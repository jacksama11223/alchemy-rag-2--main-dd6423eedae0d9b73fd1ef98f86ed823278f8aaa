
import React from 'react';

interface SmartReminderProps {
    reminderTime?: string;
    onSetReminder: (time: string | undefined) => void;
}

export const SmartReminder: React.FC<SmartReminderProps> = ({ reminderTime, onSetReminder }) => {
    return (
        <div className="flex items-center gap-2 bg-[#262626] p-2 rounded-lg border border-[#333]">
            <span className={`material-symbols-outlined text-sm ${reminderTime ? 'text-amber-400' : 'text-slate-400'}`}>
                {reminderTime ? 'notifications_active' : 'notifications'}
            </span>
            <input 
                type="datetime-local" 
                className="bg-transparent text-xs text-slate-200 border-none outline-none focus:ring-0 p-0 w-full"
                value={reminderTime || ''}
                onChange={(e) => onSetReminder(e.target.value)}
            />
            {reminderTime && (
                <button onClick={() => onSetReminder(undefined)} className="text-slate-500 hover:text-red-400">
                    <span className="material-symbols-outlined text-sm">close</span>
                </button>
            )}
        </div>
    );
};
