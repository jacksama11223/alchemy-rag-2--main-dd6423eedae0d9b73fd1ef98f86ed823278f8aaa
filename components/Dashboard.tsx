
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FileText, BookOpen } from 'lucide-react';

import { useGamification } from '../contexts/GamificationContext';
import { useBehavior } from '../contexts/BehaviorContext'; 
import { GuideTrigger } from './GuideSystem'; 
import { ApiKeyManager } from './ApiKeyManager'; 
import { fetchNotifications, respondToFriendRequestApi, markNotificationRead } from '../services/mockBackend';
import { BrandLogo, OceanBackground } from './common/BrandAssets';
import { OceanTheme } from '../theme/theme';

import { useAppStore } from '../store/useAppStore';
import { useGuideStore } from '../store/useGuideStore';
import { EcosystemGuideOverlay } from './Dashboard-Guide/EcosystemGuideOverlay';
import { ECOSYSTEM_CONNECTIONS } from './Dashboard-Guide/guideData';

// Sortable Item Component
function SortableWidget({ id, children, isCustomizing }: { id: string; children: React.ReactNode; isCustomizing: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled: !isCustomizing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white/80 backdrop-blur-md rounded-3xl shadow-lg border border-white/60 overflow-hidden flex-1 min-w-[300px] ${isCustomizing ? 'ring-2 ring-blue-500/50' : ''}`}>
      <div className="flex items-center px-6 py-4 bg-slate-50/50 border-b border-slate-100/50">
        {isCustomizing && (
          <button {...attributes} {...listeners} className="cursor-grab hover:text-blue-600 mr-3 text-slate-400">
            <GripVertical className="w-5 h-5" />
          </button>
        )}
        <h3 className="font-black text-slate-800 flex items-center text-lg">
          {id === 'notes' && <FileText className="w-5 h-5 mr-2 text-indigo-500" />}
          {id === 'flashcards' && <BookOpen className="w-5 h-5 mr-2 text-emerald-500" />}
          {id === 'notes' ? 'Ghi chú gần đây' : 'Cần ôn tập hôm nay'}
        </h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

interface DashboardProps {
  stats?: { due: number; weak: number; new: number };
}

const Dashboard: React.FC<DashboardProps> = ({ stats }) => {
  const { 
    handleLogout, 
    handleFeatureSelect, 
    handleShowAbout, 
    handleShowFAQ, 
    handleShowAccount, 
    setIsFriendManagerOpen,
    scrollToFeatures,
    setScrollToFeatures
  } = useAppStore();
  
  const { isGuideEnabled, toggleGuide, setHoveredFeature, hoveredFeature } = useGuideStore();
  
  const onLogout = handleLogout;
  const onFeatureSelect = handleFeatureSelect;
  const onShowAbout = handleShowAbout;
  const onShowFAQ = handleShowFAQ;
  const onShowAccount = handleShowAccount;
  const onShowFriends = () => setIsFriendManagerOpen(true);
  const onScrollComplete = () => setScrollToFeatures(false);

  const { progress, checkIn, isCheckedInToday } = useGamification();
  const { logAction } = useBehavior(); 
  
  const [widgets, setWidgets] = useState(['notes', 'flashcards']);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [originalWidgets, setOriginalWidgets] = useState(['notes', 'flashcards']);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch user settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/user/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.widgetOrder && data.widgetOrder.length > 0) {
          setWidgets(data.widgetOrder);
          setOriginalWidgets(data.widgetOrder);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.indexOf(active.id as string);
      const newIndex = widgets.indexOf(over.id as string);
      const newOrder = arrayMove(widgets, oldIndex, newIndex);
      
      setWidgets(newOrder);
    }
  };

  const saveWidgetOrder = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ widgetOrder: widgets })
      });
      setOriginalWidgets(widgets);
      setIsCustomizing(false);
    } catch (err) {
      console.error('Failed to save widget order', err);
      // Revert on error
      setWidgets(originalWidgets);
      setIsCustomizing(false);
    }
  };

  const cancelCustomization = () => {
    setWidgets(originalWidgets);
    setIsCustomizing(false);
  };
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    logAction('view_feature', 'Dashboard', 'User entered dashboard');
    const loadNotifs = async () => {
        const notifs = await fetchNotifications();
        setNotifications(notifs);
    };
    loadNotifs();
    
    const token = localStorage.getItem('token');
    const socket = (window as any).socket;
    
    if (socket) {
        socket.on('new_notification', (newNotif: any) => {
            setNotifications(prev => {
                // Check if notif already exists to avoid duplicates
                if (prev.find(n => n._id === newNotif._id)) return prev;
                return [newNotif, ...prev];
            });
        });
    }

    const interval = setInterval(loadNotifs, 30000); // Polling as fallback (increased to 30s)
    
    return () => {
        clearInterval(interval);
        if (socket) socket.off('new_notification');
    };
  }, []);

  useEffect(() => {
    if (scrollToFeatures) {
        const featureSection = document.getElementById('feature-navigation-grid');
        if (featureSection) {
            featureSection.scrollIntoView({ behavior: 'smooth' });
            if (onScrollComplete) setTimeout(onScrollComplete, 500);
        }
    }
  }, [scrollToFeatures, onScrollComplete]);

  const ecosystemHealth = Math.max(0, 100 - ((stats?.weak || 0) * 5));
  let healthColor = 'text-green-600';
  let healthBarColor = 'bg-gradient-to-r from-green-400 to-emerald-500';
  if (ecosystemHealth < 70) { healthColor = 'text-yellow-600'; healthBarColor = 'bg-gradient-to-r from-yellow-400 to-amber-500'; }
  if (ecosystemHealth < 40) { healthColor = 'text-red-600'; healthBarColor = 'bg-gradient-to-r from-red-400 to-rose-500'; }

  const scrollToFeaturesLocal = () => {
    const featureSection = document.getElementById('feature-navigation-grid');
    if (featureSection) {
        featureSection.scrollIntoView({ behavior: 'smooth' });
        logAction('click_element', 'Dashboard', 'Scrolled to Features');
    }
  };

  const handleFeatureClick = (feature: string) => {
      logAction('view_feature', feature, `User selected ${feature}`);
      onFeatureSelect(feature);
  };

  const handleRespondFriend = async (id: string, action: 'accept' | 'decline') => {
      await respondToFriendRequestApi(id, action);
      setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const handleMarkRead = async (id: string) => {
      await markNotificationRead(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
  };

  const FeatureCard = ({ id, icon, title, desc, onClick, color, bg }: { id: string, icon: string, title: string, desc: string, onClick: () => void, color: string, bg: string }) => {
    const isTarget = isGuideEnabled && hoveredFeature && ECOSYSTEM_CONNECTIONS[hoveredFeature]?.some(conn => conn.target === id);
    const isHovered = isGuideEnabled && hoveredFeature === id;
    const isDimmed = isGuideEnabled && hoveredFeature && !isHovered && !isTarget;

    return (
      <button 
          id={`feature-${id}`}
          onClick={onClick} 
          onMouseEnter={() => setHoveredFeature(id)}
          onMouseLeave={() => setHoveredFeature(null)}
          className={`group relative flex flex-col items-center justify-center text-center p-6 w-full aspect-square rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg hover:shadow-2xl hover:bg-white/60 transition-all duration-300 hover:-translate-y-2 overflow-hidden ${isDimmed ? 'opacity-30 grayscale' : 'z-50'}`}
      >
          <div className={`absolute -inset-full rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl ${bg}`}></div>
          
          <div 
            className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all cursor-pointer shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              toggleGuide();
            }}
            title={isGuideEnabled ? "Tắt hướng dẫn" : "Bật hướng dẫn"}
          >
            <span className="material-symbols-outlined text-xs">{isGuideEnabled ? 'visibility_off' : 'help'}</span>
            <span className="text-[10px] font-bold uppercase">{isGuideEnabled ? 'Bỏ qua' : 'Hướng dẫn?'}</span>
          </div>

          <div className={`flex items-center justify-center size-16 rounded-2xl ${bg} bg-opacity-20 mb-4 group-hover:scale-110 transition-transform shadow-sm border border-white/50`}>
              <span className={`material-symbols-outlined text-4xl ${color}`}>{icon}</span>
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2 tracking-tight group-hover:text-blue-900 transition-colors">{title}</h3>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">{desc}</p>
          
          <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-slate-400">
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </div>

          {isHovered && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl z-10">
                  <span className="text-sm font-bold text-slate-800 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50">Tiếp tục sử dụng</span>
              </div>
          )}
      </button>
    );
  };

  return (
    <div className="min-h-screen font-display text-slate-800 flex flex-col relative overflow-x-hidden">
      <OceanBackground variant="surface" />
      
      <style>{`
        .wave-text {
            background: linear-gradient(45deg, #0284c7, #06b6d4);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* Header */}
      <header className={`flex items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-4 sticky top-0 z-50 ${OceanTheme.gradients.headerLight}`}>
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.reload()}>
          <BrandLogo variant="light" />
          <GuideTrigger guideKey="dashboard" className="ml-2 bg-blue-100 text-blue-600 hover:bg-blue-200" />
        </div>
          <div className="hidden md:flex ml-8 items-center gap-8">
            <a onClick={(e) => { e.preventDefault(); scrollToFeaturesLocal(); }} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer uppercase tracking-wider">Chức Năng Hệ Thống</a>
            <a onClick={(e) => { e.preventDefault(); onShowAbout(); }} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer uppercase tracking-wider">Tổng Quan Dự Án</a>
            <a onClick={(e) => { e.preventDefault(); onShowFAQ(); }} className="text-sm font-bold text-slate-600 hover:text-blue-600 transition-colors cursor-pointer uppercase tracking-wider">Cơ Sở Tri Thức (FAQ)</a>
          </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 bg-white/60 px-4 py-1.5 rounded-full border border-white/60 shadow-sm backdrop-blur-md">
              <span className="text-amber-500 font-black text-sm">{progress.xp} XP</span>
              <div className="w-px h-4 bg-slate-300"></div>
              <span className="text-blue-500 font-bold text-sm">Lvl {progress.level}</span>
          </div>
          
          <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-white/50 text-slate-600 relative transition-colors"
              >
                  <span className="material-symbols-outlined">notifications</span>
                  {notifications.length > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-bounce"></span>
                  )}
              </button>
              
              {showNotifications && (
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-slate-100 p-4 z-50 animate-[fadeIn_0.2s]">
                      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Trung Tâm Thông Báo</h4>
                      {notifications.length === 0 ? (
                          <p className="text-sm text-slate-400 text-center py-4">Hệ thống không ghi nhận thông báo mới.</p>
                      ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto">
                              {notifications.map(n => (
                                  <div 
                                      key={n._id} 
                                      className="p-3 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
                                      onClick={() => {
                                          if (n.type !== 'friend_request') {
                                              handleMarkRead(n._id);
                                          }
                                      }}
                                  >
                                      <div className="flex justify-between items-start mb-2">
                                          <p className="text-sm text-slate-700">{n.message}</p>
                                          {n.type !== 'friend_request' && (
                                              <button 
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleMarkRead(n._id);
                                                  }}
                                                  className="text-[10px] text-blue-500 hover:text-blue-700 font-bold uppercase ml-2 flex-shrink-0"
                                              >
                                                  Đã đọc
                                              </button>
                                          )}
                                      </div>
                                      {n.type === 'friend_request' && (
                                          <div className="flex gap-2">
                                              <button 
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleRespondFriend(n._id, 'accept');
                                                  }}
                                                  className="flex-1 py-1 bg-blue-500 text-white rounded text-xs font-bold hover:bg-blue-600"
                                              >
                                                  Xác nhận kết nối
                                              </button>
                                              <button 
                                                  onClick={(e) => {
                                                      e.stopPropagation();
                                                      handleRespondFriend(n._id, 'decline');
                                                  }}
                                                  className="flex-1 py-1 border border-slate-300 text-slate-500 rounded text-xs font-bold hover:bg-slate-100"
                                              >
                                                  Hủy yêu cầu
                                              </button>
                                          </div>
                                      )}
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>
              )}
          </div>

          <button 
            onClick={onShowAccount}
            className="flex gap-2 cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 pl-2 pr-4 bg-white/50 hover:bg-white/80 border border-white text-slate-700 text-sm font-bold shadow-sm transition-all hover:shadow-md"
          >
            <div className="flex items-center justify-center bg-blue-100 aspect-square rounded-full size-8 text-blue-600">
                <span className="material-symbols-outlined text-lg">person</span>
            </div>
            <span className="truncate">Hồ Sơ Cá Nhân</span>
          </button>
          <button 
            onClick={onLogout}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 px-4 bg-red-50 hover:bg-red-100 text-red-500 border border-red-200 text-sm font-bold transition-colors shadow-sm"
          >
            <span className="truncate">Đăng Xuất Hệ Thống</span>
          </button>
        </div>
      </header>

      <main className="flex-grow">
        <section className="relative py-12 md:py-16 px-4 sm:px-6 lg:px-8 overflow-visible z-10">
          <div className="max-w-6xl mx-auto flex flex-col items-center gap-12">
            <div className="text-center animate-fade-in-up">
              <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4 border border-blue-200 shadow-sm">
                 Khởi động phiên làm việc, Nghiên Cứu Sinh! ☀️
              </span>
              <h1 className="text-5xl md:text-6xl font-black leading-tight tracking-tight text-slate-900 mb-4 drop-shadow-sm">
                Trung Tâm Điều Hành <span className="wave-text">Nghiên Cứu</span>
              </h1>
              <p className="text-lg font-medium text-slate-500 max-w-2xl mx-auto mb-8">
                Hệ thống đã sẵn sàng. Các thông số hoạt động trong trạng thái ổn định.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button 
                  onClick={() => handleFeatureClick('media')}
                  className="joyride-create-note flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-md transition-all hover:-translate-y-1"
                >
                  <span className="material-symbols-outlined">add</span>
                  Tạo Ghi chú đầu tiên
                </button>
                <button 
                  onClick={() => handleFeatureClick('alchemy')}
                  className="joyride-create-deck flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-bold shadow-md transition-all hover:-translate-y-1"
                >
                  <span className="material-symbols-outlined">style</span>
                  Tạo Bộ thẻ (Deck)
                </button>
              </div>
            </div>
            
            <div className="w-full flex flex-col lg:flex-row gap-6 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                <div className={`flex-1 rounded-3xl p-8 flex flex-col justify-between shadow-xl transition-all duration-300 relative overflow-hidden border ${isCheckedInToday ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-200' : 'bg-white border-white/60'}`}>
                    <div className="relative z-10">
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`p-4 rounded-2xl shadow-lg ${isCheckedInToday ? 'bg-green-500 text-white' : 'bg-gradient-to-br from-orange-400 to-red-500 text-white'}`}>
                                <span className="material-symbols-outlined text-3xl">{isCheckedInToday ? 'verified' : 'history_edu'}</span>
                            </div>
                            <div>
                                <h3 className="text-slate-800 font-black text-2xl">{isCheckedInToday ? 'Đã Ghi Nhận Hoạt Động' : 'Kích Hoạt Phiên Làm Việc'}</h3>
                                <p className="text-slate-500 font-medium text-sm">
                                    Chuỗi ngày nghiên cứu liên tục: <span className="text-amber-500 font-black text-lg mx-1">{progress.streak}</span> ngày
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between items-end">
                             <p className="text-xs text-slate-400 max-w-[60%] leading-relaxed">
                                {isCheckedInToday ? "Duy trì tần suất nghiên cứu ổn định." : "Duy trì tính liên tục trong nghiên cứu. Hệ thống sẽ ghi nhận +50 điểm kinh nghiệm."}
                             </p>
                             <button 
                                onClick={() => {
                                    checkIn();
                                    logAction('complete_task', 'Dashboard', 'Daily Check-in');
                                }}
                                disabled={isCheckedInToday}
                                className={`px-6 py-3 font-bold rounded-xl transition-all shadow-lg flex items-center gap-2 text-sm ${
                                    isCheckedInToday 
                                    ? 'bg-green-600 text-white cursor-default opacity-90' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800 hover:scale-105 active:scale-95'
                                }`}
                            >
                                <span>{isCheckedInToday ? 'Đã hoàn tất' : 'Điểm danh'}</span>
                                <span className="material-symbols-outlined text-sm">{isCheckedInToday ? 'check' : 'touch_app'}</span>
                            </button>
                        </div>
                    </div>
                    <div className={`absolute -right-10 -top-10 w-48 h-48 rounded-full blur-3xl opacity-40 pointer-events-none ${isCheckedInToday ? 'bg-green-300' : 'bg-orange-300'}`}></div>
                </div>

                <div className="flex-1 glass-card-strong rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
                     <div className="flex items-center gap-6 mb-6 relative z-10">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-lg ${ecosystemHealth >= 70 ? 'border-green-100 bg-green-50 text-green-500' : 'border-yellow-100 bg-yellow-50 text-yellow-500'}`}>
                             <span className="material-symbols-outlined text-4xl">analytics</span>
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-end mb-2">
                                <h3 className="text-slate-700 font-bold text-lg">Chỉ Số Hiệu Suất Nghiên Cứu</h3>
                                <p className={`text-3xl font-black ${healthColor}`}>{Math.round(ecosystemHealth)}%</p>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div className={`h-full ${healthBarColor} transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`} style={{ width: `${ecosystemHealth}%` }}></div>
                            </div>
                        </div>
                     </div>
                     <p className="text-sm text-slate-500 font-medium relative z-10 bg-white/50 p-3 rounded-xl border border-white/50">
                        <span className="material-symbols-outlined text-sm align-middle mr-1 text-blue-500">info</span>
                        {ecosystemHealth < 100 ? "Cần củng cố kiến thức nền tảng. Vui lòng truy cập 'Kho Tài Liệu' để rà soát." : "Tiến độ nghiên cứu ổn định. Tiếp tục duy trì hiệu suất."}
                    </p>
                    <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div onClick={() => handleFeatureClick('explore-graph')} className="glass-card-strong p-6 rounded-3xl flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-pointer group">
                <div className="p-4 bg-red-50 text-red-500 rounded-2xl group-hover:bg-red-100 transition-colors border border-red-100">
                    <span className="material-symbols-outlined text-3xl">notifications_active</span>
                </div>
                <div>
                    <h3 className="text-slate-800 font-black text-3xl">{stats?.due || 0}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Cần Tái Củng Cố</p>
                </div>
              </div>

              <div onClick={() => handleFeatureClick('explore-graph')} className="glass-card-strong p-6 rounded-3xl flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-pointer group">
                <div className="p-4 bg-yellow-50 text-yellow-500 rounded-2xl group-hover:bg-yellow-100 transition-colors border border-yellow-100">
                    <span className="material-symbols-outlined text-3xl">warning</span>
                </div>
                <div>
                    <h3 className="text-slate-800 font-black text-3xl">{stats?.weak || 0}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Khái Niệm Cần Cải Thiện</p>
                </div>
              </div>

              <div onClick={() => handleFeatureClick('explore-graph')} className="glass-card-strong p-6 rounded-3xl flex items-center gap-5 hover:scale-[1.02] transition-transform cursor-pointer group">
                <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl group-hover:bg-blue-100 transition-colors border border-blue-100">
                    <span className="material-symbols-outlined text-3xl">fiber_new</span>
                </div>
                <div>
                    <h3 className="text-slate-800 font-black text-3xl">{stats?.new || 0}</h3>
                    <p className="text-xs text-slate-400 uppercase tracking-wider font-bold">Dữ Liệu Mới Nhập</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Widgets Section */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-500">dashboard</span>
                Bảng Điều Khiển
              </h2>
              <div className="flex gap-2">
                {isCustomizing ? (
                  <>
                    <button onClick={cancelCustomization} className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors">
                      Hủy
                    </button>
                    <button onClick={saveWidgetOrder} className="px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-colors shadow-sm">
                      Lưu
                    </button>
                  </>
                ) : (
                  <button onClick={() => setIsCustomizing(true)} className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-full hover:bg-slate-50 transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                    Tùy chỉnh
                  </button>
                )}
              </div>
            </div>

            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={widgets} strategy={horizontalListSortingStrategy}>
                <div className="flex flex-col md:flex-row gap-6">
                  {widgets.map((id) => (
                    <SortableWidget key={id} id={id} isCustomizing={isCustomizing}>
                      {id === 'notes' && (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div 
                              key={i} 
                              onClick={() => !isCustomizing && handleFeatureSelect('media')}
                              className={`p-3 rounded-xl border border-slate-100 bg-white hover:border-indigo-200 hover:shadow-md transition-all ${!isCustomizing ? 'cursor-pointer group' : ''}`}
                            >
                              <div className="flex items-center justify-between mb-1">
                                <h4 className={`font-bold text-slate-700 ${!isCustomizing ? 'group-hover:text-indigo-600' : ''}`}>Ghi chú {i}</h4>
                                <span className="text-[10px] font-bold text-slate-400 uppercase">2 giờ trước</span>
                              </div>
                              <p className="text-xs text-slate-500 line-clamp-1">Nội dung tóm tắt của ghi chú này sẽ hiển thị ở đây...</p>
                            </div>
                          ))}
                          <button 
                            onClick={() => !isCustomizing && handleFeatureSelect('media')}
                            className={`w-full py-2 text-sm font-bold text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors mt-2 ${isCustomizing ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isCustomizing}
                          >
                            Xem tất cả ghi chú
                          </button>
                        </div>
                      )}
                      
                      {id === 'flashcards' && (
                        <div className="flex flex-col items-center justify-center py-4">
                          <div className="relative mb-4">
                            <div className="w-24 h-24 rounded-full border-4 border-emerald-100 flex items-center justify-center">
                              <div className="text-center">
                                <span className="block text-3xl font-black text-emerald-600">{stats?.due || 20}</span>
                                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Thẻ</span>
                              </div>
                            </div>
                            <div className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                              Cần ôn
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 font-medium text-center mb-6">
                            Bạn có <strong className="text-slate-800">{stats?.due || 20}</strong> thẻ cần ôn tập hôm nay để duy trì trí nhớ.
                          </p>
                          <button 
                            onClick={() => !isCustomizing && handleFeatureSelect('alchemy')}
                            className={`w-full py-3 text-sm font-bold text-white bg-emerald-500 rounded-xl shadow-md hover:bg-emerald-600 hover:-translate-y-0.5 transition-all ${isCustomizing ? 'opacity-50 cursor-not-allowed hover:-translate-y-0' : ''}`}
                            disabled={isCustomizing}
                          >
                            Ôn ngay
                          </button>
                        </div>
                      )}
                    </SortableWidget>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>
        </section>

        <section id="feature-navigation-grid" className="py-16 px-4 sm:px-6 lg:px-8 relative bg-white/40 backdrop-blur-sm border-t border-white/60">
          <div className="relative max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
              <h2 className="text-3xl font-black text-slate-800 flex items-center justify-center gap-3">
                  <span className="material-symbols-outlined text-4xl text-blue-500">grid_view</span>
                  Bộ Công Cụ Hỗ Trợ Nghiên Cứu
              </h2>
              <button 
                onClick={toggleGuide}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm border ${isGuideEnabled ? 'bg-blue-100 text-blue-600 border-blue-200 hover:bg-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'}`}
              >
                <span className="material-symbols-outlined text-sm">{isGuideEnabled ? 'visibility' : 'visibility_off'}</span>
                {isGuideEnabled ? 'Tắt hướng dẫn liên kết' : 'Bật hướng dẫn liên kết'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 relative">
              <EcosystemGuideOverlay />
              <FeatureCard id="alchemy" icon="science" title="Tổng Hợp & Xử Lý Tri Thức" desc="Xử lý & Tổng hợp" bg="bg-purple-500" color="text-purple-600" onClick={() => handleFeatureClick('alchemy')} />
              <FeatureCard id="knowledge-graph" icon="hub" title="Trực Quan Hóa Mạng Lưới" desc="Trực quan hóa dữ liệu" bg="bg-blue-500" color="text-blue-600" onClick={() => handleFeatureClick('knowledge-graph')} />
              <FeatureCard id="tutor" icon="smart_toy" title="Trợ Lý Nghiên Cứu AI" desc="Hỗ trợ nghiên cứu" bg="bg-green-500" color="text-green-600" onClick={() => handleFeatureClick('tutor')} />
              <FeatureCard id="draw" icon="draw" title="Không Gian Tư Duy Sáng Tạo" desc="Mô hình hóa ý tưởng" bg="bg-amber-500" color="text-amber-600" onClick={() => handleFeatureClick('draw')} />
              
              <FeatureCard id="media" icon="edit_note" title="Hệ Thống Ghi Chú Kỹ Thuật Số" desc="Quản lý ghi chú" bg="bg-indigo-500" color="text-indigo-600" onClick={() => handleFeatureClick('media')} />
              <FeatureCard id="adaptive-learning" icon="auto_awesome" title="Lộ Trình Học Tập Thích Ứng (AI)" desc="AI thiết kế riêng cho bạn" bg="bg-rose-500" color="text-rose-600" onClick={() => handleFeatureClick('adaptive-learning')} />
              <FeatureCard id="digest" icon="checklist" title="Lộ Trình & Tiến Độ Nghiên Cứu" desc="Todo List & Tiến độ" bg="bg-teal-500" color="text-teal-600" onClick={() => handleFeatureClick('digest')} />
              <FeatureCard id="drive" icon="folder_open" title="Kho Lưu Trữ Dữ Liệu" desc="Lưu trữ dữ liệu" bg="bg-sky-500" color="text-sky-600" onClick={() => handleFeatureClick('drive')} />
              <button 
                  id="feature-community"
                  onMouseEnter={() => setHoveredFeature('community')}
                  onMouseLeave={() => setHoveredFeature(null)}
                  onClick={() => onShowFriends()} 
                  className={`group relative flex flex-col items-center justify-center text-center p-6 w-full aspect-square rounded-3xl border border-white/60 bg-white/40 backdrop-blur-md shadow-lg hover:shadow-2xl hover:bg-white/60 transition-all duration-300 hover:-translate-y-2 overflow-hidden ${isGuideEnabled && hoveredFeature && hoveredFeature !== 'community' && !ECOSYSTEM_CONNECTIONS[hoveredFeature]?.some(conn => conn.target === 'community') ? 'opacity-30 grayscale' : 'z-50'}`}
              >
                  <div className={`absolute -inset-full rounded-full opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-2xl bg-pink-500`}></div>
                  
                  <div 
                    className="absolute top-3 right-3 z-30 flex items-center gap-1 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full border border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all cursor-pointer shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGuide();
                    }}
                    title={isGuideEnabled ? "Tắt hướng dẫn" : "Bật hướng dẫn"}
                  >
                    <span className="material-symbols-outlined text-xs">{isGuideEnabled ? 'visibility_off' : 'help'}</span>
                    <span className="text-[10px] font-bold uppercase">{isGuideEnabled ? 'Bỏ qua' : 'Hướng dẫn?'}</span>
                  </div>

                  <div className={`flex items-center justify-center size-16 rounded-2xl bg-pink-500 bg-opacity-20 mb-4 group-hover:scale-110 transition-transform shadow-sm border border-white/50`}>
                      <span className={`material-symbols-outlined text-4xl text-pink-600`}>diversity_3</span>
                  </div>
                  <h3 className="text-lg font-black text-slate-800 mb-2 tracking-tight group-hover:text-blue-900 transition-colors">Mạng Lưới Cộng Đồng Nghiên Cứu</h3>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">Trao đổi & Hợp tác Chuyên Môn</p>
                  
                  <div className="absolute bottom-0 left-0 w-full flex z-20">
                       <div className="flex-1 bg-pink-100 hover:bg-pink-200 py-2 text-[10px] font-bold text-pink-700 uppercase border-r border-white/20" onClick={(e) => {e.stopPropagation(); handleFeatureClick('community');}}>
                            Bảng Xếp Hạng Năng Lực
                       </div>
                       <div className="flex-1 bg-blue-100 hover:bg-blue-200 py-2 text-[10px] font-bold text-blue-700 uppercase" onClick={(e) => {e.stopPropagation(); onShowFriends(); }}>
                            Kết Nối Đồng Nghiệp
                       </div>
                  </div>

                  {isGuideEnabled && hoveredFeature === 'community' && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-3xl z-10 pointer-events-none">
                          <span className="text-sm font-bold text-slate-800 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-white/50">Tiếp tục sử dụng</span>
                      </div>
                  )}
              </button>
              
              <button onClick={() => handleFeatureClick('achievements')} className={`col-span-2 md:col-span-2 bg-gradient-to-r from-orange-400 to-amber-500 rounded-3xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group overflow-hidden relative ${isGuideEnabled && hoveredFeature ? 'opacity-30 grayscale' : 'z-50'}`}>
                  <div className="relative z-10 text-left">
                      <h3 className="text-xl font-black mb-1">Hồ Sơ Năng Lực Cá Nhân</h3>
                      <p className="text-orange-100 text-sm font-medium">Đánh giá quá trình phát triển năng lực</p>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm relative z-10 group-hover:rotate-12 transition-transform">
                      <span className="material-symbols-outlined text-3xl">military_tech</span>
                  </div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              </button>

              <button onClick={() => handleFeatureClick('user-guide')} className={`col-span-2 md:col-span-2 bg-gradient-to-r from-slate-700 to-slate-800 rounded-3xl p-6 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-between group overflow-hidden relative ${isGuideEnabled && hoveredFeature ? 'opacity-30 grayscale' : 'z-50'}`}>
                  <div className="relative z-10 text-left">
                      <h3 className="text-xl font-black mb-1">Tài Liệu Hướng Dẫn Hệ Thống</h3>
                      <p className="text-slate-300 text-sm font-medium">Cơ sở dữ liệu tham khảo vận hành</p>
                  </div>
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm relative z-10 group-hover:rotate-12 transition-transform">
                      <span className="material-symbols-outlined text-3xl">menu_book</span>
                  </div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -ml-10 -mb-10"></div>
              </button>
            </div>
            
            <div className="mt-12">
                <ApiKeyManager />
            </div>
          </div>
        </section>
      </main>

      <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200 bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
             <BrandLogo variant="light" />
          </div>
          <div className="flex gap-6 text-sm font-medium text-slate-500">
            <a className="hover:text-blue-600 transition-colors" href="#">Quy Định Sử Dụng</a>
            <a className="hover:text-blue-600 transition-colors" href="#">Chính Sách Bảo Mật Dữ Liệu</a>
          </div>
          <p className="text-sm text-slate-400">© 2024 LearnAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default React.memo(Dashboard);
