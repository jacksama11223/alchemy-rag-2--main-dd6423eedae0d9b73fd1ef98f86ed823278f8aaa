import React, { useState } from 'react';

export const NotesApp: React.FC = () => {
  const [note, setNote] = useState('');

  return (
    <div className="flex flex-col h-full bg-[#0f172a] p-4 gap-4">
      <div className="flex items-center justify-between shrink-0">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-400">edit_note</span>
          Quick Notes
        </h3>
        <button
          onClick={() => setNote('')}
          className="text-xs text-slate-400 hover:text-red-400 transition-colors"
        >
          Clear
        </button>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Type your notes here..."
        className="flex-1 w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none custom-scrollbar"
      />
    </div>
  );
};
