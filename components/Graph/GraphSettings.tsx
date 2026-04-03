
import React, { useState, useRef, useEffect } from 'react';

// 28. ThemeSwitcher
export const ThemeSwitcher: React.FC = () => (
    <button className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-300 hover:text-yellow-300 transition-colors" title="Chuyển đổi chế độ hiển thị">
        <span className="material-symbols-outlined text-lg">contrast</span>
    </button>
);

// 29. KeyboardShortcutsModal
export const KeyboardShortcutsModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-[#0f172a] border border-white/20 p-6 rounded-xl w-80 shadow-2xl">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2"><span className="material-symbols-outlined">keyboard</span> Danh sách phím tắt</h4>
                <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between"><span>Tạo Khái Niệm</span> <kbd className="bg-white/10 px-1 rounded">C</kbd></div>
                    <div className="flex justify-between"><span>Tạo Liên Kết</span> <kbd className="bg-white/10 px-1 rounded">L</kbd></div>
                    <div className="flex justify-between"><span>Xóa Khái Niệm</span> <kbd className="bg-white/10 px-1 rounded">Del</kbd></div>
                    <div className="flex justify-between"><span>Tra cứu</span> <kbd className="bg-white/10 px-1 rounded">/</kbd></div>
                </div>
            </div>
        </div>
    );
};

// 30. LayoutAlgorithmSelector
export const LayoutAlgorithmSelector: React.FC = () => (
    <select className="bg-black/40 border border-white/10 text-xs text-white rounded px-2 py-1 outline-none focus:border-cyan-500">
        <option>Force Directed</option>
        <option>Circular</option>
        <option>Grid</option>
        <option>Tree</option>
    </select>
);

// 31. ImportWizard
export const ImportWizard: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/80" onClick={onClose}>
            <div className="bg-[#1e1e1e] p-8 rounded-2xl w-[500px] border border-dashed border-white/20 text-center">
                <span className="material-symbols-outlined text-4xl text-slate-500 mb-4">upload_file</span>
                <h3 className="text-xl font-bold text-white mb-2">Nhập dữ liệu nghiên cứu</h3>
                <p className="text-sm text-slate-400 mb-6">Hỗ trợ định dạng Excel, JSON, Obsidian MD</p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-500">Tải lên tập tin</button>
            </div>
        </div>
    );
};

// 32. GraphBackgroundGrid
export const GraphBackgroundGrid: React.FC = () => (
    <div className="absolute inset-0 pointer-events-none opacity-20 z-0"
        style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '30px 30px',
        }}
    ></div>
);

// 33. NotificationCenter (Updated for Header Integration)
export const NotificationCenter: React.FC = () => {
    return (
        <button className="relative p-2 rounded-full text-sky-200 hover:text-white hover:bg-white/10 transition-colors group">
            <span className="material-symbols-outlined text-xl group-hover:animate-swing">notifications</span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-[#001e3c]"></span>
        </button>
    );
};

// 34. OnboardingTour
export const OnboardingTour: React.FC<{ active: boolean, onClose: () => void }> = ({ active, onClose }) => {
    if (!active) return null;
    return (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-2 rounded-lg shadow-xl z-50 animate-bounce cursor-pointer" onClick={onClose}>
            👋 Bắt đầu hành trình! Nhấp đúp để tạo khái niệm mới.
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-600 rotate-45"></div>
        </div>
    );
};

// 35. MobileControlsOverlay
export const MobileControlsOverlay: React.FC = () => (
    <div className="md:hidden absolute bottom-6 right-6 z-40 flex flex-col gap-4">
        <div className="w-12 h-12 bg-white/10 rounded-full border border-white/20 flex items-center justify-center relative">
            <div className="w-6 h-6 bg-white/50 rounded-full"></div> {/* Joystick Knob */}
        </div>
        <button className="w-12 h-12 bg-blue-600 rounded-full shadow-lg flex items-center justify-center text-white font-bold text-xl">+</button>
    </div>
);
