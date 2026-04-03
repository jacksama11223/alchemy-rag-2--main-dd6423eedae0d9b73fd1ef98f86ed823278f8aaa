import React, { useState, useEffect } from 'react';
import { GlassSurface } from '../common/BrandAssets';

interface UrlHtmlEditorProps {
    urlData: any;
    onSave: (id: string, newHtml: string) => void;
}

const UrlHtmlEditor: React.FC<UrlHtmlEditorProps> = ({ urlData, onSave }) => {
    const [htmlContent, setHtmlContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (urlData) {
            setHtmlContent(urlData.htmlContent || '');
        }
    }, [urlData]);

    const handleSave = async () => {
        if (!urlData) return;
        setIsSaving(true);
        try {
            await onSave(urlData._id, htmlContent);
        } finally {
            setIsSaving(false);
        }
    };

    if (!urlData) return null;

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800">Chỉnh sửa HTML</h3>
                <button
                    onClick={handleSave}
                    disabled={isSaving || htmlContent === urlData.htmlContent}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                    {isSaving ? (
                        <><span className="material-symbols-outlined animate-spin text-sm">sync</span> Đang lưu...</>
                    ) : (
                        <><span className="material-symbols-outlined text-sm">save</span> Lưu thay đổi</>
                    )}
                </button>
            </div>
            <textarea
                value={htmlContent}
                onChange={(e) => setHtmlContent(e.target.value)}
                className="flex-1 w-full p-4 font-mono text-sm bg-slate-900 text-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                spellCheck={false}
            />
        </div>
    );
};

export default UrlHtmlEditor;
