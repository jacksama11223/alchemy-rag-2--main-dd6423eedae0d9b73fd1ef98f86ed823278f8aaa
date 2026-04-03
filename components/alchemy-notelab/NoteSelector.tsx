import React from 'react';
import { GlassSurface } from '../common/BrandAssets';

interface NoteSelectorProps {
    notes: any[];
    isLoading: boolean;
    selectedNoteId: string | null;
    onSelectNote: (note: any) => void;
}

const NoteSelector: React.FC<NoteSelectorProps> = ({ notes, isLoading, selectedNoteId, onSelectNote }) => {
    return (
        <GlassSurface className="p-4 h-[400px] flex flex-col">
            <h4 className="font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span>Danh sách Ghi chú</span>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                    {notes.length}
                </span>
            </h4>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3">
                        <span className="material-symbols-outlined animate-spin text-3xl">sync</span>
                        <span className="text-sm">Đang tải...</span>
                    </div>
                ) : notes.length > 0 ? (
                    notes.map((note) => (
                        <button
                            key={note.id || note._id}
                            onClick={() => onSelectNote(note)}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                                (selectedNoteId === note.id || selectedNoteId === note._id)
                                    ? 'bg-amber-50 border-amber-200 shadow-sm'
                                    : 'bg-white border-transparent hover:bg-slate-50 hover:border-slate-200'
                            }`}
                        >
                            <div className={`p-2 rounded-lg shrink-0 ${
                                (selectedNoteId === note.id || selectedNoteId === note._id) ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-500'
                            }`}>
                                <span className="material-symbols-outlined text-sm">description</span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h5 className={`font-medium text-sm truncate ${
                                    (selectedNoteId === note.id || selectedNoteId === note._id) ? 'text-amber-900' : 'text-slate-700'
                                }`}>
                                    {note.title || 'Không có tiêu đề'}
                                </h5>
                                <p className="text-xs text-slate-400 mt-1 truncate">
                                    {note.blocks && note.blocks.length > 0 ? (note.blocks[0].data?.text || note.blocks[0].content || '').substring(0, 30) + '...' : 'Ghi chú trống'}
                                </p>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
                        <span className="material-symbols-outlined text-3xl opacity-50">note_stack</span>
                        <span className="text-sm">Không có ghi chú nào</span>
                    </div>
                )}
            </div>
        </GlassSurface>
    );
};

export default NoteSelector;
