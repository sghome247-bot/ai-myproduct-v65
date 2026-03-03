import React from 'react';
import { Texts } from '../types';

interface KeepFaceToggleProps {
  id: string | number;
  keepFace: boolean;
  setKeepFace: (keepFace: boolean) => void;
  texts: Texts;
}

export const KeepFaceToggle: React.FC<KeepFaceToggleProps> = ({ id, keepFace, setKeepFace, texts }) => {
  const inputId = `keep-face-toggle-${id}`;
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-slate-700 select-none cursor-pointer whitespace-nowrap">
        {texts.keepFaceLabel}
      </label>
      <label htmlFor={inputId} className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          id={inputId}
          className="sr-only peer"
          checked={keepFace}
          onChange={(e) => setKeepFace(e.target.checked)}
        />
        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-400 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
};