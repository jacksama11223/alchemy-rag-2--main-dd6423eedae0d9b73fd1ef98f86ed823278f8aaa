
import React, { useState } from 'react';
import { loginUser, sendOTP, verifyOTPAndRegister, requestPasswordReset, socialLogin } from '../services/mockBackend';
import { UserAccount } from '../types';
import { auth } from '../src/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserAccount) => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot_password'>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleUserSubmit = async () => {
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (activeTab === 'login') {
          if (!email || !password) {
              setError("Vui lòng điền đầy đủ thông tin.");
              setIsLoading(false);
              return;
          }
          const res = await loginUser(email, password);
          
          if (res.success && res.user) {
              onLoginSuccess(res.user); 
          } else {
              setError(res.message || "Đăng nhập thất bại.");
          }
      } else if (activeTab === 'register') {
          if (!email || !password || !name) {
              setError("Vui lòng điền đầy đủ thông tin.");
              setIsLoading(false);
              return;
          }

          if (!isOtpSent) {
              const res = await sendOTP(email);
              if (res.success) {
                  setIsOtpSent(true);
                  setMessage("Mã OTP đã được gửi đến email của bạn.");
              } else {
                  setError(res.message || "Không thể gửi mã OTP.");
              }
          } else {
              if (!otp) {
                  setError("Vui lòng nhập mã OTP.");
                  setIsLoading(false);
                  return;
              }
              const res = await verifyOTPAndRegister(email, otp, name, password);
              if (res.success && res.user) {
                  setMessage("Đăng ký thành công! Đang đăng nhập...");
                  setTimeout(() => onLoginSuccess(res.user!), 1000);
              } else {
                  setError(res.message || "Đăng ký thất bại.");
              }
          }
      } else if (activeTab === 'forgot_password') {
          if (!email) {
              setError("Vui lòng nhập email.");
              setIsLoading(false);
              return;
          }
          const res = await requestPasswordReset(email);
          if (res.success) {
              setMessage("Link đặt lại mật khẩu đã được gửi đến email của bạn.");
          } else {
              setError(res.message || "Không thể gửi yêu cầu đặt lại mật khẩu.");
          }
      }
    } catch (e) {
        setError("Đã xảy ra lỗi kết nối.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
      setError('');
      setIsLoading(true);
      try {
          const provider = new GoogleAuthProvider();
          const result = await signInWithPopup(auth, provider);
          const idToken = await result.user.getIdToken();
          
          const res = await socialLogin(idToken, 'google');
          if (res.success && res.user) {
              onLoginSuccess(res.user);
          } else {
              setError(res.message || "Đăng nhập Google thất bại.");
          }
      } catch (e: any) {
          console.error("Google login error", e);
          setError(e.message || "Đăng nhập Google thất bại.");
      } finally {
          setIsLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative z-10 flex w-full h-[95vh] md:h-auto max-w-[900px] overflow-y-auto md:overflow-hidden rounded-t-[2rem] md:rounded-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl transition-all duration-500 animate-[fadeInUp_0.3s_ease-out] bg-white">
        
        {/* Left Side - Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col relative bg-[#FDFDF8] text-slate-900 min-h-full">
            
            {/* Header Icon */}
            <div className="absolute top-6 left-6 md:top-10 md:left-10 text-[#3498db]">
                 <span className="material-symbols-outlined text-4xl">auto_awesome</span>
            </div>

            <div className="mt-12 md:mt-8 mb-6 text-center">
                <h2 className="text-2xl font-black mb-2 text-[#101c22]">
                    {activeTab === 'login' ? 'Chào mừng trở lại!' : activeTab === 'register' ? 'Tham gia cộng đồng' : 'Khôi phục mật khẩu'}
                </h2>
                <p className="text-sm text-[#6c757d]">
                    {activeTab === 'login' ? 'Đăng nhập để tiếp tục hành trình của bạn' : activeTab === 'register' ? 'Tạo tài khoản để lưu trữ và chia sẻ kiến thức' : 'Nhập email để nhận link đặt lại mật khẩu'}
                </p>
            </div>

            {/* View Switcher */}
            <div className="flex p-1 bg-[#e1f0fa] rounded-full mb-6">
                <button 
                    onClick={() => { setActiveTab('login'); setError(''); setMessage(''); }}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${
                        activeTab === 'login' 
                        ? 'bg-white text-[#3498db] shadow-sm' 
                        : 'text-[#6c757d] hover:text-[#3498db]'
                    }`}
                >
                    Đăng nhập
                </button>
                <button 
                    onClick={() => { setActiveTab('register'); setError(''); setMessage(''); setIsOtpSent(false); }}
                    className={`flex-1 py-2.5 text-sm font-bold rounded-full transition-all ${
                        activeTab === 'register' 
                        ? 'bg-white text-[#3498db] shadow-sm' 
                        : 'text-[#6c757d] hover:text-[#3498db]'
                    }`}
                >
                    Đăng ký
                </button>
            </div>

            {/* FORM */}
            <div className="flex flex-col gap-4">
                {activeTab === 'register' && !isOtpSent && (
                    <div className="flex flex-col gap-1.5 animate-[fadeIn_0.2s]">
                        <label className="text-xs font-bold text-[#6c757d] uppercase ml-3">Tên hiển thị</label>
                        <input 
                            type="text" 
                            placeholder="Thuyền trưởng..."
                            className="w-full px-6 py-3.5 rounded-full border border-slate-200 bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#3498db]/50 focus:border-[#3498db] transition-all"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                )}
                
                {(!isOtpSent || activeTab !== 'register') && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#6c757d] uppercase ml-3">Email</label>
                        <input 
                            type="text" 
                            placeholder="email@example.com"
                            className="w-full px-6 py-3.5 rounded-full border border-slate-200 bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#3498db]/50 focus:border-[#3498db] transition-all"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                )}

                {(activeTab === 'login' || (activeTab === 'register' && !isOtpSent)) && (
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-[#6c757d] uppercase ml-3">Mật khẩu</label>
                        <input 
                            type="password" 
                            placeholder="••••••••"
                            className="w-full px-6 py-3.5 rounded-full border border-slate-200 bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#3498db]/50 focus:border-[#3498db] transition-all"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUserSubmit()}
                        />
                    </div>
                )}

                {activeTab === 'register' && isOtpSent && (
                    <div className="flex flex-col gap-1.5 animate-[fadeIn_0.2s]">
                        <label className="text-xs font-bold text-[#6c757d] uppercase ml-3">Mã OTP</label>
                        <input 
                            type="text" 
                            placeholder="Nhập mã 6 số từ email"
                            className="w-full px-6 py-3.5 rounded-full border border-slate-200 bg-white text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#3498db]/50 focus:border-[#3498db] transition-all"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUserSubmit()}
                        />
                    </div>
                )}
                
                {/* Action Button */}
                <button 
                    onClick={handleUserSubmit}
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-full bg-[#2980b9] hover:bg-[#3498db] text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? 'Đang xử lý...' : activeTab === 'login' ? 'Ra khơi!' : activeTab === 'register' ? (isOtpSent ? 'Xác nhận OTP' : 'Tạo tài khoản') : 'Gửi yêu cầu'}
                </button>

                {/* Social Login */}
                {activeTab !== 'forgot_password' && (
                    <div className="mt-4">
                        <div className="relative flex items-center py-2">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-medium uppercase">Hoặc</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>
                        <button 
                            onClick={handleGoogleLogin}
                            disabled={isLoading}
                            className="w-full py-3 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                            </svg>
                            Tiếp tục với Google
                        </button>
                    </div>
                )}
            </div>

            {error && (
                <div className="mt-4 p-3 border rounded-xl text-sm text-center font-medium animate-pulse bg-red-100 border-red-200 text-red-600">
                    {error}
                </div>
            )}
            {message && (
                <div className="mt-4 p-3 border rounded-xl text-sm text-center font-medium bg-green-100 border-green-200 text-green-700">
                    {message}
                </div>
            )}

            {/* Footer Text */}
            <div className="mt-auto pt-6 text-center">
                <p className="text-sm text-[#6c757d]">
                    {activeTab === 'login' ? "Chưa có tài khoản? " : activeTab === 'register' ? "Đã có tài khoản? " : "Nhớ mật khẩu? "}
                    <button 
                        onClick={() => { 
                            setActiveTab(activeTab === 'login' ? 'register' : 'login'); 
                            setError(''); 
                            setMessage(''); 
                            setIsOtpSent(false);
                        }}
                        className="text-[#2980b9] font-bold hover:underline"
                    >
                        {activeTab === 'login' ? "Đăng ký" : "Đăng nhập"}
                    </button>
                </p>
                {activeTab === 'login' && (
                    <button 
                        onClick={() => { setActiveTab('forgot_password'); setError(''); setMessage(''); }}
                        className="text-xs text-[#6c757d] hover:text-[#2980b9] mt-2 underline transition-colors"
                    >
                        Quên mật khẩu?
                    </button>
                )}
            </div>
        </div>

        {/* Right Side - Image */}
        <div className="hidden md:block w-1/2 relative bg-gray-100 overflow-hidden">
            <img 
                src="https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=1287&auto=format&fit=crop" 
                alt="Student smiling" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            
            {/* Speech Bubble */}
            <div className="absolute top-1/3 -left-4 bg-white px-5 py-3 rounded-2xl rounded-bl-none shadow-lg animate-bounce">
                <p className="text-[#212529] font-medium">Cộng đồng đang chờ bạn!</p>
            </div>
        </div>

        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full transition-colors bg-slate-100/80 hover:bg-slate-200 text-slate-600 md:text-white md:bg-black/10 md:hover:bg-black/20 backdrop-blur-sm"
        >
             <span className="material-symbols-outlined">close</span>
        </button>
      </div>
    </div>
  );
};

export default React.memo(LoginModal);
