import React, { useState, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import { getAuthHeader, getNotesFromBackend } from '../../services/mockBackend';
import NoteSelector from './NoteSelector';
import NoteHighlighterFlashcard from './NoteHighlighterFlashcard';
import NoteCreator from './NoteCreator';

interface NoteLabIntegrationProps {
    onAddSource: (source: any) => void;
}

const NoteLabIntegration: React.FC<NoteLabIntegrationProps> = ({ onAddSource }) => {
    const [selectedNote, setSelectedNote] = useState<any | null>(null);
    const [notes, setNotes] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Fetch notes from backend
    useEffect(() => {
        const fetchNotes = async () => {
            setIsLoading(true);
            try {
                const data = await getNotesFromBackend();
                if (data && data.length > 0) {
                    setNotes(data.filter((n: any) => n.type === 'note'));
                } else {
                    // Fallback to mock data if API fails or empty
                    setNotes([
                        { _id: '1', title: 'Ghi chú Vật lý Lượng tử', blocks: [{ type: 'paragraph', data: { text: 'Vật lý lượng tử là một nhánh của vật lý học nghiên cứu các hiện tượng ở cấp độ vi mô, nơi các định luật vật lý cổ điển không còn đúng nữa. Một trong những khái niệm quan trọng nhất là sự chồng chập lượng tử.' } }] },
                        { _id: '2', title: 'Lịch sử Cách mạng Công nghiệp', blocks: [{ type: 'paragraph', data: { text: 'Cách mạng Công nghiệp lần thứ nhất bắt đầu ở Anh vào cuối thế kỷ 18, với sự ra đời của máy hơi nước và cơ giới hóa ngành dệt may.' } }] },
                        { _id: '3', title: 'Sinh học Tế bào', blocks: [{ type: 'paragraph', data: { text: 'Tế bào là đơn vị cấu trúc và chức năng cơ bản của mọi sinh vật sống. Mỗi tế bào đều có màng tế bào, tế bào chất và vật chất di truyền (DNA).' } }] },
                    ]);
                }
            } catch (error) {
                console.error("Error fetching notes:", error);
                // Fallback
                setNotes([
                    { _id: '1', title: 'Ghi chú Vật lý Lượng tử', blocks: [{ type: 'paragraph', data: { text: 'Vật lý lượng tử là một nhánh của vật lý học nghiên cứu các hiện tượng ở cấp độ vi mô, nơi các định luật vật lý cổ điển không còn đúng nữa. Một trong những khái niệm quan trọng nhất là sự chồng chập lượng tử.' } }] },
                    { _id: '2', title: 'Lịch sử Cách mạng Công nghiệp', blocks: [{ type: 'paragraph', data: { text: 'Cách mạng Công nghiệp lần thứ nhất bắt đầu ở Anh vào cuối thế kỷ 18, với sự ra đời của máy hơi nước và cơ giới hóa ngành dệt may.' } }] },
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchNotes();
    }, []);

    const handleSelectNote = (note: any) => {
        setSelectedNote(note);
        setIsCreating(false);
    };

    const handleCreateNewNote = () => {
        setSelectedNote(null);
        setIsCreating(true);
    };

    const handleNoteCreated = (newNote: any) => {
        setNotes([newNote, ...notes]);
        setSelectedNote(newNote);
        setIsCreating(false);
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
    };

    const handleImportToAlchemy = () => {
        if (selectedNote) {
            // Extract text from blocks
            let fullText = '';
            if (selectedNote.blocks && Array.isArray(selectedNote.blocks)) {
                fullText = selectedNote.blocks.map((b: any) => b.data?.text || b.content || '').join('\n');
            } else if (selectedNote.content) {
                fullText = selectedNote.content;
            }

            onAddSource({
                id: `note-${Date.now()}`,
                type: 'text',
                content: fullText || 'Nội dung ghi chú trống',
                metadata: {
                    title: selectedNote.title,
                    source: 'NoteLab'
                }
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 text-amber-600 mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">edit_note</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Nhập từ NoteLab</h3>
                <p className="text-slate-600 max-w-lg mx-auto">
                    Chọn ghi chú từ hệ thống NoteLab của bạn để đưa vào Lò Luyện AI hoặc tạo Flashcard trực tiếp từ nội dung ghi chú.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Note Selector */}
                <div className="lg:col-span-1 flex flex-col gap-4">
                    <button 
                        onClick={handleCreateNewNote}
                        className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-sm border ${
                            isCreating 
                                ? 'bg-amber-500 text-white border-amber-600' 
                                : 'bg-white text-amber-600 border-amber-200 hover:bg-amber-50'
                        }`}
                    >
                        <span className="material-symbols-outlined">add_circle</span>
                        Tạo Ghi chú Mới
                    </button>
                    
                    <NoteSelector 
                        notes={notes} 
                        isLoading={isLoading} 
                        selectedNoteId={selectedNote?.id || selectedNote?._id} 
                        onSelectNote={handleSelectNote} 
                    />
                </div>

                {/* Right Column: Note Viewer & Highlighter or Creator */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {isCreating ? (
                        <NoteCreator 
                            onNoteCreated={handleNoteCreated} 
                            onCancel={handleCancelCreate} 
                        />
                    ) : selectedNote ? (
                        <>
                            <GlassSurface className="p-6 flex flex-col h-[400px]">
                                <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                                    <h4 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-amber-500">description</span>
                                        {selectedNote.title}
                                    </h4>
                                    <button 
                                        onClick={handleImportToAlchemy}
                                        className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl font-medium transition-colors flex items-center gap-2 text-sm shadow-sm"
                                    >
                                        <span className="material-symbols-outlined text-sm">input</span>
                                        Đưa vào Lò Luyện
                                    </button>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                    <NoteHighlighterFlashcard note={selectedNote} />
                                </div>
                            </GlassSurface>
                        </>
                    ) : (
                        <GlassSurface className="p-12 flex flex-col items-center justify-center h-[400px] text-center border-dashed border-2 border-slate-200">
                            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                <span className="material-symbols-outlined text-4xl text-slate-300">swipe_left</span>
                            </div>
                            <h4 className="text-lg font-medium text-slate-700 mb-2">Chưa chọn ghi chú nào</h4>
                            <p className="text-slate-500 text-sm max-w-sm">
                                Hãy chọn một ghi chú từ danh sách bên trái để xem nội dung, highlight và tạo flashcard.
                            </p>
                        </GlassSurface>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteLabIntegration;
