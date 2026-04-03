import React, { useState, useEffect } from 'react';
import { AlchemyStorageItem, AlchemyStorageFlashcard, StorageSourceType, KnowledgeNode } from '../../types';
import { StorageSourceSelector } from './StorageSourceSelector';
import { StorageItemList } from './StorageItemList';
import { StorageItemDetailView } from './StorageItemDetailView';
import { FlashcardGallery } from './FlashcardGallery';
import { FlashcardAggregator } from './FlashcardAggregator';
import { AITextProcessor } from './AITextProcessor';
import { FlashcardToGraphPush } from './FlashcardToGraphPush';
import { UnifiedStorageView } from './UnifiedStorageView';
import { FlashcardStudio } from '../alchemy-flashcard/FlashcardStudio';
import { FlashcardDeck, StudioFlashcard } from '../alchemy-flashcard/types';
import { useDataSync } from '../Drive-MoveItems/DataSyncLogic';
import { 
    getAlchemyStorageItems, 
    updateAlchemyStorageItem, 
    getAlchemyStorageFlashcards, 
    updateAlchemyStorageFlashcard, 
    deleteAlchemyStorageFlashcard 
} from '../../services/alchemyService';

interface AlchemyStorageManagerProps {
    onProcessText: (text: string, method: string) => void;
    onPushToGraph: (nodes: KnowledgeNode[]) => void;
}

