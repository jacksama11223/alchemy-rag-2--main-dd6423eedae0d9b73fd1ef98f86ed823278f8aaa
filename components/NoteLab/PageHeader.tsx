
import React, { useRef } from 'react';
import { NotePage } from '../../types';

interface PageHeaderProps {
    page: NotePage;
    onUpdatePage: (updates: Partial<NotePage>) => void;
}

const EMOJI_LIST = ['📄', '📓', '💡', '🚀', '🎨', '✅', '📅', '🧠', '⭐', '🔥', '📚', '🧪'];
const COVERS = [
    'linear-gradient(to right, #ff7e5f, #feb47b)',
    'linear-gradient(to right, #6a11cb, #2575fc)',
    'linear-gradient(to right, #43cea2, #185a9d)',
    'linear-gradient(to right, #0f2027, #203a43, #2c5364)', // Deep Sea
    'url("https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")', // Beach
    'url("https://images.unsplash.com/photo-1451187580459-43490279c0fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")', // Space
];

export const PageHeader: React.FC<PageHeaderProps> = ({ page, onUpdatePage }) => {
    const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
    const [showCoverMenu, setShowCoverMenu] = React.useState(false);

    return (
        <div className="group/header relative mb-8">
            {/* COVER IMAGE */}
            <div 
                className="h-48 w-full bg-slate-800 relative group/cover overflow-hidden transition-all"
                style={{ 
                    backgroundImage: page.coverImage || 'none', 
                    backgroundSize: 'cover', 
                    backgroundPosition: 'center',
                    height: page.coverImage ? '12rem' : '4rem',
                    opacity: page.coverImage ? 1 : 0 // Hidden if no cover, reveals on hover of header area
                }}
            >
                <div className={`absolute top-4 right-4 flex gap-2 opacity-0 group-hover/cover:opacity-100 transition-opacity ${!page.coverImage ? 'hidden' : ''}`}>
                    <button 
                        onClick={() => setShowCoverMenu(!showCoverMenu)}
                        className="bg-black/50 text-white text-xs px-3 py-1.5 rounded hover:bg-black/70 backdrop-blur-sm"
                    >
                        Change Cover
                    </button>
                    <button 
                        onClick={() => onUpdatePage({ coverImage: null })}
                        className="bg-black/50 text-white text-xs px-3 py-1.5 rounded hover:bg-red-500/70 backdrop-blur-sm"
                    >
                        Remove
                    </button>
                </div>
                
                {/* Cover Picker Dropdown */}
                {showCoverMenu && (
                    <div className="absolute top-12 right-4 bg-[#1e1e1e] border border-[#333] p-2 rounded-lg shadow-xl z-50 flex gap-2 flex-wrap w-64">
                        {COVERS.map((cov, i) => (
                            <div 
                                key={i}
                                onClick={() => { onUpdatePage({ coverImage: cov }); setShowCoverMenu(false); }}
                                className="w-12 h-8 rounded cursor-pointer border border-white/10 hover:border-white"
                                style={{ backgroundImage: cov, backgroundSize: 'cover', backgroundPosition: 'center' }}
                            ></div>
                        ))}
                    </div>
                )}
            </div>

            {/* HEADER CONTENT */}
            <div className="px-12 md:px-24 relative">
                {/* ICON */}
                <div className="relative -mt-10 mb-4 group/icon inline-block">
                    <div 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="text-6xl cursor-pointer hover:bg-white/5 rounded-lg p-2 transition-colors select-none"
                    >
                        {page.icon}
                    </div>
                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div className="absolute top-full left-0 mt-2 bg-[#1e1e1e] border border-[#333] p-2 rounded-lg shadow-xl z-50 grid grid-cols-6 gap-1 w-64">
                            {EMOJI_LIST.map(e => (
                                <button 
                                    key={e} 
                                    onClick={() => { onUpdatePage({ icon: e }); setShowEmojiPicker(false); }}
                                    className="p-2 hover:bg-white/10 rounded text-xl"
                                >
                                    {e}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* VISIBLE ON HOVER: Add Cover/Icon Buttons if missing */}
                <div className="flex gap-4 text-xs text-slate-500 mb-4 opacity-0 group-hover/header:opacity-100 transition-opacity">
                    {!page.coverImage && (
                        <button onClick={() => onUpdatePage({ coverImage: COVERS[0] })} className="hover:text-slate-300 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">image</span> Add cover
                        </button>
                    )}
                </div>

                {/* TITLE */}
                <input
                    type="text"
                    value={page.title}
                    onChange={(e) => onUpdatePage({ title: e.target.value })}
                    placeholder="Untitled"
                    className="text-4xl md:text-5xl font-black text-white bg-transparent border-none outline-none placeholder-slate-600 w-full"
                />
            </div>
        </div>
    );
};
