import React from 'react';
import { Texts } from '../types';
import { Icon } from './Icon';

interface CustomPromptProps {
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  texts: Texts;
  placeholder: string;
  // FIX: Add props for suggestion functionality to resolve type error.
  onGetSuggestion: () => void;
  isSuggesting: boolean;
  isSuggestionDisabled: boolean;
}

export const CustomPrompt: React.FC<CustomPromptProps> = ({ 
  prompt, 
  setPrompt, 
  texts, 
  placeholder,
  onGetSuggestion,
  isSuggesting,
  isSuggestionDisabled
}) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="custom-prompt" className="block text-sm font-medium text-slate-700">
          {texts.promptLabel}
        </label>
        {/* FIX: Add the suggestion button, which was missing from this component. */}
        <button
            onClick={onGetSuggestion}
            disabled={isSuggesting || isSuggestionDisabled}
            className="flex justify-center items-center py-1.5 px-3 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200 hover:bg-blue-200/70 transition-all duration-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
        >
            {isSuggesting ? (
            <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {texts.gettingSuggestion}
            </>
            ) : (
            texts.getSuggestionButton
            )}
        </button>
      </div>
      <div className="relative">
        <textarea
          id="custom-prompt"
          rows={4}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-blue-300 rounded-md p-3 pr-10 text-sm text-slate-800 placeholder-blue-400/70 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
        />
        <div className="absolute top-3 right-3 text-slate-400">
          <Icon type="edit" className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};