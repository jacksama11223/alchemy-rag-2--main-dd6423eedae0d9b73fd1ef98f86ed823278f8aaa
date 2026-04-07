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
  X,
  Code as CodeIcon,
  Play,
  LogOut
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
  
  // Second Brain State
  const [secondBrainStats, setSecondBrainStats] = useState(null);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [interactiveContent, setInteractiveContent] = useState(null);
  const [isActionModalVisible, setIsActionModalVisible] = useState(false);
  const [activityStep, setActivityStep] = useState('menu'); // menu, flashcard, quiz, code, library
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [activeTermContext, setActiveTermContext] = useState({ dayIndex: null, taskIndex: null });
  const [savedSets, setSavedSets] = useState([]);
  const [isCooldown, setIsCooldown] = useState(false);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardScores, setFlashcardScores] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isFlashcardSubmitted, setIsFlashcardSubmitted] = useState(false);
  const [currentShortAnswerIndex, setCurrentShortAnswerIndex] = useState(0);
  const [shortAnswerInputs, setShortAnswerInputs] = useState({});
  const [isShortAnswerFlipped, setIsShortAnswerFlipped] = useState(false);
  const [shortAnswerScores, setShortAnswerScores] = useState([]);
  const [isShortAnswerSubmitted, setIsShortAnswerSubmitted] = useState(false);

  useEffect(() => {
    if (backendToken) {
      fetchAllData();
    }
  }, [backendToken]);

  const fetchAllData = async () => {
    setIsLoading(true);
    await Promise.all([
      fetchRoadmaps(),
      fetchSkillAchievements(),
      fetchSecondBrainStats()
    ]);
    setIsLoading(false);
  };

  const fetchSecondBrainStats = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/gamification/second-brain`, {
        headers: { Authorization: `Bearer ${backendToken}` }
      });
      const data = await res.json();
      setSecondBrainStats(data);
    } catch (err) {
      console.log('Failed to fetch brain stats', err);
    }
  };

  const fetchSavedSets = async (term) => {
    try {
      const res = await fetch(`${backendUrl}/api/adaptive/existing-modules?term=${encodeURIComponent(term)}`, {
        headers: { Authorization: `Bearer ${backendToken}` }
      });
      const data = await res.json();
      setSavedSets(data || []);
    } catch (err) {
      console.log('Failed to fetch saved modules', err);
    }
  };

  const handleOpenActionModal = (term, dayIdx, taskIdx) => {
    setSelectedTerm(term);
    setActiveTermContext({ dayIndex: dayIdx, taskIndex: taskIdx });
    setInteractiveContent(null);
    setActivityStep('menu');
    setSavedSets([]);
    setIsActionModalVisible(true);
    fetchSavedSets(term);
  };

  const handleGenerateContent = async () => {
    if (isCooldown) return;
    setIsActionLoading(true);
    setIsCooldown(true);
    
    try {
      const res = await fetch(`${backendUrl}/api/adaptive/generate-interactive-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendToken}`,
          'x-gemini-api-key': apiKey || ''
        },
        body: JSON.stringify({ term: selectedTerm })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setInteractiveContent(data);
        setIsQuizSubmitted(data.userResults?.isQuizSubmitted || false);
        setIsFlashcardSubmitted(data.userResults?.isFlashcardSubmitted || false);
        setQuizAnswers(data.userResults?.quizAnswers || {});
        setFlashcardScores(data.userResults?.flashcardScores || []);
        setShortAnswerScores(data.userResults?.shortAnswerScores || []);
        setIsShortAnswerSubmitted(data.userResults?.isShortAnswerSubmitted || false);
      } else {
        throw new Error(data.message || 'AI đang bận, vui lòng thử lại sau');
      }
    } catch (err) {
      console.error('[AI Error]', err);
      Toast.show({ 
        type: 'error', 
        text1: 'Lỗi AI', 
        text2: err.message 
      });
      setActivityStep('menu');
    } finally {
      setIsActionLoading(false);
      setTimeout(() => setIsCooldown(false), 5000);
    }
  };

  const handleGenerateMoreChallenge = async () => {
    setIsActionLoading(true);
    try {
      const res = await fetch(`${backendUrl}/api/adaptive/generate-more-challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendToken}`,
          'x-gemini-api-key': apiKey || ''
        },
        body: JSON.stringify({ term: selectedTerm, activityType: activityStep })
      });
      const data = await res.json();
      if (res.ok) {
        setInteractiveContent(data);
        Toast.show({ type: 'success', text1: 'Đã tạo thêm 5 câu hỏi khó hơn!' });
      } else {
        Toast.show({ type: 'error', text1: 'Lỗi', text2: data.message });
      }
    } catch (error) {
       console.log('Error more challenge', error);
    } finally {
       setIsActionLoading(false);
    }
  };

  const useSavedSet = (mod) => {
    // Map Unified LearningModule to the interactiveContent structure
    setInteractiveContent({
      flashcards: mod.flashcards && mod.flashcards.length > 0 ? mod.flashcards : (mod.flashcard ? [mod.flashcard] : []),
      flashcard: mod.flashcard,
      quiz: mod.quiz,
      shortAnswers: mod.shortAnswers || [],
      codeChallenge: mod.codeChallenge
    });
    setActivityStep('flashcard'); 
    setCurrentFlashcardIndex(0);
    setIsFlipped(false);
    setFlashcardScores(mod.userResults?.flashcardScores || []);
    setIsQuizSubmitted(mod.userResults?.isQuizSubmitted || false);
    setIsFlashcardSubmitted(mod.userResults?.isFlashcardSubmitted || false);
    setQuizAnswers(mod.userResults?.quizAnswers || {});
    setShortAnswerScores(mod.userResults?.shortAnswerScores || []);
    setIsShortAnswerSubmitted(mod.userResults?.isShortAnswerSubmitted || false);
  };

  const handleSubmitActivity = async (points, activityType, performanceData = null, userResultsUpdate = null) => {
    try {
      const res = await fetch(`${backendUrl}/api/adaptive/submit-activity-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${backendToken}`
        },
        body: JSON.stringify({ 
          points, 
          activityType, 
          term: selectedTerm,
          roadmapId: selectedRoadmapId,
          dayIndex: activeTermContext.dayIndex,
          taskIndex: activeTermContext.taskIndex,
          performanceData,
          userResultsUpdate
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSecondBrainStats(prev => ({
          ...prev,
          brainPower: data.brainPower,
          brainLevel: data.brainLevel
        }));
        Toast.show({ type: 'success', text1: `+${points} Brain Power!`, text2: `Cấp độ: ${data.brainLevel}` });
        setIsActionModalVisible(false);
      } else {
        const data = await res.json();
        Toast.show({ type: 'error', text1: 'Không thể cộng điểm', text2: data.message || 'Lỗi xử lý' });
      }
    } catch (err) {
      console.log('Failed to submit score', err);
    }
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
                headers: { 
                  'Authorization': `Bearer ${backendToken}`,
                  'Content-Type': 'application/json'
                }
              });
              if (res.ok) {
                Toast.show({ type: 'success', text1: 'Đã xóa lộ trình' });
                fetchRoadmaps();
              }
            } catch (err) {
              Toast.show({ type: 'error', text1: 'Lỗi kết nối' });
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
      setStep('create');
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
        fetchSecondBrainStats();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Lỗi', text2: 'Không thể nộp bài' });
      setStep('test');
    }
  };

  const getTaskColor = (proficiency) => {
    if (proficiency === null || proficiency === undefined) return { bg: '#f1f5f9', border: '#e2e8f0', text: '#64748b' };
    
    return {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#2563eb'
    };
  };

  const renderInteractiveText = (text, dayIndex, taskIndex, dayTags = []) => {
    if (!text) return null;
    
    const parts = text.split(/(\[\[.*?\]\])/g);
    const hasBrackets = text.includes('[[');

    return (
      <View style={styles.interactiveTextWrapper}>
        <View style={styles.textRow}>
          {parts.map((part, i) => {
            if (part.startsWith('[[') && part.endsWith(']]')) {
              const term = part.slice(2, -2);
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => handleOpenActionModal(term, dayIndex, taskIndex)}
                  style={styles.pillTerm}
                >
                  <Text style={styles.pillText}>{term}</Text>
                  <Sparkles size={8} color="#6366f1" />
                </TouchableOpacity>
              );
            }
            return <Text key={i} style={styles.taskText}>{part}</Text>;
          })}
        </View>
        
        {!hasBrackets && dayTags.length > 0 && (
          <View style={styles.fallbackTags}>
            {dayTags.slice(0, 2).map((tag, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleOpenActionModal(tag, dayIndex, taskIndex)}
                style={[styles.pillTerm, styles.fallbackPill]}
              >
                <Text style={[styles.pillText, styles.fallbackPillText]}>{tag}</Text>
                <ChevronRight size={10} color="#94a3b8" />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
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
      <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.iconCircle}>
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
        <TouchableOpacity style={styles.generateButton} onPress={handleGenerateTest}>
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
      <View style={styles.testContainer}>
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
        <Text style={styles.questionText}>{currentQ?.question}</Text>
        <View style={styles.optionsList}>
          {currentQ?.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => handleSelectAnswer(option)}
              style={[styles.optionButton, selectedAnswer === option && styles.optionSelected]}
            >
              <View style={[styles.optionIndicator, selectedAnswer === option && styles.optionIndicatorSelected]}>
                {selectedAnswer === option && <View style={styles.optionIndicatorDot} />}
              </View>
              <Text style={[styles.optionText, selectedAnswer === option && styles.optionTextSelected]}>{option}</Text>
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
      </View>
    );
  };

  const renderResult = () => (
    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.headerWithBack}>
        <TouchableOpacity onPress={() => setStep('list')}>
          <ArrowLeft size={24} color="#1e293b" />
        </TouchableOpacity>
      </View>
      <View style={styles.resultHeader}>
        <View style={styles.scoreCircle}>
          <Text style={styles.scoreText}>{Math.round((score / questions.length) * 100)}%</Text>
          <Trophy size={20} color="#eab308" style={styles.trophyIcon} />
        </View>
        <Text style={styles.resultTitle}>Tuyệt vời!</Text>
        <Text style={styles.aiSummary}>{analysis?.aiSummary}</Text>
      </View>
      <View style={styles.analysisGrid}>
        <View style={[styles.analysisCard, styles.strongCard]}>
          <View style={styles.cardHeader}><Target size={16} color="#059669" /><Text style={styles.cardLabel}>THẾ MẠNH</Text></View>
          <View style={styles.tagList}>
            {analysis?.strong_tags.map(tag => <Text key={tag} style={styles.strongTag}>#{tag}</Text>)}
          </View>
        </View>
        <View style={[styles.analysisCard, styles.weakCard]}>
          <View style={styles.cardHeader}><AlertCircle size={16} color="#e11d48" /><Text style={styles.cardLabel}>CẦN CẢI THIỆN</Text></View>
          <View style={styles.tagList}>
            {analysis?.weak_tags.map(tag => <Text key={tag} style={styles.weakTag}>#{tag}</Text>)}
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.mainButton} onPress={() => setStep('roadmap')}>
        <Text style={styles.mainButtonText}>Xem lộ trình tối ưu</Text>
        <ArrowRight size={20} color="white" />
      </TouchableOpacity>
    </ScrollView>
  );

  const renderRoadmap = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.roadmapPadding}>
      <View style={styles.roadmapHeader}>
        <TouchableOpacity onPress={() => { fetchAllData(); setStep('list'); }} style={styles.backIconBtn}>
          <ArrowLeft size={24} color="#6366f1" />
        </TouchableOpacity>
        <View style={styles.roadmapHeaderText}>
          <Text style={styles.roadmapTitle}>{topic}</Text>
          <Text style={styles.roadmapSubtitle}>Lộ trình học tập chuyên sâu</Text>
        </View>
      </View>

      <View style={styles.roadmapProgressSection}>
        <View style={styles.progressLabelRow}>
          <Text style={styles.progressLabel}>Tiến độ hoàn thành</Text>
          <Text style={styles.progressPercent}>
            {Math.round((roadmap.reduce((acc, day) => 
               acc + (day.taskStats?.filter(s => s.proficiency === 100).length || 0), 0) / 
               roadmap.reduce((acc, day) => acc + (day.tasks?.length || 0), 0)) * 100) || 0}%
          </Text>
        </View>
        <View style={styles.roadmapProgressBarBg}>
          <MotiView 
            animate={{ width: `${(roadmap.reduce((acc, day) => 
              acc + (day.taskStats?.filter(s => s.proficiency === 100).length || 0), 0) / 
              roadmap.reduce((acc, day) => acc + (day.tasks?.length || 0), 0)) * 100 || 0}%` }}
            style={styles.roadmapProgressBarFill} 
          />
        </View>
      </View>

      {roadmap.map((day, idx) => (
        <MotiView key={idx} from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: idx * 100 }} style={styles.dayCard}>
          <View style={styles.dayBadge}>
             {day.taskStats?.filter(s => s.proficiency === 100).length === day.tasks?.length ? (
                <Check size={16} color="white" />
             ) : (
                <Text style={styles.dayNumber}>{day.day}</Text>
             )}
          </View>
          <View style={styles.dayContent}>
            <Text style={styles.dayTitle}>{day.title}</Text>
            {day.tasks.map((task, tidx) => {
              const stat = day.taskStats?.find(s => s.taskIndex === tidx);
              const proficiency = stat?.proficiency;
              const isMastered = proficiency === 100;
              const { bg, border, text: textColor } = getTaskColor(proficiency);
              
              const firstTag = day.tags?.[0] || 'Kiến thức mới';
              
              return (
                <TouchableOpacity 
                  key={tidx} 
                  activeOpacity={0.7}
                  onPress={() => {
                    const match = task.match(/\[\[(.*?)\]\]/);
                    const termToStudy = match ? match[1] : firstTag;
                    handleOpenActionModal(termToStudy, idx, tidx);
                  }}
                  style={[
                    styles.taskItem, 
                    { backgroundColor: bg, borderColor: border, borderWidth: 1 }
                  ]}
                >
                  <View style={styles.taskLabelRow}>
                    <CheckCircle2 size={16} color={isMastered ? "#10b981" : "#cbd5e1"} />
                    {proficiency !== undefined && (
                       <Text style={[styles.percentageText, { color: textColor }]}>{proficiency}%</Text>
                    )}
                  </View>
                  <View style={styles.taskTextContainer}>
                    {renderInteractiveText(task, idx, tidx, day.tags)}
                  </View>
                  {isMastered && <View style={styles.masteredBadge}><Check size={10} color="white" /></View>}
                </TouchableOpacity>
              );
            })}
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
      <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.summaryFooter}>
        <View><Text style={styles.footerLabel}>TIẾN ĐỘ</Text><Text style={styles.footerVal}>Năng lượng: {Math.round((score / questions.length) * 100)}%</Text></View>
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
        <TouchableOpacity style={styles.createIconButton} onPress={() => { setTopic(''); setStep('create'); }}>
          <Sparkles size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Brain Dashboard */}
      <MotiView from={{ opacity: 0, translateY: -20 }} animate={{ opacity: 1, translateY: 0 }} style={styles.brainDashboard}>
        <LinearGradient colors={['#1e293b', '#0f172a']} style={styles.brainCard}>
          <View style={styles.brainCardHeader}>
            <View style={styles.brainIconCircle}><BrainCircuit size={24} color="#6366f1" /></View>
            <View style={styles.brainInfo}>
              <Text style={styles.brainLevelLabel}>Tư duy cấp độ</Text>
              <Text style={styles.brainLevelName}>{secondBrainStats?.brainLevel || 'Novice'}</Text>
            </View>
            <View style={styles.brainPowerBadge}><Sparkles size={14} color="#eab308" /><Text style={styles.brainPowerText}>{secondBrainStats?.brainPower || 0}</Text></View>
          </View>
          <View style={styles.brainProgressContainer}>
            <View style={styles.brainProgressBar}>
              <MotiView animate={{ width: `${(( (secondBrainStats?.brainPower || 0) % 500) / 500) * 100}%` }} style={styles.brainProgressFill} />
            </View>
            <Text style={styles.brainProgressText}>{500 - ((secondBrainStats?.brainPower || 0) % 500)} Power nữa để lên cấp</Text>
          </View>
          <View style={styles.topSkillsRow}>
            {(secondBrainStats?.topSkills || []).map((skill, idx) => (
              <View key={idx} style={styles.topSkillTag}><Check size={12} color="#10b981" /><Text style={styles.topSkillText}>{skill}</Text></View>
            ))}
          </View>
        </LinearGradient>
      </MotiView>

      <View style={styles.sectionHeader}><Award size={20} color="#6366f1" /><Text style={styles.sectionTitle}>Thành tựu kỹ năng</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementSlider} snapToInterval={width * 0.82} decelerationRate="fast">
        {skillAchievements.length === 0 ? (
          <View style={styles.emptyAchiCard}><Text style={styles.emptyText}>Bắt đầu học để mở khóa thành tựu!</Text></View>
        ) : skillAchievements.map((skill, idx) => (
          <MotiView key={idx} from={{ opacity: 0, translateX: 50 }} animate={{ opacity: 1, translateX: 0 }} transition={{ delay: idx * 100 }} style={styles.skillCard}>
            <View style={styles.skillCardHeader}>
              <View style={styles.skillIconBox}><BookOpen size={24} color="white" /></View>
              <View style={styles.skillInfo}><Text style={styles.skillName}>{skill.name}</Text><Text style={styles.skillLevel}>Cấp độ: {skill.proficiency >= 80 ? 'Chuyên gia' : skill.proficiency >= 50 ? 'Thành thạo' : 'Đang học'}</Text></View>
              <View style={styles.proficiencyBox}><Text style={styles.proficiencyText}>{skill.proficiency}%</Text></View>
            </View>
            <View style={styles.miniProgressBar}><MotiView animate={{ width: `${skill.proficiency}%` }} style={styles.miniProgressFill} /></View>
            <Text style={styles.subSkillLabel}>Kỹ năng con đã học:</Text>
            <View style={styles.tagCloud}>
              {(skill.children || []).map((child, cidx) => (
                <TouchableOpacity key={cidx} style={styles.subSkillTag}><Text style={styles.subSkillText}>{child.name}</Text><View style={styles.tagProficiency}><Text style={styles.tagProficiencyText}>{child.proficiency}%</Text></View></TouchableOpacity>
              ))}
            </View>
          </MotiView>
        ))}
      </ScrollView>

      <View style={styles.sectionHeader}><Layers size={20} color="#6366f1" /><Text style={styles.sectionTitle}>Lộ trình hiện có</Text></View>
      {allRoadmaps.length === 0 ? (
        <TouchableOpacity style={styles.emptyRoadmapCard} onPress={() => setStep('create')}><BrainCircuit size={40} color="#94a3b8" /><Text style={styles.emptyRoadmapText}>Bạn chưa có lộ trình nào. Bấm để tạo ngay!</Text></TouchableOpacity>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.roadmapSlider} snapToInterval={width * 0.82} decelerationRate="fast">
          {allRoadmaps.map((rm, idx) => (
            <View key={rm._id || idx} style={styles.roadmapCardContainer}>
              <TouchableOpacity style={styles.roadmapCard} onPress={() => selectRoadmap(rm)}>
                <LinearGradient colors={['#f8fafc', '#f1f5f9']} style={styles.roadmapCardInner}>
                  <View style={styles.roadmapCardHeader}><Text style={styles.roadmapCardTitle} numberOfLines={1}>{rm.topic}</Text><ChevronRight size={20} color="#94a3b8" /></View>
                  <View style={styles.roadmapCardMeta}>
                    <View style={styles.metaItem}><Target size={12} color="#64748b" /><Text style={styles.metaText}>{rm.userResults?.score}/{rm.userResults?.totalQuestions}</Text></View>
                    <View style={styles.metaItem}><Calendar size={12} color="#64748b" /><Text style={styles.metaText}>{new Date(rm.createdAt).toLocaleDateString('vi-VN')}</Text></View>
                  </View>
                  <View style={styles.roadmapMiniProgress}><View style={[styles.miniProgressFill, { width: '100%', opacity: 0.1 }]} /></View>
                </LinearGradient>
              </TouchableOpacity>
              <View style={styles.cardActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => { setSelectedRoadmapId(rm._id || rm.id); setRenameText(rm.topic); setIsRenaming(true); }}><Edit3 size={16} color="#6366f1" /></TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => handleDeleteRoadmap(rm._id || rm.id)}><Trash2 size={16} color="#ef4444" /></TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </ScrollView>
  );

  const renderActionModal = () => (
    <Modal visible={isActionModalVisible} transparent animationType="fade" onRequestClose={() => setIsActionModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.actionModal, { minHeight: 450, maxHeight: '90%' }]}>
          <View style={styles.actionHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.actionLabel}>Chủ đề: {selectedTerm}</Text>
              <Text style={styles.actionTitle}>
                {activityStep === 'menu' ? 'Học tập thông minh' : 
                 activityStep === 'flashcard' ? 'Flashcard' : 
                 activityStep === 'quiz' ? 'Kiểm tra nhanh' : 
                 activityStep === 'library' ? 'Bộ thẻ đã học' : 'Thử thách Code'}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setIsActionModalVisible(false)} style={styles.closeBtn}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          {isActionLoading ? (
            <View style={styles.actionLoading}>
              <ActivityIndicator size="large" color="#6366f1" />
              <LogOut size={40} color="#e2e8f0" style={{ position: 'absolute', opacity: 0.1 }} />
              <Text style={styles.loadingText}>AI đang phân tích kiến thức...</Text>
            </View>
          ) : (
            <View style={{ flex: 1, paddingBottom: 20 }}>
              {activityStep === 'menu' && (
                <View style={{ flex: 1 }}>
                  <View style={styles.menuGrid}>
                    <TouchableOpacity 
                      disabled={isCooldown}
                      style={[styles.menuItem, isCooldown && { opacity: 0.5 }]} 
                      onPress={() => { setActivityStep('flashcard'); setCurrentFlashcardIndex(0); setIsFlipped(false); setFlashcardScores([]); handleGenerateContent(); }}
                    >
                      <LinearGradient colors={['#6366f1', '#4f46e5']} style={styles.menuIcon}><BookOpen size={24} color="white" /></LinearGradient>
                      <Text style={styles.menuText}>Flashcard AI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      disabled={isCooldown}
                      style={[styles.menuItem, isCooldown && { opacity: 0.5 }]} 
                      onPress={() => { setActivityStep('quiz'); setQuizAnswers({}); setIsQuizSubmitted(false); handleGenerateContent(); }}
                    >
                      <LinearGradient colors={['#10b981', '#059669']} style={styles.menuIcon}><Target size={24} color="white" /></LinearGradient>
                      <Text style={styles.menuText}>Bài Quiz</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      disabled={isCooldown}
                      style={[styles.menuItem, isCooldown && { opacity: 0.5 }]} 
                      onPress={() => { setActivityStep('short_answer'); setCurrentShortAnswerIndex(0); setShortAnswerInput(''); setIsShortAnswerFlipped(false); setShortAnswerScores([]); handleGenerateContent(); }}
                    >
                      <LinearGradient colors={['#8b5cf6', '#7c3aed']} style={styles.menuIcon}><BookOpen size={24} color="white" /></LinearGradient>
                      <Text style={styles.menuText}>Tự Luận</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      disabled={isCooldown}
                      style={[styles.menuItem, isCooldown && { opacity: 0.5 }]} 
                      onPress={() => { setActivityStep('code'); handleGenerateContent(); }}
                    >
                      <LinearGradient colors={['#f59e0b', '#d97706']} style={styles.menuIcon}><CodeIcon size={24} color="white" /></LinearGradient>
                      <Text style={styles.menuText}>Ghi Code</Text>
                    </TouchableOpacity>
                  </View>

                  {savedSets.length > 0 && (
                    <View style={styles.libraryPreview}>
                      <View style={styles.libHeader}>
                        <Layers size={14} color="#6366f1" />
                        <Text style={styles.libTitle}>Bộ thẻ đã lưu ({savedSets.length})</Text>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {savedSets.map((mod, sid) => (
                          <TouchableOpacity key={sid} style={styles.libCard} onPress={() => useSavedSet(mod)}>
                            <Text style={styles.libCardText} numberOfLines={2}>{mod.flashcard?.front || mod.term}</Text>
                            <View style={styles.libCardFooter}>
                               <BookOpen size={10} color="#94a3b8" />
                               <Text style={styles.libBadgeText}>Full Module</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              )}

              {activityStep === 'flashcard' && (interactiveContent?.flashcards?.length > 0 || interactiveContent?.flashcard) && (() => {
                const flashcards = interactiveContent?.flashcards?.length > 0 ? interactiveContent.flashcards : [interactiveContent.flashcard];
                const currentFC = flashcards[currentFlashcardIndex];
                if (!currentFC) return null;
                return (
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60 }}>
                    <View style={styles.flashcardContainer}>
                        <Text style={styles.fcProgressText}>Thẻ {currentFlashcardIndex + 1} / {flashcards.length}</Text>
                        <TouchableOpacity 
                          activeOpacity={0.9} 
                          onPress={() => setIsFlipped(!isFlipped)} 
                          style={styles.flashcardRateBlock}
                        >
                          {!isFlipped ? (
                            <MotiView from={{ opacity: 0, rotateY: '90deg' }} animate={{ opacity: 1, rotateY: '0deg' }} style={styles.fcSide}>
                                <Text style={styles.fcLabel}>MẶT TRƯỚC (Chạm để lật)</Text>
                                <Text style={[styles.fcFront, {textAlign: 'center'}]}>{currentFC.front}</Text>
                            </MotiView>
                          ) : (
                            <MotiView from={{ opacity: 0, rotateY: '-90deg' }} animate={{ opacity: 1, rotateY: '0deg' }} style={styles.fcSide}>
                                <Text style={styles.fcLabel}>MẶT SAU</Text>
                                <Text style={[styles.fcBack, {textAlign: 'center'}]}>{currentFC.back}</Text>
                            </MotiView>
                          )}
                        </TouchableOpacity>
                    </View>

                    {isFlipped && (
                      <View style={styles.fcRatingContainer}>
                          <Text style={styles.fcRatingLabel}>Mức độ hiểu bài của bạn:</Text>
                          <View style={styles.fcRatingButtons}>
                            {[25, 50, 75, 100].map(level => {
                              const isSelected = flashcardScores[currentFlashcardIndex] === level;
                              return (
                              <TouchableOpacity 
                                key={level} 
                                style={[styles.fcRateBtn, { 
                                  backgroundColor: level === 100 ? '#10b981' : level === 75 ? '#3b82f6' : level === 50 ? '#f59e0b' : '#ef4444',
                                  borderWidth: isSelected ? 3 : 0,
                                  borderColor: isSelected ? '#1e293b' : 'transparent',
                                  transform: [{ scale: isSelected ? 1.1 : 1 }]
                                }]}
                                onPress={() => {
                                  if (!isFlashcardSubmitted) {
                                    const newScores = [...flashcardScores];
                                    newScores[currentFlashcardIndex] = level;
                                    setFlashcardScores(newScores);
                                    if (currentFlashcardIndex < flashcards.length - 1) {
                                        setCurrentFlashcardIndex(currentFlashcardIndex + 1);
                                        setIsFlipped(false);
                                    }
                                  }
                                }}
                              >
                                  <Text style={styles.fcRateText}>{level}%</Text>
                              </TouchableOpacity>
                            )})}
                          </View>
                      </View>
                    )}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 }}>
                      <TouchableOpacity onPress={() => { setCurrentFlashcardIndex(Math.max(0, currentFlashcardIndex - 1)); setIsFlipped(false); }} style={{ padding: 10, opacity: currentFlashcardIndex === 0 ? 0.3 : 1 }} disabled={currentFlashcardIndex === 0}>
                         <ArrowLeft size={24} color="#6366f1" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setCurrentFlashcardIndex(Math.min(flashcards.length - 1, currentFlashcardIndex + 1)); setIsFlipped(false); }} style={{ padding: 10, opacity: currentFlashcardIndex === flashcards.length - 1 ? 0.3 : 1 }} disabled={currentFlashcardIndex === flashcards.length - 1}>
                         <ArrowRight size={24} color="#6366f1" />
                      </TouchableOpacity>
                    </View>

                    {!isFlashcardSubmitted ? (
                       flashcardScores.length >= flashcards.length && (
                         <TouchableOpacity style={[styles.submitAciBtn, {backgroundColor: '#10b981', marginTop: 10}]} onPress={() => {
                            setIsFlashcardSubmitted(true);
                            const avg = flashcardScores.reduce((a,b) => a+b, 0) / flashcardScores.length;
                            const points = Math.round(30 * (avg / 100));
                            handleSubmitActivity(points, 'flashcard', { metrics: { proficiency: avg } }, { flashcardScores, isFlashcardSubmitted: true });
                         }}>
                            <Text style={styles.submitAciText}>Hoàn Thành Ghi Nhớ Thẻ</Text>
                         </TouchableOpacity>
                       )
                    ) : (
                       <View>
                         <TouchableOpacity style={[styles.submitAciBtn, {marginTop: 10}]} onPress={() => { setIsActionModalVisible(false); fetchAllData(); }}>
                            <Text style={styles.submitAciText}>Lưu & Trở về lộ trình</Text>
                         </TouchableOpacity>
                         <TouchableOpacity style={[styles.submitAciBtn, {backgroundColor: '#f59e0b', marginTop: 12}]} onPress={handleGenerateMoreChallenge}>
                            <Text style={styles.submitAciText}>Tạo 5 thẻ khó hơn (+5)</Text>
                         </TouchableOpacity>
                       </View>
                    )}
                   </ScrollView>
                );
              })()}

              {activityStep === 'quiz' && interactiveContent?.quiz && (
                 <ScrollView style={{ flex: 1 }}>
                    {interactiveContent.quiz.map((q, idx) => {
                      const selected = quizAnswers[idx];
                      return (
                      <View key={idx} style={styles.miniQuizItem}>
                        <Text style={styles.mqText}>{q.question}</Text>
                        <View style={styles.mqOptions}>
                          {q.options.map((opt, oidx) => {
                            let isCorrect = false;
                            let isWrong = false;
                            if (isQuizSubmitted) {
                               if (opt === q.correctAnswer) isCorrect = true;
                               if (selected === opt && opt !== q.correctAnswer) isWrong = true;
                            }
                            return (
                            <TouchableOpacity key={oidx} style={[styles.mqOption,
                                selected === opt && { borderColor: '#6366f1', borderWidth: 2 },
                                isCorrect && { backgroundColor: '#d1fae5', borderColor: '#10b981' },
                                isWrong && { backgroundColor: '#fee2e2', borderColor: '#ef4444' }
                            ]} onPress={() => {
                              if (!isQuizSubmitted) {
                                setQuizAnswers({...quizAnswers, [idx]: opt});
                              }
                            }}>
                              <Text style={styles.mqOptionText}>{opt}</Text>
                            </TouchableOpacity>
                          )})}
                        </View>
                        {isQuizSubmitted && selected !== q.correctAnswer && (
                          <Text style={{fontSize: 12, color: '#ef4444', marginTop: 8}}>Giải thích: {q.explanation}</Text>
                        )}
                      </View>
                    )})}
                    {!isQuizSubmitted ? (
                      <TouchableOpacity style={styles.submitAciBtn} onPress={() => setIsQuizSubmitted(true)}>
                         <Text style={styles.submitAciText}>Kiểm tra đáp án</Text>
                      </TouchableOpacity>
                    ) : (
                      <View>
                        <TouchableOpacity style={styles.submitAciBtn} onPress={() => {
                          let correctCount = 0;
                          let mistakes = [];
                          interactiveContent.quiz.forEach((q, idx) => {
                              if (quizAnswers[idx] === q.correctAnswer) correctCount++;
                              else mistakes.push(q.question);
                          });
                          const proficiency = Math.round((correctCount / interactiveContent.quiz.length) * 100);
                          const points = Math.round(50 * (proficiency / 100));
                          handleSubmitActivity(points, 'quiz', {
                             metrics: { proficiency, mistakes: mistakes.join('; ') }
                          }, {
                             isQuizSubmitted: true,
                             quizAnswers: quizAnswers
                          });
                        }}>
                           <Text style={styles.submitAciText}>Hoàn thành Quiz (+{Math.round(50 * (Object.values(quizAnswers).filter((ans, idx) => ans === interactiveContent.quiz[idx].correctAnswer).length / interactiveContent.quiz.length))} Power)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.submitAciBtn, {backgroundColor: '#f59e0b', marginTop: 12}]} onPress={handleGenerateMoreChallenge}>
                           <Text style={styles.submitAciText}>Tạo 5 bài Quiz khó hơn (+5)</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.submitAciBtn, {marginTop: 12}]} onPress={() => { setIsActionModalVisible(false); fetchAllData(); }}>
                           <Text style={styles.submitAciText}>Lưu & Trở về lộ trình</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                 </ScrollView>
              )}

              {activityStep === 'short_answer' && interactiveContent?.shortAnswers && interactiveContent.shortAnswers.length > 0 && (() => {
                const saArray = interactiveContent.shortAnswers;
                const currentSA = saArray[currentShortAnswerIndex];
                if (!currentSA) return null;
                return (
                  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60 }}>
                    <View style={styles.flashcardContainer}>
                        <Text style={styles.fcProgressText}>Câu hỏi {currentShortAnswerIndex + 1} / {saArray.length}</Text>
                        <View style={styles.flashcardRateBlock}>
                           <Text style={styles.fcLabel}>CÂU HỎI TỰ LUẬN</Text>
                           <Text style={[styles.fcFront, {marginBottom: 20}]}>{currentSA.question}</Text>
                           
                           {!isShortAnswerFlipped ? (
                              <View>
                                 <TextInput 
                                   style={[styles.input, {backgroundColor: '#fff', minHeight: 80, borderColor: '#e2e8f0', borderWidth: 1, borderRadius: 12}]} 
                                   multiline 
                                   placeholder="Nhập câu trả lời của bạn..." 
                                   value={shortAnswerInputs[currentShortAnswerIndex] || ''}
                                   onChangeText={(t) => setShortAnswerInputs({...shortAnswerInputs, [currentShortAnswerIndex]: t})}
                                 />
                                 <TouchableOpacity style={styles.submitAciBtn} onPress={() => setIsShortAnswerFlipped(true)}>
                                   <Text style={styles.submitAciText}>Xem đáp án</Text>
                                 </TouchableOpacity>
                              </View>
                           ) : (
                              <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }}>
                                 <View style={styles.fcDivider} />
                                 <Text style={styles.fcLabel}>ĐÁP ÁN ĐÚNG</Text>
                                 <Text style={styles.fcBack}>{currentSA.answer}</Text>
                                 <View style={styles.fcDivider} />
                                 <Text style={styles.fcLabel}>GIẢI THÍCH</Text>
                                 <Text style={[styles.fcBack, {fontSize: 14}]}>{currentSA.explanation}</Text>
                              </MotiView>
                           )}
                        </View>
                    </View>

                    {isShortAnswerFlipped && (
                      <View style={styles.fcRatingContainer}>
                          <Text style={styles.fcRatingLabel}>Độ chính xác của bạn:</Text>
                          <View style={styles.fcRatingButtons}>
                            {[25, 50, 75, 100].map(level => {
                              const isSelected = shortAnswerScores[currentShortAnswerIndex] === level;
                              return (
                              <TouchableOpacity 
                                key={level} 
                                style={[styles.fcRateBtn, { 
                                  backgroundColor: level === 100 ? '#10b981' : level === 75 ? '#3b82f6' : level === 50 ? '#f59e0b' : '#ef4444',
                                  borderWidth: isSelected ? 3 : 0,
                                  borderColor: isSelected ? '#1e293b' : 'transparent',
                                  transform: [{ scale: isSelected ? 1.1 : 1 }]
                                }]}
                                onPress={() => {
                                  if (!isShortAnswerSubmitted) {
                                    const newScores = [...shortAnswerScores];
                                    newScores[currentShortAnswerIndex] = level;
                                    setShortAnswerScores(newScores);
                                    if (currentShortAnswerIndex < saArray.length - 1) {
                                        setCurrentShortAnswerIndex(currentShortAnswerIndex + 1);
                                        setIsShortAnswerFlipped(false);
                                    }
                                  }
                                }}
                              >
                                  <Text style={styles.fcRateText}>{level}%</Text>
                              </TouchableOpacity>
                            )})}
                          </View>
                      </View>
                    )}
                    
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginTop: 10 }}>
                      <TouchableOpacity onPress={() => { setCurrentShortAnswerIndex(Math.max(0, currentShortAnswerIndex - 1)); setIsShortAnswerFlipped(false); }} style={{ padding: 10, opacity: currentShortAnswerIndex === 0 ? 0.3 : 1 }} disabled={currentShortAnswerIndex === 0}>
                         <ArrowLeft size={24} color="#6366f1" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => { setCurrentShortAnswerIndex(Math.min(saArray.length - 1, currentShortAnswerIndex + 1)); setIsShortAnswerFlipped(false); }} style={{ padding: 10, opacity: currentShortAnswerIndex === saArray.length - 1 ? 0.3 : 1 }} disabled={currentShortAnswerIndex === saArray.length - 1}>
                         <ArrowRight size={24} color="#6366f1" />
                      </TouchableOpacity>
                    </View>

                    {!isShortAnswerSubmitted ? (
                       shortAnswerScores.length >= saArray.length && (
                         <TouchableOpacity style={[styles.submitAciBtn, {backgroundColor: '#10b981', marginTop: 10}]} onPress={() => {
                            setIsShortAnswerSubmitted(true);
                            const avg = shortAnswerScores.reduce((a,b) => a+b, 0) / shortAnswerScores.length;
                            const points = Math.round(50 * (avg / 100)); 
                            handleSubmitActivity(points, 'short_answer', {
                               metrics: { proficiency: avg, mistakes: avg < 50 ? 'Cần ôn lại tự luận' : 'Không có gì' }
                            }, { shortAnswerScores, isShortAnswerSubmitted: true });
                         }}>
                            <Text style={styles.submitAciText}>Hoàn Thành Làm Bài Tự Luận</Text>
                         </TouchableOpacity>
                       )
                    ) : (
                       <View>
                         <TouchableOpacity style={[styles.submitAciBtn, {marginTop: 10}]} onPress={() => { setIsActionModalVisible(false); fetchAllData(); }}>
                            <Text style={styles.submitAciText}>Lưu & Trở về lộ trình</Text>
                         </TouchableOpacity>
                         <TouchableOpacity style={[styles.submitAciBtn, {backgroundColor: '#f59e0b', marginTop: 12}]} onPress={handleGenerateMoreChallenge}>
                            <Text style={styles.submitAciText}>Tạo 5 tự luận khó hơn (+5)</Text>
                         </TouchableOpacity>
                       </View>
                    )}
                  </ScrollView>
                );
              })()}

              {activityStep === 'code' && interactiveContent?.codeChallenge && (
                <View style={styles.codeView}>
                   <View style={styles.codeHeader}>
                      <CodeIcon size={18} color="#6366f1" />
                      <Text style={styles.codeTitle}>Thử thách logic</Text>
                   </View>
                   <Text style={styles.codeProblem}>{interactiveContent.codeChallenge.problem}</Text>
                   <View style={styles.codeBlock}>
                      <Text style={styles.codeText}>{interactiveContent.codeChallenge.startCode}</Text>
                   </View>
                   <TouchableOpacity style={styles.submitAciBtn} onPress={() => handleSubmitActivity(100, 'code', {
                      metrics: { proficiency: 100, mistakes: 'Không có' }
                   })}>
                      <Text style={styles.submitAciText}>Nộp bài giải (+100 Power)</Text>
                   </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {activityStep !== 'menu' && (
            <TouchableOpacity style={styles.backToMenu} onPress={() => setActivityStep('menu')}>
               <ArrowLeft size={14} color="#64748b" />
               <Text style={styles.backToMenuText}>Quay lại menu</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {isLoading && <View style={styles.globalLoading}><ActivityIndicator size="large" color="#6366f1" /></View>}
      <AnimatePresence mode="wait">
        {step === 'list' && renderList()}
        {step === 'create' && renderCreateRoadmap()}
        {step === 'loading' && renderLoading()}
        {step === 'test' && renderTest()}
        {step === 'result' && renderResult()}
        {step === 'roadmap' && renderRoadmap()}
      </AnimatePresence>
      {renderActionModal()}

      <Modal visible={isRenaming} transparent animationType="fade" onRequestClose={() => setIsRenaming(false)}>
        <View style={styles.modalOverlay}>
          <MotiView from={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đổi tên lộ trình</Text>
            <TextInput style={styles.modalInput} value={renameText} onChangeText={setRenameText} autoFocus placeholder="Nhập tên mới..." />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setIsRenaming(false)}><Text style={styles.cancelText}>Hủy</Text></TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleRenameRoadmap}><Text style={styles.confirmText}>Lưu</Text></TouchableOpacity>
            </View>
          </MotiView>
        </View>
      </Modal>
      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scrollContainer: { padding: 24, paddingTop: 60 },
  centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  backButtonTop: { position: 'absolute', top: 60, left: 24, zIndex: 10 },
  headerWithBack: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  backIconBtn: { padding: 8, marginRight: 8 },
  iconCircle: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 24, elevation: 8, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10 },
  title: { fontSize: 28, fontWeight: '800', color: '#1e293b', marginBottom: 12 },
  subtitle: { fontSize: 16, color: '#64748b', textAlign: 'center', lineHeight: 24, marginBottom: 32 },
  inputWrapper: { width: '100%', backgroundColor: '#f8fafc', borderRadius: 20, padding: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  input: { padding: 16, fontSize: 16, color: '#1e293b' },
  generateButton: { backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 16, gap: 8 },
  generateButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  testContainer: { flex: 1, padding: 24, paddingTop: 60 },
  progressHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  progressText: { fontSize: 12, fontWeight: '800', color: '#6366f1', width: 80 },
  progressBarBg: { flex: 1, height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, overflow: 'hidden' },
  progressBarFill: { height: '100%', backgroundColor: '#6366f1' },
  questionText: { fontSize: 22, fontWeight: '700', color: '#0f172a', lineHeight: 32, marginBottom: 32 },
  optionsList: { gap: 12 },
  optionButton: { flexDirection: 'row', alignItems: 'center', padding: 18, backgroundColor: '#f8fafc', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  optionSelected: { borderColor: '#6366f1', backgroundColor: '#eef2ff' },
  optionIndicator: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#cbd5e1', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  optionIndicatorSelected: { borderColor: '#6366f1', backgroundColor: '#6366f1' },
  optionIndicatorDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  optionText: { fontSize: 16, color: '#475569', fontWeight: '500', flex: 1 },
  optionTextSelected: { color: '#1e1b4b', fontWeight: '600' },
  nextButton: { backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, gap: 8, marginTop: 'auto', marginBottom: 20, elevation: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  buttonDisabled: { backgroundColor: '#e2e8f0' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  resultHeader: { alignItems: 'center', marginBottom: 40 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: '#eef2ff', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  scoreText: { fontSize: 32, fontWeight: '900', color: '#6366f1' },
  trophyIcon: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#fff', borderRadius: 15, padding: 4 },
  resultTitle: { fontSize: 24, fontWeight: '800', color: '#0f172a', marginBottom: 8 },
  aiSummary: { fontSize: 14, color: '#64748b', textAlign: 'center', fontStyle: 'italic', paddingHorizontal: 20 },
  analysisGrid: { gap: 16, marginBottom: 32 },
  analysisCard: { padding: 16, borderRadius: 20, borderWidth: 1 },
  strongCard: { backgroundColor: '#ecfdf5', borderColor: '#d1fae5' },
  weakCard: { backgroundColor: '#fff1f2', borderColor: '#ffe4e6' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  cardLabel: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  tagList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  strongTag: { fontSize: 12, fontWeight: '600', color: '#059669', backgroundColor: 'rgba(5, 150, 105, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  weakTag: { fontSize: 12, fontWeight: '600', color: '#e11d48', backgroundColor: 'rgba(225, 29, 72, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  mainButton: { backgroundColor: '#6366f1', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 16, gap: 8 },
  mainButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  roadmapPadding: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  roadmapHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  roadmapHeaderText: { flex: 1, marginLeft: 8 },
  roadmapTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a' },
  roadmapSubtitle: { fontSize: 13, color: '#64748b' },
  dayCard: { flexDirection: 'row', marginBottom: 24 },
  dayBadge: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#fff', borderWidth: 2, borderColor: '#6366f1', alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  dayNumber: { fontSize: 12, fontWeight: '900', color: '#6366f1' },
  dayContent: { flex: 1, marginLeft: 16, backgroundColor: '#f8fafc', borderRadius: 20, padding: 16, borderWidth: 1, borderColor: '#f1f5f9' },
  dayTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  taskItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  taskTextContainer: { flex: 1 },
  taskText: { fontSize: 13, color: '#475569', lineHeight: 18 },
  resourceList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  resourceLink: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  resourceText: { fontSize: 10, fontWeight: '700', color: '#6366f1' },
  summaryFooter: { marginTop: 20, padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  footerLabel: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  footerVal: { fontSize: 18, fontWeight: '900', color: '#fff' },
  listPadding: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  mainHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  welcomeText: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  mainTitle: { fontSize: 24, fontWeight: '900', color: '#0f172a' },
  createIconButton: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginTop: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#1e293b' },
  achievementSlider: { paddingRight: 24, paddingBottom: 8 },
  skillCard: { width: width * 0.8, backgroundColor: '#fff', borderRadius: 24, padding: 20, marginRight: 16, borderWidth: 1, borderColor: '#f1f5f9', elevation: 5, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 12 },
  skillCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  skillIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  skillInfo: { flex: 1, marginLeft: 12 },
  skillName: { fontSize: 16, fontWeight: '800', color: '#0f172a' },
  skillLevel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  proficiencyBox: { backgroundColor: '#f1f5f9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  proficiencyText: { fontSize: 14, fontWeight: '900', color: '#6366f1' },
  miniProgressBar: { height: 6, backgroundColor: '#f1f5f9', borderRadius: 3, marginBottom: 20, overflow: 'hidden' },
  miniProgressFill: { height: '100%', backgroundColor: '#6366f1' },
  subSkillLabel: { fontSize: 12, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  tagCloud: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subSkillTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#f1f5f9', gap: 6 },
  subSkillText: { fontSize: 11, fontWeight: '700', color: '#475569' },
  tagProficiency: { backgroundColor: '#eef2ff', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 4 },
  tagProficiencyText: { fontSize: 9, fontWeight: '800', color: '#6366f1' },
  emptyAchiCard: { width: width * 0.8, height: 180, backgroundColor: '#f8fafc', borderRadius: 24, alignItems: 'center', justifyContent: 'center', borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0' },
  emptyText: { fontSize: 14, color: '#94a3b8', fontWeight: '600' },
  roadmapSlider: { paddingRight: 24, paddingBottom: 20 },
  roadmapCardContainer: { width: width * 0.8, marginRight: 16 },
  roadmapCard: { borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#f1f5f9', backgroundColor: '#fff', elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  roadmapCardInner: { padding: 16 },
  roadmapCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  roadmapCardTitle: { fontSize: 16, fontWeight: '800', color: '#0f172a', flex: 1 },
  roadmapCardMeta: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  roadmapMiniProgress: { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' },
  emptyRoadmapCard: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: '#f8fafc', borderRadius: 24, borderStyle: 'dashed', borderWidth: 2, borderColor: '#e2e8f0' },
  emptyRoadmapText: { marginTop: 16, fontSize: 14, color: '#94a3b8', fontWeight: '600', textAlign: 'center' },
  globalLoading: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 12 },
  actionBtn: { padding: 8, backgroundColor: '#f1f5f9', borderRadius: 10 },
  deleteBtn: { backgroundColor: '#fef2f2' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 20 },
  modalInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, padding: 16, fontSize: 16, color: '#1e293b', marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12 },
  modalCancel: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', borderRadius: 12 },
  modalConfirm: { flex: 1, padding: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#6366f1', borderRadius: 12 },
  cancelText: { fontSize: 14, fontWeight: '700', color: '#64748b' },
  confirmText: { fontSize: 14, fontWeight: '700', color: '#fff' },

  // New Styles
  brainDashboard: { marginBottom: 24 },
  brainCard: { borderRadius: 24, padding: 20, elevation: 8, shadowColor: '#6366f1', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
  brainCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  brainIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(99, 102, 241, 0.2)', alignItems: 'center', justifyContent: 'center' },
  brainInfo: { flex: 1, marginLeft: 12 },
  brainLevelLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: '700', textTransform: 'uppercase' },
  brainLevelName: { fontSize: 20, color: '#fff', fontWeight: '900' },
  brainPowerBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 4 },
  brainPowerText: { fontSize: 16, color: '#fff', fontWeight: '800' },
  brainProgressContainer: { marginBottom: 16 },
  brainProgressBar: { height: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  brainProgressFill: { height: '100%', backgroundColor: '#6366f1' },
  brainProgressText: { fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: '600' },
  topSkillsRow: { flexDirection: 'row', gap: 8 },
  topSkillTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(16, 185, 129, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, gap: 4, borderWidth: 1, borderColor: 'rgba(16, 185, 129, 0.2)' },
  topSkillText: { fontSize: 10, color: '#10b981', fontWeight: '700' },

  interactiveTerm: { color: '#6366f1', fontWeight: '700', textDecorationLine: 'underline' },
  
  actionModal: { backgroundColor: '#fff', width: '100%', borderRadius: 32, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: -10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  actionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 },
  actionLabel: { fontSize: 12, color: '#64748b', fontWeight: '700', textTransform: 'uppercase' },
  actionTitle: { fontSize: 22, color: '#0f172a', fontWeight: '900', marginTop: 4 },
  closeBtn: { padding: 8, backgroundColor: '#f8fafc', borderRadius: 12 },
  actionLoading: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  loadingText: { marginTop: 16, fontSize: 14, color: '#64748b', fontWeight: '600' },
  
  menuGrid: { flexDirection: 'row', gap: 16 },
  menuItem: { flex: 1, alignItems: 'center', gap: 12 },
  menuIcon: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  menuText: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  
  flashcardView: { gap: 20 },
  flashcardContainer: { width: '100%', alignItems: 'center' },
  fcProgressText: { fontSize: 13, color: '#64748b', fontWeight: '800', marginBottom: 12 },
  flashcardRateBlock: { width: '100%', backgroundColor: '#f8fafc', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 180 },
  fcSide: { width: '100%', minHeight: 140, justifyContent: 'center' },
  fcRatingContainer: { marginTop: 10, padding: 16, backgroundColor: '#f1f5f9', borderRadius: 20, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  fcRatingLabel: { fontSize: 13, color: '#475569', fontWeight: '700', marginBottom: 16 },
  fcRatingButtons: { flexDirection: 'row', gap: 12, width: '100%', justifyContent: 'space-between' },
  fcRateBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  fcRateText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  flashcard: { backgroundColor: '#f8fafc', padding: 24, borderRadius: 24, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 180 },
  fcLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  fcFront: { fontSize: 18, color: '#1e293b', fontWeight: '700', marginBottom: 16 },
  fcDivider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
  fcBack: { fontSize: 16, color: '#475569', lineHeight: 24 },
  
  submitAciBtn: { backgroundColor: '#6366f1', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  submitAciText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  
  miniQuizItem: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e2e8f0' },
  mqText: { fontSize: 15, fontWeight: '700', color: '#1e293b', marginBottom: 12 },
  mqOptions: { gap: 8 },
  mqOption: { backgroundColor: '#fff', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#e2e8f0' },
  mqOptionText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  
  codeView: { gap: 16 },
  codeHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  codeTitle: { fontSize: 16, fontWeight: '800', color: '#1e293b' },
  codeProblem: { fontSize: 14, color: '#475569', lineHeight: 20 },
  codeBlock: { backgroundColor: '#1e293b', padding: 16, borderRadius: 16 },
  codeText: { color: '#fbbf24', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  
  backToMenu: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24, paddingVertical: 10 },
  backToMenuText: { fontSize: 13, color: '#64748b', fontWeight: '600' },
  
  masteredLabel: { fontSize: 10, color: '#10b981', fontWeight: '800', marginLeft: 'auto', backgroundColor: '#ecfdf5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  roadmapProgressSection: { marginBottom: 32, backgroundColor: '#f8fafc', padding: 16, borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  progressLabel: { fontSize: 13, color: '#64748b', fontWeight: '700' },
  progressPercent: { fontSize: 14, color: '#6366f1', fontWeight: '900' },
  roadmapProgressBarBg: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  roadmapProgressBarFill: { height: '100%', backgroundColor: '#6366f1' },
  
  interactiveTextWrapper: { width: '100%' },
  textRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  pillTerm: { 
    backgroundColor: '#eff6ff', 
    paddingHorizontal: 10, 
    paddingVertical: 4, 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: '#dbeafe',
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 2,
    gap: 4,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pillText: { fontSize: 13, fontWeight: '800', color: '#1e40af' },
  fallbackTags: { flexDirection: 'row', marginTop: 8, gap: 8 },
  fallbackPill: { backgroundColor: '#f8fafc', borderColor: '#e2e8f0', borderWidth: 1 },
  fallbackPillText: { color: '#64748b', fontSize: 11 },
  taskItemMastered: { backgroundColor: 'rgba(16, 185, 129, 0.05)', padding: 8, borderRadius: 12, marginHorizontal: -8 },
  masteredBadge: { width: 16, height: 16, borderRadius: 8, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  taskLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  percentageText: { fontSize: 10, fontWeight: '900' },
  libraryPreview: { marginTop: 24, padding: 16, backgroundColor: '#f8fafc', borderRadius: 16, borderTopWidth: 1, borderTopColor: '#e2e8f0' },
  libHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  libTitle: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  libCard: { backgroundColor: 'white', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', width: 140, marginRight: 10, justifyContent: 'space-between' },
  libCardText: { fontSize: 11, color: '#475569', marginBottom: 8, lineHeight: 14 },
  libCardFooter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  libBadgeText: { fontSize: 9, color: '#94a3b8', fontWeight: 'bold' }
});
