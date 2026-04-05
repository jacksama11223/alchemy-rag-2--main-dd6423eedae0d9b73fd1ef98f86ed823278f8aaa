import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ActivityIndicator, Modal, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  Plus, NotebookPen, Sparkles, Trash2, X, Save, Search as SearchIcon,
  ChevronRight, Tag, Clock, AlertCircle, Settings, Brain,
} from 'lucide-react-native';
import Toast from 'react-native-toast-message';

import { AuthContext } from '../context/AuthContext';
import { useApiKey } from '../context/ApiKeyContext';
import { addNote, getUserNotes, deleteNote } from '../services/apiNoteService';
import { sendChatMessage, getRAGContext } from '../services/ragService';
import GlassCard from '../components/ui/GlassCard';

// ─── Relative time helper ─────────────────────────────────────────────────────
const relativeTime = (timestamp) => {
  if (!timestamp) return '';
  const ms = typeof timestamp === 'string' ? new Date(timestamp).getTime() : (timestamp?.seconds ? timestamp.seconds * 1000 : timestamp);
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Vừa xong';
  if (m < 60) return `${m} phút trước`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} giờ trước`;
  return `${Math.floor(h / 24)} ngày trước`;
};

// ─── Note Card ────────────────────────────────────────────────────────────────
const NoteCard = ({ item, onPress, onDelete }) => (
  <MotiView
    from={{ opacity: 0, translateX: -20 }}
    animate={{ opacity: 1, translateX: 0 }}
    transition={{ type: 'spring', damping: 20 }}
  >
    <TouchableOpacity onPress={() => onPress(item)} activeOpacity={0.85}>
      <GlassCard style={styles.noteCard} dark>
        <View style={styles.noteCardHeader}>
          <View style={styles.noteIcon}>
            <NotebookPen size={16} color="#a78bfa" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle} numberOfLines={1}>{item.title || 'Không có tiêu đề'}</Text>
            <View style={styles.noteMeta}>
              <Clock size={10} color="#475569" />
              <Text style={styles.noteTime}>{relativeTime(item.createdAt)}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => onDelete(item)} style={styles.deleteBtn}>
            <Trash2 size={16} color="#475569" />
          </TouchableOpacity>
        </View>
        <Text style={styles.notePreview} numberOfLines={2}>
          {item.content || '(Không có nội dung)'}
        </Text>
        {item.aiEnhanced && (
          <View style={styles.aiEnhancedBadge}>
            <Sparkles size={10} color="#a78bfa" />
            <Text style={styles.aiEnhancedText}>AI đã cải thiện</Text>
          </View>
        )}
        <ChevronRight size={16} color="#334155" style={styles.chevron} />
      </GlassCard>
    </TouchableOpacity>
  </MotiView>
);

// ─── Editor Modal ─────────────────────────────────────────────────────────────
const NoteEditorModal = ({ visible, note, onClose, onSave, hasApiKey, navigation }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [ragChunks, setRagChunks] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setContent(note.content || '');
    } else {
      setTitle('');
      setContent('');
    }
    setAiSuggestion('');
    setRagChunks([]);
  }, [note, visible]);

  const handleAiEnhance = async () => {
    if (!content.trim()) {
      Toast.show({ type: 'error', text1: 'Thiếu nội dung', text2: 'Nhập nội dung ghi chú trước' });
      return;
    }
    if (!hasApiKey) {
      Toast.show({ type: 'error', text1: 'Cần API Key', text2: 'Cấu hình trong Cài đặt' });
      return;
    }

    setIsEnhancing(true);
    setAiSuggestion('');

    // Step 1: Fetch RAG context based on note title/content
    const ragResult = await getRAGContext(title || content.substring(0, 100));
    if (ragResult.success && ragResult.chunks?.length > 0) {
      setRagChunks(ragResult.chunks.slice(0, 3));
    }

    // Step 2: Ask AI to enhance the note with RAG context
    const prompt = `Bạn là trợ lý học tập AI. Hãy cải thiện và mở rộng ghi chú sau đây, thêm thông tin hữu ích, ví dụ, và cấu trúc rõ ràng hơn. Trả lời bằng tiếng Việt.\n\nTiêu đề: ${title}\n\nNội dung ghi chú:\n${content}\n\nHãy cải thiện ghi chú này.`;

    const result = await sendChatMessage(prompt, `enhance_${Date.now()}`);
    setIsEnhancing(false);

    if (result.success) {
      setAiSuggestion(result.reply);
    } else {
      Toast.show({ type: 'error', text1: 'Lỗi AI', text2: result.error });
    }
  };

  const handleAcceptSuggestion = () => {
    setContent(aiSuggestion);
    setAiSuggestion('');
    setRagChunks([]);
  };

  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Nhập tiêu đề hoặc nội dung' });
      return;
    }
    setIsSaving(true);
    await onSave({ title, content, aiEnhanced: !!aiSuggestion && content !== (note?.content || '') });
    setIsSaving(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} statusBarTranslucent>
      <SafeAreaView style={editorStyles.container} edges={['top', 'bottom']}>
        <LinearGradient colors={['#0f172a', '#1e293b']} style={StyleSheet.absoluteFill} />

        {/* Editor Header */}
        <View style={editorStyles.header}>
          <TouchableOpacity onPress={onClose} style={editorStyles.headerBtn}>
            <X size={20} color="#94a3b8" />
          </TouchableOpacity>
          <Text style={editorStyles.headerTitle}>{note ? 'Chỉnh sửa' : 'Ghi chú mới'}</Text>
          <TouchableOpacity
            onPress={handleSave}
            style={[editorStyles.headerBtn, editorStyles.saveBtn]}
            disabled={isSaving}
          >
            {isSaving ? <ActivityIndicator size="small" color="#fff" /> : <Save size={18} color="#fff" />}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView style={editorStyles.scroll} showsVerticalScrollIndicator={false}>
            {/* Title */}
            <TextInput
              style={editorStyles.titleInput}
              placeholder="Tiêu đề ghi chú..."
              placeholderTextColor="#334155"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />

            {/* Content */}
            <TextInput
              style={editorStyles.contentInput}
              placeholder="Bắt đầu viết ghi chú của bạn tại đây...\n\nBấm nút ✨ AI để AI giúp bạn cải thiện và mở rộng nội dung."
              placeholderTextColor="#334155"
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
            />

            {/* RAG chunks used */}
            {ragChunks.length > 0 && (
              <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
                <View style={editorStyles.ragSection}>
                  <View style={editorStyles.ragHeader}>
                    <SearchIcon size={14} color="#38bdf8" />
                    <Text style={editorStyles.ragHeaderText}>Tri thức liên quan tìm thấy ({ragChunks.length})</Text>
                  </View>
                  {ragChunks.map((chunk, i) => (
                    <Text key={i} style={editorStyles.ragChunk} numberOfLines={2}>
                      • {typeof chunk === 'string' ? chunk : chunk.text || chunk.content || JSON.stringify(chunk)}
                    </Text>
                  ))}
                </View>
              </MotiView>
            )}

            {/* AI Suggestion */}
            {aiSuggestion ? (
              <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
                <View style={editorStyles.suggestionBox}>
                  <View style={editorStyles.suggestionHeader}>
                    <Sparkles size={16} color="#a78bfa" />
                    <Text style={editorStyles.suggestionTitle}>Gợi ý từ AI</Text>
                  </View>
                  <Text style={editorStyles.suggestionText}>{aiSuggestion}</Text>
                  <View style={editorStyles.suggestionActions}>
                    <TouchableOpacity style={editorStyles.acceptBtn} onPress={handleAcceptSuggestion}>
                      <Text style={editorStyles.acceptBtnText}>✅ Áp dụng</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={editorStyles.rejectBtn} onPress={() => { setAiSuggestion(''); setRagChunks([]); }}>
                      <Text style={editorStyles.rejectBtnText}>❌ Bỏ qua</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </MotiView>
            ) : null}

            <View style={{ height: 120 }} />
          </ScrollView>
        </KeyboardAvoidingView>

        {/* AI Enhance FAB */}
        <TouchableOpacity
          style={[editorStyles.enhanceFab, isEnhancing && editorStyles.enhanceFabLoading]}
          onPress={handleAiEnhance}
          disabled={isEnhancing}
        >
          {isEnhancing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Sparkles size={18} color="#fff" />
              <Text style={editorStyles.enhanceFabText}>AI Enhance</Text>
            </>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

// ─── Main NoteLabScreen ───────────────────────────────────────────────────────
export default function NoteLabScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const { hasApiKey } = useApiKey();

  const [notes, setNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);

  const fetchNotes = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    const result = await getUserNotes();
    setIsLoading(false);
    if (result.success) {
      setNotes(result.data || []);
    }
  }, [user]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const filteredNotes = notes.filter(n =>
    (n.title || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (n.content || '').toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenNote = (note) => {
    setSelectedNote(note);
    setEditorVisible(true);
  };

  const handleNewNote = () => {
    setSelectedNote(null);
    setEditorVisible(true);
  };

  const handleSaveNote = async ({ title, content, aiEnhanced }) => {
    if (!user) return;
    const result = await addNote(null, title, content, selectedNote?.id);
    if (result.success) {
      Toast.show({ type: 'success', text1: '✅ Đã lưu', text2: 'Ghi chú đã được lưu' });
      setEditorVisible(false);
      await fetchNotes();
    } else {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: result.error || 'Lưu thất bại' });
    }
  };

  const handleDeleteNote = (note) => {
    Alert.alert('Xóa ghi chú', `Xóa "${note.title || 'ghi chú này'}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: async () => {
          if (!note.id) return;
          const result = await deleteNote(note.id);
          if (result.success) {
            Toast.show({ type: 'success', text1: 'Đã xóa' });
            setNotes(prev => prev.filter(n => n.id !== note.id));
          } else {
            Toast.show({ type: 'error', text1: 'Lỗi xóa', text2: result.error });
          }
        },
      },
    ]);
  };

  const EmptyState = () => (
    <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={styles.emptyWrap}>
      <NotebookPen size={48} color="#334155" />
      <Text style={styles.emptyTitle}>Chưa có ghi chú</Text>
      <Text style={styles.emptyDesc}>Tạo ghi chú đầu tiên và dùng AI để cải thiện nội dung!</Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={handleNewNote}>
        <Plus size={16} color="#fff" />
        <Text style={styles.emptyBtnText}>Tạo ghi chú</Text>
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>📓 NoteLab</Text>
          <Text style={styles.headerSub}>{notes.length} ghi chú · AI-powered</Text>
        </View>
        {!hasApiKey && (
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.apiWarnBtn}>
            <AlertCircle size={14} color="#fbbf24" />
            <Text style={styles.apiWarnText}>Cần API Key</Text>
          </TouchableOpacity>
        )}
      </MotiView>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <SearchIcon size={16} color="#475569" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm ghi chú..."
          placeholderTextColor="#475569"
          value={searchText}
          onChangeText={setSearchText}
        />
        {searchText ? (
          <TouchableOpacity onPress={() => setSearchText('')}>
            <X size={16} color="#475569" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* AI Feature Banner */}
      <View style={styles.aiBanner}>
        <Brain size={14} color="#a78bfa" />
        <Text style={styles.aiBannerText}>Mở ghi chú → bấm ✨ AI Enhance để AI cải thiện bằng RAG</Text>
      </View>

      {/* Notes List */}
      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 60 }} color="#a78bfa" size="large" />
      ) : (
        <FlatList
          data={filteredNotes}
          keyExtractor={(item, idx) => item.id || String(idx)}
          renderItem={({ item }) => (
            <NoteCard item={item} onPress={handleOpenNote} onDelete={handleDeleteNote} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleNewNote}>
        <LinearGradient colors={['#7c3aed', '#4f46e5']} style={styles.fabGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <Plus size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>

      {/* Editor Modal */}
      <NoteEditorModal
        visible={editorVisible}
        note={selectedNote}
        onClose={() => setEditorVisible(false)}
        onSave={handleSaveNote}
        hasApiKey={hasApiKey}
        navigation={navigation}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#f1f5f9' },
  headerSub: { fontSize: 12, color: '#64748b', marginTop: 2 },
  apiWarnBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(251,191,36,0.1)', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)' },
  apiWarnText: { fontSize: 12, color: '#fbbf24', fontWeight: '600' },

  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 10, marginHorizontal: 20, marginBottom: 10, backgroundColor: 'rgba(30,41,59,0.8)', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)' },
  searchInput: { flex: 1, fontSize: 15, color: '#e2e8f0' },

  aiBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 20, marginBottom: 14, backgroundColor: 'rgba(167,139,250,0.08)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(167,139,250,0.15)' },
  aiBannerText: { fontSize: 12, color: '#94a3b8', flex: 1 },

  list: { paddingHorizontal: 20, paddingBottom: 100 },

  noteCard: { backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 18, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', position: 'relative' },
  noteCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 8 },
  noteIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(167,139,250,0.15)', justifyContent: 'center', alignItems: 'center' },
  noteTitle: { fontSize: 16, fontWeight: '700', color: '#e2e8f0', flex: 1 },
  noteMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  noteTime: { fontSize: 11, color: '#475569' },
  deleteBtn: { padding: 4 },
  notePreview: { fontSize: 13, color: '#64748b', lineHeight: 19 },
  aiEnhancedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 8, backgroundColor: 'rgba(167,139,250,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  aiEnhancedText: { fontSize: 11, color: '#a78bfa', fontWeight: '600' },
  chevron: { position: 'absolute', right: 16, bottom: 16 },

  emptyWrap: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 40, gap: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#334155' },
  emptyDesc: { fontSize: 14, color: '#475569', textAlign: 'center', lineHeight: 22 },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#4f46e5', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16 },
  emptyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  fab: { position: 'absolute', bottom: 90, right: 24, borderRadius: 20, overflow: 'hidden', elevation: 10, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 12 },
  fabGrad: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' },
});

const editorStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#e2e8f0' },
  headerBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.06)', justifyContent: 'center', alignItems: 'center' },
  saveBtn: { backgroundColor: '#4f46e5' },

  scroll: { flex: 1, paddingHorizontal: 20 },
  titleInput: { fontSize: 24, fontWeight: '800', color: '#f1f5f9', paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)', marginBottom: 16 },
  contentInput: { fontSize: 16, color: '#cbd5e1', lineHeight: 26, minHeight: 200 },

  ragSection: { backgroundColor: 'rgba(14,165,233,0.08)', borderRadius: 14, padding: 14, marginTop: 20, borderWidth: 1, borderColor: 'rgba(56,189,248,0.15)' },
  ragHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  ragHeaderText: { fontSize: 13, fontWeight: '600', color: '#38bdf8' },
  ragChunk: { fontSize: 12, color: '#64748b', marginBottom: 6, lineHeight: 18 },

  suggestionBox: { backgroundColor: 'rgba(167,139,250,0.08)', borderRadius: 16, padding: 16, marginTop: 20, borderWidth: 1, borderColor: 'rgba(167,139,250,0.2)' },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  suggestionTitle: { fontSize: 15, fontWeight: '700', color: '#a78bfa' },
  suggestionText: { fontSize: 14, color: '#94a3b8', lineHeight: 22 },
  suggestionActions: { flexDirection: 'row', gap: 12, marginTop: 16 },
  acceptBtn: { flex: 1, backgroundColor: 'rgba(74,222,128,0.15)', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)' },
  acceptBtnText: { color: '#4ade80', fontWeight: '700', fontSize: 14 },
  rejectBtn: { flex: 1, backgroundColor: 'rgba(239,68,68,0.1)', padding: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  rejectBtnText: { color: '#f87171', fontWeight: '700', fontSize: 14 },

  enhanceFab: { position: 'absolute', bottom: 30, right: 24, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#7c3aed', paddingHorizontal: 20, paddingVertical: 14, borderRadius: 20, elevation: 10, shadowColor: '#7c3aed', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 12 },
  enhanceFabLoading: { opacity: 0.7 },
  enhanceFabText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
