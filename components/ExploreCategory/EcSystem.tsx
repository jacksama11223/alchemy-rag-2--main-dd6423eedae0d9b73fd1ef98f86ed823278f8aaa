
import React, { useState, useEffect } from 'react';

// 1. ControlPanelSettings
export const ControlPanelSettings: React.FC = () => (
    <div className="p-4 bg-[#1e293b] rounded-xl border border-white/10">
        <h4 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-slate-400">tune</span> Control Panel
        </h4>
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Thông báo đẩy</span>
                <input type="checkbox" className="toggle-checkbox" defaultChecked />
            </div>
            <div className="flex justify-between items-center">
                <span className="text-xs text-slate-300">Âm thanh hệ thống</span>
                <input type="checkbox" className="toggle-checkbox" defaultChecked />
            </div>
        </div>
    </div>
);

// 2. EclipseThemeSwitcher
export const EclipseThemeSwitcher: React.FC = () => (
    <button className="flex items-center gap-2 p-2 bg-black/20 rounded-full border border-white/10 hover:bg-white/5 transition-colors">
        <span className="material-symbols-outlined text-yellow-400 text-sm">light_mode</span>
        <div className="w-8 h-4 bg-slate-700 rounded-full relative">
            <div className="absolute right-0.5 top-0.5 w-3 h-3 bg-white rounded-full"></div>
        </div>
        <span className="material-symbols-outlined text-slate-500 text-sm">dark_mode</span>
    </button>
);

// 3. TranslatorDroid
export const TranslatorDroid: React.FC = () => (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:border-cyan-500/50 cursor-pointer">
        <span className="material-symbols-outlined text-slate-400 text-sm">translate</span>
        <span className="text-xs text-slate-200 font-bold">Tiếng Việt</span>
        <span className="material-symbols-outlined text-slate-500 text-xs">expand_more</span>
    </div>
);

// 4. HullIntegrityError (404/Error)
export const HullIntegrityError: React.FC = () => (
    <div className="bg-red-900/10 border border-red-500/30 rounded-xl p-6 text-center">
        <span className="material-symbols-outlined text-4xl text-red-500 mb-2 animate-pulse">warning</span>
        <h3 className="text-red-200 font-bold">Hull Breach Detected!</h3>
        <p className="text-red-300/70 text-sm mt-1">Hệ thống gặp lỗi không xác định. Vui lòng thử lại sau.</p>
    </div>
);

// 5. DockingSuccessToast
export const DockingSuccessToast: React.FC = () => (
    <div className="fixed top-24 right-6 z-[60] bg-green-900/90 border border-green-500/50 rounded-lg p-3 shadow-2xl flex items-center gap-3 animate-slide-left pointer-events-none">
        <span className="material-symbols-outlined text-green-400">check_circle</span>
        <div>
            <h5 className="text-sm font-bold text-green-100">Docking Successful</h5>
            <p className="text-xs text-green-300/80">Dữ liệu đã được lưu an toàn.</p>
        </div>
    </div>
);

// 6. VoidStatePlaceholder
export const VoidStatePlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-12 text-slate-600">
        <span className="material-symbols-outlined text-6xl mb-4 opacity-20">public_off</span>
        <p className="text-sm font-medium">Khu vực này thuộc về Hư Không (The Void).</p>
        <p className="text-xs opacity-70">Chưa có dữ liệu nào được tìm thấy.</p>
    </div>
);

// 7. AccessCodeVault
export const AccessCodeVault: React.FC = () => (
    <div className="p-4 bg-black/20 border border-white/10 rounded-xl">
        <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Mã truy cập hầm chứa (API Key)</label>
        <div className="flex gap-2">
            <input type="password" value="sk-xxxxxxxx" readOnly className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-1.5 text-xs text-slate-300" />
            <button className="bg-white/5 hover:bg-white/10 px-3 rounded text-slate-400"><span className="material-symbols-outlined text-sm">visibility</span></button>
        </div>
    </div>
);

// 8. PrivacyProtocolModal
export const PrivacyProtocolModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#1e1e1e] p-6 rounded-xl w-96 border border-white/10">
                <h3 className="text-white font-bold mb-4">Giao thức bảo mật</h3>
                <p className="text-slate-400 text-xs leading-relaxed mb-6">
                    Dữ liệu của bạn được mã hóa cấp độ lượng tử. Chúng tôi cam kết không chia sẻ tọa độ căn cứ của bạn với bất kỳ thế lực ngoài hành tinh nào.
                </p>
                <button onClick={onClose} className="w-full py-2 bg-slate-700 text-white rounded font-bold text-sm">Đã rõ</button>
            </div>
        </div>
    );
};

// 9. FeedbackBlackBox
export const FeedbackBlackBox: React.FC = () => (
    <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/5">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Hộp đen (Góp ý)</h4>
        <textarea className="w-full bg-black/20 border border-white/10 rounded p-2 text-xs text-white resize-none h-20 outline-none focus:border-white/30" placeholder="Báo cáo sự cố hoặc gửi ý tưởng..."></textarea>
        <button className="mt-2 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded transition-colors">Gửi tín hiệu</button>
    </div>
);

