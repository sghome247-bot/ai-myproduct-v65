import React, { useState } from 'react';
import { Header } from './components/Header';
import { Language, FashionTask } from './types';
import { generateFashionImages, generatePromptSuggestion, generateTitleAndDescription, generateVeoPrompt, removeCharacterFromImage, generateSingleFashionImage, removeFaceFromImage } from './services/geminiService';
import { TEXTS } from './constants';
import { FashionTask as FashionTaskComponent } from './components/FashionTask';

const getNewFashionTask = (id: number): FashionTask => ({
    id,
    personFile: null,
    personPreview: null,
    outfitFile: null,
    outfitPreview: null,
    outfitDataForGeneration: null,
    sceneFile: null,
    scenePreview: null,
    prompt: '',
    generatedImages: [],
    isLoading: false,
    isSuggesting: false,
    error: null,
    quality: '8K',
    keepFace: true,
    title: '',
    description: '',
    veoPrompts: [],
    isRemovingPersonFromOutfit: false,
    isRemovingPersonFromScene: false,
    isRemovingFaceFromOutfit: false,
});


const App: React.FC = () => {
  const language: Language = 'vi';
  const [fashionTask, setFashionTask] = useState<FashionTask>(getNewFashionTask(Date.now()));

  const fileToBase64 = (file: File): Promise<{base64: string; mimeType: string}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1];
        resolve({ base64, mimeType: file.type });
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const base64ToFile = async (dataUrl: string, filename: string): Promise<File> => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type });
  };
  
  const updateFashionTask = (newValues: Partial<Omit<FashionTask, 'id'>>) => {
    setFashionTask(currentTask => ({ ...currentTask, ...newValues }));
  };

  const generateSuggestion = async () => {
    if (!fashionTask.outfitDataForGeneration) {
        updateFashionTask({ error: TEXTS[language].missingInfoSuggestionFashion });
        return;
    }

    updateFashionTask({ isSuggesting: true, error: null });

    try {
        let personData: { base64: string; mimeType: string } | undefined = undefined;
        if (fashionTask.personFile) {
            personData = await fileToBase64(fashionTask.personFile);
        }
        
        let sceneData: { base64: string; mimeType: string } | undefined = undefined;
        if (fashionTask.sceneFile) {
            sceneData = await fileToBase64(fashionTask.sceneFile);
        }

        const suggestion = await generatePromptSuggestion(
            fashionTask.outfitDataForGeneration,
            language,
            personData,
            sceneData
        );
        updateFashionTask({ prompt: suggestion, isSuggesting: false });
    } catch (err) {
        console.error("Suggestion generation failed", err);
        const errorMsg = String(err).includes('429') || String(err).includes('RESOURCE_EXHAUSTED') ? TEXTS[language].quotaExceeded : TEXTS[language].generationError;
        updateFashionTask({ error: errorMsg, isSuggesting: false });
    }
  };

  const generateImages = async () => {
    if (!fashionTask.outfitDataForGeneration || !fashionTask.prompt) {
        updateFashionTask({ error: TEXTS[language].missingInfoFashion });
        return;
    }

    updateFashionTask({ isLoading: true, generatedImages: [], error: null, title: '', description: '', veoPrompts: [] });

    try {
        let personData: { base64: string; mimeType: string } | undefined = undefined;
        if (fashionTask.personFile) {
            personData = await fileToBase64(fashionTask.personFile);
        }
        
        let sceneData: { base64: string; mimeType: string } | undefined = undefined;
        if (fashionTask.sceneFile) {
            sceneData = await fileToBase64(fashionTask.sceneFile);
        }

        const imageGenerationPromise = Promise.all(generateFashionImages(
            fashionTask.outfitDataForGeneration!.base64, 
            fashionTask.outfitDataForGeneration!.mimeType, 
            fashionTask.prompt, 
            fashionTask.quality, 
            fashionTask.keepFace,
            personData?.base64,
            personData?.mimeType,
            sceneData?.base64,
            sceneData?.mimeType
        ));

        const titleDescGenerationPromise = generateTitleAndDescription(
            fashionTask.outfitDataForGeneration!,
            fashionTask.prompt,
            language,
            personData,
            sceneData
        );

        const veoPromptGenerationPromise = generateVeoPrompt(
            fashionTask.outfitDataForGeneration!,
            fashionTask.prompt,
            language,
            personData,
            sceneData
        );
        
        const [imageResults, titleDescResults, veoResult] = await Promise.all([
            imageGenerationPromise,
            titleDescGenerationPromise,
            veoPromptGenerationPromise
        ]);

        updateFashionTask({ 
            generatedImages: imageResults, 
            title: titleDescResults.title,
            description: titleDescResults.description,
            veoPrompts: veoResult.veoPrompts,
            isLoading: false, 
            error: null 
        });

    } catch (err) {
        console.error("Generation failed for task", fashionTask.id, err);
        const errorMsg = String(err).includes('429') || String(err).includes('RESOURCE_EXHAUSTED') ? TEXTS[language].quotaExceeded : TEXTS[language].generationError;
        updateFashionTask({ error: errorMsg, isLoading: false });
    }
  };

    const regenerateImage = async (index: number, newPrompt: string) => {
        const imageToRegen = fashionTask.generatedImages[index];
        if (!imageToRegen || !fashionTask.outfitDataForGeneration) return;

        const updatedImages = [...fashionTask.generatedImages];
        updatedImages[index] = { ...updatedImages[index], isLoading: true };
        updateFashionTask({ generatedImages: updatedImages });

        try {
            const personData = fashionTask.personFile ? await fileToBase64(fashionTask.personFile) : undefined;
            const sceneData = fashionTask.sceneFile ? await fileToBase64(fashionTask.sceneFile) : undefined;

            const newImage = await generateSingleFashionImage(
                fashionTask.outfitDataForGeneration.base64,
                fashionTask.outfitDataForGeneration.mimeType,
                newPrompt,
                fashionTask.quality,
                imageToRegen.aspectRatio,
                fashionTask.keepFace,
                personData?.base64,
                personData?.mimeType,
                sceneData?.base64,
                sceneData?.mimeType
            );
            
            const finalImages = [...fashionTask.generatedImages];
            finalImages[index] = { ...newImage, prompt: newPrompt, isLoading: false };
            updateFashionTask({ generatedImages: finalImages, error: null });

        } catch (err) {
            console.error("Regeneration failed", err);
            const errorMsg = String(err).includes('429') || String(err).includes('RESOURCE_EXHAUSTED') ? TEXTS[language].quotaExceeded : TEXTS[language].generationError;
            const revertedImages = [...fashionTask.generatedImages];
            revertedImages[index] = { ...revertedImages[index], isLoading: false };
            updateFashionTask({ error: errorMsg, generatedImages: revertedImages });
        }
    };

  const handleRemoveCharacter = async (type: 'outfit' | 'scene') => {
    const fileToProcess = type === 'outfit' ? fashionTask.outfitFile : fashionTask.sceneFile;
    if (!fileToProcess) return;

    const loadingKey = type === 'outfit' ? 'isRemovingPersonFromOutfit' : 'isRemovingPersonFromScene';
    updateFashionTask({ [loadingKey]: true, error: null });

    try {
        const { base64, mimeType } = await fileToBase64(fileToProcess);
        const resultBase64DataUrl = await removeCharacterFromImage({ base64, mimeType });
        const newFileName = `edited_${fileToProcess.name}`;
        const newFile = await base64ToFile(resultBase64DataUrl, newFileName);
        
        const keyFile = `${type}File` as keyof FashionTask;
        const keyPreview = `${type}Preview` as keyof FashionTask;
        const updatePayload: Partial<FashionTask> = {
            [keyFile]: newFile,
            [keyPreview]: resultBase64DataUrl,
            [loadingKey]: false
        };

        if (type === 'outfit') {
            const { base64: newBase64, mimeType: newMimeType } = await fileToBase64(newFile);
            updatePayload.outfitDataForGeneration = { base64: newBase64, mimeType: newMimeType };
        }
        
        updateFashionTask(updatePayload);

    } catch (err) {
        console.error(`Failed to remove character from ${type} image`, err);
        const errorMsg = String(err).includes('429') || String(err).includes('RESOURCE_EXHAUSTED') ? TEXTS[language].quotaExceeded : TEXTS[language].generationError;
        updateFashionTask({ error: errorMsg, [loadingKey]: false });
    }
  };

  const handleRemoveFace = async (type: 'outfit') => {
    const fileToProcess = fashionTask.outfitFile;
    if (!fileToProcess) return;

    updateFashionTask({ isRemovingFaceFromOutfit: true, error: null });

    try {
        const { base64, mimeType } = await fileToBase64(fileToProcess);
        const resultBase64DataUrl = await removeFaceFromImage({ base64, mimeType });
        const newFileName = `face_removed_${fileToProcess.name}`;
        const newFile = await base64ToFile(resultBase64DataUrl, newFileName);
        
        const { base64: newBase64, mimeType: newMimeType } = await fileToBase64(newFile);

        updateFashionTask({
            outfitFile: newFile,
            outfitPreview: resultBase64DataUrl,
            outfitDataForGeneration: { base64: newBase64, mimeType: newMimeType },
            isRemovingFaceFromOutfit: false
        });

    } catch (err) {
        console.error(`Failed to remove face from ${type} image`, err);
        const errorMsg = String(err).includes('429') || String(err).includes('RESOURCE_EXHAUSTED') ? TEXTS[language].quotaExceeded : TEXTS[language].generationError;
        updateFashionTask({ error: errorMsg, isRemovingFaceFromOutfit: false });
    }
  };

  const currentTexts = TEXTS[language];

  return (
    <div className="min-h-screen bg-blue-50 text-slate-800 p-4 sm:p-5 lg:p-6">
      <Header 
        title={currentTexts.title} 
        author={currentTexts.author}
      />
      <main className="mt-4">
          <FashionTaskComponent
            task={fashionTask}
            onUpdate={updateFashionTask}
            onGenerate={generateImages}
            onGetSuggestion={generateSuggestion}
            onRemoveCharacter={handleRemoveCharacter}
            onRemoveFace={handleRemoveFace}
            onRegenerateImage={regenerateImage}
            fileToBase64={fileToBase64}
            base64ToFile={base64ToFile}
            texts={currentTexts}
          />
      </main>
    </div>
  );
};

export default App;