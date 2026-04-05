import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus } from '../../services/mockBackend';
import { UserAccount, AdminUserFlow } from '../../types';
import { socketService } from '../../services/socketService';

interface AdminUsersProps {
    onImpersonate: (user: UserAccount, flow?: AdminUserFlow) => void;
}

export const AdminUsers: React.FC<AdminUsersProps> = ({ onImpersonate }) => {
    const [users, setUsers] = useState<UserAccount[]>([]);
    const [search, setSearch] = useState('');
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    const fetchUsers = async () => {
        const data = await getAllUsers();
        setUsers(data);
    };

    useEffect(() => {
        let isMounted = true;
        fetchUsers();

        const socket = socketService.getSocket();
        if (socket) {
            socket.on('online_users_update', (onlineUsers: any[]) => {
                if (isMounted) {
                    const ids = new Set(onlineUsers.map(u => u.id));
                    setOnlineUserIds(ids);
                }
            });
        }

        return () => {
            isMounted = false;
            if (socket) {
                socket.off('online_users_update');
            }
        };
    }, []);

    const handleBanToggle = async (id: string, currentStatus: boolean) => {
        if (confirm(currentStatus ? "Mở khóa tài khoản này?" : "Bạn chắc chắn muốn khóa tài khoản này?")) {
            await updateUserStatus(id, !currentStatus);
            fetchUsers();
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(search.toLowerCase()) || 
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white">Quản Lý Người Dùng</h2>
                    <p className="text-slate-400 text-xs">Xem, chỉnh sửa và quản lý {users.length} thành viên.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm user, email..." 
                        className="w-full bg-[#1e293b] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-lg">search</span>
                </div>
            </div>

            <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-500 uppercase bg-[#162032] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-bold">Người dùng</th>
                                <th className="px-6 py-4 font-bold">Email</th>
                                <th className="px-6 py-4 font-bold">Ngày tham gia</th>
                                <th className="px-6 py-4 font-bold">Trạng thái</th>
                                <th className="px-6 py-4 font-bold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredUsers.map(user => {
                                const isOnline = onlineUserIds.has(user.id);
                                return (
                                <tr key={user.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                                        <div className="relative">
                                            <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-700 border border-white/10" alt="avatar" />
                                            {isOnline && (
                                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#1e293b] rounded-full"></span>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold flex items-center gap-2">
                                                {user.name}
                                                {isOnline && <span className="text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-full border border-green-500/20">Online</span>}
                                            </div>
                                            {user.isAdmin && <span className="bg-purple-500/20 text-purple-300 text-[9px] px-1.5 py-0.5 rounded uppercase font-bold border border-purple-500/30">Admin</span>}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{user.email}</td>
                                    <td className="px-6 py-4 text-slate-400">{new Date(user.joinedDate || (user as any).createdAt || (user as any).timestamp || Date.now()).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        {user.isBanned ? (
                                            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30 flex items-center gap-1 w-fit">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Banned
                                            </span>
                                        ) : (
                                            <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30 flex items-center gap-1 w-fit">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {!user.isAdmin && (
                                                <button 
                                                    onClick={() => onImpersonate(user)}
                                                    className="text-xs font-bold px-3 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 border border-blue-500/30 transition-all flex items-center gap-1"
                                                    title="Đăng nhập dưới quyền người dùng này"
                                                >
                                                    <span className="material-symbols-outlined text-sm">visibility</span> Ghost
                                                </button>
                                            )}
                                            {!user.isAdmin && (
                                                <button 
                                                    onClick={() => handleBanToggle(user.id, !!user.isBanned)}
                                                    className={`text-xs font-bold px-4 py-2 rounded-lg transition-all shadow-lg active:scale-95 ${
                                                        user.isBanned 
                                                        ? 'bg-green-600 hover:bg-green-500 text-white shadow-green-900/20' 
                                                        : 'bg-red-600/10 hover:bg-red-600/30 text-red-400 border border-red-500/30'
                                                    }`}
                                                >
                                                    {user.isBanned ? 'Mở Khóa' : 'Khóa TK'}
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-30">person_off</span>
                        <p>Không tìm thấy người dùng nào.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
