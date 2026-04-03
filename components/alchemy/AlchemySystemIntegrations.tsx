
import React, { useState } from 'react';

// 1. Notion Sync Config
export const NotionSyncConfig: React.FC = () => {
    return (
        <div className="py-3 border-b border-white/5">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-4 h-4" alt="Notion" /> Notion Sync
            </h4>
            <input type="password" placeholder="Nhập Integration Token..." className="w-full bg-black/20 border border-white/10 rounded px-3 py-1.5 text-xs text-white mb-2 focus:border-cyan-500 focus:outline-none" />
            <button className="w-full py-1.5 bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 rounded transition-colors">Kết nối</button>
        </div>
    );
};

// 2. Anki Connect Config
export const AnkiConnectConfig: React.FC = () => {
    return (
        <div className="py-3 border-b border-white/5">
            <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-400 text-sm">style</span> Anki Connect
            </h4>
            <div className="flex gap-2 mb-2">
                <input type="text" placeholder="IP (127.0.0.1)" className="flex-1 bg-black/20 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none" defaultValue="127.0.0.1" />
                <input type="text" placeholder="Port (8765)" className="w-20 bg-black/20 border border-white/10 rounded px-3 py-1.5 text-xs text-white focus:border-cyan-500 focus:outline-none" defaultValue="8765" />
            </div>
            <button className="w-full py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-xs font-bold text-blue-300 rounded transition-colors border border-blue-500/30">Test Kết nối</button>
        </div>
    );
};

// 3. Google Drive Picker
export const GoogleDrivePicker: React.FC = () => {
    return (
        <button className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-slate-300 transition-colors w-full border border-white/5">
            <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-4 h-4" alt="Drive" />
            Chọn từ Google Drive
        </button>
    );
};

// 4. API Usage Monitor
export const ApiUsageMonitor: React.FC = () => {
    const used = 45000;
    const limit = 100000;
    const percent = (used/limit) * 100;

    return (
        <div className="py-3 border-b border-white/5">
            <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Gemini API Usage</span>
                <span>{Math.round(percent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${percent > 80 ? 'bg-red-500' : 'bg-cyan-500'}`} style={{ width: `${percent}%` }}></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 text-right">{used.toLocaleString()} / {limit.toLocaleString()} tokens</p>
        </div>
    );
};

// 5. Error Log Console (Developer)
export const ErrorLogConsole: React.FC = () => {
    return (
        <details className="group py-2">
            <summary className="text-[10px] font-mono text-slate-600 cursor-pointer hover:text-slate-400 list-none">
                &gt; Dev Console
            </summary>
            <div className="mt-2 bg-black p-2 rounded text-[10px] font-mono text-green-400 h-20 overflow-y-auto border border-white/10">
                <p>[INFO] App initialized</p>
                <p>[INFO] Alchemy loaded</p>
                <p className="text-yellow-400">[WARN] High latency on node 4</p>
            </div>
        </details>
    );
};

// 6. Feedback Floating Button
export const FeedbackFloatingButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 z-[90]">
            {isOpen ? (
                <div className="bg-[#1e293b] p-4 rounded-xl border border-white/20 shadow-2xl w-64 animate-[slideInUp_0.2s]">
                    <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-white">Gửi góp ý</h4>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined text-sm">close</span></button>
                    </div>
                    <textarea className="w-full h-20 bg-black/30 border border-white/10 rounded p-2 text-xs text-white resize-none focus:outline-none focus:border-cyan-500 mb-2" placeholder="Bạn gặp vấn đề gì?"></textarea>
                    <button className="w-full py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded">Gửi</button>
                </div>
            ) : (
                <button onClick={() => setIsOpen(true)} className="p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-lg transition-transform hover:scale-110" title="Góp ý / Báo lỗi">
                    <span className="material-symbols-outlined text-xl">bug_report</span>
                </button>
            )}
        </div>
    );
};
