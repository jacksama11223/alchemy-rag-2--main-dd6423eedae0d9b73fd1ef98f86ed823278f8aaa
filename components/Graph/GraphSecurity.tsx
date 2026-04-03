
import React from 'react';

// 31. EncryptedNodeVault
export const EncryptedNodeVault: React.FC<{ locked: boolean }> = ({ locked }) => {
    if (!locked) return null;
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10 rounded-xl">
            <div className="text-center">
                <span className="material-symbols-outlined text-4xl text-red-500 mb-2">lock</span>
                <p className="text-slate-300 text-sm mb-2">Nội dung được mã hóa</p>
                <input type="password" placeholder="Nhập mật khẩu..." className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white text-center w-32" />
            </div>
        </div>
    );
};

// 32. VersionCompareSlider
export const VersionCompareSlider: React.FC<{ visible: boolean }> = ({ visible }) => {
    if (!visible) return null;
    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-64 z-30 bg-[#1e1e1e] p-2 rounded-full border border-white/10 shadow-lg flex items-center gap-2">
            <span className="text-[10px] text-slate-400">Yesterday</span>
            <input type="range" className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-ew-resize" />
            <span className="text-[10px] text-white">Today</span>
        </div>
    );
};

// 33. OfflineModeIndicator
export const OfflineModeIndicator: React.FC<{ isOffline: boolean }> = ({ isOffline }) => {
    if (!isOffline) return null;
    return (
        <div className="absolute top-2 right-1/2 translate-x-1/2 z-50 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-b shadow-lg">
            OFFLINE MODE - Saved Locally
        </div>
    );
};

// 34. RecycleBinManager
export const RecycleBinManager: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60" onClick={onClose}>
            <div className="bg-[#1e1e1e] w-80 p-4 rounded-xl border border-white/10 shadow-2xl">
                <h4 className="text-white font-bold mb-3 flex items-center gap-2"><span className="material-symbols-outlined text-slate-400">recycling</span> Thùng rác</h4>
                <div className="space-y-2 text-xs text-slate-300">
                    <div className="flex justify-between items-center p-2 bg-white/5 rounded">
                        <span>Old Node</span>
                        <button className="text-green-400 hover:underline">Restore</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// 35. AccessControlMatrix
export const AccessControlMatrix: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-[#1e1e1e] p-4 rounded-xl border border-white/10 shadow-2xl w-96">
            <h4 className="text-white font-bold mb-4">Phân quyền Node</h4>
            <div className="grid grid-cols-4 gap-2 text-xs text-slate-300 mb-2 font-bold border-b border-white/10 pb-1">
                <span className="col-span-2">User</span>
                <span className="text-center">Read</span>
                <span className="text-center">Write</span>
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-slate-400 items-center mb-2">
                <span className="col-span-2">Everyone</span>
                <input type="checkbox" defaultChecked className="justify-self-center" />
                <input type="checkbox" className="justify-self-center" />
            </div>
            <div className="grid grid-cols-4 gap-2 text-xs text-slate-400 items-center">
                <span className="col-span-2">Admins</span>
                <input type="checkbox" defaultChecked className="justify-self-center" />
                <input type="checkbox" defaultChecked className="justify-self-center" />
            </div>
        </div>
    );
};
