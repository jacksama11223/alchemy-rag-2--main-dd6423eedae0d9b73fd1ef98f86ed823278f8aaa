import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Animated, Pressable,
  Dimensions, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView, MotiText } from 'moti';
import {
  Send, Bot, User as UserIcon, Sparkles, Search, Settings,
  AlertCircle, RefreshCcw, ChevronDown, Zap, Brain, BookOpen,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import { AuthContext } from '../context/AuthContext';
import { useApiKey } from '../context/ApiKeyContext';
import { sendChatMessage } from '../services/ragService';
import GlassCard from '../components/ui/GlassCard';

const { width } = Dimensions.get('window');

// ─── Tab Bar Height Adjustment ────────────────────────────────────────────────
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 86 : 68;
const WEB_SAFE_BOTTOM = Platform.OS === 'web' ? 24 : 0;

// ─── Stable session ID per user ───────────────────────────────────────────────
const getSessionId = async (uid) => {
  const key = `chat_session_${uid}`;
  let id = await AsyncStorage.getItem(key);
  if (!id) {
    id = `mobile_${uid}_${Date.now()}`;
    await AsyncStorage.setItem(key, id);
  }
  return id;
};

// ─── Quick Prompt Chips ────────────────────────────────────────────────────────
const QUICK_PROMPTS = [
  { label: 'Tóm tắt kiến thức', icon: <BookOpen size={12} color="#a78bfa" /> },
  { label: 'Giải thích khái niệm', icon: <Brain size={12} color="#38bdf8" /> },
  { label: 'Tạo câu hỏi ôn tập', icon: <Zap size={12} color="#fb923c" /> },
  { label: 'Phân tích sâu hơn', icon: <Sparkles size={12} color="#4ade80" /> },
];

// ─── Message Bubble ───────────────────────────────────────────────────────────
const ChatBubble = React.memo(({ item }) => {
  const isUser = item.role === 'user';
  return (
    <MotiView
      from={{ opacity: 0, translateY: 12, scale: 0.96 }}
      animate={{ opacity: 1, translateY: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 22, stiffness: 200 }}
      style={[styles.bubbleWrap, isUser ? styles.bubbleWrapUser : styles.bubbleWrapBot]}
    >
      {!isUser && (
        <LinearGradient
          colors={['rgba(124,58,237,0.3)', 'rgba(79,70,229,0.15)']}
          style={styles.avatarBot}
        >
          <Bot size={14} color="#a78bfa" />
        </LinearGradient>
      )}

      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleBot]}>
        {isUser ? (
          <LinearGradient
            colors={['#4f46e5', '#7c3aed']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.userBubbleGrad}
          >
            {item.isRagLoading ? (
              <View style={styles.ragIndicator}>
                <Search size={12} color="#38bdf8" />
                <Text style={styles.ragText}> Đang tìm kiếm tri thức...</Text>
              </View>
            ) : (
              <Text style={[styles.bubbleText, styles.bubbleTextUser]}>{item.content}</Text>
            )}
            <Text style={[styles.bubbleTime, { color: 'rgba(255,255,255,0.4)' }]}>
              {new Date(item.timestamp || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </LinearGradient>
        ) : (
          <>
            {item.isRagLoading ? (
              <View style={styles.ragIndicator}>
                <Search size={12} color="#38bdf8" />
                <Text style={styles.ragText}> Đang tìm kiếm tri thức...</Text>
              </View>
            ) : (
              <>
                {item.ragUsed && (
                  <View style={styles.ragBadge}>
                    <Sparkles size={10} color="#38bdf8" />
                    <Text style={styles.ragBadgeText}>RAG · Tri thức cá nhân</Text>
                  </View>
                )}
                <Text style={[styles.bubbleText, styles.bubbleTextBot]}>{item.content}</Text>
              </>
            )}
            <Text style={styles.bubbleTime}>
              {new Date(item.timestamp || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </>
        )}
      </View>

      {isUser && (
        <LinearGradient
          colors={['rgba(14,165,233,0.25)', 'rgba(99,102,241,0.15)']}
          style={styles.avatarUser}
        >
          <UserIcon size={14} color="#38bdf8" />
        </LinearGradient>
      )}
    </MotiView>
  );
});

// ─── Typing Indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = (dot, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: -7, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(560 - delay),
        ])
      ).start();
    anim(dot1, 0);
    anim(dot2, 140);
    anim(dot3, 280);
  }, []);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 8 }}
      animate={{ opacity: 1, translateY: 0 }}
      style={styles.typingWrap}
    >
      <LinearGradient colors={['rgba(124,58,237,0.3)', 'rgba(79,70,229,0.15)']} style={styles.avatarBot}>
        <Bot size={14} color="#a78bfa" />
      </LinearGradient>
      <View style={styles.typingBubble}>
        {[dot1, dot2, dot3].map((dot, i) => (
          <Animated.View key={i} style={[styles.typingDot, { transform: [{ translateY: dot }] }]} />
        ))}
      </View>
    </MotiView>
  );
};

