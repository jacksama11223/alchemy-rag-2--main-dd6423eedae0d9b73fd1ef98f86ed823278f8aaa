import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
} from 'react-native';
import { MotiView, AnimatePresence } from 'moti';
import { LinearGradient } from 'expo-linear-gradient';
import {
  BrainCircuit,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Trophy,
  Target,
  AlertCircle,
  Calendar,
  ExternalLink,
  RefreshCcw,
  TrendingUp,
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useApiKey } from '../context/ApiKeyContext';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function AdaptiveLearningScreen() {
  const { backendToken, backendUrl } = useContext(AuthContext);
  const { apiKey } = useApiKey();
  const [step, setStep] = useState('input'); // input, loading, test, result, roadmap
  const [topic, setTopic] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [score, setScore] = useState(0);

  useEffect(() => {
    fetchLatestRoadmap();
  }, []);

  const fetchLatestRoadmap = async () => {
    try {
      if (!backendToken) return;
      const res = await fetch(`${backendUrl}/api/adaptive/roadmap`, {
        headers: { 
          Authorization: `Bearer ${backendToken}`,
          'x-gemini-api-key': apiKey || ''
        }
      });
      const data = await res.json();
      if (data) {
        setAnalysis(data.analysis);
        setRoadmap(data.roadmap);
        setScore(data.userResults?.score || 0);
        setTopic(data.topic);
        setStep('roadmap');
      }
    } catch (err) {
      console.log('Failed to fetch latest roadmap', err);
    }
  };

  const handleGenerateTest = async () => {
    if (!topic.trim()) {
      Toast.show({ type: 'error', text1: 'Vui lòng nhập chủ đề' });
      return;
    }

    setStep('loading');
    try {
      const res = await fetch(`${backendUrl}/api/adaptive/generate-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendToken}`,
          'x-gemini-api-key': apiKey || ''
        },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      if (res.ok) {
        setSessionId(data.sessionId);
        setQuestions(data.testContent);
        setStep('test');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể tạo bài test' });
      setStep('input');
    }
  };

  const handleSelectAnswer = (answer) => {
    const newAnswers = [...userAnswers];
    const existingIndex = newAnswers.findIndex(a => a.questionIndex === currentQuestionIndex);
    if (existingIndex >= 0) {
      newAnswers[existingIndex].selectedAnswer = answer;
    } else {
      newAnswers.push({ questionIndex: currentQuestionIndex, selectedAnswer: answer });
    }
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmitTest();
    }
  };

  const handleSubmitTest = async () => {
    setStep('loading');
    try {
      const res = await fetch(`${backendUrl}/api/adaptive/submit-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendToken}`,
          'x-gemini-api-key': apiKey || ''
        },
        body: JSON.stringify({ sessionId, answers: userAnswers })
      });
      const data = await res.json();
      if (res.ok) {
        setScore(data.score);
        setAnalysis(data.analysis);
        setRoadmap(data.roadmap);
        setStep('result');
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể nộp bài' });
      setStep('test');
    }
  };

  const renderInput = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.centerContainer}
    >
      <LinearGradient
        colors={['#6366f1', '#4f46e5']}
        style={styles.iconCircle}
      >
        <BrainCircuit size={40} color="white" />
      </LinearGradient>
      
      <Text style={styles.title}>Học tập Thích ứng</Text>
      <Text style={styles.subtitle}>
        AI sẽ tạo lộ trình riêng cho bạn dựa trên kho kiến thức cá nhân.
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Bạn muốn học về chủ đề gì?"
          placeholderTextColor="#94a3b8"
          value={topic}
          onChangeText={setTopic}
        />
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateTest}
        >
          <Sparkles size={20} color="white" />
          <Text style={styles.generateButtonText}>Bắt đầu ngay</Text>
        </TouchableOpacity>
      </View>
    </MotiView>
  );

  const renderLoading = () => (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color="#6366f1" />
      <Text style={[styles.subtitle, { marginTop: 20 }]}>AI đang chuẩn bị nội dung kiến thức...</Text>
    </View>
  );

  const renderTest = () => {
    const currentQ = questions[currentQuestionIndex];
    const selectedAnswer = userAnswers.find(a => a.questionIndex === currentQuestionIndex)?.selectedAnswer;

    return (
      <MotiView
        from={{ opacity: 0, translateX: 50 }}
        animate={{ opacity: 1, translateX: 0 }}
        style={styles.testContainer}
      >
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>Câu {currentQuestionIndex + 1}/{questions.length}</Text>
          <View style={styles.progressBarBg}>
            <MotiView 
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              style={styles.progressBarFill} 
            />
          </View>
        </View>

        <Text style={styles.questionText}>{currentQ.question}</Text>

        <View style={styles.optionsList}>
          {currentQ.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSelectAnswer(option)}
              style={[
                styles.optionButton,
                selectedAnswer === option && styles.optionSelected
              ]}
            >
              <View style={[
                styles.optionIndicator,
                selectedAnswer === option && styles.optionIndicatorSelected
              ]}>
                {selectedAnswer === option && <View style={styles.optionIndicatorDot} />}
              </View>
              <Text style={[
                styles.optionText,
                selectedAnswer === option && styles.optionTextSelected
              ]}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleNextQuestion}
          disabled={!selectedAnswer}
          style={[styles.nextButton, !selectedAnswer && styles.buttonDisabled]}
        >
          <Text style={styles.nextButtonText}>
            {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
          </Text>
          <ChevronRight size={20} color="white" />
        </TouchableOpacity>
      </MotiView>
    );
  };

  const renderResult = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <MotiView
        from={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        style={styles.resultHeader}
      >
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{Math.round((score / questions.length) * 100)}%</Text>
          <Trophy size={20} color="#eab308" style={styles.trophyIcon} />
        </View>
        <Text style={styles.resultTitle}>Tuyệt vời!</Text>
        <Text style={styles.aiSummary}>{analysis?.aiSummary}</Text>
      </MotiView>

      <View style={styles.analysisGrid}>
        <View style={[styles.analysisCard, styles.strongCard]}>
          <View style={styles.cardHeader}>
            <Target size={16} color="#059669" />
            <Text style={styles.cardLabel}>THẾ MẠNH</Text>
          </View>
          <View style={styles.tagList}>
            {analysis?.strong_tags.map(tag => (
              <Text key={tag} style={styles.strongTag}>#{tag}</Text>
            ))}
          </View>
        </View>

        <View style={[styles.analysisCard, styles.weakCard]}>
          <View style={styles.cardHeader}>
            <AlertCircle size={16} color="#e11d48" />
            <Text style={styles.cardLabel}>CẦN CẢI THIỆN</Text>
          </View>
          <View style={styles.tagList}>
            {analysis?.weak_tags.map(tag => (
              <Text key={tag} style={styles.weakTag}>#{tag}</Text>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity 
        style={styles.mainButton}
        onPress={() => setStep('roadmap')}
      >
        <Text style={styles.mainButtonText}>Xem lộ trình tối ưu</Text>
        <ArrowRight size={20} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderRoadmap = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.roadmapPadding}>
      <View style={styles.roadmapHeader}>
        <Calendar size={24} color="#6366f1" />
        <View style={styles.roadmapHeaderText}>
          <Text style={styles.roadmapTitle}>{topic}</Text>
          <Text style={styles.roadmapSubtitle}>Lộ trình học tập 7 ngày tới</Text>
        </View>
        <TouchableOpacity onPress={() => setStep('input')} style={styles.refreshBtn}>
          <RefreshCcw size={20} color="#94a3b8" />
        </TouchableOpacity>
      </View>

      {roadmap.map((day, idx) => (
        <MotiView
          key={idx}
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ delay: idx * 100 }}
          style={styles.dayCard}
        >
          <View style={styles.dayBadge}>
            <Text style={styles.dayNumber}>{day.day}</Text>
          </View>
          
          <View style={styles.dayContent}>
            <Text style={styles.dayTitle}>{day.title}</Text>
            {day.tasks.map((task, tidx) => (
              <View key={tidx} style={styles.taskItem}>
                <CheckCircle2 size={14} color="#10b981" />
                <Text style={styles.taskText}>{task}</Text>
              </View>
            ))}
            
            <View style={styles.resourceList}>
              {day.resources.map((res, ridx) => (
                <TouchableOpacity key={ridx} style={styles.resourceLink}>
                  <ExternalLink size={12} color="#6366f1" />
                  <Text style={styles.resourceText}>{res.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </MotiView>
      ))}

      <LinearGradient
        colors={['#6366f1', '#4f46e5']}
        style={styles.summaryFooter}
      >
        <View>
          <Text style={styles.footerLabel}>TIẾN ĐỘ</Text>
          <Text style={styles.footerVal}>Năng lượng: {Math.round((score / questions.length) * 100)}%</Text>
        </View>
        <TrendingUp size={24} color="white" />
      </LinearGradient>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <AnimatePresence mode="wait">
        {step === 'input' && renderInput()}
        {step === 'loading' && renderLoading()}
        {step === 'test' && renderTest()}
        {step === 'result' && renderResult()}
        {step === 'roadmap' && renderRoadmap()}
      </AnimatePresence>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 24,
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1e293b',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  inputWrapper: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
  },
  generateButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  testContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6366f1',
    width: 80,
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  questionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 32,
    marginBottom: 32,
  },
  optionsList: {
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  optionSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  optionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionIndicatorSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#6366f1',
  },
  optionIndicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
    flex: 1,
  },
  optionTextSelected: {
    color: '#1e1b4b',
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
    marginTop: 'auto',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  scoreCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 8,
    borderColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#6366f1',
  },
  trophyIcon: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 4,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
  },
  aiSummary: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
  analysisGrid: {
    gap: 16,
    marginBottom: 32,
  },
  analysisCard: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  strongCard: {
    backgroundColor: '#ecfdf5',
    borderColor: '#d1fae5',
  },
  weakCard: {
    backgroundColor: '#fff1f2',
    borderColor: '#ffe4e6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  strongTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    backgroundColor: 'rgba(5, 150, 105, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  weakTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e11d48',
    backgroundColor: 'rgba(225, 29, 72, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mainButton: {
    backgroundColor: '#6366f1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 8,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  roadmapPadding: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  roadmapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  roadmapHeaderText: {
    flex: 1,
    marginLeft: 16,
  },
  roadmapTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0f172a',
  },
  roadmapSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  refreshBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  dayCard: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dayBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6366f1',
  },
  dayContent: {
    flex: 1,
    marginLeft: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 12,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  taskText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    flex: 1,
  },
  resourceList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  resourceLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resourceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6366f1',
  },
  summaryFooter: {
    marginTop: 20,
    padding: 20,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
  },
  footerLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 1,
  },
  footerVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
  },
});
