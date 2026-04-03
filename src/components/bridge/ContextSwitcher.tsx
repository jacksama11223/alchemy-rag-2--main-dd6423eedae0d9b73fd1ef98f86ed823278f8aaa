import React from 'react';
import { useLearningContext } from '../../hooks/useLearningContext';

export const ContextSwitcher = () => {
  const { activeTopic, clearContext } = useLearningContext();

  if (!activeTopic) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 border border-gray-700 text-white p-3 rounded-lg shadow-xl z-50 flex items-center gap-4">
      <div>
        <div className="text-xs text-gray-400">Active Topic</div>
        <div className="font-bold text-sm truncate max-w-[200px]">{activeTopic}</div>
      </div>
      <div className="flex gap-2">
        <button className="bg-blue-600 hover:bg-blue-500 text-xs px-2 py-1 rounded">Flashcards</button>
        <button className="bg-green-600 hover:bg-green-500 text-xs px-2 py-1 rounded">NoteLab</button>
        <button className="bg-purple-600 hover:bg-purple-500 text-xs px-2 py-1 rounded">Alchemy</button>
      </div>
      <button onClick={clearContext} className="text-gray-400 hover:text-white ml-2">✖</button>
    </div>
  );
};
