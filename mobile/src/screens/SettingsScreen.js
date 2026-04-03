import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Switch, Alert, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import {
  Key, Server, Trash2, Info, ChevronRight, Eye, EyeOff,
  CheckCircle2, AlertCircle, ExternalLink, RotateCcw, LogOut,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';

import { useApiKey } from '../context/ApiKeyContext';
import { AuthContext } from '../context/AuthContext';
import GlassCard from '../components/ui/GlassCard';

export default function SettingsScreen({ navigation }) {
  const { apiKey, backendUrl, setApiKey, setBackendUrl, hasApiKey } = useApiKey();
  const { logout, user } = useContext(AuthContext);

  const [localApiKey, setLocalApiKey] = useState(apiKey);
  const [localBackendUrl, setLocalBackendUrl] = useState(backendUrl);
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveApiKey = async () => {
    if (!localApiKey.trim()) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'API Key không được để trống' });
      return;
    }
    if (!localApiKey.startsWith('AIza')) {
      Toast.show({ type: 'error', text1: 'Cảnh báo', text2: 'API Key thường bắt đầu bằng AIza...' });
    }
    setIsSaving(true);
    await setApiKey(localApiKey.trim());
    setIsSaving(false);
    Toast.show({ type: 'success', text1: '✅ Đã lưu', text2: 'Gemini API Key đã được cập nhật' });
  };

  const handleSaveBackendUrl = async () => {
    if (!localBackendUrl.startsWith('http')) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'URL phải bắt đầu bằng http://' });
      return;
    }
    await setBackendUrl(localBackendUrl.trim());
    Toast.show({ type: 'success', text1: '✅ Đã lưu', text2: 'Backend URL đã được cập nhật' });
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Xóa lịch sử chat',
      'Bạn có chắc muốn xóa toàn bộ lịch sử chat không?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('chat_sessions');
            Toast.show({ type: 'success', text1: '🗑️ Đã xóa', text2: 'Lịch sử chat đã được xóa' });
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Đăng xuất', style: 'destructive', onPress: logout },
    ]);
  };

  const maskedKey = apiKey
    ? `${apiKey.substring(0, 6)}${'•'.repeat(20)}${apiKey.slice(-4)}`
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#0f172a', '#1e293b', '#0f172a']} style={StyleSheet.absoluteFill} />

      {/* Header */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 400 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>⚙️ Cài Đặt</Text>
        <Text style={styles.headerSub}>Cấu hình API & kết nối backend</Text>
      </MotiView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ─── API Key Status Banner ─── */}
        <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 100 }}>
          <View style={[styles.statusBanner, hasApiKey ? styles.statusOk : styles.statusWarn]}>
            {hasApiKey
              ? <CheckCircle2 size={18} color="#4ade80" />
              : <AlertCircle size={18} color="#fbbf24" />}
            <Text style={[styles.statusText, hasApiKey ? styles.statusTextOk : styles.statusTextWarn]}>
              {hasApiKey ? `API Key đang hoạt động: ${maskedKey}` : 'Chưa cấu hình Gemini API Key — các tính năng AI sẽ không hoạt động'}
            </Text>
          </View>
        </MotiView>

        {/* ─── Gemini API Key Section ─── */}
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 150 }}>
          <GlassCard style={styles.section} dark>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconBox}>
                <Key size={20} color="#a78bfa" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>Gemini API Key</Text>
                <Text style={styles.sectionDesc}>Lấy key tại Google AI Studio</Text>
              </View>
              <TouchableOpacity onPress={() => Linking.openURL('https://aistudio.google.com/app/apikey')}>
                <ExternalLink size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.textInput}
                placeholder="AIzaSy..."
                placeholderTextColor="#475569"
                value={localApiKey}
                onChangeText={setLocalApiKey}
                secureTextEntry={!showKey}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowKey(!showKey)} style={styles.eyeBtn}>
                {showKey ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.saveBtnDisabled]}
              onPress={handleSaveApiKey}
              disabled={isSaving}
            >
              <LinearGradient colors={['#7c3aed', '#4f46e5']} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.saveBtnText}>{isSaving ? 'Đang lưu...' : 'Lưu API Key'}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.hintText}>
              🔒 Key được lưu cục bộ trên thiết bị, không gửi lên server
            </Text>
          </GlassCard>
        </MotiView>

        {/* ─── Backend URL Section ─── */}
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 250 }}>
          <GlassCard style={styles.section} dark>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconBox, { backgroundColor: 'rgba(14,165,233,0.15)' }]}>
                <Server size={20} color="#38bdf8" />
              </View>
              <View>
                <Text style={styles.sectionTitle}>Backend URL</Text>
                <Text style={styles.sectionDesc}>IP máy tính đang chạy backend</Text>
              </View>
            </View>

            <TextInput
              style={[styles.textInput, { marginBottom: 12 }]}
              placeholder="http://192.168.1.xxx:5000"
              placeholderTextColor="#475569"
              value={localBackendUrl}
              onChangeText={setLocalBackendUrl}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />

            <View style={styles.urlHintBox}>
              <Info size={14} color="#38bdf8" />
              <Text style={styles.urlHint}>
                Chạy <Text style={styles.code}>ipconfig</Text> trên PC → IPv4 của WiFi. Điện thoại và PC phải cùng mạng.
              </Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBackendUrl}>
              <LinearGradient colors={['#0ea5e9', '#0284c7']} style={styles.saveBtnGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <Text style={styles.saveBtnText}>Lưu Backend URL</Text>
              </LinearGradient>
            </TouchableOpacity>
          </GlassCard>
        </MotiView>

        {/* ─── Data Management ─── */}
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 350 }}>
          <GlassCard style={styles.section} dark>
            <Text style={styles.sectionTitle}>Quản lý dữ liệu</Text>

            <TouchableOpacity style={styles.actionRow} onPress={handleClearHistory}>
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(239,68,68,0.15)' }]}>
                <Trash2 size={18} color="#f87171" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Xóa lịch sử Chat</Text>
                <Text style={styles.actionDesc}>Xóa toàn bộ hội thoại đã lưu local</Text>
              </View>
              <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity
              style={styles.actionRow}
              onPress={() => {
                Alert.alert('Reset API Key', 'Xóa API Key đã lưu?', [
                  { text: 'Hủy', style: 'cancel' },
                  {
                    text: 'Xóa',
                    style: 'destructive',
                    onPress: async () => {
                      await setApiKey('');
                      setLocalApiKey('');
                      Toast.show({ type: 'success', text1: 'Đã xóa API Key' });
                    },
                  },
                ]);
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(251,191,36,0.15)' }]}>
                <RotateCcw size={18} color="#fbbf24" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.actionTitle}>Reset API Key</Text>
                <Text style={styles.actionDesc}>Xóa key đã lưu, nhập lại từ đầu</Text>
              </View>
              <ChevronRight size={18} color="#475569" />
            </TouchableOpacity>
          </GlassCard>
        </MotiView>

        {/* ─── Account ─── */}
        <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 450 }}>
          <GlassCard style={styles.section} dark>
            <Text style={styles.sectionTitle}>Tài khoản</Text>
            <Text style={styles.emailText}>{user?.email || user?.displayName || 'Người dùng'}</Text>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <LogOut size={18} color="#f87171" />
              <Text style={styles.logoutText}>Đăng xuất</Text>
            </TouchableOpacity>
          </GlassCard>
        </MotiView>

        {/* App version */}
        <Text style={styles.version}>LearnAI Mobile v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#f1f5f9', letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: '#64748b', marginTop: 4 },
  scroll: { padding: 20, paddingBottom: 100 },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14, borderRadius: 16, marginBottom: 20,
  },
  statusOk: { backgroundColor: 'rgba(74,222,128,0.1)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.2)' },
  statusWarn: { backgroundColor: 'rgba(251,191,36,0.1)', borderWidth: 1, borderColor: 'rgba(251,191,36,0.2)' },
  statusText: { fontSize: 13, flex: 1, lineHeight: 18 },
  statusTextOk: { color: '#4ade80' },
  statusTextWarn: { color: '#fbbf24' },

  section: { backgroundColor: 'rgba(30,41,59,0.8)', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  sectionIconBox: { width: 42, height: 42, borderRadius: 14, backgroundColor: 'rgba(167,139,250,0.15)', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#e2e8f0', marginBottom: 2 },
  sectionDesc: { fontSize: 12, color: '#64748b' },

  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
  textInput: { flex: 1, padding: 14, fontSize: 15, color: '#e2e8f0', backgroundColor: 'rgba(15,23,42,0.8)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 0 },
  eyeBtn: { padding: 14 },

  saveBtn: { borderRadius: 14, overflow: 'hidden', marginBottom: 12 },
  saveBtnGrad: { paddingVertical: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  hintText: { fontSize: 12, color: '#475569', textAlign: 'center' },

  urlHintBox: { flexDirection: 'row', gap: 8, backgroundColor: 'rgba(14,165,233,0.08)', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'flex-start' },
  urlHint: { fontSize: 12, color: '#94a3b8', flex: 1, lineHeight: 18 },
  code: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', color: '#38bdf8' },

  actionRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 },
  actionIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 15, fontWeight: '600', color: '#e2e8f0', marginBottom: 2 },
  actionDesc: { fontSize: 12, color: '#64748b' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginVertical: 8 },

  emailText: { fontSize: 14, color: '#94a3b8', marginBottom: 16 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(239,68,68,0.1)', padding: 14, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(239,68,68,0.2)' },
  logoutText: { fontSize: 15, fontWeight: '600', color: '#f87171' },

  version: { textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 20, marginBottom: 40 },
});
