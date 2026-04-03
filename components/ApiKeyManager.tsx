
import React, { useState, useEffect } from 'react';

export const ApiKeyManager: React.FC = () => {
    const [key, setKey] = useState('');
    const [saved, setSaved] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem('custom_gemini_api_key');
        if (stored) {
            setKey(stored);
            setSaved(true);
        }
    }, []);

    const handleSave = () => {
        if (key.trim()) {
            localStorage.setItem('custom_gemini_api_key', key.trim());
            setSaved(true);
            alert("API Key đã được lưu! Vui lòng tải lại trang để áp dụng.");
            window.location.reload();
        }
    };

    const handleClear = () => {
        localStorage.removeItem('custom_gemini_api_key');
        setKey('');
        setSaved(false);
        alert("Đã xóa API Key.");
        window.location.reload();
    };

    return (
        <div className="w-full max-w-4xl mx-auto mt-8 mb-4 p-4 bg-[#111827] border border-white/10 rounded-xl">
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-400 text-lg">key</span>
                    Cấu hình API Key (Gemini)
                </h4>
                <button 
                    onClick={() => setIsVisible(!isVisible)}
                    className="text-xs text-slate-400 hover:text-white"
                >
                    {isVisible ? 'Ẩn' : 'Hiện'}
                </button>
            </div>
            
            {isVisible && (
                <div className="flex gap-2">
                    <input 
                        type="password" 
                        value={key}
                        onChange={(e) => { setKey(e.target.value); setSaved(false); }}
                        placeholder="Nhập Google Gemini API Key của bạn..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none"
                    />
                    <button 
                        onClick={handleSave}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${saved ? 'bg-green-600 text-white' : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
                    >
                        {saved ? 'Đã Lưu' : 'Lưu Key'}
                    </button>
                    {saved && (
                        <button 
                            onClick={handleClear}
                            className="px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold transition-all"
                        >
                            Xóa
                        </button>
                    )}
                </div>
            )}
            <p className="text-[10px] text-slate-500 mt-2">
                *Key được lưu trong trình duyệt của bạn (LocalStorage). Nếu không nhập, hệ thống sẽ dùng Key mặc định (nếu có).
            </p>
        </div>
    );
};
