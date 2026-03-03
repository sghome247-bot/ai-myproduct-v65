import React, { useState } from 'react';
import { FashionTask as FashionTaskType, Texts } from '../types';
import { FileUpload } from './FileUpload';
import { ImageGrid } from './ImageGrid';
import { QualitySelector } from './QualitySelector';
import { KeepFaceToggle } from './KeepFaceToggle';
import { Icon } from './Icon';
import { removeFaceFromImage, removeCharacterFromImage } from '../services/geminiService';
import { GenerateButton } from './GenerateButton';

interface FashionTaskProps {
  task: FashionTaskType;
  onUpdate: (newValues: Partial<Omit<FashionTaskType, 'id'>>) => void;
  onGenerate: () => void;
  onGetSuggestion: () => void;
  onRemoveCharacter: (type: 'outfit' | 'scene') => void;
  onRemoveFace: (type: 'outfit') => void;
  onRegenerateImage: (index: number, newPrompt: string) => void;
  fileToBase64: (file: File) => Promise<{ base64: string; mimeType: string }>;
  base64ToFile: (dataUrl: string, filename: string) => Promise<File>;
  texts: Texts;
}


interface GeneratedContentProps {
    label: string;
    content: string;
    onUpdate: (newContent: string) => void;
    texts: Texts;
    rows?: number;
}

const GeneratedContent: React.FC<GeneratedContentProps> = ({ label, content, onUpdate, texts, rows = 1 }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!content) return;
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">{label}</label>
                <button
                    onClick={handleCopy}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors disabled:text-slate-400 disabled:cursor-not-allowed"
                    disabled={!content}
                >
                    {copied ? texts.copiedLabel : texts.copyButtonLabel}
                </button>
            </div>
            <textarea
                value={content}
                onChange={(e) => onUpdate(e.target.value)}
                rows={rows}
                className="w-full bg-white border border-blue-200 rounded-md p-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
        </div>
    );
};

