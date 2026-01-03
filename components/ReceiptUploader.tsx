import React, { useRef, useState } from 'react';
import { Upload, Loader2, ImagePlus } from 'lucide-react';

interface ReceiptUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export const ReceiptUploader: React.FC<ReceiptUploaderProps> = ({ onUpload, isProcessing }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const triggerClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      className={`relative w-full p-8 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out cursor-pointer group
        ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'}
        ${isProcessing ? 'opacity-70 pointer-events-none' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={triggerClick}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleChange}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4 text-center">
        {isProcessing ? (
          <>
            <div className="p-4 bg-blue-100 rounded-full animate-pulse">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">Analyzing Receipt...</p>
              <p className="text-sm text-gray-500">Extracting date, merchant, and amount with AI</p>
            </div>
          </>
        ) : (
          <>
            <div className={`p-4 rounded-full transition-colors ${dragActive ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-700">
                Click to upload or drag & drop
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Supports JPG, PNG, HEIC (Receipt Photos)
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