// 10. GraphSyncStatus (NEW) - Links Category to Graph
export const GraphSyncStatus: React.FC<{ totalNodes: number, onSync: () => void }> = ({ totalNodes, onSync }) => {
    return (
        <div className="fixed bottom-6 right-20 z-40 bg-[#0f172a]/90 backdrop-blur-md border border-cyan-500/30 rounded-full px-4 py-2 shadow-[0_0_20px_rgba(6,182,212,0.2)] flex items-center gap-3 animate-slide-up">
            <div className="flex items-center gap-2">
                <div className="relative">
                    <span className="material-symbols-outlined text-cyan-400">hub</span>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse border border-[#0f172a]"></span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Graph Uplink</span>
                    <span className="text-xs font-mono text-white font-bold">{totalNodes} Nodes Active</span>
                </div>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <button 
                onClick={onSync}
                className="text-xs font-bold text-cyan-300 hover:text-white flex items-center gap-1 transition-colors"
            >
                <span className="material-symbols-outlined text-sm">sync</span> Đồng bộ
            </button>
        </div>
    );
};

// 11. SystemTicker (NEW) - Auto scrolling announcement bar
export const SystemTicker: React.FC = () => {
    return (
        <div className="w-full bg-black/40 border-b border-white/5 overflow-hidden py-1 flex justify-center backdrop-blur-sm">
            <div className="whitespace-nowrap animate-[stream_30s_linear_infinite] flex items-center gap-8 text-[10px] font-mono text-cyan-500/70">
                <span>SYSTEM: ONLINE</span>
                <span>•</span>
                <span>AI CORE: ACTIVE (GEMINI PRO)</span>
                <span>•</span>
                <span>NEW MODULE: "REACT HOOKS" DETECTED</span>
                <span>•</span>
                <span>OPTIMIZING NEURAL PATHWAYS...</span>
                <span>•</span>
                <span>REMINDER: DRINK WATER</span>
                <span>•</span>
                <span>SECURITY LEVEL: QUANTUM</span>
            </div>
        </div>
    );
};

// 12. DailyMissionWidget (NEW) - Sidebar Widget
export const DailyMissionWidget: React.FC<{ completedNodes: number }> = ({ completedNodes }) => {
    const [checked, setChecked] = useState([false, false, false]);
    
    // Auto-check first mission based on props
    useEffect(() => {
        if (completedNodes > 0 && !checked[0]) {
            const newChecked = [...checked];
            newChecked[0] = true;
            setChecked(newChecked);
        }
    }, [completedNodes]);

    const handleCheck = (idx: number) => {
        const newChecked = [...checked];
        newChecked[idx] = !newChecked[idx];
        setChecked(newChecked);
    };

    return (
        <div className="bg-gradient-to-b from-[#1e293b] to-[#0f172a] rounded-xl p-4 border border-amber-500/20 shadow-lg relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
            
            <h4 className="text-xs font-bold text-amber-400 uppercase mb-3 flex items-center gap-2 relative z-10">
                <span className="material-symbols-outlined text-sm">military_tech</span> Chiến dịch trong ngày
            </h4>
            
            <div className="space-y-2 relative z-10">
                {[
                    { label: "Ôn tập 5 thẻ bài", done: checked[0] },
                    { label: "Tạo 1 Node mới", done: checked[1] },
                    { label: "Khám phá Chợ Tri Thức", done: checked[2] }
                ].map((mission, idx) => (
                    <div 
                        key={idx} 
                        onClick={() => handleCheck(idx)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer border transition-all ${
                            mission.done 
                            ? 'bg-amber-900/20 border-amber-500/50 text-amber-100' 
                            : 'bg-black/20 border-transparent hover:bg-black/40 text-slate-400'
                        }`}
                    >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center ${mission.done ? 'bg-amber-500 border-amber-500' : 'border-slate-500'}`}>
                            {mission.done && <span className="material-symbols-outlined text-[12px] text-black font-bold">check</span>}
                        </div>
                        <span className={`text-xs ${mission.done ? 'line-through opacity-70' : ''}`}>{mission.label}</span>
                    </div>
                ))}
            </div>

            <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-slate-500">Phần thưởng:</span>
                <span className="text-xs font-bold text-amber-400">+150 XP</span>
            </div>
        </div>
    );
};

// 13. QuickActionDial (NEW) - Floating Action Button
export const QuickActionDial: React.FC<{ onAction: (action: string) => void }> = ({ onAction }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
            {isOpen && (
                <div className="flex flex-col gap-2 items-end animate-slide-up origin-bottom">
                    <button onClick={() => onAction('create')} className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                        <span className="text-xs font-bold">Tạo mới</span>
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                    </button>
                    <button onClick={() => onAction('learn')} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                        <span className="text-xs font-bold">Học ngay</span>
                        <span className="material-symbols-outlined text-sm">school</span>
                    </button>
                    <button onClick={() => onAction('search')} className="flex items-center gap-2 bg-slate-700 text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform">
                        <span className="text-xs font-bold">Tìm kiếm</span>
                        <span className="material-symbols-outlined text-sm">search</span>
                    </button>
                </div>
            )}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center transition-all duration-300 ${
                    isOpen ? 'bg-red-500 rotate-45' : 'bg-cyan-600 hover:bg-cyan-500 hover:scale-110'
                }`}
            >
                <span className="material-symbols-outlined text-2xl text-white">add</span>
            </button>
        </div>
    );
};
