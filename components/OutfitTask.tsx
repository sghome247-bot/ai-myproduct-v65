import React from 'react';
import { OutfitTask as OutfitTaskType, Texts } from '../types';
import { FileUpload } from './FileUpload';
import { ImageGrid } from './ImageGrid';
import { GenerateButton } from './GenerateButton';

interface OutfitTaskProps {
  task: OutfitTaskType;
  onUpdate: (taskId: number, newValues: Partial<Omit<OutfitTaskType, 'id'>>) => void;
  onRemove: (taskId: number) => void;
  onProcess: (taskId: number) => void;
  texts: Texts;
}

export const OutfitTask: React.FC<OutfitTaskProps> = ({ task, onUpdate, onRemove, onProcess, texts }) => {

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        onUpdate(task.id, { error: texts.fileTooLarge, sourceFile: null, sourcePreview: null });
        return;
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        onUpdate(task.id, { error: texts.fileTypeInvalid, sourceFile: null, sourcePreview: null });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(task.id, {
          sourceFile: file,
          sourcePreview: reader.result as string,
          error: null,
        });
      };
      reader.readAsDataURL(file);
    } else {
      onUpdate(task.id, { sourceFile: null, sourcePreview: null });
    }
  };

  const handleAccessoryFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    e.target.value = ''; // Reset file input

    const validFiles: File[] = [];
    let validationError: string | null = null;

    // First, validate all files
    // FIX: Cast files to File[] to ensure proper typing for the loop variable 'file'.
    // This resolves errors where 'file' was inferred as 'unknown'.
    for (const file of files as File[]) {
      if (file.size > 10 * 1024 * 1024) {
        validationError = texts.fileTooLarge;
        continue; // Skip oversized files
      }
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        validationError = texts.fileTypeInvalid;
        continue; // Skip invalid file types
      }
      validFiles.push(file);
    }

    // If no files are valid, show the last validation error and stop.
    if (validFiles.length === 0) {
      if (validationError) {
        onUpdate(task.id, { error: validationError });
      }
      return;
    }

    // Helper to read a file and return a promise
    const readFileAsDataURL = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      // Wait for all valid files to be read
      const newPreviews = await Promise.all(validFiles.map(readFileAsDataURL));
      
      // Update state once with all new files and previews
      onUpdate(task.id, {
        accessoryFiles: [...task.accessoryFiles, ...validFiles],
        accessoryPreviews: [...task.accessoryPreviews, ...newPreviews],
        error: validationError, // Show validation error if some files were skipped, otherwise it's null
      });
    } catch (readError) {
      console.error('Failed to read files:', readError);
      onUpdate(task.id, { error: 'An error occurred while loading images.' });
    }
  };


  const removeAccessory = (index: number) => {
      const newFiles = [...task.accessoryFiles];
      const newPreviews = [...task.accessoryPreviews];
      newFiles.splice(index, 1);
      newPreviews.splice(index, 1);
      onUpdate(task.id, {
          accessoryFiles: newFiles,
          accessoryPreviews: newPreviews
      });
  };

  return (
    <div className="relative bg-white/80 backdrop-blur-sm border border-blue-200 rounded-2xl p-4 sm:p-6 flex flex-col gap-4 h-full shadow-md transition-shadow hover:shadow-lg">
      <button
        onClick={() => onRemove(task.id)}
        className="absolute -top-3 -right-3 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl hover:bg-blue-700 transition-colors z-10 border-4 border-blue-50 shadow-sm"
        aria-label={texts.removeRowButton}
      >
        &times;
      </button>

      {task.error && <div className="bg-red-500/10 border border-red-400 text-red-700 px-4 py-2 rounded-md text-sm mb-4">{task.error}</div>}

      <div className="flex items-start gap-4">
        <div className="w-48 flex-shrink-0">
           <h3 className="text-base font-semibold text-slate-800 mb-2 text-center">{texts.originalImageLabel}</h3>
           <FileUpload
            onFileChange={handleFileChange}
            imagePreview={task.sourcePreview}
            texts={texts}
            className="w-full h-48 aspect-square"
          />
        </div>
        
        <div className="flex-grow">
            <h3 className="text-base font-semibold text-slate-800 mb-2 text-center">{texts.fashionItemsLabelOutfit}</h3>
            <div className="grid grid-cols-2 gap-2">
                {task.accessoryPreviews.map((preview, index) => (
                    <div key={index} className="relative aspect-square">
                        <img src={preview} alt={`Accessory ${index+1}`} className="w-full h-full object-cover rounded-md" />
                        <button
                            onClick={() => removeAccessory(index)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-blue-700"
                        >&times;</button>
                    </div>
                ))}
                <label htmlFor={`accessory-upload-${task.id}`} className="aspect-square flex items-center justify-center border-2 border-dashed border-blue-300 rounded-md cursor-pointer hover:border-blue-400 transition-colors">
                    <span className="text-3xl text-blue-400 font-light">+</span>
                    <input
                        id={`accessory-upload-${task.id}`}
                        type="file"
                        multiple
                        accept="image/png, image/jpeg"
                        className="hidden"
                        onChange={handleAccessoryFileChange}
                    />
                </label>
            </div>
        </div>
      </div>
      
      <div className="flex-grow flex flex-col">
          <h3 className="text-lg font-semibold text-slate-800 mb-2 text-center">{texts.resultLabel}</h3>
          <div className="flex-grow bg-white/70 backdrop-blur-sm border-2 border-blue-200 rounded-lg p-2 min-h-[250px]">
              <ImageGrid
                  images={task.resultImage ? [task.resultImage] : []}
                  isLoading={task.isLoading}
                  loadingText={texts.loadingMessage}
                  texts={texts}
                  skeletonCount={1}
              />
          </div>
      </div>

      <div className="mt-auto pt-4">
        <GenerateButton onClick={() => onProcess(task.id)} isLoading={task.isLoading} texts={texts} label={texts.processButton} />
      </div>
    </div>
  );
};