import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, ActivityIndicator, Dimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Sparkles, Image as ImageIcon, BrainCircuit, Send, Settings2, X, Key } from 'lucide-react-native';
import GlassCard from '../components/ui/GlassCard';
import AnimatedText from '../components/ui/AnimatedText';
import { generateWithThinking, generateImage } from '../services/geminiService';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

export default function AIStudioScreen() {
  const [mode, setMode] = useState('thinking'); // 'thinking' or 'image'
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState('');
  const [resultImage, setResultImage] = useState(null);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [useProImage, setUseProImage] = useState(false);
  
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    const loadApiKey = async () => {
      const key = await AsyncStorage.getItem('custom_gemini_api_key');
      if (key) setApiKey(key);
    };
    loadApiKey();
  }, []);

  const saveApiKey = async () => {
    await AsyncStorage.setItem('custom_gemini_api_key', apiKey);
    setSettingsVisible(false);
    Toast.show({ type: 'success', text1: 'Thành công', text2: 'Đã lưu API Key' });
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    setResultText('');
    setResultImage(null);

    if (mode === 'thinking') {
      const res = await generateWithThinking(prompt);
      if (res.success) {
        setResultText(res.text);
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: res.error });
      }
    } else {
      const res = await generateImage(prompt, aspectRatio, useProImage);
      if (res.success) {
        setResultImage(res.imageUrl);
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: res.error });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient colors={['#F8FAFC', '#F1F5F9']} style={styles.background} />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <AnimatedText text="AI Studio" style={styles.headerTitle} duration={400} />
          <TouchableOpacity onPress={() => setSettingsVisible(true)} style={styles.settingsBtn}>
            <Settings2 size={24} color="#64748B" />
          </TouchableOpacity>
        </View>
        <View style={styles.modeSelector}>
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'thinking' && styles.modeBtnActive]}
            onPress={() => setMode('thinking')}
          >
            <BrainCircuit size={18} color={mode === 'thinking' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'thinking' && styles.modeTextActive]}>Tư duy sâu</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.modeBtn, mode === 'image' && styles.modeBtnActive]}
            onPress={() => setMode('image')}
          >
            <ImageIcon size={18} color={mode === 'image' ? '#FFF' : '#64748B'} />
            <Text style={[styles.modeText, mode === 'image' && styles.modeTextActive]}>Tạo ảnh</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {mode === 'image' && (
          <MotiView from={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
            <GlassCard style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Tỷ lệ ảnh</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {ASPECT_RATIOS.map(ratio => (
                    <TouchableOpacity 
                      key={ratio} 
                      style={[styles.ratioBtn, aspectRatio === ratio && styles.ratioBtnActive]}
                      onPress={() => setAspectRatio(ratio)}
                    >
                      <Text style={[styles.ratioText, aspectRatio === ratio && styles.ratioTextActive]}>{ratio}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={[styles.settingRow, { marginTop: 15, justifyContent: 'space-between' }]}>
                <Text style={styles.settingLabel}>Chất lượng Studio (Pro)</Text>
                <TouchableOpacity 
                  style={[styles.toggleBtn, useProImage && styles.toggleBtnActive]}
                  onPress={() => setUseProImage(!useProImage)}
                >
                  <View style={[styles.toggleKnob, useProImage && styles.toggleKnobActive]} />
                </TouchableOpacity>
              </View>
            </GlassCard>
          </MotiView>
        )}

        <GlassCard style={styles.inputCard}>
          <TextInput
            style={styles.input}
            placeholder={mode === 'thinking' ? "Nhập câu hỏi phức tạp cần tư duy sâu..." : "Mô tả bức ảnh bạn muốn tạo..."}
            placeholderTextColor="#94A3B8"
            multiline
            value={prompt}
            onChangeText={setPrompt}
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !prompt.trim() && { opacity: 0.5 }]} 
            onPress={handleGenerate}
            disabled={!prompt.trim() || isLoading}
          >
            {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Send size={20} color="#FFF" />}
          </TouchableOpacity>
        </GlassCard>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <MotiView
              from={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.2, opacity: 1 }}
              transition={{ type: 'timing', duration: 1000, loop: true }}
            >
              <Sparkles size={40} color="#0ea5e9" />
            </MotiView>
            <Text style={styles.loadingText}>
              {mode === 'thinking' ? 'AI đang suy nghĩ sâu...' : 'Đang vẽ bức tranh của bạn...'}
            </Text>
          </View>
        )}

        {!isLoading && resultText ? (
          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }}>
            <GlassCard style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <BrainCircuit size={20} color="#8b5cf6" />
                <Text style={styles.resultTitle}>Kết quả tư duy</Text>
              </View>
              <Text style={styles.resultTextContent}>{resultText}</Text>
            </GlassCard>
          </MotiView>
        ) : null}

        {!isLoading && resultImage ? (
          <MotiView from={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <GlassCard style={styles.imageResultCard}>
              <Image source={{ uri: resultImage }} style={styles.generatedImage} resizeMode="contain" />
            </GlassCard>
          </MotiView>
        ) : null}

      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={isSettingsVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cài đặt AI Studio</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <X size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.apiKeyContainer}>
              <View style={styles.apiKeyHeader}>
                <Key size={18} color="#0ea5e9" />
                <Text style={styles.apiKeyTitle}>Gemini API Key</Text>
              </View>
              <Text style={styles.apiKeyDesc}>Nhập API Key của bạn để sử dụng các tính năng AI. Key sẽ được lưu an toàn trên thiết bị.</Text>
              <TextInput
                style={styles.apiKeyInput}
                placeholder="AIzaSy..."
                value={apiKey}
                onChangeText={setApiKey}
                placeholderTextColor="#94A3B8"
                secureTextEntry
              />
            </View>
            
            <TouchableOpacity style={styles.saveButton} onPress={saveApiKey}>
              <Text style={styles.saveButtonText}>Lưu Cài Đặt</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { padding: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginBottom: 15 },
  modeSelector: { flexDirection: 'row', backgroundColor: '#E2E8F0', borderRadius: 12, padding: 4 },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 8 },
  modeBtnActive: { backgroundColor: '#0ea5e9', shadowColor: '#0ea5e9', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  modeText: { fontSize: 14, fontWeight: '600', color: '#64748B', marginLeft: 8 },
  modeTextActive: { color: '#FFF' },
  scrollContent: { padding: 20, paddingBottom: 100 },
  settingsCard: { marginBottom: 20, padding: 15 },
  settingRow: { flexDirection: 'row', alignItems: 'center' },
  settingLabel: { fontSize: 14, fontWeight: '600', color: '#334155', marginRight: 15, width: 80 },
  ratioBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: '#E2E8F0' },
  ratioBtnActive: { backgroundColor: '#E0F2FE', borderColor: '#0ea5e9' },
  ratioText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  ratioTextActive: { color: '#0ea5e9' },
  toggleBtn: { width: 44, height: 24, borderRadius: 12, backgroundColor: '#CBD5E1', padding: 2 },
  toggleBtnActive: { backgroundColor: '#0ea5e9' },
  toggleKnob: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFF' },
  toggleKnobActive: { transform: [{ translateX: 20 }] },
  inputCard: { flexDirection: 'row', alignItems: 'flex-end', padding: 10, marginBottom: 20 },
  input: { flex: 1, minHeight: 80, maxHeight: 150, padding: 10, fontSize: 16, color: '#1E293B', textAlignVertical: 'top' },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#0ea5e9', justifyContent: 'center', alignItems: 'center', marginLeft: 10, marginBottom: 5 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 20, fontSize: 14, color: '#64748B', fontWeight: '500' },
  resultCard: { padding: 20 },
  resultHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#8b5cf6', marginLeft: 8 },
  resultTextContent: { fontSize: 15, color: '#334155', lineHeight: 24 },
  imageResultCard: { padding: 10, alignItems: 'center' },
  generatedImage: { width: width - 60, height: width - 60, borderRadius: 12 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  settingsBtn: { padding: 8, backgroundColor: '#E2E8F0', borderRadius: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, minHeight: 300 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  apiKeyContainer: { backgroundColor: '#F8FAFC', padding: 16, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: '#E2E8F0' },
  apiKeyHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  apiKeyTitle: { fontSize: 16, fontWeight: '600', color: '#0F172A', marginLeft: 8 },
  apiKeyDesc: { fontSize: 13, color: '#64748B', marginBottom: 12, lineHeight: 20 },
  apiKeyInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 10, padding: 12, fontSize: 14, color: '#1E293B' },
  saveButton: { backgroundColor: '#0ea5e9', borderRadius: 12, padding: 16, alignItems: 'center' },
  saveButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
