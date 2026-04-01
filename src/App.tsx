/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Palette, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { ImageUpload } from './components/ImageUpload';
import { ComparisonSlider } from './components/ComparisonSlider';
import { ChatInterface } from './components/ChatInterface';
import { INTERIOR_STYLES, generateRoomMakeover } from './services/geminiService';
import { cn } from './lib/utils';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState(INTERIOR_STYLES[0].id);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!originalImage) return;

    setIsGenerating(true);
    setError(null);
    try {
      const styleName = INTERIOR_STYLES.find(s => s.id === selectedStyle)?.name || selectedStyle;
      const result = await generateRoomMakeover(originalImage, styleName);
      setGeneratedImage(result);
    } catch (err) {
      console.error(err);
      setError("Failed to generate makeover. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setGeneratedImage(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">InteriorAI</h1>
          </div>
          {originalImage && (
            <button 
              onClick={reset}
              className="text-sm font-medium text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Start Over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Controls & Upload */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 text-slate-800">
                <Palette className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold">1. Upload & Choose Style</h2>
              </div>
              
              <ImageUpload onUpload={setOriginalImage} />

              <AnimatePresence>
                {originalImage && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      {INTERIOR_STYLES.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={cn(
                            "p-3 rounded-xl border text-left transition-all",
                            selectedStyle === style.id 
                              ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600" 
                              : "border-slate-200 bg-white hover:border-slate-300"
                          )}
                        >
                          <p className={cn(
                            "text-sm font-semibold",
                            selectedStyle === style.id ? "text-blue-700" : "text-slate-700"
                          )}>{style.name}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">{style.description}</p>
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Reimagining Space...
                        </>
                      ) : (
                        <>
                          Generate Makeover
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Right Column: Visualization & Chat */}
          <div className="lg:col-span-7 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-800">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold">2. Visualization</h2>
                </div>
              </div>

              {!generatedImage ? (
                <div className="w-full aspect-square bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                  <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <p className="font-medium">Your reimagined space will appear here</p>
                  <p className="text-sm mt-1 max-w-xs">Upload a photo and choose a style to see the magic happen.</p>
                </div>
              ) : (
                <ComparisonSlider 
                  original={originalImage!} 
                  generated={generatedImage} 
                />
              )}
            </section>

            <AnimatePresence>
              {generatedImage && (
                <motion.section 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2 text-slate-800">
                    <Palette className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold">3. Refine & Shop</h2>
                  </div>
                  <ChatInterface currentImage={generatedImage} />
                </motion.section>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Footer Branding */}
      <footer className="mt-20 py-12 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-800">InteriorAI</span>
          </div>
          <p className="text-sm text-slate-500">Powered by Gemini AI • Made for modern living</p>
        </div>
      </footer>
    </div>
  );
}
