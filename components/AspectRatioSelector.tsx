import React from 'react';
import { AspectRatio, Texts } from '../types';

interface AspectRatioSelectorProps {
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  texts: Texts;
}

const RATIOS: AspectRatio[] = ['1:1', '16:9', '9:16'];

export const AspectRatioSelector: React.FC<AspectRatioSelectorProps> = ({ aspectRatio, setAspectRatio }) => {
  return (
    <div className="inline-flex bg-blue-100/50 rounded-md p-0.5">
      {RATIOS.map(r => (
        <button
          key={r}
          onClick={() => setAspectRatio(r)}
          className={`px-4 py-2 text-sm rounded transition-colors font-semibold ${
            aspectRatio === r
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-500 hover:bg-blue-200/70'
          }`}
        >
          {r}
        </button>
      ))}
    </div>
  );
};
