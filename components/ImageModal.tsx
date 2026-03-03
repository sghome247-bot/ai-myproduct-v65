import React from 'react';

interface ImageModalProps {
  images: string[];
  currentIndex: number | null;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ images, currentIndex, onClose, onNext, onPrev }) => {
  if (currentIndex === null || !images[currentIndex]) {
    return null;
  }

  const src = images[currentIndex];
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < images.length - 1;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex justify-center items-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Enlarged image view"
    >
      {/* Previous Button */}
      {canGoPrev && (
        <button
            onClick={(e) => { e.stopPropagation(); onPrev(); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous image"
            disabled={!canGoPrev}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
        </button>
      )}

      <div 
        className="relative max-w-full max-h-full"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking on the image itself
      >
        <img 
          src={src} 
          alt="Enlarged view" 
          className="block max-w-[85vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
        <button 
          onClick={onClose}
          className="absolute -top-3 -right-3 w-10 h-10 bg-white text-slate-800 rounded-full flex items-center justify-center font-bold text-2xl hover:bg-blue-100 transition-colors z-50 shadow-lg"
          aria-label="Close image view"
        >
          &times;
        </button>
      </div>
      
      {/* Next Button */}
      {canGoNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onNext(); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next image"
            disabled={!canGoNext}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
        </button>
      )}
    </div>
  );
};
