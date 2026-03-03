import React from 'react';
import { Quality, Texts } from '../types';

interface QualitySelectorProps {
  quality: Quality;
  setQuality: (quality: Quality) => void;
  texts: Texts;
}

const QUALITIES: Quality[] = ['Stanc', '4K', '8K'];

export const QualitySelector: React.FC<QualitySelectorProps> = ({ quality, setQuality, texts }) => {
  return (
    <div className="inline-flex bg-blue-100/50 rounded-md p-0.5">
      {QUALITIES.map(q => (
        <button
          key={q}
          onClick={() => setQuality(q)}
          className={`px-2.5 py-1 text-xs rounded transition-colors font-semibold ${
            quality === q
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-blue-200/70'
          }`}
        >
          {q === '8K' ? (
            <div className="text-center leading-tight">
              <div className="text-xs">8K Ultra</div>
              <div className="text-[9px] font-normal opacity-90">Photorealistic</div>
            </div>
          ) : (
            <span className="py-2">{q}</span>
          )}
        </button>
      ))}
    </div>
  );
};