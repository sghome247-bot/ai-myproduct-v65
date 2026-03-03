
import React from 'react';
import { Texts } from '../types';

interface CommunityPanelProps {
  images: string[];
  isLoading: boolean;
  texts: Texts;
}

const SkeletonLoader: React.FC = () => (
  <div className="relative aspect-[9/16] bg-rose-200 rounded-lg animate-pulse"></div>
);

const CommunityImageItem: React.FC<{ src: string; index: number }> = ({ src, index }) => {
    return (
        <div className="relative group aspect-[9/16] overflow-hidden rounded-lg shadow-md">
            <img 
                src={src} 
                alt={`Community image ${index + 1}`} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
    );
};

export const CommunityPanel: React.FC<CommunityPanelProps> = ({ images, isLoading, texts }) => {
  return (
    <div className="bg-white/70 backdrop-blur-sm border border-rose-200 rounded-lg p-6 h-full flex flex-col">
      <h2 className="text-xl font-bold text-slate-800 mb-4">{texts.communityShowcaseTitle}</h2>
      <div className="flex-grow overflow-y-auto -mr-3 pr-3">
        {isLoading ? (
           <div className="grid grid-cols-2 gap-4">
            {[...Array(8)].map((_, index) => <SkeletonLoader key={`skeleton-community-${index}`} />)}
           </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {images.map((img, index) => (
              <CommunityImageItem key={index} src={img} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
