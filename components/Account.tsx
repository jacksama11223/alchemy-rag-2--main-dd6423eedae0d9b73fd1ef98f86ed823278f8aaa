
import React, { useEffect, useState } from 'react';
import { getCurrentUser, updateUserProfile } from '../services/mockBackend';
import { UserAccount } from '../types';

interface AccountProps {
    onBack: () => void;
    onLogout: () => void;
    onShowAbout: () => void;
    onShowFAQ: () => void;
    onGoToFeatures?: () => void;
}

const Account: React.FC<AccountProps> = ({ onBack, onLogout, onShowAbout, onShowFAQ, onGoToFeatures }) => {
    const [user, setUser] = useState<UserAccount | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [newName, setNewName] = useState('');
    
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    const [isEditingPass, setIsEditingPass] = useState(false);
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        const u = getCurrentUser();
        setUser(u);
        if (u) {
            setNewName(u.name);
            setNewEmail(u.email);
        }
    }, []);

    const handleUpdate = async (field: 'name' | 'email' | 'password') => {
        let payload: any = {};
        if (field === 'name') {
            if (!newName.trim()) return;
            payload.name = newName;
        } else if (field === 'email') {
            if (!newEmail.trim()) return;
            payload.email = newEmail;
        } else if (field === 'password') {
            if (!newPassword.trim()) return;
            payload.password = newPassword;
        }

        const res = await updateUserProfile(payload);
        if (res.success) {
            if (field === 'name') {
                setUser(prev => prev ? { ...prev, name: newName } : null);
                setIsEditingName(false);
            } else if (field === 'email') {
                setUser(prev => prev ? { ...prev, email: newEmail } : null);
                setIsEditingEmail(false);
            } else if (field === 'password') {
                setIsEditingPass(false);
                setNewPassword('');
                alert("Đổi mật khẩu thành công!");
            }
        } else {
            alert(res.message || "Cập nhật thất bại.");
        }
    };

    return (
        <div className="relative flex h-auto min-h-screen w-full flex-col bg-[#051428] group/design-root overflow-x-hidden font-display text-slate-200">
            <style>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24
                }
                @keyframes shimmer-particle {
                    0%, 100% { transform: translateY(0) scale(0.5); opacity: 0; }
                    50% { opacity: 0.6; }
                    99% { transform: translateY(-50px) scale(1); opacity: 0; }
                }
                .particle {
                    position: absolute;
                    border-radius: 50%;
                    animation: shimmer-particle 6s infinite ease-in-out;
                    box-shadow: 0 0 10px currentColor, 0 0 20px currentColor, 0 0 30px currentColor;
                }
                .text-shadow-glow {
                    text-shadow: 0 1px 8px rgba(0,0,0,0.6);
                }
            `}</style>
            
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#0a192f] via-[#051428] to-[#171a26]"></div>
            
            <div className="absolute inset-0 z-10 bottom-0 overflow-hidden pointer-events-none">
                <div className="particle bg-amber-300" style={{ width: '2px', height: '2px', top: '10%', left: '15%', animationDelay: '0.5s' }}></div>
                <div className="particle bg-yellow-200" style={{ width: '3px', height: '3px', top: '20%', left: '80%', animationDelay: '1.2s' }}></div>
                <div className="particle bg-amber-400" style={{ width: '1px', height: '1px', top: '50%', left: '50%', animationDelay: '2.5s' }}></div>
            </div>
            
            <img 
                alt="An underwater treasure vault" 
                className="absolute inset-0 w-full h-full object-cover opacity-15 z-0" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDOwBbddQ-MP9UgXIUfN4w08iKkMlLT1lmcKekZN9OJB69pVuOVEVwUn8_lyYzV9eB6C3D1rrbe4dgd5RSQ4IXpUxvjih2SjJC6fkuzSb2LPjD5knydjj1IuI6L5G_0Nj5xySZmqaQCqJkg416LgzEwQ2D8Ktl325ZBIkJyTCqpfcD6ycsgO24Vb4GxsnCFUd5FE1FkNkF9naJD8ux4dIBS8NGMOinP-Mi1o6xbWE_U9qmmsq4Act3qcDwphuV0O387HOL8dMsQgPZt"
            />
            
            <div className="flex h-full grow flex-col relative z-20">
                <header className="flex items-center justify-between whitespace-nowrap px-4 sm:px-10 py-3 font-display bg-[#0a192f]/50 backdrop-blur-sm sticky top-0 z-50">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2.5 text-xl font-bold text-white text-shadow-glow cursor-pointer" onClick={() => onBack()}>
                            <span className="material-symbols-outlined text-3xl">sailing</span>
                            <span>LearnAI</span>
                        </div>
                        <nav className="hidden md:flex items-center gap-6">
                            <a 
                                className="text-white text-sm font-bold leading-normal hover:text-white/80 transition-colors text-shadow-glow cursor-pointer"
                                onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}
                            >
                                Tính năng
                            </a>
                            <a onClick={(e) => { e.preventDefault(); onShowAbout(); }} className="text-white text-sm font-bold leading-normal hover:text-white/80 transition-colors text-shadow-glow cursor-pointer" href="#">Giới thiệu</a>
                            <a onClick={(e) => { e.preventDefault(); onShowFAQ(); }} className="text-white text-sm font-bold leading-normal hover:text-white/80 transition-colors text-shadow-glow cursor-pointer" href="#">Hỏi đáp</a>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 cursor-pointer text-sm font-bold text-amber-300 transition-colors text-shadow-glow bg-white/10 px-4 py-2 rounded-full border border-amber-300/30">
                            <span className="material-symbols-outlined text-base">person</span>
                            <span>Tài khoản</span>
                        </button>
                        <button onClick={onLogout} className="flex items-center gap-2 cursor-pointer text-sm font-bold text-white transition-colors hover:text-white/80 text-shadow-glow">
                            <span className="material-symbols-outlined text-base">logout</span>
                            <span>Đăng xuất</span>
                        </button>
                    </div>
                </header>
                
                <main className="flex-grow flex flex-col items-center px-4 py-8">
                    <div className="w-full max-w-6xl">
                        <div className="w-full flex justify-start mb-6">
                            <button 
                                onClick={onBack}
                                className="flex items-center justify-center rounded-xl h-10 px-4 text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] bg-black/20 hover:bg-black/40 transition-colors backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                            >
                                <span className="material-symbols-outlined text-white" style={{ fontSize: '20px', fontWeight: 700 }}>arrow_back</span>
                                <span>Quay về</span>
                            </button>
                        </div>
                        
                        <div 
                            className="bg-slate-900/40 backdrop-blur-lg border-2 border-amber-400/30 rounded-xl shadow-2xl shadow-amber-500/10 p-8 flex flex-col lg:flex-row gap-8 items-start relative overflow-hidden" 
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='old-map' patternUnits='userSpaceOnUse' width='100' height='100'%3E%3Cimage href='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.05%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22 opacity=%220.1%22/%3E%3C/svg%3E' x='0' y='0' width='100' height='100'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23old-map)'/%3E%3C/svg%3E")` }}
                        >
                            <div className="w-full lg:w-2/3">
                                <h1 className="text-white text-3xl font-black leading-tight tracking-[-0.033em] text-amber-300 [text-shadow:0_2px_10px_rgba(252,211,77,0.5)] mb-8">Kho Báu Cá Nhân: Tài khoản</h1>
                                
                                <div className="space-y-4">
                                    {/* NAME */}
                                    <div className="bg-stone-800/50 border border-amber-600/40 rounded-lg p-4 backdrop-blur-sm shadow-lg flex flex-wrap items-center justify-between gap-4 transition-all duration-300 hover:bg-stone-700/60 hover:shadow-amber-500/20">
                                        <div className="flex items-center gap-4 flex-1">
                                            <span className="material-symbols-outlined text-amber-400 text-3xl">badge</span>
                                            <div className="w-full">
                                                <h3 className="text-lg font-semibold text-amber-200">Tên người dùng</h3>
                                                {isEditingName ? (
                                                    <input 
                                                        className="bg-black/30 border border-white/20 rounded px-2 py-1 text-white w-full outline-none focus:border-amber-400"
                                                        value={newName}
                                                        onChange={(e) => setNewName(e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-stone-300/90 text-sm font-bold text-white">{user?.name || "Khách"}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => isEditingName ? handleUpdate('name') : setIsEditingName(true)}
                                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">{isEditingName ? 'save' : 'edit'}</span>
                                            <span>{isEditingName ? 'Lưu' : 'Sửa'}</span>
                                        </button>
                                        {isEditingName && (
                                            <button onClick={() => { setIsEditingName(false); setNewName(user?.name || ''); }} className="text-slate-400 hover:text-white px-2">Hủy</button>
                                        )}
                                    </div>

                                    {/* Friend ID Display */}
                                    <div className="bg-blue-900/40 border border-blue-500/40 rounded-lg p-4 backdrop-blur-sm shadow-lg flex flex-wrap items-center justify-between gap-4 transition-all duration-300 hover:bg-blue-800/50">
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-blue-400 text-3xl">qr_code</span>
                                            <div>
                                                <h3 className="text-lg font-semibold text-blue-200">Mã kết bạn (ID)</h3>
                                                <p className="text-white text-lg font-mono tracking-widest font-black">{user?.friendCode || "----"}</p>
                                            </div>
                                        </div>
                                        <div className="text-xs text-blue-300 italic">Dùng mã này để kết bạn</div>
                                    </div>
                                    
                                    {/* EMAIL */}
                                    <div className="bg-stone-800/50 border border-amber-600/40 rounded-lg p-4 backdrop-blur-sm shadow-lg flex flex-wrap items-center justify-between gap-4 transition-all duration-300 hover:bg-stone-700/60 hover:shadow-amber-500/20">
                                        <div className="flex items-center gap-4 flex-1">
                                            <span className="material-symbols-outlined text-amber-400 text-3xl">mail</span>
                                            <div className="w-full">
                                                <h3 className="text-lg font-semibold text-amber-200">Email</h3>
                                                {isEditingEmail ? (
                                                    <input 
                                                        className="bg-black/30 border border-white/20 rounded px-2 py-1 text-white w-full outline-none focus:border-amber-400"
                                                        value={newEmail}
                                                        onChange={(e) => setNewEmail(e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-stone-300/90 text-sm">{user?.email || "Chưa cập nhật"}</p>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => isEditingEmail ? handleUpdate('email') : setIsEditingEmail(true)}
                                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">{isEditingEmail ? 'save' : 'edit'}</span>
                                            <span>{isEditingEmail ? 'Lưu' : 'Sửa'}</span>
                                        </button>
                                        {isEditingEmail && (
                                            <button onClick={() => { setIsEditingEmail(false); setNewEmail(user?.email || ''); }} className="text-slate-400 hover:text-white px-2">Hủy</button>
                                        )}
                                    </div>
                                    
                                    {/* PASSWORD */}
                                    <div className="bg-stone-800/50 border border-amber-600/40 rounded-lg p-4 backdrop-blur-sm shadow-lg flex flex-wrap items-center justify-between gap-4 transition-all duration-300 hover:bg-stone-700/60 hover:shadow-amber-500/20">
                                        <div className="flex items-center gap-4 flex-1">
                                            <span className="material-symbols-outlined text-amber-400 text-3xl">password</span>
                                            <div className="w-full">
                                                <h3 className="text-lg font-semibold text-amber-200">Mật khẩu</h3>
                                                {isEditingPass ? (
                                                    <input 
                                                        type="password"
                                                        placeholder="Nhập mật khẩu mới..."
                                                        className="bg-black/30 border border-white/20 rounded px-2 py-1 text-white w-full outline-none focus:border-amber-400"
                                                        value={newPassword}
                                                        onChange={(e) => setNewPassword(e.target.value)}
                                                    />
                                                ) : (
                                                    <p className="text-stone-300/90 text-sm">********</p>
                                                )}
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => isEditingPass ? handleUpdate('password') : setIsEditingPass(true)}
                                            className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">{isEditingPass ? 'save' : 'edit'}</span>
                                            <span>{isEditingPass ? 'Lưu' : 'Đổi'}</span>
                                        </button>
                                        {isEditingPass && (
                                            <button onClick={() => { setIsEditingPass(false); setNewPassword(''); }} className="text-slate-400 hover:text-white px-2">Hủy</button>
                                        )}
                                    </div>
                                    
                                    <div className="bg-stone-800/50 border border-amber-600/40 rounded-lg p-4 backdrop-blur-sm shadow-lg flex flex-wrap items-center justify-between gap-4 transition-all duration-300 hover:bg-stone-700/60 hover:shadow-amber-500/20">
                                        <div className="flex items-center gap-4">
                                            <span className="material-symbols-outlined text-amber-400 text-3xl">history</span>
                                            <div>
                                                <h3 className="text-lg font-semibold text-amber-200">Lịch sử hoạt động</h3>
                                                <p className="text-stone-300/90 text-sm">Theo dõi hành trình khám phá tri thức</p>
                                            </div>
                                        </div>
                                        <button className="bg-stone-600 hover:bg-stone-500 text-white font-bold py-2 px-4 rounded-lg text-sm transition-colors flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">visibility</span>
                                            <span>Xem chi tiết</span>
                                        </button>
                                    </div>
                                    
                                </div>
                            </div>
                            
                            <div className="w-full lg:w-1/3 flex flex-col items-center gap-6 mt-16 lg:mt-0">
                                <h2 className="text-xl font-bold text-amber-200 [text-shadow:0_1px_5px_rgba(252,211,77,0.4)] text-center">Kho Báu Tri Thức</h2>
                                <div className="relative w-48 h-48">
                                    <img 
                                        alt="A glowing treasure chest" 
                                        className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(253,224,71,0.2)]" 
                                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuD88sls_WBnuwwmB9eZlZsLt6BZ7thvgOgu8jESraq76hENodORwg-JpxmIfq_AcSXzU8UmIneyAzKtjjKW3Mbo20X_JMo6oquPxBDB7tShmfXm7NtmGVJrFCdpkY-2QIdzrt5C16K80kIA4qJIXNL-MWoYUpYtrrV0U4etg3BaWZYgSe9w_4VH_zCUVRc1jLITEdhtHME6HaTxHG-0tCQVpzplEuqAUDsW17ttqawkYfeJSbeJ2DaoVk4Jwj7FPMidAuTY-FhjJZ4Z"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-amber-300 text-6xl opacity-70 animate-pulse">school</span>
                                    </div>
                                </div>
                                <p className="text-amber-100 text-center text-sm">Tổng quan tiến độ học tập của bạn.</p>
                                <div className="w-full bg-stone-900/50 p-4 rounded-lg border border-amber-500/30">
                                    <div className="flex justify-between items-center text-sm text-amber-200 mb-1">
                                        <span>Cấp độ: Nhà Thám Hiểm</span>
                                        <span>75%</span>
                                    </div>
                                    <div className="w-full bg-stone-700 rounded-full h-2.5">
                                        <div className="bg-gradient-to-r from-amber-500 to-yellow-300 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                    <p className="text-xs text-stone-400 text-center mt-2">2500 XP nữa để lên cấp!</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
                
                <footer className="flex items-center justify-between whitespace-nowrap px-4 sm:px-10 py-4 font-display bg-[#0a192f]/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2.5 text-white text-shadow-glow">
                        <span className="material-symbols-outlined text-3xl">sailing</span>
                        <span className="text-xl font-bold">LearnAI</span>
                    </div>
                    <div className="flex-1 flex justify-center items-center gap-6">
                        <a className="text-white text-sm font-bold leading-normal hover:text-white/80 transition-colors text-shadow-glow" href="#">Điều khoản dịch vụ</a>
                        <a className="text-white text-sm font-bold leading-normal hover:text-white/80 transition-colors text-shadow-glow" href="#">Chính sách bảo mật</a>
                    </div>
                    <p className="text-gray-200 text-sm font-medium text-shadow-glow">© 2024 LearnAI. All rights reserved</p>
                </footer>
            </div>
        </div>
    );
};

export default React.memo(Account);
