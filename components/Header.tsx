import React from 'react';

interface HeaderProps {
  title: string;
  author: string;
}

export const Header: React.FC<HeaderProps> = ({ title, author }) => {
  return (
    <header className="flex flex-col sm:flex-row sm:justify-between items-center w-full">
      <div className="text-center sm:text-left mb-4 sm:mb-0">
        <h1 className="text-xl font-bold tracking-tight text-slate-800">{title}</h1>
        <p className="text-xs text-gray-500">{author}</p>
      </div>
    </header>
  );
};