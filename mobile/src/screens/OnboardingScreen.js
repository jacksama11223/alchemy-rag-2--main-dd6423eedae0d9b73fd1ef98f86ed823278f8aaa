import React, { useState, useRef, useContext } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Database, BrainCircuit, Layers, ArrowRight } from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Thu thập tri thức',
    description: 'Lưu trữ mọi thứ từ văn bản, hình ảnh, giọng nói đến link bài viết vào kho dữ liệu cá nhân của bạn.',
    icon: Database,
    color: '#6366F1',
  },
  {
    id: '2',
    title: 'Giả Kim Thuật AI',
    description: 'Sử dụng sức mạnh của Gemini AI để tự động tóm tắt, trích xuất và tạo thẻ nhớ từ dữ liệu thô.',
    icon: BrainCircuit,
    color: '#8B5CF6',
  },
  {
    id: '3',
    title: 'Ôn tập thông minh',
    description: 'Học tập hiệu quả hơn với thuật toán Lặp lại ngắt quãng (Spaced Repetition) và Sơ đồ tri thức.',
    icon: Layers,
    color: '#10B981',
  }
];

export default function OnboardingScreen() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const { completeOnboarding } = useContext(AuthContext);

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollToNext = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      completeOnboarding();
    }
  };

  const renderItem = ({ item, index }) => {
    const Icon = item.icon;
    return (
      <View style={styles.slide}>
        <MotiView
          from={{ opacity: 0, translateY: 50 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'spring', delay: 200 }}
          style={[styles.iconContainer, { shadowColor: item.color }]}
        >
          <LinearGradient colors={[item.color, item.color + '80']} style={styles.iconGradient}>
            <Icon color="#FFF" size={60} strokeWidth={1.5} />
          </LinearGradient>
        </MotiView>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  const Paginator = () => {
    return (
      <View style={styles.paginatorContainer}>
        {slides.map((_, i) => {
          const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [10, 30, 10],
            extrapolate: 'clamp',
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });
          const backgroundColor = scrollX.interpolate({
            inputRange,
            outputRange: ['#94A3B8', slides[i].color, '#94A3B8'],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={i.toString()}
              style={[styles.dot, { width: dotWidth, opacity, backgroundColor }]}
            />
          );
        })}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#F8FAFC', '#EEF2FF']} style={styles.background} />
      
      <View style={styles.skipContainer}>
        <TouchableOpacity onPress={completeOnboarding}>
          <Text style={styles.skipText}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 3 }}>
        <FlatList
          data={slides}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.bottomContainer}>
        <Paginator />
        
        <TouchableOpacity style={styles.button} onPress={scrollToNext} activeOpacity={0.8}>
          <LinearGradient 
            colors={currentIndex === slides.length - 1 ? ['#10B981', '#059669'] : ['#6366F1', '#4F46E5']} 
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          >
            <Text style={styles.buttonText}>
              {currentIndex === slides.length - 1 ? 'Bắt đầu ngay' : 'Tiếp tục'}
            </Text>
            <ArrowRight color="#FFF" size={20} />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  background: { position: 'absolute', width, height },
  skipContainer: { marginTop: 60, paddingHorizontal: 20, alignItems: 'flex-end' },
  skipText: { fontSize: 16, color: '#64748B', fontWeight: '600' },
  slide: { width, alignItems: 'center', padding: 20, paddingTop: 40 },
  iconContainer: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 15,
    backgroundColor: '#FFF',
  },
  iconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: width * 0.35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: { alignItems: 'center', paddingHorizontal: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#0F172A', marginBottom: 15, textAlign: 'center' },
  description: { fontSize: 16, color: '#475569', textAlign: 'center', lineHeight: 24 },
  bottomContainer: { flex: 1, justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 50 },
  paginatorContainer: { flexDirection: 'row', height: 40, justifyContent: 'center', alignItems: 'center' },
  dot: { height: 10, borderRadius: 5, marginHorizontal: 6 },
  button: { width: '100%', height: 60, borderRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 15, elevation: 5 },
  buttonGradient: { flex: 1, flexDirection: 'row', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  buttonText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginRight: 10 },
});