export const AlchemyStorageManager: React.FC<AlchemyStorageManagerProps> = ({ onProcessText, onPushToGraph }) => {
    const [items, setItems] = useState<AlchemyStorageItem[]>([]);
    const [flashcards, setFlashcards] = useState<AlchemyStorageFlashcard[]>([]);
    const [selectedSource, setSelectedSource] = useState<StorageSourceType | 'all'>('all');
    const [selectedItem, setSelectedItem] = useState<AlchemyStorageItem | null>(null);
    const [studioItem, setStudioItem] = useState<AlchemyStorageItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const { syncData } = useDataSync((data) => {
        if (data.type === 'file_updated' && data.item) {
            setItems(prev => prev.map(item => item.id === data.item.id ? { ...item, ...data.item } : item));
        } else if (data.type === 'file_created' && data.item) {
            setItems(prev => [data.item, ...prev]);
        } else if (data.type === 'file_deleted' && data.id) {
            setItems(prev => prev.filter(item => item.id !== data.id));
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const fetchedItems = await getAlchemyStorageItems();
                const fetchedFlashcards = await getAlchemyStorageFlashcards();
                
                // Fetch saved recordings and youtube videos to merge into storage
                const { getAuthHeader } = await import('../../services/mockBackend');
                
                let extraItems: AlchemyStorageItem[] = [];
                
                try {
                    const recRes = await fetch('/api/savedrecordings', { headers: getAuthHeader() });
                    if (recRes.ok) {
                        const recordings = await recRes.json();
                        if (Array.isArray(recordings)) {
                            extraItems = [...extraItems, ...recordings.map((r: any) => ({
                                id: r._id,
                                sourceType: 'voice' as StorageSourceType,
                                title: r.title,
                                originalContent: r.audioData,
                                extractedText: r.transcript,
                                createdAt: r.createdAt,
                                updatedAt: r.createdAt
                            }))];
                        }
                    }
                } catch (e) { console.error("Failed to fetch recordings", e); }
                
                try {
                    const ytRes = await fetch('/api/savedyoutubevideos', { headers: getAuthHeader() });
                    if (ytRes.ok) {
                        const videos = await ytRes.json();
                        if (Array.isArray(videos)) {
                            extraItems = [...extraItems, ...videos.map((v: any) => ({
                                id: v._id,
                                sourceType: 'youtube' as StorageSourceType,
                                title: v.title,
                                originalContent: v.url,
                                extractedText: v.subtitles,
                                createdAt: v.createdAt,
                                updatedAt: v.createdAt
                            }))];
                        }
                    }
                } catch (e) { console.error("Failed to fetch youtube videos", e); }
                
                try {
                    const urlRes = await fetch('/api/savedurls', { headers: getAuthHeader() });
                    if (urlRes.ok) {
                        const urls = await urlRes.json();
                        if (Array.isArray(urls)) {
                            extraItems = [...extraItems, ...urls.map((u: any) => ({
                                id: u._id,
                                sourceType: 'web' as StorageSourceType,
                                title: u.title,
                                originalContent: u.url,
                                extractedText: u.textContent || u.htmlContent,
                                createdAt: u.createdAt,
                                updatedAt: u.createdAt
                            }))];
                        }
                    }
                } catch (e) { console.error("Failed to fetch saved urls", e); }
                
                try {
                    const ocrRes = await fetch('/api/ocr', { headers: getAuthHeader() });
                    if (ocrRes.ok) {
                        const ocrs = await ocrRes.json();
                        if (Array.isArray(ocrs)) {
                            extraItems = [...extraItems, ...ocrs.map((o: any) => ({
                                id: o._id,
                                sourceType: 'ocr' as StorageSourceType,
                                title: o.title,
                                originalContent: o.imageUrl,
                                extractedText: o.extractedText,
                                createdAt: o.createdAt,
                                updatedAt: o.updatedAt
                            }))];
                        }
                    }
                } catch (e) { console.error("Failed to fetch ocr documents", e); }
                
                try {
                    const textRes = await fetch('/api/pasted-texts', { headers: getAuthHeader() });
                    if (textRes.ok) {
                        const texts = await textRes.json();
                        if (Array.isArray(texts)) {
                            extraItems = [...extraItems, ...texts.map((t: any) => ({
                                id: t._id,
                                sourceType: 'text' as StorageSourceType,
                                title: t.title,
                                originalContent: t.content,
                                extractedText: t.content,
                                createdAt: t.createdAt,
                                updatedAt: t.createdAt
                            }))];
                        }
                    }
                } catch (e) { console.error("Failed to fetch pasted texts", e); }
                
                try {
                    const notesRes = await fetch('/api/notes', { headers: getAuthHeader() });
                    if (notesRes.ok) {
                        const notes = await notesRes.json();
                        if (Array.isArray(notes)) {
                            extraItems = [...extraItems, ...notes.map((n: any) => ({
                                id: n._id || n.id,
                                sourceType: 'note' as StorageSourceType,
                                title: n.title,
                                originalContent: '',
                                extractedText: n.blocks ? n.blocks.map((b:any) => b.content).join('\n') : '',
                                createdAt: n.updatedAt || n.createdAt || new Date().toISOString(),
                                updatedAt: n.updatedAt || n.createdAt || new Date().toISOString()
                            }))];
                        }
                    }
                } catch (e) { console.error("Failed to fetch notes", e); }
                
                // Merge and sort by createdAt descending
                const allItems = [...fetchedItems, ...extraItems].sort((a, b) => {
                    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                    return timeB - timeA;
                });
                
                // Remove duplicates by id just in case
                const uniqueItems = Array.from(new Map(allItems.map(item => [item.id, item])).values());
                
                setItems(uniqueItems);
                setFlashcards(fetchedFlashcards);
            } catch (error) {
                console.error("Failed to fetch storage data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredItems = (selectedSource === 'all' || selectedSource === 'unified')
        ? items 
        : items.filter(item => item.sourceType === selectedSource);

    const handleUpdateItem = async (updatedItem: AlchemyStorageItem) => {
        const result = await updateAlchemyStorageItem(updatedItem.id, updatedItem);
        if (result) {
            setItems(prev => prev.map(item => item.id === updatedItem.id ? result : item));
            setSelectedItem(result);
            syncData({ type: 'file_updated', item: result });
        }
    };

    const handleToggleFlashcardSelect = (id: string) => {
        setFlashcards(prev => prev.map(card => 
            card.id === id ? { ...card, isSelected: !card.isSelected } : card
        ));
    };

    const handleSelectAllFlashcards = () => {
        setFlashcards(prev => prev.map(card => ({ ...card, isSelected: true })));
    };

    const handleDeselectAllFlashcards = () => {
        setFlashcards(prev => prev.map(card => ({ ...card, isSelected: false })));
    };

    const handleUpdateFlashcard = async (updatedCard: AlchemyStorageFlashcard) => {
        const result = await updateAlchemyStorageFlashcard(updatedCard.id, updatedCard);
        if (result) {
            setFlashcards(prev => prev.map(card => card.id === updatedCard.id ? result : card));
        }
    };

    const handleRemoveFlashcard = async (id: string) => {
        const success = await deleteAlchemyStorageFlashcard(id);
        if (success) {
            setFlashcards(prev => prev.filter(card => card.id !== id));
        }
    };

    const handleAggregateFlashcards = (aggregatedCards: AlchemyStorageFlashcard[]) => {
        // Automatically select the aggregated cards
        const aggregatedIds = aggregatedCards.map(c => c.id);
        setFlashcards(prev => prev.map(card => 
            aggregatedIds.includes(card.id) ? { ...card, isSelected: true } : card
        ));
    };

    const handlePushFlashcardsToGraph = async (cardsToPush: AlchemyStorageFlashcard[]) => {
        try {
            const { createNodeInBackend } = await import('../../services/mockBackend');
            
            const groupedFlashcards = cardsToPush.map(c => ({
                front: c.front,
                back: c.back
            }));

            const nodeData = {
                title: `Bộ Flashcard (${cardsToPush.length} thẻ)`,
                type: 'Flashcard',
                status: 'new',
                tags: ['Flashcard'],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 300,
                timestamp: new Date(),
                data: {
                    flashcards: groupedFlashcards,
                    summary: `Bộ thẻ gồm ${cardsToPush.length} khái niệm được chọn từ Alchemy.`,
                    cardCount: cardsToPush.length
                }
            };
            
            const createdNode = await createNodeInBackend(nodeData);
            const newNodes = createdNode ? [createdNode] : [{ ...nodeData, id: Date.now().toString() }];
            
            onPushToGraph(newNodes as KnowledgeNode[]);
            handleDeselectAllFlashcards();
        } catch (error) {
            console.error('Failed to push flashcards to graph:', error);
        }
    };

    const handlePushStudioCardsToGraph = async (deck: FlashcardDeck, cards: StudioFlashcard[]) => {
        try {
            const { pushFlashcardDeckToGraph, createNodeInBackend } = await import('../../services/mockBackend');
            
            // Nếu bạn đang trực tiếp đẩy nguyên cả Deck đã lưu từ Studio
            if (deck.id && !deck.id.startsWith('temp_')) {
                const createdNode = await pushFlashcardDeckToGraph(deck.id);
                if (createdNode) {
                    onPushToGraph([createdNode as KnowledgeNode]);
                    setStudioItem(null);
                    return;
                }
            }

            // Fallback: nếu chưa lưu hoặc lỗi DB, tạo 1 node tạm thời ngay trên trình duyệt
            const groupedFlashcards = cards.map(c => {
                const fields = Object.keys(c.fieldData || {});
                return {
                    front: c.fieldData['Mặt trước'] || c.fieldData['Từ vựng'] || (fields.length > 0 ? c.fieldData[fields[0]] : 'Thẻ trống'),
                    back: c.fieldData['Mặt sau'] || c.fieldData['Đáp án'] || c.fieldData['Định nghĩa'] || (fields.length > 1 ? c.fieldData[fields[1]] : '')
                };
            });

            const nodeData = {
                title: deck.name || "Bộ Flashcard Mới",
                type: 'Flashcard',
                status: 'new',
                tags: ['Flashcard Deck', deck.name],
                x: (Math.random() - 0.5) * 400,
                y: (Math.random() - 0.5) * 300,
                timestamp: new Date(),
                data: {
                    flashcards: groupedFlashcards,
                    summary: deck.description || `Bộ thẻ: ${deck.name} (${cards.length} thẻ)`,
                    cardCount: cards.length
                }
            };
            
            const createdNode = await createNodeInBackend(nodeData);
            const newNodes = createdNode ? [createdNode] : [{ ...nodeData, id: Date.now().toString() }];
            
            onPushToGraph(newNodes as KnowledgeNode[]);
            setStudioItem(null); 
        } catch (error) {
            console.error('Failed to push studio cards to graph:', error);
        }
    };

    const selectedFlashcards = flashcards.filter(f => f.isSelected);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sky-500">blender</span>
                        Kho Dữ Liệu Tạm (Alchemy Storage)
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">Quản lý, chỉnh sửa và chế tạo tri thức từ các nguồn đã thu thập.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-[calc(100vh-250px)] min-h-[600px]">
                {/* Left Column: Sources & Items */}
                <div className="xl:col-span-4 flex flex-col gap-4 h-full">
                    <StorageSourceSelector 
                        selectedSource={selectedSource} 
                        onSelectSource={setSelectedSource} 
                    />
                    <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 overflow-hidden flex flex-col">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Danh sách dữ liệu</h3>
                        <StorageItemList 
                            items={filteredItems} 
                            onSelectItem={setSelectedItem} 
                            selectedItemId={selectedItem?.id}
                        />
                    </div>
                </div>

                {/* Middle Column: Dropzone for Flashcard Studio */}
                <div className="xl:col-span-4 flex flex-col gap-6 h-full">
                    <div 
                        className="flex-1 border-2 border-dashed border-slate-300 rounded-3xl flex flex-col items-center justify-center bg-slate-50/50 hover:bg-sky-50 hover:border-sky-400 transition-all duration-300 group"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                            e.preventDefault();
                            try {
                                const data = JSON.parse(e.dataTransfer.getData('application/json'));
                                if (data.type === 'storageItem') {
                                    setStudioItem(data.item);
                                }
                            } catch (err) {
                                console.error('Invalid drop data');
                            }
                        }}
                    >
                        <div className="w-20 h-20 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-4xl text-sky-500">style</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Flashcard Studio</h3>
                        <p className="text-slate-500 text-center px-8 text-sm">
                            Kéo thả dữ liệu từ danh sách bên trái vào đây để bắt đầu tạo flashcard.
                        </p>
                    </div>
                </div>

                {/* Right Column: Flashcards */}
                <div className="xl:col-span-4 flex flex-col gap-6 h-full">
                    <div className="flex-1 overflow-hidden">
                        <FlashcardGallery 
                            flashcards={flashcards} 
                            onToggleSelect={handleToggleFlashcardSelect}
                            onSelectAll={handleSelectAllFlashcards}
                            onDeselectAll={handleDeselectAllFlashcards}
                            onUpdateFlashcard={handleUpdateFlashcard}
                            onRemoveFlashcard={handleRemoveFlashcard}
                        />
                    </div>
                    <div className="shrink-0 flex flex-col gap-4">
                        <FlashcardToGraphPush 
                            selectedFlashcards={selectedFlashcards} 
                            onPushToGraph={handlePushFlashcardsToGraph} 
                        />
                    </div>
                </div>
            </div>

            {/* Full Screen Popup for StorageItemDetailView */}
            {selectedItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 md:p-8">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-full max-h-[90vh] overflow-hidden flex flex-col">
                        <StorageItemDetailView 
                            item={selectedItem} 
                            onUpdateItem={handleUpdateItem} 
                            onClose={() => setSelectedItem(null)} 
                            onOpenStudio={() => { setStudioItem(selectedItem); setSelectedItem(null); }}
                        />
                    </div>
                </div>
            )}

            {/* Flashcard Studio Full Screen Popup */}
            {studioItem && (
                <FlashcardStudio 
                    item={studioItem} 
                    onClose={() => setStudioItem(null)} 
                    onPushToNode={handlePushStudioCardsToGraph}
                    onSaveFlashcard={(card) => setFlashcards(prev => [card, ...prev])}
                />
            )}
        </div>
    );
};
