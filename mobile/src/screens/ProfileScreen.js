import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, User, Settings, Shield, ChevronRight, BrainCircuit, Globe, Key } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useApiKey } from '../context/ApiKeyContext';
import { MotiView } from 'moti';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const { apiKey, setApiKey, backendUrl, setBackendUrl } = useApiKey();
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isAIModalVisible, setAIModalVisible] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempBackendUrl, setTempBackendUrl] = useState(backendUrl);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    setLogoutModalVisible(false);
    await logout();
    setIsLoggingOut(false);
  };

  const menuItems = [
    { icon: User, title: 'Thông tin cá nhân', color: '#6366F1', onPress: () => {} },
    { icon: BrainCircuit, title: 'Cấu hình AI (Gemini)', color: '#A855F7', onPress: () => { setTempApiKey(apiKey); setTempBackendUrl(backendUrl); setAIModalVisible(true); } },
    { icon: Shield, title: 'Bảo mật & Mật khẩu', color: '#10B981', onPress: () => {} },
    { icon: Settings, title: 'Cài đặt ứng dụng', color: '#F59E0B', onPress: () => {} },
  ];

  const handleSaveAIConfig = async () => {
    setIsSaving(true);
    await Promise.all([
      setApiKey(tempApiKey),
      setBackendUrl(tempBackendUrl)
    ]);
    setIsSaving(false);
    setAIModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1E1B4B', '#312E81', '#4338CA']} style={styles.background} />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hồ Sơ</Text>
      </View>

      <MotiView 
        from={{ opacity: 0, translateY: 20 }} 
        animate={{ opacity: 1, translateY: 0 }} 
        transition={{ type: 'timing', duration: 500 }}
        style={styles.profileCard}
      >
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: user?.avatar || 'https://ui-avatars.com/api/?name=' + (user?.name || 'User') + '&background=6366F1&color=fff' }} 
            style={styles.avatar} 
          />
        </View>
        <Text style={styles.userName}>{user?.name || 'Người dùng'}</Text>
        <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>Thành viên Free</Text>
        </View>
      </MotiView>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <MotiView 
            key={index}
            from={{ opacity: 0, translateX: -20 }} 
            animate={{ opacity: 1, translateX: 0 }} 
            transition={{ type: 'timing', duration: 400, delay: 200 + index * 100 }}
          >
            <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                <item.icon color={item.color} size={22} />
              </View>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <ChevronRight color="#64748B" size={20} />
            </TouchableOpacity>
          </MotiView>
        ))}
      </View>

      <MotiView 
        from={{ opacity: 0, translateY: 20 }} 
        animate={{ opacity: 1, translateY: 0 }} 
        transition={{ type: 'timing', duration: 500, delay: 600 }}
        style={styles.logoutContainer}
      >
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? (
            <ActivityIndicator color="#EF4444" />
          ) : (
            <>
              <LogOut color="#EF4444" size={20} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Đăng Xuất</Text>
            </>
          )}
        </TouchableOpacity>
      </MotiView>

      <Modal
        visible={isLogoutModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đăng xuất</Text>
            <Text style={styles.modalMessage}>Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelButton} onPress={() => setLogoutModalVisible(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmLogout}>
                <Text style={styles.modalConfirmText}>Đăng xuất</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* AI Configuration Modal */}
      <Modal
        visible={isAIModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAIModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <MotiView 
            from={{ translateY: 300 }}
            animate={{ translateY: 0 }}
            style={[styles.modalContent, { width: '90%', maxWidth: 400 }]}
          >
            <View style={styles.modalHeader}>
              <BrainCircuit color="#A855F7" size={24} />
              <Text style={styles.modalTitle}> Cấu hình AI & Backend</Text>
            </View>
            
            <Text style={styles.inputLabel}>Gemini API Key</Text>
            <View style={styles.inputContainer}>
              <Key color="#94A3B8" size={18} style={styles.inputIcon} />
              <TextInput 
                style={styles.textInput}
                value={tempApiKey}
                onChangeText={setTempApiKey}
                placeholder="Dán API Key của bạn vào đây..."
                placeholderTextColor="#64748B"
                secureTextEntry={true}
              />
            </View>
            <Text style={styles.inputHelp}>Dùng để chạy Chatbot và Alchemy. Key được lưu an toàn trên máy bạn.</Text>

            <Text style={[styles.inputLabel, { marginTop: 20 }]}>Backend URL</Text>
            <View style={styles.inputContainer}>
              <Globe color="#94A3B8" size={18} style={styles.inputIcon} />
              <TextInput 
                style={styles.textInput}
                value={tempBackendUrl}
                onChangeText={setTempBackendUrl}
                placeholder="http://192.168.1.xxx:5000"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
              />
            </View>
            <Text style={styles.inputHelp}>Địa chỉ IP máy tính chạy server backend.</Text>

            <View style={[styles.modalActions, { marginTop: 30 }]}>
              <TouchableOpacity 
                style={styles.modalCancelButton} 
                onPress={() => setAIModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalConfirmButton, { backgroundColor: '#A855F7' }]} 
                onPress={handleSaveAIConfig}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Lưu cấu hình</Text>
                )}
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  profileCard: { 
    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
    marginHorizontal: 20, 
    borderRadius: 24, 
    padding: 24, 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginTop: 10
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#6366F1',
    padding: 3,
    marginBottom: 15
  },
  avatar: { width: '100%', height: '100%', borderRadius: 50 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#FFF', marginBottom: 5 },
  userEmail: { fontSize: 14, color: '#94A3B8', marginBottom: 15 },
  badgeContainer: { 
    backgroundColor: 'rgba(99, 102, 241, 0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.5)'
  },
  badgeText: { color: '#A5B4FC', fontSize: 12, fontWeight: 'bold' },
  menuContainer: { marginTop: 30, paddingHorizontal: 20 },
  menuItem: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
    padding: 16, 
    borderRadius: 16, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  menuIconContainer: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  menuItemTitle: { flex: 1, fontSize: 16, color: '#F8FAFC', fontWeight: '500' },
  logoutContainer: { marginTop: 'auto', marginBottom: 40, paddingHorizontal: 20 },
  logoutButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(239, 68, 68, 0.1)', 
    padding: 16, 
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)'
  },
  logoutIcon: { marginRight: 10 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 20, padding: 24, width: '80%', alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF', marginBottom: 10 },
  modalMessage: { fontSize: 15, color: '#94A3B8', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-between', width: '100%' },
  modalCancelButton: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', marginRight: 10, alignItems: 'center' },
  modalCancelText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  modalConfirmButton: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: '#EF4444', marginLeft: 10, alignItems: 'center' },
  modalConfirmText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  inputLabel: { color: '#E2E8F0', fontSize: 14, fontWeight: '600', marginBottom: 8, alignSelf: 'flex-start' },
  inputContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#0F172A', 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: '#334155',
    paddingHorizontal: 12,
    width: '100%'
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, color: '#FFF', paddingVertical: 12, fontSize: 15 },
  inputHelp: { color: '#64748B', fontSize: 12, marginTop: 6, alignSelf: 'flex-start' }
});
