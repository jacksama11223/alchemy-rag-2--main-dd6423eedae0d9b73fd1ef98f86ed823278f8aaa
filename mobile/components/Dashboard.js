import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Sparkles, Brain, NotebookPen, Zap, ChevronRight, Trophy } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function Dashboard({ onFeatureSelect }) {
  const [stats] = useState({ xp: 120, level: 5 });

  const features = [
    { id: 'alchemy', title: 'Giả Kim Thuật', desc: 'Xử lý dữ liệu AI', icon: <Sparkles size={24} color="#0ea5e9" />, color: '#0ea5e9' },
    { id: 'graph', title: 'Sơ Đồ Tri Thức', desc: 'Khám phá liên kết', icon: <Brain size={24} color="#8b5cf6" />, color: '#8b5cf6' },
    { id: 'notelab', title: 'NoteLab', desc: 'Ghi chú thông minh', icon: <NotebookPen size={24} color="#f59e0b" />, color: '#f59e0b' },
    { id: 'cram', title: 'Cram Mode', desc: 'Ôn thi cấp tốc', icon: <Zap size={24} color="#ef4444" />, color: '#ef4444' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <MotiView 
          from={{ opacity: 0, translateY: -20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
          style={styles.header}
        >
          <View>
            <Text style={styles.title}>LearnAI</Text>
            <Text style={styles.subtitle}>Hệ sinh thái học tập</Text>
          </View>
          <TouchableOpacity style={styles.statsBadge}>
            <Trophy size={14} color="#0284c7" style={{ marginRight: 4 }} />
            <Text style={styles.statsText}>{stats.xp} XP • Lvl {stats.level}</Text>
          </TouchableOpacity>
        </MotiView>

        {/* Welcome Section */}
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', delay: 200 }}
        >
          <LinearGradient
            colors={['#0ea5e9', '#2563eb']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeCard}
          >
            <Text style={styles.welcomeTitle}>Chào mừng trở lại!</Text>
            <Text style={styles.welcomeDesc}>Hôm nay bạn muốn khám phá tri thức nào?</Text>
            <TouchableOpacity style={styles.continueBtn}>
              <Text style={styles.continueBtnText}>Tiếp tục học</Text>
              <ChevronRight size={16} color="#0ea5e9" />
            </TouchableOpacity>
          </LinearGradient>
        </MotiView>

        {/* Feature Grid */}
        <Text style={styles.sectionTitle}>Chức Năng Hệ Thống</Text>
        <View style={styles.grid}>
          {features.map((feature, index) => (
            <MotiView
              key={feature.id}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', delay: 300 + (index * 100) }}
            >
              <TouchableOpacity 
                style={styles.card}
                onPress={() => onFeatureSelect(feature.id)}
              >
                <View style={[styles.iconContainer, { backgroundColor: feature.color + '15' }]}>
                  {feature.icon}
                </View>
                <Text style={styles.cardTitle}>{feature.title}</Text>
                <Text style={styles.cardDesc}>{feature.desc}</Text>
              </TouchableOpacity>
            </MotiView>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    padding: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  statsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0f2fe',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  statsText: {
    color: '#0284c7',
    fontWeight: 'bold',
    fontSize: 13,
  },
  welcomeCard: {
    padding: 24,
    borderRadius: 28,
    marginBottom: 32,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  welcomeTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  welcomeDesc: {
    color: '#e0f2fe',
    fontSize: 15,
    marginBottom: 20,
    opacity: 0.9,
  },
  continueBtn: {
    backgroundColor: 'white',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  continueBtnText: {
    color: '#0ea5e9',
    fontWeight: 'bold',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width - 60) / 2,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 3,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 6,
    textAlign: 'center',
  },
  cardDesc: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  }
});
