import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image,
  RefreshControl, Dimensions, TextInput, Modal, ActivityIndicator, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Carousel from 'react-native-reanimated-carousel';
import {
  Bell, Plus, BookOpen, Brain, Zap, Image as ImageIcon,
  Sparkles, NotebookPen, Trophy, ChevronRight, X, Flame,
  TrendingUp, MessageSquare, Star, Clock,
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addNote, getUserNotes } from '../services/apiNoteService';
import { getAlchemyItems } from '../services/apiAlchemyService';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import GlassCard from '../components/ui/GlassCard';
import AnimatedText from '../components/ui/AnimatedText';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

// ─── Greeting helper ──────────────────────────────────────────────────────────
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Chào buổi sáng';
  if (h < 18) return 'Chào buổi chiều';
  return 'Chào buổi tối';
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, value, label, color, delay }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring', delay }}
    style={[styles.statCard, { borderColor: color + '25' }]}
  >
    <LinearGradient
      colors={[color + '18', color + '06']}
      style={styles.statIconBg}
    >
      {icon}
    </LinearGradient>
    <Text style={[styles.statValue, { color }]}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </MotiView>
);

// ─── Feature Card ─────────────────────────────────────────────────────────────
const FeatureCard = ({ feature, onPress, index }) => (
  <MotiView
    from={{ opacity: 0, translateY: 24 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: 'spring', delay: 400 + index * 80, damping: 18 }}
    style={{ width: '48%' }}
  >
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={[feature.color + '18', feature.color + '06']}
        style={styles.featureCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={[styles.featureIconRing, { borderColor: feature.color + '30' }]}>
          <View style={[styles.featureIconBg, { backgroundColor: feature.color + '20' }]}>
            {feature.icon}
          </View>
        </View>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDesc}>{feature.desc}</Text>
        <View style={[styles.featureArrow, { backgroundColor: feature.color + '20' }]}>
          <ChevronRight size={12} color={feature.color} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  </MotiView>
);

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, icon, action, actionLabel }) => (
  <View style={styles.sectionHeader}>
    <View style={styles.sectionTitleRow}>
      {icon}
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
    {action && (
      <TouchableOpacity onPress={action} style={styles.sectionAction}>
        <Text style={styles.sectionActionText}>{actionLabel || 'Xem tất cả'}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ xp: 120, level: 5, totalCards: 50, streak: 3 });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const bottomSheetRef = useRef(null);

  const fetchData = async () => {
    if (!user) return;
    const [notesResult, alchemyResult] = await Promise.all([
      getUserNotes(),
      getAlchemyItems(),
    ]);

    let combined = [];
    if (notesResult.success) combined = [...combined, ...notesResult.data.map(n => ({ ...n, type: 'note' }))];
    if (alchemyResult.success) combined = [...combined, ...alchemyResult.data.map(a => ({ ...a, type: 'alchemy' }))];

    combined.sort((a, b) => {
      const dA = a.createdAt?.seconds ?? 0;
      const dB = b.createdAt?.seconds ?? 0;
      return dB - dA;
    });
    setRecentActivities(combined.slice(0, 5));
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setStats(prev => ({ ...prev, totalCards: Math.floor(Math.random() * 100) + 50, streak: Math.floor(Math.random() * 10) + 1 }));
    setRefreshing(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [user]);

  const handleAddNote = async () => {
    if (!newNoteTitle.trim() || !newNoteContent.trim() || !user) return;
    setIsSaving(true);
    const result = await addNote(null, newNoteTitle.trim(), newNoteContent.trim());
    setIsSaving(false);
    if (result.success) {
      setModalVisible(false);
      setNewNoteTitle('');
      setNewNoteContent('');
      fetchData();
      Toast.show({ type: 'success', text1: '✅ Thành công', text2: 'Đã lưu ghi chú' });
    } else {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Lỗi lưu ghi chú: ' + result.error });
    }
  };

  const features = [
    { id: 'alchemy', title: 'Giả Kim Thuật', desc: 'Chế tạo kiến thức với AI', icon: <Sparkles size={26} color="#0ea5e9" />, color: '#0ea5e9' },
    { id: 'graph', title: 'Sơ Đồ Tri Thức', desc: 'Khám phá liên kết', icon: <Brain size={26} color="#8b5cf6" />, color: '#8b5cf6' },
    { id: 'notelab', title: 'NoteLab', desc: 'Ghi chú thông minh', icon: <NotebookPen size={26} color="#f59e0b" />, color: '#f59e0b' },
    { id: 'aistudio', title: 'AI Studio', desc: 'Tư duy sâu & Tạo ảnh', icon: <ImageIcon size={26} color="#ec4899" />, color: '#ec4899' },
    { id: 'chatbot', title: 'Chatbot AI', desc: 'Hỏi đáp dựa trên RAG', icon: <MessageSquare size={26} color="#4ade80" />, color: '#4ade80' },
  ];

  const handleFeatureSelect = (featureId) => {
    const routes = { alchemy: 'Alchemy', graph: 'Graph', notelab: 'NoteLab', aistudio: 'AIStudio', chatbot: 'Chatbot' };
    if (routes[featureId]) navigation.navigate(routes[featureId]);
    else Toast.show({ type: 'info', text1: 'Đang phát triển!' });
  };

  const carouselItems = [
    {
      title: 'Học thông minh hơn với AI',
      desc: 'Chuyển đổi mọi tài liệu thành kiến thức có cấu trúc',
      colors: ['#0ea5e9', '#2563eb'],
      badge: '✨ Alchemy',
      stat: `${stats.totalCards} thẻ nhớ`,
      statIcon: <BookOpen size={14} color="#FFF" />,
      stat2: `${stats.streak} ngày chuỗi`,
      stat2Icon: <Flame size={14} color="#FFF" />,
      onPress: () => navigation.navigate('Alchemy'),
    },
    {
      title: 'RAG Chatbot Cá Nhân',
      desc: 'AI trả lời từ chính kho tri thức của bạn',
      colors: ['#7c3aed', '#4f46e5'],
      badge: '🧠 RAG',
      stat: 'Gemini AI',
      statIcon: <Sparkles size={14} color="#FFF" />,
      stat2: 'Tìm kiếm ngữ nghĩa',
      stat2Icon: <TrendingUp size={14} color="#FFF" />,
      onPress: () => navigation.navigate('Chatbot'),
    },
    {
      title: 'AI Studio Sáng Tạo',
      desc: 'Tư duy sâu và tạo hình ảnh với AI thế hệ mới',
      colors: ['#ec4899', '#8b5cf6'],
      badge: '🎨 Studio',
      stat: 'Gemini Pro',
      statIcon: <Brain size={14} color="#FFF" />,
      stat2: 'Image Gen',
      stat2Icon: <ImageIcon size={14} color="#FFF" />,
      onPress: () => navigation.navigate('AIStudio'),
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <LinearGradient colors={['#F0F9FF', '#F8FAFC', '#F1F5F9']} style={StyleSheet.absoluteFill} />

      {/* Decorative accent */}
      <View style={styles.accentCircle1} />
      <View style={styles.accentCircle2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0ea5e9" />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <MotiView
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.header}
        >
          <View style={styles.userInfo}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: user?.avatar || `https://api.dicebear.com/7.x/avataaars/png?seed=${user?.name || 'User'}` }}
                style={styles.avatar}
              />
              <View style={styles.avatarOnline} />
            </View>
            <View>
              <Text style={styles.greeting}>{getGreeting()}, 👋</Text>
              <Text style={styles.userName}>{user?.name || 'Nhà Giả Kim'}</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.xpBadge} onPress={() => bottomSheetRef.current?.expand()}>
              <Trophy size={14} color="#f59e0b" />
              <Text style={styles.xpText}>{stats.xp} XP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.notifBtn} onPress={() => navigation.navigate('Notifications')}>
              <Bell color="#64748B" size={20} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </View>
        </MotiView>

        {/* Level Progress Bar */}
        <MotiView
          from={{ opacity: 0, translateX: -20 }}
          animate={{ opacity: 1, translateX: 0 }}
          transition={{ delay: 150 }}
          style={styles.levelBar}
        >
          <View style={styles.levelBarInner}>
            <Star size={14} color="#f59e0b" />
            <Text style={styles.levelText}>Cấp {stats.level}</Text>
            <View style={styles.levelProgress}>
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: `${(stats.xp / 500) * 100}%` }}
                transition={{ type: 'timing', duration: 1200, delay: 400 }}
                style={styles.levelProgressFill}
              />
            </View>
            <Text style={styles.levelXP}>{stats.xp}/500</Text>
          </View>
        </MotiView>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard icon={<BookOpen size={18} color="#0ea5e9" />} value={stats.totalCards} label="Thẻ nhớ" color="#0ea5e9" delay={200} />
          <StatCard icon={<Flame size={18} color="#f59e0b" />} value={`${stats.streak}d`} label="Chuỗi ngày" color="#f59e0b" delay={260} />
          <StatCard icon={<TrendingUp size={18} color="#4ade80" />} value={stats.xp} label="Điểm XP" color="#4ade80" delay={320} />
          <StatCard icon={<Trophy size={18} color="#a78bfa" />} value={`Lv${stats.level}`} label="Cấp độ" color="#a78bfa" delay={380} />
        </View>

        {/* Hero Carousel */}
        <MotiView from={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', delay: 250 }}>
          <View style={{ height: 190, marginBottom: 32 }}>
            <Carousel
              loop
              width={width - 40}
              height={190}
              autoPlay
              autoPlayInterval={3500}
              data={carouselItems}
              scrollAnimationDuration={900}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={item.onPress} activeOpacity={0.9} style={{ flex: 1 }}>
                  <LinearGradient
                    colors={item.colors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.carouselCard}
                  >
                    {/* Badge */}
                    <View style={styles.carouselBadge}>
                      <Text style={styles.carouselBadgeText}>{item.badge}</Text>
                    </View>
                    <Text style={styles.carouselTitle}>{item.title}</Text>
                    <Text style={styles.carouselDesc}>{item.desc}</Text>
                    {/* Mini stats */}
                    <View style={styles.carouselStats}>
                      <View style={styles.carouselStatItem}>
                        {item.statIcon}
                        <Text style={styles.carouselStatText}>{item.stat}</Text>
                      </View>
                      <View style={styles.carouselStatDot} />
                      <View style={styles.carouselStatItem}>
                        {item.stat2Icon}
                        <Text style={styles.carouselStatText}>{item.stat2}</Text>
                      </View>
                    </View>
                    {/* CTA */}
                    <View style={styles.carouselCTA}>
                      <Text style={styles.carouselCTAText}>Khám phá →</Text>
                    </View>
                    {/* Decorative circle */}
                    <View style={styles.carouselCircle} />
                  </LinearGradient>
                </TouchableOpacity>
              )}
            />
          </View>
        </MotiView>

        {/* Feature Grid */}
        <SectionHeader
          title="Tính Năng"
          icon={<Zap size={16} color="#f59e0b" style={{ marginRight: 6 }} />}
        />
        <View style={styles.featureGrid}>
          {features.map((feature, index) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onPress={() => handleFeatureSelect(feature.id)}
              index={index}
            />
          ))}
        </View>

        {/* Recent Activity */}
        <SectionHeader
          title="Hoạt Động Gần Đây"
          icon={<Clock size={16} color="#64748b" style={{ marginRight: 6 }} />}
          action={() => setModalVisible(true)}
          actionLabel="+ Ghi chú"
        />

        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 600 }}>
          {recentActivities.length === 0 ? (
            <View style={styles.emptyActivity}>
              <Text style={styles.emptyActivityIcon}>🌱</Text>
              <Text style={styles.emptyActivityText}>Chưa có hoạt động. Hãy bắt đầu hành trình học tập!</Text>
            </View>
          ) : (
            recentActivities.map((item, index) => (
              <TouchableOpacity key={item.id || index} activeOpacity={0.85}>
                <View style={styles.activityItem}>
                  <LinearGradient
                    colors={item.type === 'alchemy' ? ['#E0F2FE', '#BAE6FD'] : ['#EEF2FF', '#E0E7FF']}
                    style={styles.activityIcon}
                  >
                    {item.type === 'alchemy'
                      ? <Sparkles color="#0ea5e9" size={18} />
                      : <NotebookPen color="#6366F1" size={18} />}
                  </LinearGradient>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityTitle} numberOfLines={1}>
                      {item.title || item.content?.substring(0, 30) || 'Không có tên'}
                    </Text>
                    <Text style={styles.activityMeta}>
                      {item.type === 'alchemy' ? '⚗️ Giả Kim Thuật' : '📓 Ghi chú'}
                    </Text>
                  </View>
                  <ChevronRight size={18} color="#CBD5E1" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </MotiView>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Gamification Bottom Sheet */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={['55%']}
        enablePanDownToClose
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}
      >
        <BottomSheetView style={styles.sheetContent}>
          <LinearGradient colors={['#fef9c3', '#fef3c7']} style={styles.sheetTrophy}>
            <Trophy size={44} color="#f59e0b" />
          </LinearGradient>
          <Text style={styles.sheetLevelTitle}>Cấp độ {stats.level}</Text>
          <Text style={styles.sheetLevelSub}>Nhà Khai Hoang Tri Thức ⚡</Text>

          <View style={styles.sheetProgressWrap}>
            <View style={styles.sheetProgressHeader}>
              <Text style={styles.sheetProgressLabel}>Tiến trình → Cấp {stats.level + 1}</Text>
              <Text style={styles.sheetProgressVal}>{stats.xp} / 500 XP</Text>
            </View>
            <View style={styles.sheetProgressBg}>
              <MotiView
                from={{ width: '0%' }}
                animate={{ width: `${(stats.xp / 500) * 100}%` }}
                transition={{ type: 'spring', delay: 200 }}
                style={styles.sheetProgressFill}
              />
            </View>
          </View>

          <View style={styles.sheetStreakRow}>
            <LinearGradient colors={['#fef9c3', '#fef3c7']} style={styles.sheetStreakIcon}>
              <Flame size={22} color="#f59e0b" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={styles.sheetStreakTitle}>{stats.streak} Ngày Liên Tiếp 🔥</Text>
              <Text style={styles.sheetStreakDesc}>Tiếp tục học để không mất chuỗi!</Text>
            </View>
          </View>
        </BottomSheetView>
      </BottomSheet>

      {/* Add Note Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>📝 Ghi Chú Mới</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalClose}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.modalInput}
              placeholder="Tiêu đề ghi chú..."
              value={newNoteTitle}
              onChangeText={setNewNoteTitle}
              placeholderTextColor="#94A3B8"
            />
            <TextInput
              style={[styles.modalInput, styles.modalTextArea]}
              placeholder="Nội dung..."
              value={newNoteContent}
              onChangeText={setNewNoteContent}
              multiline
              numberOfLines={5}
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[styles.modalSaveBtn, (!newNoteTitle || !newNoteContent) && styles.modalSaveBtnDisabled]}
              onPress={handleAddNote}
              disabled={!newNoteTitle || !newNoteContent || isSaving}
            >
              {isSaving
                ? <ActivityIndicator color="#FFF" />
                : <Text style={styles.modalSaveBtnText}>Lưu Ghi Chú</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F9FF' },
  scrollContent: { padding: 20, paddingTop: 16, paddingBottom: 30 },

  // Decorative
  accentCircle1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(14,165,233,0.05)', top: -100, right: -80 },
  accentCircle2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(139,92,246,0.04)', bottom: 200, left: -60 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#E2E8F0', borderWidth: 2, borderColor: '#fff' },
  avatarOnline: { position: 'absolute', bottom: 0, right: 0, width: 12, height: 12, borderRadius: 6, backgroundColor: '#4ade80', borderWidth: 2, borderColor: '#fff' },
  greeting: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  userName: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.5 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  xpBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#FFFBEB', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: '#FEF3C7' },
  xpText: { fontSize: 13, fontWeight: '800', color: '#d97706' },
  notifBtn: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  notifDot: { position: 'absolute', top: 9, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1.5, borderColor: '#FFF' },

  // Level Bar
  levelBar: { backgroundColor: '#FFF', borderRadius: 16, padding: 12, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  levelBarInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  levelText: { fontSize: 13, fontWeight: '700', color: '#f59e0b', minWidth: 40 },
  levelProgress: { flex: 1, height: 8, backgroundColor: '#F1F5F9', borderRadius: 4, overflow: 'hidden' },
  levelProgressFill: { height: '100%', backgroundColor: '#f59e0b', borderRadius: 4 },
  levelXP: { fontSize: 12, fontWeight: '600', color: '#94A3B8' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 18, padding: 12, alignItems: 'center', borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statIconBg: { width: 38, height: 38, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  statValue: { fontSize: 16, fontWeight: '800', letterSpacing: -0.5 },
  statLabel: { fontSize: 10, color: '#94A3B8', fontWeight: '600', marginTop: 2 },

  // Carousel
  carouselCard: { flex: 1, borderRadius: 24, padding: 22, overflow: 'hidden', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  carouselBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginBottom: 10 },
  carouselBadgeText: { color: '#FFF', fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  carouselTitle: { fontSize: 20, fontWeight: '800', color: '#FFF', marginBottom: 5, letterSpacing: -0.5 },
  carouselDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 14, lineHeight: 19 },
  carouselStats: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  carouselStatItem: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  carouselStatText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  carouselStatDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.5)' },
  carouselCTA: { position: 'absolute', bottom: 18, right: 18, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  carouselCTAText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  carouselCircle: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -40 },

  // Section Header
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A', letterSpacing: -0.3 },
  sectionAction: { backgroundColor: '#EFF6FF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  sectionActionText: { fontSize: 13, fontWeight: '700', color: '#0ea5e9' },

  // Feature Grid
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 28 },
  featureCard: { borderRadius: 22, padding: 18, borderWidth: 1, borderColor: 'rgba(0,0,0,0.04)', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, position: 'relative', minHeight: 140 },
  featureIconRing: { width: 56, height: 56, borderRadius: 18, borderWidth: 1.5, padding: 4, marginBottom: 12 },
  featureIconBg: { width: '100%', height: '100%', borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  featureTitle: { fontSize: 15, fontWeight: '800', color: '#1e293b', marginBottom: 3, letterSpacing: -0.3 },
  featureDesc: { fontSize: 11, color: '#64748b', lineHeight: 16 },
  featureArrow: { position: 'absolute', bottom: 14, right: 14, width: 24, height: 24, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },

  // Recent activity
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFF', padding: 14, borderRadius: 18, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  activityIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginBottom: 3 },
  activityMeta: { fontSize: 12, color: '#94A3B8' },
  emptyActivity: { alignItems: 'center', paddingVertical: 28, gap: 8 },
  emptyActivityIcon: { fontSize: 36 },
  emptyActivityText: { fontSize: 14, color: '#94A3B8', textAlign: 'center', lineHeight: 22 },

  // Bottom Sheet
  sheetBg: { backgroundColor: '#FFF', borderRadius: 28 },
  sheetHandle: { backgroundColor: '#E2E8F0', width: 40 },
  sheetContent: { padding: 24, alignItems: 'center', gap: 4 },
  sheetTrophy: { width: 88, height: 88, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  sheetLevelTitle: { fontSize: 26, fontWeight: '800', color: '#0F172A', letterSpacing: -0.8 },
  sheetLevelSub: { fontSize: 14, color: '#64748B', marginBottom: 24 },
  sheetProgressWrap: { width: '100%', marginBottom: 20 },
  sheetProgressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sheetProgressLabel: { fontSize: 13, fontWeight: '600', color: '#475569' },
  sheetProgressVal: { fontSize: 13, fontWeight: '700', color: '#0ea5e9' },
  sheetProgressBg: { height: 10, backgroundColor: '#F1F5F9', borderRadius: 5, overflow: 'hidden' },
  sheetProgressFill: { height: '100%', backgroundColor: '#0ea5e9', borderRadius: 5 },
  sheetStreakRow: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#FFFBEB', padding: 16, borderRadius: 18, width: '100%', borderWidth: 1, borderColor: '#FEF3C7' },
  sheetStreakIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  sheetStreakTitle: { fontSize: 15, fontWeight: '700', color: '#B45309' },
  sheetStreakDesc: { fontSize: 12, color: '#D97706', marginTop: 2 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#FFF', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 36 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A' },
  modalClose: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
  modalInput: { backgroundColor: '#F8FAFC', borderRadius: 16, padding: 16, fontSize: 15, color: '#1E293B', marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  modalTextArea: { minHeight: 120, textAlignVertical: 'top' },
  modalSaveBtn: { backgroundColor: '#0ea5e9', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  modalSaveBtnDisabled: { backgroundColor: '#CBD5E1' },
  modalSaveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
});
