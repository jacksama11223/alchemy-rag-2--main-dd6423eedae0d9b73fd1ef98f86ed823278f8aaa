
import React, { useState } from 'react';

export const CalendarIntegration: React.FC = () => {
    const [gCalConnected, setGCalConnected] = useState(false);
    const [outlookConnected, setOutlookConnected] = useState(false);

    return (
        <div className="p-4 bg-[#262626] rounded-xl border border-[#333]">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">calendar_sync</span> 
                Đồng bộ Lịch
            </h3>
            
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" className="w-8 h-8" alt="Google Calendar" />
                        <div>
                            <p className="text-sm font-bold text-white">Google Calendar</p>
                            <p className="text-xs text-slate-400">{gCalConnected ? 'Đã kết nối: user@gmail.com' : 'Chưa kết nối'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setGCalConnected(!gCalConnected)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${gCalConnected ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                    >
                        {gCalConnected ? 'Ngắt kết nối' : 'Kết nối'}
                    </button>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-700 rounded flex items-center justify-center text-white font-bold text-xs">O</div>
                        <div>
                            <p className="text-sm font-bold text-white">Outlook Calendar</p>
                            <p className="text-xs text-slate-400">{outlookConnected ? 'Đã kết nối' : 'Chưa kết nối'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setOutlookConnected(!outlookConnected)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${outlookConnected ? 'bg-red-500/20 text-red-400 border border-red-500/50' : 'bg-blue-600 text-white hover:bg-blue-500'}`}
                    >
                        {outlookConnected ? 'Ngắt kết nối' : 'Kết nối'}
                    </button>
                </div>
            </div>
        </div>
    );
};
