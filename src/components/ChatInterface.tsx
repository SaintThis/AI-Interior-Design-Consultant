import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, MapPin, ExternalLink } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { chatWithConsultant } from '@/src/services/geminiService';

interface Message {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
}

interface ChatInterfaceProps {
  currentImage?: string;
  className?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ currentImage, className }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithConsultant(userMessage, history, currentImage);
      
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text,
        groundingChunks: response.groundingChunks
      }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col h-[500px] bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden", className)}>
      <div className="p-4 border-bottom border-slate-100 bg-slate-50/50 flex items-center gap-2">
        <Bot className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-slate-800">Design Assistant</h3>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <p>Ask me to refine the design or find items!</p>
            <p className="text-xs mt-1">"Make the rug blue" or "Where can I buy this lamp?"</p>
          </div>
        )}
        
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "flex gap-3 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                m.role === 'user' ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-600"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-3 rounded-2xl text-sm",
                m.role === 'user' ? "bg-blue-600 text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
              )}>
                <div className="markdown-body">
                  <Markdown>{m.text}</Markdown>
                </div>
                
                {m.groundingChunks && m.groundingChunks.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Sources & Locations
                    </p>
                    {m.groundingChunks.map((chunk: any, idx: number) => (
                      chunk.web && (
                        <a 
                          key={idx} 
                          href={chunk.web.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-blue-600 hover:underline bg-white p-2 rounded-lg border border-slate-200"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span className="truncate">{chunk.web.title}</span>
                        </a>
                      )
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex gap-3 mr-auto max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
              <Bot className="w-4 h-4 text-slate-600" />
            </div>
            <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask for refinements or items..."
            className="w-full pl-4 pr-12 py-3 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
