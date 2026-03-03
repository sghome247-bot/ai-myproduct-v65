import React from 'react';
import { Language, Quality, AspectRatio, GenerationMode } from '../types';
import { TEXTS } from '../constants';
import { FileUpload } from './FileUpload';
import { CustomPrompt } from './CustomPrompt';
import { QualitySelector } from './QualitySelector';
import { AspectRatioSelector } from './AspectRatioSelector';
import { GenerateButton } from './GenerateButton';
import { KeepFaceToggle } from './KeepFaceToggle';

interface LeftPanelProps {
  language: Language;
  generationMode: GenerationMode;
  onFileChange: (file: File | null) => void;
  imagePreview: string | null;
  onProductFileChange: (file: File | null) => void;
  productImagePreview: string | null;
  isSegmenting: boolean;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  quality: Quality;
  setQuality: (quality: Quality) => void;
  aspectRatio: AspectRatio;
  setAspectRatio: (ratio: AspectRatio) => void;
  keepFace: boolean;
  setKeepFace: (keepFace: boolean) => void;
  onGenerate: () => void;
  isLoading: boolean;
  error: string | null;
  onGetSuggestion: () => void;
  isSuggesting: boolean;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  language,
  generationMode,
  onFileChange,
  imagePreview,
  onProductFileChange,
  productImagePreview,
  isSegmenting,
  prompt,
  setPrompt,
  quality,
  setQuality,
  aspectRatio,
  setAspectRatio,
  keepFace,
  setKeepFace,
  onGenerate,
  isLoading,
  error,
  onGetSuggestion,
  isSuggesting,
}) => {
  const currentTexts = TEXTS[language];

  const isSuggestionDisabled = (generationMode === 'brand')
    ? !imagePreview || !productImagePreview
    : !imagePreview;

  const getPromptPlaceholder = () => {
    switch(generationMode) {
      case 'brand': return currentTexts.promptPlaceholder;
      case 'creative':
      default:
        return currentTexts.promptPlaceholderCreative;
    }
  }

  return (
    <div className="bg-white/70 backdrop-blur-sm border border-blue-200 rounded-lg p-6 space-y-6 h-full">
      {error && <div className="bg-red-500/10 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">{error}</div>}
      
      {generationMode === 'creative' ? (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">{currentTexts.referenceImageLabelCreative}</label>
          <FileUpload onFileChange={onFileChange} imagePreview={imagePreview} texts={currentTexts} />
        </div>
      ) : (
        <>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{currentTexts.portraitLabel}</label>
            <FileUpload onFileChange={onFileChange} imagePreview={imagePreview} texts={currentTexts} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {currentTexts.referenceImageLabel}
            </label>
            <FileUpload onFileChange={onProductFileChange} imagePreview={productImagePreview} texts={currentTexts} isLoading={isSegmenting} />
          </div>
        </>
      )}
      
      <CustomPrompt 
        prompt={prompt} 
        setPrompt={setPrompt} 
        texts={currentTexts} 
        onGetSuggestion={onGetSuggestion}
        isSuggesting={isSuggesting}
        isSuggestionDisabled={isSuggestionDisabled}
        placeholder={getPromptPlaceholder()}
      />

      {/* FIX: Add the required 'id' prop to KeepFaceToggle. */}
      <KeepFaceToggle 
        id="left-panel-toggle"
        keepFace={keepFace} 
        setKeepFace={setKeepFace} 
        texts={currentTexts}
      />

      <QualitySelector quality={quality} setQuality={setQuality} texts={currentTexts} />

      <AspectRatioSelector aspectRatio={aspectRatio} setAspectRatio={setAspectRatio} texts={currentTexts} />

      <div>
        <GenerateButton onClick={onGenerate} isLoading={isLoading} texts={currentTexts} />
      </div>
    </div>
  );
};