import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LogOut, User, Settings, Shield, ChevronRight } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { MotiView } from 'moti';

export default function ProfileScreen() {
  const { user, logout } = useContext(AuthContext);
  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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
    { icon: User, title: 'Thông tin cá nhân', color: '#6366F1' },
    { icon: Shield, title: 'Bảo mật & Mật khẩu', color: '#10B981' },
    { icon: Settings, title: 'Cài đặt ứng dụng', color: '#F59E0B' },
  ];

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
            <TouchableOpacity style={styles.menuItem}>
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
  modalConfirmText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
