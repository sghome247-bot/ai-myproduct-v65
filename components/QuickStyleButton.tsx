
import React from 'react';

interface QuickStyleButtonProps {
  label: string;
  onClick: () => void;
}

export const QuickStyleButton: React.FC<QuickStyleButtonProps> = ({ label, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-xs font-medium bg-slate-700 text-slate-300 rounded-full hover:bg-blue-500 hover:text-white transition-colors"
    >
      {label}
    </button>
  );
};
