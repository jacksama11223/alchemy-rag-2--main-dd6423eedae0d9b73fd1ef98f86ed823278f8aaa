import React, { useState, useEffect } from 'react';
import { getPendingMarketplaceItems, approveMarketplaceItem, rejectMarketplaceItem, deleteMarketplaceItem } from '../../services/mockBackend';
import { MarketplaceItem } from '../../types';

export const AdminMarketplace: React.FC = () => {
    const [pendingItems, setPendingItems] = useState<MarketplaceItem[]>([]);

    const fetchItems = async () => {
        const items = await getPendingMarketplaceItems();
        setPendingItems(items);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const handleApprove = async (id: string) => {
        await approveMarketplaceItem(id);
        fetchItems();
    };

    const handleReject = async (id: string) => {
        await rejectMarketplaceItem(id);
        fetchItems();
    };

    const handleDelete = async (id: string) => {
        if(confirm("Xóa vĩnh viễn item này?")) {
            await deleteMarketplaceItem(id);
            fetchItems();
        }
    };

    return (
        <div className="space-y-6 animate-[fadeIn_0.5s]">
            <div>
                <h2 className="text-2xl font-bold text-white">Quản Lý Chợ Tri Thức</h2>
                <p className="text-slate-400 text-xs">Duyệt và quản lý các nội dung được chia sẻ lên chợ.</p>
            </div>

            <div className="bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 border-b border-white/10 bg-[#162032]">
                    <h3 className="text-white font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined text-amber-400">pending_actions</span>
                        Nội dung chờ duyệt ({pendingItems.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300">
                        <thead className="text-xs text-slate-500 uppercase bg-[#162032] border-b border-white/5">
                            <tr>
                                <th className="px-6 py-4 font-bold">Tiêu đề</th>
                                <th className="px-6 py-4 font-bold">Tác giả</th>
                                <th className="px-6 py-4 font-bold">Loại</th>
                                <th className="px-6 py-4 font-bold">Giá</th>
                                <th className="px-6 py-4 font-bold text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {pendingItems.map(item => (
                                <tr key={item.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{item.title}</td>
                                    <td className="px-6 py-4">{item.author}</td>
                                    <td className="px-6 py-4">
                                        <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/30">
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-green-400">{item.price === 0 ? 'Miễn phí' : `${item.price} XP`}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleApprove(item.id)} className="text-xs font-bold px-3 py-1.5 rounded bg-green-600/20 hover:bg-green-600/40 text-green-400 border border-green-500/30 transition-all">Duyệt</button>
                                            <button onClick={() => handleReject(item.id)} className="text-xs font-bold px-3 py-1.5 rounded bg-amber-600/20 hover:bg-amber-600/40 text-amber-400 border border-amber-500/30 transition-all">Từ chối</button>
                                            <button onClick={() => handleDelete(item.id)} className="text-xs font-bold px-3 py-1.5 rounded bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 transition-all">Xóa</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {pendingItems.length === 0 && (
                    <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                        <span className="material-symbols-outlined text-4xl mb-2 opacity-30">check_circle</span>
                        <p>Không có nội dung nào đang chờ duyệt.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
