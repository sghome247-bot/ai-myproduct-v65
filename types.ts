
export type Language = 'vi' | 'en';

export type Quality = 'Stanc' | '4K' | '8K';

export type AspectRatio = '1:1' | '16:9' | '9:16';

export type GenerationMode = 'creative' | 'brand' | 'fashion';

export interface GeneratedImage {
  url: string;
  prompt: string;
  aspectRatio: AspectRatio;
  isLoading?: boolean;
}

export interface FashionTask {
  id: number;
  personFile: File | null;
  personPreview: string | null;
  outfitFile: File | null;
  outfitPreview: string | null;
  outfitDataForGeneration: { base64: string; mimeType: string } | null;
  sceneFile: File | null;
  scenePreview: string | null;
  prompt: string;
  generatedImages: GeneratedImage[];
  isLoading: boolean;
  isSuggesting: boolean;
  error: string | null;
  quality: Quality;
  keepFace: boolean;
  title: string;
  description: string;
  veoPrompts: string[];
  isRemovingPersonFromOutfit?: boolean;
  isRemovingPersonFromScene?: boolean;
  isRemovingFaceFromOutfit?: boolean;
}

export interface OutfitTask {
  id: number;
  sourceFile: File | null;
  sourcePreview: string | null;
  accessoryFiles: File[];
  accessoryPreviews: string[];
  resultImage: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface Texts {
  title: string;
  author: string;
  uploadPlaceholder: string;
  portraitLabel: string;
  fashionItemsLabel: string;
  sceneObjectLabel: string;
  promptLabel: string;
  promptPlaceholderFashion: string;
  qualityLabel: string;
  generateButton: string;
  downloadAllButton: string;
  loadingMessage: string;
  resultsGridTitle: string;
  fileTooLarge: string;
  fileTypeInvalid: string;
  missingInfoFashion: string;
  missingInfoSuggestionFashion: string;
  generationError: string;
  english: string;
  vietnamese: string;
  fashionMode: string;
  contactButton: string;
  communityButton: string;
  quotaExceeded: string;
  zaloButton: string;
  getSuggestionButton: string;
  gettingSuggestion: string;
  keepFaceLabel: string;
  initialStateTitle: string;
  initialStateMessage: string;
  reuseButton: string;
  addFashionRowButton: string;
  generateAllButton: string;
  removeRowButton: string;
  promptPlaceholder: string;
  promptPlaceholderCreative: string;
  referenceImageLabelCreative: string;
  referenceImageLabel: string;
  analyzingImage: string;
  communityShowcaseTitle: string;
  creativeMode: string;
  brandMode: string;

  // New texts for Outfit Processing Mode
  outfitProcessingMode: string;
  originalImageLabel: string;
  resultLabel: string;
  addOutfitRowButton: string;
  processAllButton: string;
  processButton: string;
  missingInfoOutfit: string;
  viewButton: string;
  fashionItemsLabelOutfit: string;
  addAccessoryButton: string;

  // New texts for Title/Description Generation
  generatedTitleLabel: string;
  generatedDescriptionLabel: string;
  copyButtonLabel: string;
  copiedLabel: string;
  socialContentTitle: string;
  generatedVeoPromptLabel: string;
  
  // New texts for regeneration
  regenerateButton: string;
  editPromptTitle: string;
  removeFaceButtonLabel: string;
  removePersonButtonLabel: string;
}