import React from 'react';
import { ImageGrid } from './ImageGrid';
import { Texts } from '../types';
import { Icon } from './Icon';

interface RightPanelProps {
  images: string[];
  isLoading: boolean;
  texts: Texts;
  skeletonCount?: number;
}

export const RightPanel: React.FC<RightPanelProps> = ({ images, isLoading, texts, skeletonCount = 4 }) => {
  const downloadAll = () => {
    images.forEach((image, index) => {
      const link = document.createElement('a');
      link.href = image;
      link.download = `personal-brand-image-${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-lg p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h2 className="text-xl font-bold text-slate-800">{texts.resultsGridTitle}</h2>
        {images.length > 0 && !isLoading && (
          <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors self-start sm:self-auto">
            <Icon type="download" className="w-4 h-4" />
            {texts.downloadAllButton}
          </button>
        )}
      </div>
      <div className="flex-grow">
        <ImageGrid images={images} isLoading={isLoading} loadingText={texts.loadingMessage} texts={texts} skeletonCount={skeletonCount} />
      </div>
    </div>
  );
};