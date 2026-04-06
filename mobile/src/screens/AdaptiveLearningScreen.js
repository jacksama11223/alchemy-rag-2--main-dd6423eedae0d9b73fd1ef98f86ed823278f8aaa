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
  Alert,
  Modal,
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
  ArrowLeft,
  History,
  Award,
  BookOpen,
  Layers,
  ArrowRight,
  Trash2,
  Edit3,
  Check,
  X
} from 'lucide-react-native';
import { AuthContext } from '../context/AuthContext';
import { useApiKey } from '../context/ApiKeyContext';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function AdaptiveLearningScreen() {
  const { backendToken, backendUrl } = useContext(AuthContext);
  const { apiKey } = useApiKey();
  const [step, setStep] = useState('list'); // list, create, loading, test, result, roadmap
  const [topic, setTopic] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [roadmap, setRoadmap] = useState([]);
  const [score, setScore] = useState(0);
  const [allRoadmaps, setAllRoadmaps] = useState([]);
  const [skillAchievements, setSkillAchievements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameText, setRenameText] = useState('');
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null);

  useEffect(() => {
    if (backendToken) {
      fetchAllData();
    }
  }, [backendToken]);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchRoadmaps(),
      fetchSkillAchievements()
    ]);
    setIsLoading(false);
  };

  const fetchRoadmaps = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/adaptive/all-roadmaps`, {
        headers: { Authorization: `Bearer ${backendToken}` }
      });
      const data = await res.json();
      setAllRoadmaps(data || []);
    } catch (err) {
      console.log('Failed to fetch roadmaps', err);
    }
  };

  const fetchSkillAchievements = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/gamification/skill-achievements`, {
        headers: { Authorization: `Bearer ${backendToken}` }
      });
      const data = await res.json();
      setSkillAchievements(data || []);
    } catch (err) {
      console.log('Failed to fetch skill achievements', err);
    }
  };

  const selectRoadmap = (rm) => {
    setAnalysis(rm.analysis);
    setRoadmap(rm.roadmap);
    setScore(rm.userResults?.score || 0);
    setQuestions(rm.testContent || []);
    setTopic(rm.topic);
    setStep('roadmap');
  };

  const handleRenameRoadmap = async () => {
    if (!renameText.trim()) return;
    try {
      const res = await fetch(`${backendUrl}/api/adaptive/rename-roadmap/${selectedRoadmapId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendToken}`
        },
        body: JSON.stringify({ topic: renameText })
      });
      if (res.ok) {
        Toast.show({ type: 'success', text1: 'Đã đổi tên lộ trình' });
        setIsRenaming(false);
        fetchRoadmaps();
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể đổi tên' });
    }
  };

  const handleDeleteRoadmap = (id) => {
    Alert.alert(
      'Xóa lộ trình',
      'Bạn có chắc chắn muốn xóa lộ trình này không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(`${backendUrl}/api/adaptive/roadmap/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${backendToken}` }
              });
              if (res.ok) {
                Toast.show({ type: 'success', text1: 'Đã xóa lộ trình' });
                fetchRoadmaps();
              }
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể xóa' });
            }
          }
        }
      ]
    );
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

  const renderCreateRoadmap = () => (
    <MotiView
      from={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={styles.centerContainer}
    >
      <TouchableOpacity 
        style={styles.backButtonTop}
        onPress={() => setStep('list')}
      >
        <ArrowLeft size={24} color="#1e293b" />
      </TouchableOpacity>

      <LinearGradient
        colors={['#6366f1', '#4f46e5']}
        style={styles.iconCircle}
      >
        <BrainCircuit size={40} color="white" />
      </LinearGradient>
      
      <Text style={styles.title}>Lộ trình mới</Text>
      <Text style={styles.subtitle}>
        Nhập chủ đề bạn muốn khám phá, AI sẽ xây dựng lộ trình học tập tối ưu cho riêng bạn.
      </Text>

      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Lập trình React cao cấp..."
          placeholderTextColor="#94a3b8"
          value={topic}
          onChangeText={setTopic}
        />
        <TouchableOpacity 
          style={styles.generateButton}
          onPress={handleGenerateTest}
        >
          <Sparkles size={20} color="white" />
          <Text style={styles.generateButtonText}>Bắt đầu bài đánh giá</Text>
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
          <TouchableOpacity onPress={() => setStep('list')} style={styles.backIconBtn}>
            <ArrowLeft size={20} color="#64748b" />
          </TouchableOpacity>
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
      <View style={styles.headerWithBack}>
        <TouchableOpacity onPress={() => setStep('list')}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>

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
        <TouchableOpacity onPress={() => {
          fetchAllData();
          setStep('list');
        }} style={styles.backIconBtn}>
          <ArrowLeft size={24} color="#6366f1" />
        </TouchableOpacity>
        <View style={styles.roadmapHeaderText}>
          <Text style={styles.roadmapTitle}>{topic}</Text>
          <Text style={styles.roadmapSubtitle}>Lộ trình học tập chuyên sâu</Text>
        </View>
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

  const renderList = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.listPadding}>
      <View style={styles.mainHeader}>
        <View>
          <Text style={styles.welcomeText}>Xin chào,</Text>
          <Text style={styles.mainTitle}>Lộ trình của bạn</Text>
        </View>
        <TouchableOpacity 
          style={styles.createIconButton}
          onPress={() => {
            setTopic('');
            setStep('create');
          }}
        >
          <Sparkles size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Achievement Slider */}
      <View style={styles.sectionHeader}>
        <Award size={20} color="#6366f1" />
        <Text style={styles.sectionTitle}>Thành tựu kỹ năng</Text>
      </View>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.achievementSlider}
        snapToInterval={width * 0.82}
        decelerationRate="fast"
      >
        {skillAchievements.length === 0 ? (
          <View style={styles.emptyAchiCard}>
            <Text style={styles.emptyText}>Bắt đầu học để mở khóa thành tựu!</Text>
          </View>
        ) : skillAchievements.map((skill, idx) => (
          <MotiView 
            key={idx}
            from={{ opacity: 0, translateX: 50 }}
            animate={{ opacity: 1, translateX: 0 }}
            transition={{ delay: idx * 100 }}
            style={styles.skillCard}
          >
            <View style={styles.skillCardHeader}>
              <View style={styles.skillIconBox}>
                <BookOpen size={24} color="white" />
              </View>
              <View style={styles.skillInfo}>
                <Text style={styles.skillName}>{skill.name}</Text>
                <Text style={styles.skillLevel}>Cấp độ: {skill.proficiency >= 80 ? 'Chuyên gia' : skill.proficiency >= 50 ? 'Thành thạo' : 'Đang học'}</Text>
              </View>
              <View style={styles.proficiencyBox}>
                <Text style={styles.proficiencyText}>{skill.proficiency}%</Text>
              </View>
            </View>

            <View style={styles.miniProgressBar}>
              <MotiView 
                animate={{ width: `${skill.proficiency}%` }}
                style={styles.miniProgressFill} 
              />
            </View>

            <Text style={styles.subSkillLabel}>Kỹ năng con đã học:</Text>
            <View style={styles.tagCloud}>
              {(skill.children || []).map((child, cidx) => (
                <TouchableOpacity key={cidx} style={styles.subSkillTag}>
                  <Text style={styles.subSkillText}>{child.name}</Text>
                  <View style={styles.tagProficiency}>
                    <Text style={styles.tagProficiencyText}>{child.proficiency}%</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </MotiView>
        ))}
      </ScrollView>

      {/* Roadmap List */}
      <View style={styles.sectionHeader}>
        <Layers size={20} color="#6366f1" />
        <Text style={styles.sectionTitle}>Lộ trình hiện có</Text>
      </View>

      {allRoadmaps.length === 0 ? (
        <TouchableOpacity 
          style={styles.emptyRoadmapCard}
          onPress={() => setStep('create')}
        >
          <BrainCircuit size={40} color="#94a3b8" />
          <Text style={styles.emptyRoadmapText}>Bạn chưa có lộ trình nào. Bấm để tạo ngay!</Text>
        </TouchableOpacity>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.roadmapSlider}
          snapToInterval={width * 0.82}
          decelerationRate="fast"
        >
          {allRoadmaps.map((rm, idx) => (
            <View key={rm._id || idx} style={styles.roadmapCardContainer}>
              <TouchableOpacity 
                style={styles.roadmapCard}
                onPress={() => selectRoadmap(rm)}
              >
                <LinearGradient
                  colors={['#f8fafc', '#f1f5f9']}
                  style={styles.roadmapCardInner}
                >
                  <View style={styles.roadmapCardHeader}>
                    <Text style={styles.roadmapCardTitle} numberOfLines={1}>{rm.topic}</Text>
                    <ChevronRight size={20} color="#94a3b8" />
                  </View>
                  <View style={styles.roadmapCardMeta}>
                    <View style={styles.metaItem}>
                      <Target size={12} color="#64748b" />
                      <Text style={styles.metaText}>{rm.userResults?.score}/{rm.userResults?.totalQuestions}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Calendar size={12} color="#64748b" />
                      <Text style={styles.metaText}>{new Date(rm.createdAt).toLocaleDateString('vi-VN')}</Text>
                    </View>
                  </View>
                  <View style={styles.roadmapMiniProgress}>
                    <View style={[styles.miniProgressFill, { width: '100%', opacity: 0.1 }]} />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
              
              <View style={styles.cardActions}>
                <TouchableOpacity 
                  style={styles.actionBtn}
                  onPress={() => {
                    setSelectedRoadmapId(rm._id);
                    setRenameText(rm.topic);
                    setIsRenaming(true);
                  }}
                >
                  <Edit3 size={16} color="#6366f1" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDeleteRoadmap(rm._id)}
                >
                  <Trash2 size={16} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.globalLoading}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      )}
      <AnimatePresence mode="wait">
        {step === 'list' && renderList()}
        {step === 'create' && renderCreateRoadmap()}
        {step === 'loading' && renderLoading()}
        {step === 'test' && renderTest()}
        {step === 'result' && renderResult()}
        {step === 'roadmap' && renderRoadmap()}
      </AnimatePresence>

      <Modal
        visible={isRenaming}
        transparent
        animationType="fade"
        onRequestClose={() => setIsRenaming(false)}
      >
        <View style={styles.modalOverlay}>
          <MotiView 
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Đổi tên lộ trình</Text>
            <TextInput
              style={styles.modalInput}
              value={renameText}
              onChangeText={setRenameText}
              autoFocus
              placeholder="Nhập tên mới..."
            />
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancel}
                onPress={() => setIsRenaming(false)}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalConfirm}
                onPress={handleRenameRoadmap}
              >
                <Text style={styles.confirmText}>Lưu</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        </View>
      </Modal>
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
  backButtonTop: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backIconBtn: {
    padding: 8,
    marginRight: 8,
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
    padding: 24,
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
    marginLeft: 8,
  },
  roadmapTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  roadmapSubtitle: {
    fontSize: 13,
    color: '#64748b',
  },
  dayCard: {
    flexDirection: 'row',
    marginBottom: 24,
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
    justifyContent: 'space-between',
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
  listPadding: {
    padding: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  mainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#0f172a',
  },
  createIconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1e293b',
  },
  achievementSlider: {
    paddingRight: 24,
    paddingBottom: 8,
  },
  skillCard: {
    width: width * 0.8,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    elevation: 5,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  skillCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  skillIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillInfo: {
    flex: 1,
    marginLeft: 12,
  },
  skillName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  skillLevel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  proficiencyBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proficiencyText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#6366f1',
  },
  miniProgressBar: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    marginBottom: 20,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  subSkillLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  tagCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  subSkillTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    gap: 6,
  },
  subSkillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  tagProficiency: {
    backgroundColor: '#eef2ff',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tagProficiencyText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6366f1',
  },
  emptyAchiCard: {
    width: width * 0.8,
    height: 180,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
  },
  roadmapSlider: {
    paddingRight: 24,
    paddingBottom: 20,
  },
  roadmapCardContainer: {
    width: width * 0.8,
    marginRight: 16,
  },
  roadmapCard: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  roadmapCardInner: {
    padding: 16,
  },
  roadmapCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  roadmapCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    flex: 1,
  },
  roadmapCardMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  roadmapMiniProgress: {
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  emptyRoadmapCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#f8fafc',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  emptyRoadmapText: {
    marginTop: 16,
    fontSize: 14,
    color: '#94a3b8',
    fontWeight: '600',
    textAlign: 'center',
  },
  globalLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 12,
  },
  actionBtn: {
    padding: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
  },
  deleteBtn: {
    backgroundColor: '#fef2f2',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    marginBottom: 24,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
  },
  modalConfirm: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6366f1',
    borderRadius: 12,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  confirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
  },
});
