import React from 'react';
import { Texts } from '../types';

type AppMode = 'fashion' | 'outfit';

interface TabSelectorProps {
  mode: AppMode;
  setMode: (mode: AppMode) => void;
  texts: Texts;
}

export const TabSelector: React.FC<TabSelectorProps> = ({ mode, setMode, texts }) => {
  return (
    <div className="flex space-x-1 bg-blue-200/50 rounded-lg p-1 mb-6">
      <button
        onClick={() => setMode('fashion')}
        className={`w-full text-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
          mode === 'fashion'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-slate-600 hover:bg-white/50'
        }`}
      >
        {texts.fashionMode}
      </button>
      <button
        onClick={() => setMode('outfit')}
        className={`w-full text-center px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
          mode === 'outfit'
            ? 'bg-white text-blue-700 shadow-sm'
            : 'text-slate-600 hover:bg-white/50'
        }`}
      >
        {texts.outfitProcessingMode}
      </button>
    </div>
  );
};