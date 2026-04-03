import React, { useState, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';
import UrlList from './UrlList';
import UrlHtmlEditor from './UrlHtmlEditor';
import UrlHighlighterFlashcard from './UrlHighlighterFlashcard';
import { scrapeWebsite, getAuthHeader } from '../../services/mockBackend';

interface UrlExtractIntegrationProps {
    onAddSource: (source: any) => void;
}

const UrlExtractIntegration: React.FC<UrlExtractIntegrationProps> = ({ onAddSource }) => {
    const [urls, setUrls] = useState<any[]>([]);
    const [selectedUrl, setSelectedUrl] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'reader' | 'html'>('reader');

    useEffect(() => {
        fetchUrls();
    }, []);

    const fetchUrls = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/savedurls', {
                headers: getAuthHeader()
            });
            if (response.ok) {
                const data = await response.json();
                setUrls(data);
            } else {
                // Fallback mock data
                setUrls([
                    {
                        _id: 'mock-1',
                        url: 'https://vi.wikipedia.org/wiki/L%E1%BB%8Bch_s%E1%BB%AD_Vi%E1%BB%87t_Nam',
                        title: 'Lịch sử Việt Nam - Wikipedia',
                        htmlContent: '<h1>Lịch sử Việt Nam</h1><p>Lịch sử Việt Nam nếu tính từ lúc có mặt con người sinh sống thì đã có hàng vạn năm trước Công nguyên...</p>',
                        textContent: 'Lịch sử Việt Nam\n\nLịch sử Việt Nam nếu tính từ lúc có mặt con người sinh sống thì đã có hàng vạn năm trước Công nguyên...',
                        createdAt: new Date().toISOString()
                    }
                ]);
            }
        } catch (error) {
            console.error("Error fetching URLs:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddUrl = async (newUrl: string) => {
        setIsLoading(true);
        try {
            let mockTitle = newUrl.split('/').pop() || 'Trang web mới';
            let mockHtml = `<h1>${mockTitle}</h1><p>Nội dung trích xuất từ ${newUrl}...</p>`;
            let mockText = `${mockTitle}\n\nNội dung trích xuất từ ${newUrl}...`;

            try {
                const scrapedData = await scrapeWebsite(newUrl);
                if (scrapedData && scrapedData.html) {
                    mockHtml = scrapedData.html;
                    mockText = scrapedData.text;
                    mockTitle = new URL(newUrl).hostname;
                }
            } catch (scrapeErr) {
                console.warn("Scraping failed, using fallback content", scrapeErr);
            }

            const response = await fetch('/api/savedurls', {
                method: 'POST',
                headers: getAuthHeader(),
                body: JSON.stringify({
                    url: newUrl,
                    title: mockTitle,
                    htmlContent: mockHtml,
                    textContent: mockText
                })
            });

            if (response.ok) {
                const saved = await response.json();
                setUrls([saved, ...urls]);
                setSelectedUrl(saved);
            } else {
                // Fallback
                const newSaved = {
                    _id: `mock-${Date.now()}`,
                    url: newUrl,
                    title: mockTitle,
                    htmlContent: mockHtml,
                    textContent: mockText,
                    createdAt: new Date().toISOString()
                };
                setUrls([newSaved, ...urls]);
                setSelectedUrl(newSaved);
            }
        } catch (error) {
            console.error("Error adding URL:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUrl = async (id: string) => {
        try {
            await fetch(`/api/savedurls/${id}`, {
                method: 'DELETE',
                headers: getAuthHeader()
            });
            setUrls(urls.filter(u => u._id !== id));
            if (selectedUrl?._id === id) {
                setSelectedUrl(null);
            }
        } catch (error) {
            console.error("Error deleting URL:", error);
        }
    };

    const handleSaveHtml = async (id: string, newHtml: string) => {
        try {
            const response = await fetch(`/api/savedurls/${id}`, {
                method: 'PUT',
                headers: getAuthHeader(),
                body: JSON.stringify({ htmlContent: newHtml })
            });

            if (response.ok) {
                const updated = await response.json();
                setUrls(urls.map(u => u._id === id ? updated : u));
                if (selectedUrl?._id === id) {
                    setSelectedUrl(updated);
                }
            } else {
                // Fallback update
                const updatedUrls = urls.map(u => {
                    if (u._id === id) {
                        const updated = { ...u, htmlContent: newHtml };
                        if (selectedUrl?._id === id) setSelectedUrl(updated);
                        return updated;
                    }
                    return u;
                });
                setUrls(updatedUrls);
            }
        } catch (error) {
            console.error("Error updating HTML:", error);
        }
    };

    const handleImportToAlchemy = () => {
        if (selectedUrl) {
            onAddSource({
                id: `url-${Date.now()}`,
                type: 'url',
                content: selectedUrl.textContent || selectedUrl.htmlContent || 'Nội dung trống',
                metadata: {
                    url: selectedUrl.url,
                    title: selectedUrl.title,
                    source: 'UrlExtract'
                }
            });
        }
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in">
            <div className="text-center mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 text-blue-600 mb-4 shadow-inner">
                    <span className="material-symbols-outlined text-3xl">link</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Trích xuất URL</h3>
                <p className="text-slate-600 max-w-lg mx-auto">
                    Lưu trữ các đường link, đọc nội dung, chỉnh sửa HTML và tạo Flashcard trực tiếp từ trang web.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: URL List */}
                <div className="lg:col-span-1 h-[600px]">
                    <UrlList 
                        urls={urls} 
                        isLoading={isLoading} 
                        selectedUrlId={selectedUrl?._id} 
                        onSelectUrl={setSelectedUrl} 
                        onDeleteUrl={handleDeleteUrl}
                        onAddUrl={handleAddUrl}
                    />
                </div>

                {/* Right Column: URL Content & Tools */}
                <div className="lg:col-span-2 h-[600px] flex flex-col">
                    <GlassSurface className="flex-1 flex flex-col overflow-hidden">
                        {selectedUrl ? (
                            <>
                                {/* Header / Tabs */}
                                <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-white/50">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setActiveTab('reader')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                                activeTab === 'reader' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">menu_book</span>
                                            Chế độ đọc
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('html')}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                                activeTab === 'html' 
                                                    ? 'bg-emerald-100 text-emerald-700' 
                                                    : 'text-slate-600 hover:bg-slate-100'
                                            }`}
                                        >
                                            <span className="material-symbols-outlined text-sm">code</span>
                                            Chỉnh sửa HTML
                                        </button>
                                    </div>
                                    <button 
                                        onClick={handleImportToAlchemy}
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md"
                                    >
                                        <span className="material-symbols-outlined text-sm">science</span>
                                        Đưa vào Lò Luyện
                                    </button>
                                </div>

                                {/* Content Area */}
                                <div className="flex-1 overflow-hidden p-6 bg-white/30">
                                    {activeTab === 'reader' ? (
                                        <UrlHighlighterFlashcard urlData={selectedUrl} />
                                    ) : (
                                        <UrlHtmlEditor urlData={selectedUrl} onSave={handleSaveHtml} />
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                                <span className="material-symbols-outlined text-6xl mb-4 opacity-50">web</span>
                                <h3 className="text-xl font-medium text-slate-600 mb-2">Chưa chọn URL nào</h3>
                                <p className="text-sm max-w-sm">
                                    Hãy thêm một URL mới hoặc chọn từ danh sách bên trái để bắt đầu đọc, chỉnh sửa và tạo Flashcard.
                                </p>
                            </div>
                        )}
                    </GlassSurface>
                </div>
            </div>
        </div>
    );
};

export default UrlExtractIntegration;