// ─── No API Key Warning ───────────────────────────────────────────────────────
const NoKeyWarning = ({ onGoSettings }) => (
  <MotiView
    from={{ opacity: 0, scale: 0.85 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: 'spring' }}
    style={styles.noKeyWrap}
  >
    <LinearGradient colors={['rgba(251,191,36,0.15)', 'rgba(245,158,11,0.05)']} style={styles.noKeyIconBg}>
      <AlertCircle size={44} color="#fbbf24" />
    </LinearGradient>
    <Text style={styles.noKeyTitle}>Chưa có API Key</Text>
    <Text style={styles.noKeyDesc}>Vui lòng cấu hình Gemini API Key trong Cài đặt để sử dụng chatbot AI</Text>
    <TouchableOpacity style={styles.noKeyBtn} onPress={onGoSettings}>
      <Settings size={16} color="#fff" />
      <Text style={styles.noKeyBtnText}>Đến Cài đặt</Text>
    </TouchableOpacity>
  </MotiView>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ChatbotScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { hasApiKey } = useApiKey();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);

  const flatListRef = useRef(null);
  const inputRef = useRef(null);
  const STORAGE_KEY = `chat_messages_${user?.uid}`;

  // Load persisted messages
  useEffect(() => {
    const init = async () => {
      if (!user?.uid) return;
      try {
        const [sid, saved] = await Promise.all([
          getSessionId(user.uid),
          AsyncStorage.getItem(STORAGE_KEY),
        ]);
        setSessionId(sid);
        if (saved) {
          const parsed = JSON.parse(saved);
          setMessages(Array.isArray(parsed) ? parsed.slice(-50) : []);
          setShowQuickPrompts(false);
        } else {
          setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: 'Xin chào! Tôi là trợ lý AI của LearnAI 🧠\n\nTôi có thể trả lời câu hỏi dựa trên kiến thức trong hệ thống của bạn. Hãy hỏi tôi bất cứ điều gì!',
            timestamp: Date.now(),
            ragUsed: false,
          }]);
        }
      } catch (e) {
        console.warn('[ChatbotScreen] Init error:', e.message);
      }
    };
    init();
  }, [user?.uid]);

  // Persist messages on change
  useEffect(() => {
    if (messages.length > 0 && user?.uid) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(messages)).catch(() => {});
    }
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const handleSend = async (overrideText) => {
    const text = (overrideText || inputText).trim();
    if (!text || isLoading) return;
    if (!hasApiKey) {
      Toast.show({ type: 'error', text1: 'Cần API Key', text2: 'Vui lòng cấu hình trong Cài đặt' });
      return;
    }

    setShowQuickPrompts(false);

    const userMsg = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    const ragPlaceholder = {
      id: `rag_${Date.now()}`,
      role: 'assistant',
      content: '',
      isRagLoading: true,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg, ragPlaceholder]);
    setInputText('');
    setIsLoading(true);

    await new Promise(r => setTimeout(r, 600));

    const result = await sendChatMessage(text, sessionId);

    setMessages(prev => {
      const withoutPlaceholder = prev.filter(m => !m.isRagLoading);
      if (result.success) {
        return [...withoutPlaceholder, {
          id: `bot_${Date.now()}`,
          role: 'assistant',
          content: result.reply,
          timestamp: Date.now(),
          ragUsed: true,
        }];
      } else {
        return [...withoutPlaceholder, {
          id: `err_${Date.now()}`,
          role: 'assistant',
          content: `❌ Lỗi: ${result.error}`,
          timestamp: Date.now(),
          ragUsed: false,
        }];
      }
    });

    setIsLoading(false);
    setTimeout(scrollToBottom, 100);
  };

  const handleNewSession = async () => {
    if (!user?.uid) return;
    const newId = `mobile_${user.uid}_${Date.now()}`;
    await AsyncStorage.setItem(`chat_session_${user.uid}`, newId);
    setSessionId(newId);
    setShowQuickPrompts(true);
    setMessages([{
      id: 'welcome_new',
      role: 'assistant',
      content: '🔄 Phiên chat mới đã bắt đầu!\nTôi sẵn sàng hỗ trợ bạn với bất kỳ câu hỏi nào.',
      timestamp: Date.now(),
      ragUsed: false,
    }]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  if (!hasApiKey) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <LinearGradient colors={['#7c3aed', '#4f46e5']} style={styles.headerIcon}>
              <Bot size={18} color="#fff" />
            </LinearGradient>
            <View>
              <Text style={styles.headerTitle}>Chatbot AI</Text>
              <Text style={styles.headerSub}>RAG-powered</Text>
            </View>
          </View>
        </View>
        <NoKeyWarning onGoSettings={() => navigation.navigate('Settings')} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      {/* Background */}
      <LinearGradient colors={['#0f172a', '#1e1b4b', '#0f172a']} style={StyleSheet.absoluteFill} />

      {/* Decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -16 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 500 }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <LinearGradient colors={['#7c3aed', '#4f46e5']} style={styles.headerIcon}>
            <Bot size={18} color="#fff" />
          </LinearGradient>
          <View>
            <Text style={styles.headerTitle}>Chatbot AI</Text>
            <View style={styles.onlineDot}>
              <View style={styles.onlineDotInner} />
              <Text style={styles.headerSub}>Trực tuyến · RAG-powered</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity onPress={handleNewSession} style={styles.newSessionBtn}>
          <RefreshCcw size={16} color="#94a3b8" />
        </TouchableOpacity>
      </MotiView>

      {/* RAG Info Banner */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 200 }}
        style={styles.ragBanner}
      >
        <LinearGradient
          colors={['rgba(56,189,248,0.12)', 'rgba(14,165,233,0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.ragBannerContent}
        >
          <Sparkles size={12} color="#38bdf8" />
          <Text style={styles.ragBannerText}>AI tự động tìm kiếm tri thức liên quan trước khi trả lời</Text>
        </LinearGradient>
      </MotiView>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={item => item.id}
          renderItem={({ item }) => <ChatBubble item={item} />}
          contentContainerStyle={styles.messageList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={
            isLoading ? <TypingIndicator /> : <View style={{ height: 8 }} />
          }
          onScrollBeginDrag={() => setShowScrollDown(true)}
        />

        {/* Scroll-to-bottom button */}
        {showScrollDown && (
          <MotiView
            from={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.scrollDownBtnWrap}
          >
            <TouchableOpacity style={styles.scrollDownBtn} onPress={() => { scrollToBottom(); setShowScrollDown(false); }}>
              <LinearGradient colors={['#4f46e5', '#7c3aed']} style={styles.scrollDownGrad}>
                <ChevronDown size={18} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </MotiView>
        )}

        {/* Quick Prompts */}
        {showQuickPrompts && messages.length <= 1 && (
          <MotiView
            from={{ opacity: 0, translateY: 10 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ delay: 400 }}
            style={styles.quickPromptsWrap}
          >
            <Text style={styles.quickPromptsLabel}>Gợi ý câu hỏi</Text>
            <View style={styles.quickPromptsRow}>
              {QUICK_PROMPTS.map((qp, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.quickPromptChip}
                  onPress={() => handleSend(qp.label)}
                >
                  {qp.icon}
                  <Text style={styles.quickPromptText}>{qp.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </MotiView>
        )}

        {/* Input Bar */}
        <View style={styles.inputBarWrapper}>
          <LinearGradient
            colors={['rgba(15,23,42,0.98)', 'rgba(15,23,42,1)']}
            style={styles.inputBar}
          >
            <TextInput
              ref={inputRef}
              style={styles.input}
              placeholder="Hỏi bất cứ điều gì..."
              placeholderTextColor="#334155"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={2000}
              // Enter để gửi trên cả web và mobile (single-line mode)
              onSubmitEditing={handleSend}
              returnKeyType="send"
              blurOnSubmit={true}
            />
            <TouchableOpacity
              style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
              onPress={() => handleSend()}
              disabled={!inputText.trim() || isLoading}
            >
              <LinearGradient
                colors={!inputText.trim() || isLoading ? ['#1e293b', '#1e293b'] : ['#4f46e5', '#7c3aed']}
                style={styles.sendBtnGrad}
              >
                {isLoading
                  ? <ActivityIndicator size="small" color="#64748b" />
                  : <Send size={18} color={!inputText.trim() ? '#334155' : '#fff'} />}
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const BOT_BG = 'rgba(30,41,59,0.85)';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },

  // Decorative blobs
  blob1: { position: 'absolute', width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(124,58,237,0.06)', top: -60, right: -60 },
  blob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(56,189,248,0.04)', bottom: 100, left: -60 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5 },
  onlineDot: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2 },
  onlineDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ade80' },
  headerSub: { fontSize: 12, color: '#64748b' },
  newSessionBtn: { padding: 10, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },

  // RAG Banner
  ragBanner: { marginHorizontal: 20, marginBottom: 10 },
  ragBannerContent: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(56,189,248,0.12)' },
  ragBannerText: { fontSize: 12, color: '#64748b', flex: 1 },

  // Messages
  messageList: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16 },

  // Bubbles
  bubbleWrap: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 14, gap: 8 },
  bubbleWrapUser: { justifyContent: 'flex-end' },
  bubbleWrapBot: { justifyContent: 'flex-start' },

  avatarBot: { width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  avatarUser: { width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(56,189,248,0.2)' },

  bubble: { maxWidth: '78%', borderRadius: 20, overflow: 'hidden' },
  bubbleUser: { borderBottomRightRadius: 5 },
  bubbleBot: { backgroundColor: BOT_BG, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', padding: 12 },

  userBubbleGrad: { padding: 12 },

  bubbleText: { fontSize: 15, lineHeight: 23 },
  bubbleTextUser: { color: '#f1f5f9' },
  bubbleTextBot: { color: '#cbd5e1' },
  bubbleTime: { fontSize: 10, color: 'rgba(255,255,255,0.25)', marginTop: 5, alignSelf: 'flex-end' },

  ragBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 8, backgroundColor: 'rgba(56,189,248,0.1)', alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(56,189,248,0.15)' },
  ragBadgeText: { fontSize: 10, color: '#38bdf8', fontWeight: '700', letterSpacing: 0.3 },

  ragIndicator: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ragText: { fontSize: 13, color: '#38bdf8', fontStyle: 'italic' },

  // Typing
  typingWrap: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 14, paddingHorizontal: 16 },
  typingBubble: { flexDirection: 'row', gap: 5, backgroundColor: BOT_BG, paddingHorizontal: 16, paddingVertical: 14, borderRadius: 20, borderBottomLeftRadius: 5, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  typingDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#475569' },

  // Scroll to bottom
  scrollDownBtnWrap: { position: 'absolute', right: 20, bottom: 90, zIndex: 10 },
  scrollDownBtn: { borderRadius: 20, overflow: 'hidden', shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 8 },
  scrollDownGrad: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },

  // Quick Prompts
  quickPromptsWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  quickPromptsLabel: { fontSize: 11, fontWeight: '700', color: '#475569', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 },
  quickPromptsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickPromptChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  quickPromptText: { fontSize: 12, fontWeight: '600', color: '#94a3b8' },

  // Input bar
  inputBarWrapper: { 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.05)',
    paddingBottom: Platform.OS === 'web' ? TAB_BAR_HEIGHT + WEB_SAFE_BOTTOM : 0 
  },
  inputBar: { 
    flexDirection: 'row', 
    alignItems: 'flex-end', 
    gap: 10, 
    paddingHorizontal: 16, 
    paddingVertical: 12, 
    paddingBottom: Platform.OS === 'ios' ? 28 : (Platform.OS === 'web' ? 14 : TAB_BAR_HEIGHT + 14) 
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(30,41,59,0.9)',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    fontSize: 15,
    color: '#e2e8f0',
    maxHeight: 110,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    lineHeight: 22,
  },
  sendBtn: { borderRadius: 16, overflow: 'hidden' },
  sendBtnGrad: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { opacity: 0.5 },

  // No key warning
  noKeyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40, gap: 20 },
  noKeyIconBg: { width: 90, height: 90, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
  noKeyTitle: { fontSize: 22, fontWeight: '800', color: '#e2e8f0', letterSpacing: -0.5 },
  noKeyDesc: { fontSize: 15, color: '#64748b', textAlign: 'center', lineHeight: 24 },
  noKeyBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#4f46e5', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 18, marginTop: 4 },
  noKeyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
