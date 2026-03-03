import React, { useState } from 'react';
import { GeneratedImage, Texts } from '../types';

interface EditPromptModalProps {
  image: GeneratedImage;
  onClose: () => void;
  onRegenerate: (newPrompt: string) => void;
  texts: Texts;
}

export const EditPromptModal: React.FC<EditPromptModalProps> = ({ image, onClose, onRegenerate, texts }) => {
  const [prompt, setPrompt] = useState(image.prompt);

  const handleRegenerateClick = () => {
    onRegenerate(prompt);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Edit prompt modal"
    >
      <div 
        className="relative bg-white rounded-lg shadow-2xl p-6 w-full max-w-2xl flex flex-col md:flex-row gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center font-bold text-2xl hover:bg-blue-100 transition-colors z-50 shadow-lg"
          aria-label="Close"
        >
          &times;
        </button>

        <div className="md:w-1/2 flex-shrink-0">
          <img src={image.url} alt="Editing prompt for this image" className="rounded-md w-full h-full object-contain bg-slate-100" />
        </div>

        <div className="md:w-1/2 flex flex-col">
          <h3 className="text-lg font-bold text-slate-800 mb-2">{texts.editPromptTitle}</h3>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={8}
            className="w-full bg-slate-50 border border-slate-300 rounded-md p-2.5 text-sm text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition mb-4 flex-grow"
          />
          <button
            onClick={handleRegenerateClick}
            className="w-full py-2.5 px-4 bg-blue-600 text-white font-bold rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
          >
            {texts.regenerateButton}
          </button>
        </div>
      </div>
    </div>
  );
};