export const FashionTask: React.FC<FashionTaskProps> = ({ task, onUpdate, onGenerate, onGetSuggestion, onRemoveCharacter, onRemoveFace, onRegenerateImage, fileToBase64, base64ToFile, texts }) => {
  
  const handleFileChange = (file: File | null, type: 'person' | 'outfit' | 'scene') => {
    const keyFile = `${type}File` as keyof FashionTaskType;
    const keyPreview = `${type}Preview` as keyof FashionTaskType;

    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        onUpdate({ error: texts.fileTooLarge, [keyFile]: null, [keyPreview]: null });
        return;
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        onUpdate({ error: texts.fileTypeInvalid, [keyFile]: null, [keyPreview]: null });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        const updatePayload: Partial<FashionTaskType> = {
            [keyFile]: file,
            [keyPreview]: reader.result as string,
            error: null,
        };
        if (type === 'outfit') {
             try {
                const { base64, mimeType } = await fileToBase64(file);
                updatePayload.outfitDataForGeneration = { base64, mimeType };
             } catch (err) {
                 console.error("Outfit file processing failed", err);
                 updatePayload.error = "Could not process file.";
             }
        }
        onUpdate(updatePayload);
      };
      reader.readAsDataURL(file);
    } else {
      const payload: Partial<FashionTaskType> = { [keyFile]: null, [keyPreview]: null };
      if (type === 'outfit') payload.outfitDataForGeneration = null;
      onUpdate(payload);
    }
  };
  
  const handleDeleteImage = (indexToDelete: number) => {
    const updatedImages = task.generatedImages.filter((_, index) => index !== indexToDelete);
    onUpdate({ generatedImages: updatedImages });
  };

  return (
    <div className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Left Panel: Inputs */}
            <div className="lg:col-span-3 space-y-6 p-5 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-md">
                {task.error && <div className="bg-red-500/10 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm">{task.error}</div>}
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                    {/* Image Uploads */}
                    <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">{texts.portraitLabel}</label>
                            <div className="relative">
                                <FileUpload onFileChange={(file) => handleFileChange(file, 'person')} imagePreview={task.personPreview} texts={texts} className="h-36" />
                                {task.personPreview && (
                                    <button
                                        onClick={() => handleFileChange(null, 'person')}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-blue-700 transition-colors z-10 border-2 border-white shadow-md"
                                        aria-label="Remove person image"
                                    >
                                        &times;
                                    </button>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">{texts.fashionItemsLabel}</label>
                            <div className="relative">
                                <FileUpload 
                                    onFileChange={(file) => handleFileChange(file, 'outfit')} 
                                    imagePreview={task.outfitPreview} 
                                    texts={texts} 
                                    className="h-36" 
                                    isLoading={task.isRemovingPersonFromOutfit || task.isRemovingFaceFromOutfit}
                                />
                                {task.outfitPreview && (
                                    <>
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-x-2">
                                            <button
                                                onClick={() => onRemoveFace('outfit')}
                                                className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors z-10 border-2 border-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Remove face from outfit image"
                                                title={texts.removeFaceButtonLabel}
                                                disabled={task.isRemovingFaceFromOutfit || task.isRemovingPersonFromOutfit}
                                            >
                                                <Icon type="ban" className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => onRemoveCharacter('outfit')}
                                                className="w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors z-10 border-2 border-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                                aria-label="Remove person from outfit image"
                                                title={texts.removePersonButtonLabel}
                                                disabled={task.isRemovingFaceFromOutfit || task.isRemovingPersonFromOutfit}
                                            >
                                                <Icon type="person-off" className="w-5 h-5" />
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleFileChange(null, 'outfit')}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-blue-700 transition-colors z-10 border-2 border-white shadow-md"
                                            aria-label="Remove outfit image"
                                        >
                                            &times;
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">{texts.sceneObjectLabel}</label>
                            <div className="relative">
                                <FileUpload
                                    onFileChange={(file) => handleFileChange(file, 'scene')}
                                    imagePreview={task.scenePreview}
                                    texts={texts}
                                    className="h-36"
                                    isLoading={task.isRemovingPersonFromScene}
                                />
                                {task.scenePreview && (
                                    <>
                                        <button
                                            onClick={() => onRemoveCharacter('scene')}
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-8 h-8 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-800 transition-colors z-10 border-2 border-white shadow-md"
                                            aria-label="Remove person from scene image"
                                            title={texts.removePersonButtonLabel}
                                        >
                                            <Icon type="person-off" className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleFileChange(null, 'scene')}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg hover:bg-blue-700 transition-colors z-10 border-2 border-white shadow-md"
                                            aria-label="Remove scene image"
                                        >
                                            &times;
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="md:col-span-1 space-y-4 flex flex-col items-center">
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5 text-center">{texts.qualityLabel}</label>
                            <QualitySelector quality={task.quality} setQuality={(q) => onUpdate({ quality: q })} texts={texts} />
                        </div>
                        <div className="w-full">
                            <GenerateButton 
                                onClick={onGenerate}
                                isLoading={task.isLoading}
                                texts={texts}
                            />
                        </div>
                         <KeepFaceToggle
                            id={task.id}
                            keepFace={task.keepFace}
                            setKeepFace={(value) => onUpdate({ keepFace: value })}
                            texts={texts}
                        />
                    </div>
                </div>

                {/* Prompt */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">{texts.promptLabel}</label>
                    <div className="relative">
                        <textarea
                            rows={3}
                            value={task.prompt}
                            onChange={(e) => onUpdate({ prompt: e.target.value })}
                            placeholder={texts.promptPlaceholderFashion}
                            className="w-full bg-white border border-blue-300 rounded-lg p-3 pr-12 text-sm text-slate-800 placeholder-blue-400/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        />
                         <button
                            onClick={onGetSuggestion}
                            disabled={task.isSuggesting || !task.outfitDataForGeneration}
                            className="absolute top-1/2 -translate-y-1/2 right-3 p-1.5 text-slate-500 hover:text-blue-600 rounded-md transition-colors disabled:text-slate-300 disabled:cursor-not-allowed"
                            aria-label="Get prompt suggestion"
                        >
                           {task.isSuggesting ? ( <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : <Icon type="edit" className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right Panel: Social Content */}
            <div className="lg:col-span-2 space-y-3 p-4 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-md">
                <h3 className="text-lg font-bold text-slate-800">{texts.socialContentTitle}</h3>
                <GeneratedContent 
                    label={texts.generatedTitleLabel}
                    content={task.title}
                    onUpdate={(newTitle) => onUpdate({ title: newTitle })}
                    texts={texts}
                    rows={1}
                />
                <div className="grid grid-cols-2 gap-3">
                    <GeneratedContent 
                        label={texts.generatedDescriptionLabel}
                        content={task.description}
                        onUpdate={(newDesc) => onUpdate({ description: newDesc })}
                        texts={texts}
                        rows={5}
                    />
                    <GeneratedContent 
                        key={`veo-${task.id}-0`}
                        label={texts.generatedVeoPromptLabel}
                        content={task.veoPrompts[0] || ''}
                        onUpdate={(newPrompt) => {
                            const newPrompts = [...task.veoPrompts];
                            newPrompts[0] = newPrompt;
                            onUpdate({ veoPrompts: newPrompts });
                        }}
                        texts={texts}
                        rows={5}
                    />
                </div>
            </div>
        </div>

        {/* Bottom Panel: Results */}
        <div className="p-3 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl shadow-md">
            <h2 className="text-xl font-bold text-slate-800 mb-2">{texts.resultsGridTitle}</h2>
            <div className="min-h-[400px]">
                <ImageGrid 
                    images={task.generatedImages}
                    isLoading={task.isLoading}
                    loadingText={texts.loadingMessage}
                    texts={texts}
                    skeletonCount={5}
                    onDelete={handleDeleteImage}
                    onRegenerate={onRegenerateImage}
                />
            </div>
        </div>
    </div>
  );
};