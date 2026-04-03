
import React from 'react';

// 26. AuditLogTerminal
export const AuditLogTerminal: React.FC = () => (
    <div className="bg-black border border-slate-700 rounded-lg p-3 font-mono text-[10px] h-32 overflow-y-auto text-green-400 shadow-inner">
        <div className="opacity-70">user@admin:~$ tail -f audit.log</div>
        <div>[2024-05-20 10:00] User 'Alice' edited Node #402</div>
        <div>[2024-05-20 10:05] User 'Bob' changed permission on Deck #99</div>
        <div className="animate-pulse">_</div>
    </div>
);

// 27. RolePermissionMatrix
export const RolePermissionMatrix: React.FC = () => (
    <div className="bg-[#1e293b] border border-white/10 rounded-xl p-4 overflow-x-auto">
        <table className="w-full text-xs text-left text-slate-300">
            <thead className="text-slate-500 uppercase bg-white/5">
                <tr>
                    <th className="px-4 py-2">Role</th>
                    <th className="px-4 py-2">View</th>
                    <th className="px-4 py-2">Edit</th>
                    <th className="px-4 py-2">Delete</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
                <tr><td className="px-4 py-2 font-bold text-white">Admin</td><td>✅</td><td>✅</td><td>✅</td></tr>
                <tr><td className="px-4 py-2">Editor</td><td>✅</td><td>✅</td><td>❌</td></tr>
                <tr><td className="px-4 py-2">Viewer</td><td>✅</td><td>❌</td><td>❌</td></tr>
            </tbody>
        </table>
    </div>
);

// 28. FeatureFlagToggle
export const FeatureFlagToggle: React.FC = () => (
    <div className="flex items-center justify-between p-3 bg-yellow-900/10 border border-yellow-500/30 rounded-lg">
        <div>
            <div className="text-xs font-bold text-yellow-500 uppercase">Beta Feature</div>
            <div className="text-sm text-white">AI Grading System</div>
        </div>
        <div className="relative inline-block w-10 h-5 transition duration-200 ease-in-out">
            <input type="checkbox" className="absolute w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer checked:right-0 right-5 border-transparent checked:bg-green-500 bg-slate-600 transition-all" />
        </div>
    </div>
);

// 29. ApiTokenVault
export const ApiTokenVault: React.FC = () => (
    <div className="p-4 bg-[#0f172a] rounded-xl border border-white/10 mt-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">API Keys</h4>
        <div className="flex gap-2">
            <input type="password" value="sk_live_XXXXXXXXXXXXXXXXXXXX" readOnly className="flex-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-xs text-slate-300 font-mono" />
            <button className="bg-white/10 hover:bg-white/20 text-white px-3 rounded"><span className="material-symbols-outlined text-sm">content_copy</span></button>
        </div>
        <p className="text-[10px] text-red-400 mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[10px]">warning</span> Không chia sẻ key này.</p>
    </div>
);

// 30. BioAuthFingerprint
export const BioAuthFingerprint: React.FC<{ onAuth: () => void }> = ({ onAuth }) => (
    <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center">
        <span className="material-symbols-outlined text-6xl text-red-500 animate-pulse cursor-pointer" onClick={onAuth}>fingerprint</span>
        <h3 className="text-white font-bold mt-4">Xác thực sinh trắc học</h3>
        <p className="text-slate-500 text-sm">Chạm để mở khóa tài liệu mật</p>
    </div>
);
