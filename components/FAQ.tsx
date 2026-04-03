
import React from 'react';

interface FAQProps {
    onBack: () => void;
    onLogout: () => void;
    onShowAbout: () => void;
    onShowAccount: () => void;
    onGoToFeatures?: () => void;
}

const FAQ: React.FC<FAQProps> = ({ onBack, onLogout, onShowAbout, onShowAccount, onGoToFeatures }) => {
    return (
        <div className="bg-deep-sea-start font-display text-text-dark min-h-screen flex flex-col">
            <style>{`
                .aquarium-gradient {
                    background: linear-gradient(160deg, #011c27 0%, #00796b 100%);
                    position: relative;
                    overflow: hidden;
                }
                .light-shafts::before {
                    content: '';
                    position: absolute;
                    top: -20%;
                    left: -50%;
                    width: 200%;
                    height: 150%;
                    background: 
                        linear-gradient(155deg, rgba(245, 245, 245, 0) 45%, rgba(245, 245, 245, 0.15) 50%, rgba(245, 245, 245, 0) 55%),
                        linear-gradient(175deg, rgba(245, 245, 245, 0) 48%, rgba(245, 245, 245, 0.1) 50%, rgba(245, 245, 245, 0) 52%);
                    transform-origin: top center;
                    animation: lightRay 20s ease-in-out infinite;
                    pointer-events: none;
                }
                details[open] .arrow-icon {
                    transform: rotate(90deg);
                }
                .arrow-icon {
                    transition: transform 0.3s ease;
                }
            `}</style>
            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                <div className="flex h-full grow flex-col">
                    <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 bg-background-dark/80 px-4 py-3 backdrop-blur-md sm:px-6 lg:px-8">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-3xl text-white">sailing</span>
                                <h2 className="text-xl font-bold text-white">LearnAI</h2>
                            </div>
                            <nav className="hidden items-center gap-6 md:flex">
                                <a 
                                    className="text-sm font-medium text-white/80 transition-colors hover:text-white cursor-pointer" 
                                    onClick={(e) => { e.preventDefault(); if(onGoToFeatures) onGoToFeatures(); }}
                                >
                                    Tính năng
                                </a>
                                <a onClick={(e) => { e.preventDefault(); onShowAbout(); }} className="text-sm font-medium text-white/80 transition-colors hover:text-white cursor-pointer" href="#">Giới thiệu</a>
                                <a className="text-sm font-bold text-white transition-colors underline underline-offset-4" href="#">Hỏi đáp</a>
                            </nav>
                        </div>
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={onShowAccount}
                                className="flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
                            >
                                <span className="material-symbols-outlined text-base">person</span>
                                <span>Tài khoản</span>
                            </button>
                            <button onClick={onLogout} className="flex items-center justify-center gap-2 overflow-hidden rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20">
                                <span className="material-symbols-outlined text-base">logout</span>
                                <span>Đăng xuất</span>
                            </button>
                        </div>
                    </header>
                    <main className="flex-grow">
                        <section className="relative flex min-h-[calc(100vh-145px)] flex-col items-center justify-center aquarium-gradient px-4 py-16 sm:px-6 lg:px-8">
                            <div className="light-shafts absolute inset-0 z-0"></div>
                            <button 
                                onClick={onBack}
                                className="absolute top-6 left-6 z-30 flex items-center gap-2 rounded-full bg-black/30 px-4 py-2 text-sm font-bold text-white shadow-md backdrop-blur-sm transition-all duration-300 hover:bg-black/40"
                            >
                                <span className="material-symbols-outlined">arrow_back</span>
                                <span className="hidden sm:inline">Quay về</span>
                            </button>
                            <div className="relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-12 animate-subtleFloat">
                                <div className="text-center">
                                    <h1 className="text-4xl font-black leading-tight tracking-tighter text-white drop-shadow-lg md:text-5xl">Thủy Cung Tri Thức</h1>
                                    <p className="mt-2 text-lg text-ivory-white/80">Tìm câu trả lời cho các thắc mắc của bạn</p>
                                </div>
                                <div className="w-full rounded-2xl border border-white/20 bg-black/20 p-6 shadow-2xl backdrop-blur-lg sm:p-8">
                                    <div className="relative mb-8">
                                        <input className="w-full rounded-full border-2 border-transparent bg-ivory-white/10 py-3 pl-12 pr-4 text-ivory-white placeholder-ivory-white/60 transition-all focus:border-light-emerald focus:bg-ivory-white/20 focus:ring-0" placeholder="Tìm kiếm câu hỏi..." type="search"/>
                                        <span className="material-symbols-outlined pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ivory-white/70">search</span>
                                    </div>
                                    <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
                                        <button className="rounded-full bg-emerald-green px-4 py-2 text-sm font-semibold text-white shadow-glow-emerald transition hover:scale-105">Tất cả</button>
                                        <button className="rounded-full bg-ivory-white/10 px-4 py-2 text-sm font-medium text-ivory-white transition hover:bg-ivory-white/20 hover:shadow-glow-white">Tài khoản</button>
                                        <button className="rounded-full bg-ivory-white/10 px-4 py-2 text-sm font-medium text-ivory-white transition hover:bg-ivory-white/20 hover:shadow-glow-white">Tính năng</button>
                                        <button className="rounded-full bg-ivory-white/10 px-4 py-2 text-sm font-medium text-ivory-white transition hover:bg-ivory-white/20 hover:shadow-glow-white">Kỹ thuật</button>
                                    </div>
                                    <div className="space-y-4">
                                        <details className="group rounded-lg bg-ivory-white/5 transition">
                                            <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold text-ivory-white">
                                                Làm thế nào để tạo một Sơ đồ Tri thức mới?
                                                <span className="material-symbols-outlined arrow-icon">chevron_right</span>
                                            </summary>
                                            <div className="border-t border-ivory-white/10 p-4 text-ivory-white/80">
                                                Để tạo Sơ đồ Tri thức mới, bạn hãy vào trang chính, nhấp vào nút "Tạo mới", sau đó chọn "Sơ đồ Tri thức". Bạn có thể nhập nội dung từ văn bản, URL hoặc tải lên tệp tin. Hệ thống AI sẽ tự động phân tích và tạo sơ đồ cho bạn.
                                            </div>
                                        </details>
                                        <details className="group rounded-lg bg-ivory-white/5 transition">
                                            <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold text-ivory-white">
                                                LearnAI hỗ trợ những định dạng tệp nào?
                                                <span className="material-symbols-outlined arrow-icon">chevron_right</span>
                                            </summary>
                                            <div className="border-t border-ivory-white/10 p-4 text-ivory-white/80">
                                                Hiện tại, LearnAI hỗ trợ các định dạng tệp phổ biến như .txt, .pdf, .docx. Chúng tôi đang nỗ lực để hỗ trợ thêm nhiều định dạng khác trong tương lai.
                                            </div>
                                        </details>
                                        <details className="group rounded-lg bg-ivory-white/5 transition">
                                            <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold text-ivory-white">
                                                Tôi có thể chia sẻ Sơ đồ Tri thức của mình không?
                                                <span className="material-symbols-outlined arrow-icon">chevron_right</span>
                                            </summary>
                                            <div className="border-t border-ivory-white/10 p-4 text-ivory-white/80">
                                                Có, bạn hoàn toàn có thể chia sẻ sơ đồ của mình. Trong giao diện Sơ đồ Tri thức, hãy tìm nút "Chia sẻ" ở góc trên bên phải. Bạn có thể tạo một liên kết công khai hoặc mời người dùng khác xem và cộng tác.
                                            </div>
                                        </details>
                                        <details className="group rounded-lg bg-ivory-white/5 transition">
                                            <summary className="flex cursor-pointer list-none items-center justify-between p-4 font-semibold text-ivory-white">
                                                Làm cách nào để đặt lại mật khẩu?
                                                <span className="material-symbols-outlined arrow-icon">chevron_right</span>
                                            </summary>
                                            <div className="border-t border-ivory-white/10 p-4 text-ivory-white/80">
                                                Bạn có thể đặt lại mật khẩu bằng cách vào trang "Tài khoản", chọn mục "Bảo mật" và làm theo hướng dẫn. Nếu bạn quên mật khẩu, hãy sử dụng tính năng "Quên mật khẩu" trên trang đăng nhập.
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>
                    <footer className="border-t border-solid border-white/10 bg-background-dark/80 px-4 py-6 sm:px-6 lg:px-8">
                        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-2xl text-white">sailing</span>
                                <h2 className="text-lg font-bold text-white">LearnAI</h2>
                            </div>
                            <div className="flex gap-6 text-sm font-medium text-white/80">
                                <a className="transition-colors hover:text-white" href="#">Điều khoản dịch vụ</a>
                                <a className="transition-colors hover:text-white" href="#">Chính sách bảo mật</a>
                            </div>
                            <p className="text-sm text-white/60">© 2024 LearnAI. All rights reserved.</p>
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
};

export default React.memo(FAQ);
