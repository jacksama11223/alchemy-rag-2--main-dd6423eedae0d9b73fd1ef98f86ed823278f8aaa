import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell, BookOpen, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../components/ui/GlassCard';
import AnimatedText from '../components/ui/AnimatedText';
import AnimatedList from '../components/ui/AnimatedList';

export default function NotificationScreen({ navigation }) {
  const notifications = [
    { id: 1, type: 'study', title: 'Đến giờ học rồi!', message: 'Tiếp tục chuỗi 3 ngày học của bạn với bài học Giả Kim Thuật mới.', time: '10 phút trước', icon: <BookOpen color="#0ea5e9" size={20} />, color: '#0ea5e9' },
    { id: 2, type: 'system', title: 'Tính năng mới', message: 'Sơ đồ tri thức đã được cập nhật với giao diện 3D mới.', time: '2 giờ trước', icon: <Sparkles color="#8b5cf6" size={20} />, color: '#8b5cf6' },
  ];

  const handleNotificationPress = (notif) => {
    if (notif.type === 'study') {
      navigation.navigate('Alchemy');
    }
  };

  const renderNotification = ({ item }) => (
    <TouchableOpacity onPress={() => handleNotificationPress(item)} activeOpacity={0.8}>
      <GlassCard style={styles.notificationCard} intensity={60} tint="light">
        <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
          {item.icon}
        </View>
        <View style={styles.notifContent}>
          <Text style={styles.notifTitle}>{item.title}</Text>
          <Text style={styles.notifMessage}>{item.message}</Text>
          <Text style={styles.notifTime}>{item.time}</Text>
        </View>
      </GlassCard>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#E0E7FF', '#F1F5F9']} style={styles.background} />
      
      <GlassCard style={styles.header} intensity={80} tint="light">
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#0F172A" />
        </TouchableOpacity>
        <AnimatedText text="Thông báo" style={styles.headerTitle} duration={500} />
        <View style={{ width: 24 }} />
      </GlassCard>

      <View style={styles.content}>
        {notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={48} color="#CBD5E1" />
            <Text style={styles.emptyText}>Bạn không có thông báo nào</Text>
          </View>
        ) : (
          <AnimatedList
            data={notifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.id.toString()}
            estimatedItemSize={120}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  background: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, borderRadius: 0, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.5)' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  notificationCard: { flexDirection: 'row', padding: 16, marginBottom: 12, borderRadius: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  notifContent: { flex: 1 },
  notifTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  notifMessage: { fontSize: 14, color: '#64748B', marginBottom: 8, lineHeight: 20 },
  notifTime: { fontSize: 12, color: '#94A3B8' },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' }
});
