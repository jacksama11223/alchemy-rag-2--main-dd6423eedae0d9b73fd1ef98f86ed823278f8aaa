import React, { useState, useEffect } from 'react';
import { AlchemyStorageItem } from '../../types';
import { FlashcardDeck, FlashcardTemplate, StudioFlashcard } from './types';
import YoutubePlayer from '../alchemy-youtubevideo-extract/YoutubePlayer';
import RecordingPlayer from '../alchemy-recorded-extract/RecordingPlayer';
import { ZoomableImage } from '../alchemy-storage/StorageItemDetailView';

interface FlashcardStudioProps {
    item: AlchemyStorageItem;
    onClose: () => void;
    onPushToNode: (deck: FlashcardDeck, cards: StudioFlashcard[]) => void;
    onSaveFlashcard: (flashcard: any) => void;
}

export const FlashcardStudio: React.FC<FlashcardStudioProps> = ({ item, onClose, onPushToNode, onSaveFlashcard }) => {
    // State
    const [decks, setDecks] = useState<FlashcardDeck[]>([
        { id: 'default', name: 'Bộ thẻ mặc định', description: 'Bộ thẻ chung', color: 'bg-sky-500', createdAt: Date.now() }
    ]);
    const [activeDeckId, setActiveDeckId] = useState<string>('default');

    useEffect(() => {
        const fetchDecks = async () => {
            try {
                const { getFlashcardDecks } = await import('../../services/alchemyService');
                const fetchedDecks = await getFlashcardDecks();
                if (fetchedDecks.length > 0) {
                    setDecks(fetchedDecks);
                    setActiveDeckId(fetchedDecks[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch decks:', error);
            }
        };
        fetchDecks();
    }, []);

    const [templates, setTemplates] = useState<FlashcardTemplate[]>([
        { id: 'basic', name: 'Cơ bản', fields: ['Mặt trước', 'Mặt sau'], color: 'bg-blue-500' },
        { id: 'vocab', name: 'Từ vựng', fields: ['Từ vựng', 'Định nghĩa', 'Ví dụ'], color: 'bg-emerald-500' },
        { id: 'cloze', name: 'Điền khuyết', fields: ['Câu hỏi (dùng [...] cho chỗ trống)', 'Đáp án'], color: 'bg-amber-500' }
    ]);
    const [activeTemplateId, setActiveTemplateId] = useState<string>('basic');

    const [flashcards, setFlashcards] = useState<StudioFlashcard[]>([]);
    const [isLoadingCards, setIsLoadingCards] = useState(false);

    useEffect(() => {
        const fetchExistingCards = async () => {
            setIsLoadingCards(true);
            try {
                const { getAlchemyStorageFlashcards } = await import('../../services/alchemyService');
                const allCards = await getAlchemyStorageFlashcards();
                // Filter cards that belong to this source item
                const itemCards = allCards.filter(c => c.sourceItemId === item.id);
                
                // Map to StudioFlashcard format
                const mappedCards: StudioFlashcard[] = itemCards.map(c => ({
                    id: c.id,
                    deckId: c.deckId || 'default',
                    templateId: 'basic', // Default to basic for existing cards
                    fieldData: {
                        'Mặt trước': c.front,
                        'Mặt sau': c.back
                    },
                    comments: [],
                    createdAt: Date.now()
                }));
                
                setFlashcards(mappedCards);
            } catch (error) {
                console.error('Failed to fetch existing cards:', error);
            } finally {
                setIsLoadingCards(false);
            }
        };
        fetchExistingCards();
    }, [item.id]);

    const [showNewTemplateModal, setShowNewTemplateModal] = useState(false);
    const [showNewDeckModal, setShowNewDeckModal] = useState(false);

    // Derived
    const activeDeck = decks.find(d => d.id === activeDeckId) || decks[0];
    const activeTemplate = templates.find(t => t.id === activeTemplateId) || templates[0];
    const currentDeckCards = flashcards.filter(c => c.deckId === activeDeckId || (!c.deckId && activeDeckId === 'default'));

    // Handlers
    const handleSaveFlashcard = async (fieldData: Record<string, string>) => {
        const newCard: StudioFlashcard = {
            id: Date.now().toString(),
            deckId: activeDeckId,
            templateId: activeTemplateId,
            fieldData,
            comments: [],
            createdAt: Date.now()
        };
        setFlashcards([newCard, ...flashcards]);

        // Save to backend
        try {
            const { saveAlchemyStorageFlashcard } = await import('../../services/alchemyService');
            
            // Convert fieldData to front/back
            let front = '';
            let back = '';
            
            if (activeTemplate.id === 'basic') {
                front = fieldData['Mặt trước'] || '';
                back = fieldData['Mặt sau'] || '';
            } else if (activeTemplate.id === 'vocab') {
                front = fieldData['Từ vựng'] || '';
                back = `${fieldData['Định nghĩa'] || ''}\n\nVí dụ:\n${fieldData['Ví dụ'] || ''}`;
            } else if (activeTemplate.id === 'cloze') {
                front = fieldData['Câu hỏi (dùng [...] cho chỗ trống)'] || '';
                back = fieldData['Đáp án'] || '';
            } else {
                // Fallback for custom templates
                const fields = Object.keys(fieldData);
                if (fields.length > 0) front = fieldData[fields[0]];
                if (fields.length > 1) back = fields.slice(1).map(f => `${f}:\n${fieldData[f]}`).join('\n\n');
            }

            if (!front.trim()) {
                console.warn('Front of flashcard is empty, skipping save');
                return;
            }

            const savedCard = await saveAlchemyStorageFlashcard({
                front,
                back,
                tags: [activeDeck.name],
                sourceItemId: item.id,
                deckId: activeDeckId !== 'default' ? activeDeckId : undefined,
                deckName: activeDeck.name
            });
            
            // Update the local card with the real ID from backend
            setFlashcards(prev => prev.map(c => c.id === newCard.id ? { ...c, id: savedCard.id } : c));
            
            onSaveFlashcard(savedCard);
        } catch (error) {
            console.error('Failed to save flashcard to backend:', error);
        }
    };

    const handleDeleteCard = (id: string) => {
        setFlashcards(flashcards.filter(c => c.id !== id));
    };

    const handleAddComment = (cardId: string, text: string) => {
        setFlashcards(flashcards.map(c => {
            if (c.id === cardId) {
                return {
                    ...c,
                    comments: [...c.comments, { id: Date.now().toString(), text, timestamp: Date.now(), author: 'Bạn' }]
                };
            }
            return c;
        }));
    };

    return (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex flex-col animate-[fadeIn_0.2s]">
            {/* Header */}
            <div className="h-14 bg-slate-800 border-b border-slate-700 flex items-center justify-between px-4 text-white shrink-0">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-amber-400">style</span>
                    <h2 className="font-bold text-lg">Flashcard Studio</h2>
                    <span className="text-slate-400 text-sm px-2 border-l border-slate-600 ml-2 truncate max-w-md">{item.title}</span>
                </div>
                <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-700 transition-colors">
                    <span className="material-symbols-outlined">close</span>
                </button>
            </div>

            {/* Split Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Source Viewer */}
                <div className="w-1/2 border-r border-slate-700 bg-slate-900 flex flex-col">
                    <SourceViewer item={item} />
                </div>

                {/* Right: Deck Workspace */}
                <div className="w-1/2 bg-slate-800 flex flex-col">
                    <DeckWorkspace 
                        decks={decks}
                        activeDeckId={activeDeckId}
                        setActiveDeckId={setActiveDeckId}
                        templates={templates}
                        activeTemplateId={activeTemplateId}
                        setActiveTemplateId={setActiveTemplateId}
                        currentDeckCards={currentDeckCards}
                        activeTemplate={activeTemplate}
                        onSaveFlashcard={handleSaveFlashcard}
                        onDeleteCard={handleDeleteCard}
                        onAddComment={handleAddComment}
                        onNewTemplate={() => setShowNewTemplateModal(true)}
                        onNewDeck={() => setShowNewDeckModal(true)}
                        onPushToNode={() => onPushToNode(activeDeck, currentDeckCards)}
                    />
                </div>
            </div>

            {/* Modals */}
            {showNewTemplateModal && (
                <NewTemplateModal 
                    onClose={() => setShowNewTemplateModal(false)}
                    onSave={(t: any) => { setTemplates([...templates, t]); setActiveTemplateId(t.id); setShowNewTemplateModal(false); }}
                />
            )}
            {showNewDeckModal && (
                <NewDeckModal 
                    onClose={() => setShowNewDeckModal(false)}
                    onSave={async (d: any) => { 
                        try {
                            const { createFlashcardDeck } = await import('../../services/alchemyService');
                            const newDeck = await createFlashcardDeck({
                                name: d.name,
                                description: d.description,
                                color: d.color
                            });
                            setDecks([...decks, newDeck]); 
                            setActiveDeckId(newDeck.id); 
                            setShowNewDeckModal(false); 
                        } catch (error) {
                            console.error('Failed to create deck:', error);
                        }
                    }}
                />
            )}
        </div>
    );
};

// --- Sub Components ---

const SourceViewer = ({ item }: { item: AlchemyStorageItem }) => {
    const [viewMode, setViewMode] = useState<'text' | 'original'>('text');
    
    return (
        <div className="flex flex-col h-full">
            <div className="h-12 border-b border-slate-700 flex items-center px-4 gap-2 shrink-0 bg-slate-800/50">
                <button onClick={() => setViewMode('text')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'text' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>Văn bản trích xuất</button>
                {item.originalContent && (
                    <button onClick={() => setViewMode('original')} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'original' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>Bản gốc</button>
                )}
            </div>
            <div className="flex-1 overflow-auto p-8 custom-scrollbar">
                {viewMode === 'text' ? (
                    <div className="prose prose-invert max-w-none">
                        <p className="whitespace-pre-wrap text-slate-300 leading-relaxed text-lg selection:bg-amber-500/40 selection:text-amber-100">
                            {item.extractedText || 'Không có văn bản trích xuất.'}
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center min-h-full">
                        {item.sourceType === 'ocr' || item.sourceType === 'upload' ? (
                            <ZoomableImage src={item.originalContent as string} alt="Original" />
                        ) : item.sourceType === 'voice' ? (
                            <RecordingPlayer audioData={item.originalContent as string} title={item.title} />
                        ) : (item.sourceType === 'youtube' || item.sourceType === 'web') && typeof item.originalContent === 'string' && (item.originalContent.includes('youtube.com') || item.originalContent.includes('youtu.be')) ? (
                            <YoutubePlayer videoId={item.originalContent.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/)?.[1] || ''} />
                        ) : (
                            <pre className="text-sm text-slate-400 whitespace-pre-wrap font-mono bg-slate-800 p-6 rounded-xl border border-slate-700">{item.originalContent}</pre>
                        )}
                    </div>
                )}
            </div>
            <div className="p-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-400 flex items-center gap-2 shrink-0">
                <span className="material-symbols-outlined text-[16px] text-amber-400 animate-pulse">lightbulb</span>
                <span className="font-medium">Mẹo: Bôi đen đoạn văn bản bất kỳ và kéo thả sang các ô bên phải để tạo Flashcard nhanh.</span>
            </div>
        </div>
    );
};

const DeckWorkspace = ({ decks, activeDeckId, setActiveDeckId, templates, activeTemplateId, setActiveTemplateId, currentDeckCards, activeTemplate, onSaveFlashcard, onDeleteCard, onAddComment, onNewTemplate, onNewDeck, onPushToNode }: any) => {
    return (
        <div className="flex flex-col h-full">
            {/* Top: Deck & Template Selection */}
            <div className="p-4 border-b border-slate-700 shrink-0 flex flex-col gap-4 bg-slate-800/80">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-slate-400">folder_special</span>
                        <select 
                            value={activeDeckId} 
                            onChange={e => setActiveDeckId(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white font-medium rounded-lg px-3 py-1.5 text-sm outline-none focus:border-sky-500 transition-colors cursor-pointer"
                        >
                            {decks.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                        <button onClick={onNewDeck} className="joyride-create-deck w-8 h-8 flex items-center justify-center rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors" title="Tạo bộ thẻ mới">
                            <span className="material-symbols-outlined text-[18px]">add</span>
                        </button>
                    </div>
                    <button onClick={onPushToNode} className="px-4 py-1.5 bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30 rounded-lg text-sm font-bold flex items-center gap-2 transition-all hover:scale-105">
                        <span className="material-symbols-outlined text-[18px]">account_tree</span>
                        Đẩy sang Node Học
                    </button>
                </div>
                
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400">dashboard_customize</span>
                    <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-1">
                        {templates.map((t: any) => (
                            <button 
                                key={t.id}
                                onClick={() => setActiveTemplateId(t.id)}
                                className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeTemplateId === t.id ? `${t.color} text-white shadow-md scale-105` : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                            >
                                {t.name}
                            </button>
                        ))}
                        <button onClick={onNewTemplate} className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 border border-slate-600 text-slate-400 hover:text-white hover:border-slate-400 border-dashed flex items-center gap-1 transition-colors">
                            <span className="material-symbols-outlined text-[14px]">add</span> Mẫu mới
                        </button>
                    </div>
                </div>
            </div>

            {/* Middle: Flashcard Editor Form */}
            <div className="p-4 border-b border-slate-700 shrink-0 bg-slate-900/30">
                <FlashcardEditor template={activeTemplate} onSave={onSaveFlashcard} />
            </div>

            {/* Bottom: List of created flashcards in current deck */}
            <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-slate-900/80">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">style</span>
                    Thẻ đã tạo trong bộ ({currentDeckCards.length})
                </h4>
                <div className="flex flex-col gap-3">
                    {currentDeckCards.map((card: any) => (
                        <FlashcardListItem key={card.id} card={card} template={templates.find((t: any) => t.id === card.templateId)} onDelete={onDeleteCard} onAddComment={onAddComment} />
                    ))}
                    {currentDeckCards.length === 0 && (
                        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-800/30 flex flex-col items-center gap-3">
                            <span className="material-symbols-outlined text-4xl text-slate-600">drag_indicator</span>
                            <p>Chưa có thẻ nào.<br/>Hãy bôi đen và kéo thả văn bản từ bên trái vào các ô bên trên để tạo thẻ!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const FlashcardEditor = ({ template, onSave }: any) => {
    const [fieldData, setFieldData] = useState<Record<string, string>>({});

    useEffect(() => { setFieldData({}); }, [template.id]);

    const handleDrop = (e: React.DragEvent, field: string) => {
        e.preventDefault();
        const text = e.dataTransfer.getData('text/plain');
        if (text) {
            setFieldData(prev => ({
                ...prev,
                [field]: prev[field] ? `${prev[field]}\n${text}` : text
            }));
        }
    };

    const handleSave = () => {
        if (Object.values(fieldData).some(v => typeof v === 'string' && v.trim().length > 0)) {
            onSave(fieldData);
            setFieldData({});
        }
    };

    return (
        <div className="flex flex-col gap-4">
            {template.fields.map((field: string) => (
                <div key={field} className="flex flex-col gap-1.5 relative group">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        {field}
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-sky-400 font-normal normal-case bg-sky-500/10 px-2 py-0.5 rounded-full">Kéo thả text vào đây</span>
                    </label>
                    <textarea
                        value={fieldData[field] || ''}
                        onChange={e => setFieldData(prev => ({ ...prev, [field]: e.target.value }))}
                        onDragOver={e => e.preventDefault()}
                        onDrop={e => handleDrop(e, field)}
                        onKeyDown={e => {
                            if (e.ctrlKey && e.key === 'Enter') {
                                handleSave();
                            }
                        }}
                        placeholder="Nhập nội dung hoặc kéo thả văn bản vào đây..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white placeholder:text-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none resize-none min-h-[80px] custom-scrollbar transition-all shadow-inner"
                    />
                </div>
            ))}
            <div className="flex justify-end mt-2">
                <button onClick={handleSave} className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105">
                    <span className="material-symbols-outlined text-[18px]">save</span>
                    Lưu Thẻ (Ctrl+Enter)
                </button>
            </div>
        </div>
    );
};

const FlashcardListItem = ({ card, template, onDelete, onAddComment }: any) => {
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col gap-3 group hover:border-slate-600 transition-colors shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 flex flex-col gap-3">
                    {template?.fields.map((field: string) => (
                        <div key={field} className="flex flex-col bg-slate-900/50 p-3 rounded-xl border border-slate-700/50">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">{field}</span>
                            <span className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{card.fieldData[field] || '-'}</span>
                        </div>
                    ))}
                </div>
                <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onDelete(card.id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors" title="Xóa thẻ">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                </div>
            </div>
            
            {/* Comments toggle */}
            <div className="pt-3 border-t border-slate-700/50 flex items-center justify-between mt-1">
                <button onClick={() => setShowComments(!showComments)} className={`text-xs flex items-center gap-1.5 transition-colors font-medium ${showComments ? 'text-sky-400' : 'text-slate-400 hover:text-sky-400'}`}>
                    <span className="material-symbols-outlined text-[16px]">chat_bubble</span>
                    {card.comments.length} Bình luận / Ghi chú
                </button>
                <span className="text-[10px] text-slate-500 font-medium">{new Date(card.createdAt).toLocaleTimeString()}</span>
            </div>

            {/* Comments section */}
            {showComments && (
                <div className="flex flex-col gap-2 mt-2 bg-slate-900 rounded-xl p-3 border border-slate-700/50 animate-[fadeIn_0.2s]">
                    {card.comments.map((c: any) => (
                        <div key={c.id} className="flex flex-col gap-1 bg-slate-800 p-2.5 rounded-lg border border-slate-700/50">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">{c.author}</span>
                                <span className="text-[10px] text-slate-500">{new Date(c.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <span className="text-xs text-slate-300 mt-1">{c.text}</span>
                        </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                        <input 
                            type="text" 
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter' && commentText.trim()) {
                                    onAddComment(card.id, commentText);
                                    setCommentText('');
                                }
                            }}
                            placeholder="Thêm ghi chú/bình luận..."
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-sky-500 transition-colors"
                        />
                        <button 
                            onClick={() => {
                                if (commentText.trim()) {
                                    onAddComment(card.id, commentText);
                                    setCommentText('');
                                }
                            }}
                            className="w-9 h-9 flex items-center justify-center bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-colors shadow-sm"
                        >
                            <span className="material-symbols-outlined text-[16px]">send</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Modals ---

const NewTemplateModal = ({ onClose, onSave }: any) => {
    const [name, setName] = useState('');
    const [fields, setFields] = useState(['Mặt trước', 'Mặt sau']);

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s]">
            <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden animate-[slideUp_0.3s]">
                <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-sky-400">dashboard_customize</span>
                        Tạo Mẫu Flashcard Mới
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
                <div className="p-6 flex flex-col gap-5">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tên mẫu</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-sky-500 transition-colors" placeholder="VD: Ngữ pháp tiếng Anh" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Các trường dữ liệu (Fields)</label>
                        <div className="flex flex-col gap-3">
                            {fields.map((f: string, i: number) => (
                                <div key={i} className="flex gap-2">
                                    <input value={f} onChange={e => {
                                        const newF = [...fields];
                                        newF[i] = e.target.value;
                                        setFields(newF);
                                    }} className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-sky-500 transition-colors" placeholder={`Trường ${i + 1}`} />
                                    <button onClick={() => setFields(fields.filter((_, idx) => idx !== i))} className="w-11 flex items-center justify-center bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors"><span className="material-symbols-outlined text-[18px]">delete</span></button>
                                </div>
                            ))}
                            <button onClick={() => setFields([...fields, `Trường ${fields.length + 1}`])} className="py-2.5 border border-dashed border-slate-600 text-slate-400 rounded-xl hover:text-white hover:border-slate-400 hover:bg-slate-700/50 flex items-center justify-center gap-2 text-sm mt-1 transition-all">
                                <span className="material-symbols-outlined text-[18px]">add</span> Thêm trường
                            </button>
                        </div>
                    </div>
                </div>
                <div className="p-5 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-slate-300 hover:text-white font-medium rounded-xl hover:bg-slate-700 transition-colors">Hủy</button>
                    <button onClick={() => {
                        if (name.trim() && fields.length > 0) {
                            onSave({ id: Date.now().toString(), name, fields, color: 'bg-purple-500' });
                        }
                    }} className="px-6 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-bold rounded-xl shadow-md transition-all">Lưu Mẫu</button>
                </div>
            </div>
        </div>
    );
};

const NewDeckModal = ({ onClose, onSave }: any) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s]">
            <div className="bg-slate-800 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl overflow-hidden animate-[slideUp_0.3s]">
                <div className="p-5 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">folder_special</span>
                        Tạo Bộ Thẻ Mới
                    </h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
                </div>
                <div className="p-6 flex flex-col gap-5">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Tên bộ thẻ</label>
                        <input value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-sky-500 transition-colors" placeholder="VD: Từ vựng IELTS Bài 1" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Mô tả ngắn</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-white outline-none focus:border-sky-500 transition-colors resize-none h-24" placeholder="Mô tả bộ thẻ này dùng để làm gì..." />
                    </div>
                </div>
                <div className="p-5 border-t border-slate-700 bg-slate-800/50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 text-slate-300 hover:text-white font-medium rounded-xl hover:bg-slate-700 transition-colors">Hủy</button>
                    <button onClick={() => {
                        if (name.trim()) {
                            onSave({ id: Date.now().toString(), name, description, color: 'bg-amber-500', createdAt: Date.now() });
                        }
                    }} className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-md transition-all">Tạo Bộ Thẻ</button>
                </div>
            </div>
        </div>
    );
};
