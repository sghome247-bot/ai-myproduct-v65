import React, { useState } from 'react';
import { Icon } from './Icon';
import { GeneratedImage, Texts } from '../types';
import { ImageModal } from './ImageModal';
import { EditPromptModal } from './EditPromptModal';

interface ImageGridProps {
  images: GeneratedImage[];
  isLoading: boolean;
  loadingText: string;
  texts: Texts;
  skeletonCount?: number;
  onDelete?: (index: number) => void;
  onRegenerate?: (index: number, newPrompt: string) => void;
}

const SkeletonLoader: React.FC = () => (
  <div className="w-full h-full bg-blue-200 rounded-lg animate-pulse"></div>
);

interface ImageItemProps {
    image: GeneratedImage;
    index: number;
    onView: (index: number) => void;
    texts: Texts;
    onDelete?: (index: number) => void;
    onEdit?: (index: number) => void;
}

const ImageItem: React.FC<ImageItemProps> = ({ image, index, onView, texts, onDelete, onEdit }) => {
    const downloadImage = () => {
        const link = document.createElement('a');
        link.href = image.url;
        link.download = `personal-brand-image-${index + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="relative group w-full h-full bg-slate-100">
            {image.isLoading && (
                <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
            )}
            <img src={image.url} alt={`Generated result ${index + 1}`} className="w-full h-full object-contain" />
            {onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(index);
                    }}
                    className="absolute top-2 right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-blue-700 transition-colors z-20 border-2 border-white shadow-md"
                    aria-label="Delete image"
                >
                    &times;
                </button>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex justify-center items-center gap-2 pointer-events-none">
                 <button
                    onClick={() => onView(index)}
                    className="opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 pointer-events-auto"
                    aria-label={texts.viewButton}
                >
                    <Icon type="expand" className="w-6 h-6" />
                </button>
                 {onEdit && (
                    <button
                        onClick={() => onEdit(index)}
                        className="opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 pointer-events-auto"
                        aria-label={texts.editPromptTitle}
                    >
                        <Icon type="edit" className="w-6 h-6" />
                    </button>
                )}
                <button
                    onClick={downloadImage}
                    className="opacity-0 group-hover:opacity-100 transform group-hover:scale-100 scale-90 transition-all duration-300 p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 pointer-events-auto"
                    aria-label="Download image"
                >
                    <Icon type="download" className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

export const ImageGrid: React.FC<ImageGridProps> = ({ images, isLoading, loadingText, texts, skeletonCount = 3, onDelete, onRegenerate }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [editingImage, setEditingImage] = useState<{ image: GeneratedImage; index: number } | null>(null);
  
  const handleRegenerate = (newPrompt: string) => {
    if (editingImage && onRegenerate) {
        onRegenerate(editingImage.index, newPrompt);
    }
  };

  const handleNext = () => {
    setCurrentImageIndex(prevIndex => {
        if (prevIndex === null || prevIndex >= images.length - 1) {
            return prevIndex;
        }
        return prevIndex + 1;
    });
  };

  const handlePrev = () => {
    setCurrentImageIndex(prevIndex => {
        if (prevIndex === null || prevIndex <= 0) {
            return prevIndex;
        }
        return prevIndex - 1;
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full">
            {[...Array(skeletonCount)].map((_, i) => (
                <div key={i} className="aspect-square"><SkeletonLoader /></div>
            ))}
        </div>
        <p className="mt-6 text-slate-500 text-center">{loadingText}</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[400px] text-center bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg p-8">
          <Icon type="image" className="w-16 h-16 mb-4 text-blue-400" />
          <h3 className="text-lg font-semibold text-slate-700">{texts.initialStateTitle}</h3>
          <p className="text-sm text-slate-500 mt-1">{texts.initialStateMessage}</p>
      </div>
    );
  }

  return (
    <>
      <ImageModal
        images={images.map(img => img.url)}
        currentIndex={currentImageIndex}
        onClose={() => setCurrentImageIndex(null)}
        onNext={handleNext}
        onPrev={handlePrev}
      />
      {editingImage && (
        <EditPromptModal
            image={editingImage.image}
            onClose={() => setEditingImage(null)}
            onRegenerate={handleRegenerate}
            texts={texts}
        />
      )}
       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {images.map((img, index) => (
           <div key={index} className="bg-slate-100 rounded-lg overflow-hidden aspect-square">
            <ImageItem 
              image={img} 
              index={index} 
              texts={texts} 
              onView={setCurrentImageIndex} 
              onDelete={onDelete}
              onEdit={onRegenerate ? (idx) => setEditingImage({ image: images[idx], index: idx }) : undefined}
            />
          </div>
        ))}
      </div>
    </>
  );
};