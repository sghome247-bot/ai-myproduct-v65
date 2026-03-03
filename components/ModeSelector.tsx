import React from 'react';
import { GenerationMode, Texts } from '../types';

interface ModeSelectorProps {
  mode: GenerationMode;
  setMode: (mode: GenerationMode) => void;
  texts: Texts;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, setMode, texts }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 bg-rose-50 border border-rose-200 rounded-md p-1">
        <button
          onClick={() => setMode('creative')}
          className={`w-full text-center px-3 py-1.5 text-sm rounded-md transition-colors font-semibold ${
            mode === 'creative'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-rose-200'
          }`}
        >
          {texts.creativeMode}
        </button>
        <button
          onClick={() => setMode('brand')}
          className={`w-full text-center px-3 py-1.5 text-sm rounded-md transition-colors font-semibold ${
            mode === 'brand'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-rose-200'
          }`}
        >
          {texts.brandMode}
        </button>
        <button
          onClick={() => setMode('fashion')}
          className={`w-full text-center px-3 py-1.5 text-sm rounded-md transition-colors font-semibold ${
            mode === 'fashion'
              ? 'bg-rose-600 text-white shadow-md'
              : 'text-slate-500 hover:bg-rose-200'
          }`}
        >
          {texts.fashionMode}
        </button>
      </div>
    </div>
  );
};