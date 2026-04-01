import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ImageUploadProps {
  onUpload: (base64: string) => void;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, className }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setPreview(base64);
        onUpload(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className={cn("w-full", className)}>
      {!preview ? (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
        >
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-slate-700">Upload your room photo</p>
            <p className="text-sm text-slate-500">Drag and drop or click to browse</p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            className="hidden" 
          />
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden shadow-md group">
          <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
          <button 
            onClick={clearImage}
            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Original Space
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
