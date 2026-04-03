
import React from 'react';

// 1. TradingPostCard
interface TradingPostProps {
    title: string;
    price: number;
    author: string;
    onBuy?: (title: string, price: number) => void;
}

export const TradingPostCard: React.FC<TradingPostProps> = ({ title, price, author, onBuy }) => (
    <div className="bg-[#1e293b] border border-amber-500/30 rounded-xl p-4 w-full shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer group flex flex-col">
        <div className="h-32 bg-gradient-to-br from-amber-900/50 to-purple-900/50 rounded-lg mb-3 flex items-center justify-center border border-white/5">
            <span className="material-symbols-outlined text-4xl text-amber-400 group-hover:scale-110 transition-transform">inventory_2</span>
        </div>
        <h4 className="font-bold text-white text-sm truncate">{title}</h4>
        <p className="text-xs text-slate-400 mb-3">by {author}</p>
        <div className="flex justify-between items-center mt-auto">
            <div className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                <span className="material-symbols-outlined text-sm">monetization_on</span> {price}
            </div>
            <button 
                onClick={(e) => { e.stopPropagation(); onBuy && onBuy(title, price); }}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs px-3 py-1.5 rounded font-bold transition-colors shadow-lg active:scale-95"
            >
                Mua ngay
            </button>
        </div>
    </div>
);

// 2. CreditExchangePanel
export const CreditExchangePanel: React.FC<{ onPurchaseCredits?: (amount: number) => void }> = ({ onPurchaseCredits }) => (
    <div className="bg-[#0f172a] p-6 rounded-2xl border border-white/10 w-full sm:w-80">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-green-400">currency_exchange</span> Galactic Bank
        </h3>
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-500">payments</span>
                    <span className="text-sm text-slate-200">100 Credits</span>
                </div>
                <button 
                    onClick={() => onPurchaseCredits && onPurchaseCredits(100)}
                    className="text-xs bg-green-600/20 text-green-400 px-2 py-1 rounded border border-green-500/30 hover:bg-green-600 hover:text-white transition-colors"
                >
                    $0.99
                </button>
            </div>
            <div className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-yellow-500/30">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-yellow-500">payments</span>
                    <span className="text-sm text-slate-200 font-bold">1200 Credits</span>
                </div>
                <button 
                    onClick={() => onPurchaseCredits && onPurchaseCredits(1200)}
                    className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded border border-yellow-500/30 hover:bg-yellow-600 hover:text-white transition-colors"
                >
                    $9.99
                </button>
            </div>
        </div>
    </div>
);

// 3. CartModule
export const CartModule: React.FC<{ itemCount: number }> = ({ itemCount }) => (
    <button className="fixed top-24 right-6 z-50 p-3 bg-amber-600 text-white rounded-full shadow-lg hover:scale-110 transition-transform group">
        <span className="material-symbols-outlined">shopping_cart</span>
        {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center border-2 border-[#0f172a]">
                {itemCount}
            </span>
        )}
        <div className="absolute right-full top-1/2 -translate-y-1/2 mr-3 bg-black/80 px-2 py-1 rounded text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Giỏ hàng
        </div>
    </button>
);

// 4. LicenseKeyGenerator
export const LicenseKeyGenerator: React.FC = () => {
    const handleGenerate = () => {
        alert("Generated: XXXX-YYYY-ZZZZ-AAAA");
    };
    return (
        <div className="p-4 bg-[#1e293b] border border-dashed border-slate-600 rounded-xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Tạo mã quà tặng</h4>
            <button 
                onClick={handleGenerate}
                className="w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded flex items-center justify-center gap-2 transition-colors"
            >
                <span className="material-symbols-outlined text-sm">vpn_key</span> Generate Key
            </button>
        </div>
    );
};

// 5. AffiliateLinkBox
export const AffiliateLinkBox: React.FC = () => (
    <div className="p-4 bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-xl">
        <div className="flex justify-between items-center mb-2">
            <h4 className="text-xs font-bold text-pink-300 uppercase">Link giới thiệu</h4>
            <span className="text-[10px] bg-pink-500/20 text-pink-300 px-1.5 rounded">+15% hoa hồng</span>
        </div>
        <div className="flex gap-2">
            <input readOnly value="learnai.io/ref/u/captain" className="flex-1 bg-black/30 border border-white/10 rounded px-2 py-1 text-xs text-slate-300 outline-none" />
            <button 
                onClick={() => alert("Đã sao chép link!")}
                className="text-pink-400 hover:text-white"
            >
                <span className="material-symbols-outlined text-sm">content_copy</span>
            </button>
        </div>
    </div>
);
