import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  ExternalLink, 
  ArrowLeft,
  Trophy,
  AlertCircle,
  Calendar,
  BookOpen,
  Target,
  LayoutDashboard
} from 'lucide-react';
import axios from 'axios';

interface Resource {
  title: string;
  link: string;
  type: string;
}

interface RoadmapItem {
  day: number;
  title: string;
  tasks: string[];
  resources: Resource[];
  isCompleted: boolean;
}

interface Question {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  tags: string[];
}

interface Analysis {
  weak_tags: string[];
  strong_tags: string[];
  aiSummary: string;
}

interface AdaptiveLearningProps {
  onBack: () => void;
}

const API_BASE = '/api/adaptive';

const AdaptiveLearningRoadmap: React.FC<AdaptiveLearningProps> = ({ onBack }) => {
  const [step, setStep] = useState<'start' | 'loading' | 'quiz' | 'results' | 'roadmap'>('start');
  const [topic, setTopic] = useState('');
  const [loadingStatus, setLoadingStatus] = useState('Đang khởi tạo AI...');
  const [testContent, setTestContent] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [results, setResults] = useState<{ score: number; total: number; analysis: Analysis } | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapItem[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Load existing roadmap on mount
  useEffect(() => {
    const fetchExisting = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${API_BASE}/roadmap`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data) {
          setRoadmap(res.data.roadmap);
          setResults({ 
            score: res.data.userResults.score, 
            total: res.data.userResults.totalQuestions, 
            analysis: res.data.analysis 
          });
          setStep('roadmap');
        }
      } catch (err) {
        console.log('No existing roadmap found');
      }
    };
    fetchExisting();
  }, []);

  const handleStartGeneration = async () => {
    if (!topic.trim()) return;
    setStep('loading');
    setLoadingStatus('Đang phân tích chủ đề...');
    
    try {
      const token = localStorage.getItem('token');
      
      const logs = [
        'Đang truy xuất kiến thức liên quan từ RAG...',
        'Đang thiết lập môi trường Gemini 1.5...',
        'Đang biên soạn câu hỏi kiểm tra năng lực...',
        'Hoàn tất! Sẵn sàng bắt đầu bài đánh giá.'
      ];

      for (const log of logs) {
        setLoadingStatus(log);
        await new Promise(r => setTimeout(r, 800));
      }

      const res = await axios.post(`${API_BASE}/generate-test`, { topic }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTestContent(res.data.testContent);
      setSessionId(res.data.sessionId);
      setStep('quiz');
    } catch (err) {
      alert('Không thể khởi tạo lộ trình. Vui lòng thử lại.');
      setStep('start');
    }
  };

  const handleSelectAnswer = (answer: string) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestionIndex] = { questionIndex: currentQuestionIndex, selectedAnswer: answer };
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex < testContent.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit
      setStep('loading');
      setLoadingStatus('AI đang chấm điểm và phân tích lỗ hổng kiến thức...');
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post(`${API_BASE}/submit-test`, { 
          sessionId, 
          answers: userAnswers 
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setResults({ score: res.data.score, total: res.data.totalQuestions, analysis: res.data.analysis });
        setRoadmap(res.data.roadmap);
        
        setLoadingStatus('Đang thiết kế lộ trình 7 ngày riêng cho bạn...');
        await new Promise(r => setTimeout(r, 1500));
        setStep('results');
      } catch (err) {
        alert('Lỗi khi nộp bài. Vui lòng thử lại.');
        setStep('quiz');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white pt-24 pb-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header Navigation */}
        <div className="flex items-center gap-4 mb-12">
          <button 
            onClick={onBack}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
              Lộ trình thích ứng <span className="text-rose-500">AI</span>
            </h1>
            <p className="text-slate-400 text-sm font-medium">Hệ thống tự động thiết kế con đường học tập tối ưu</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* STEP 1: START */}
          {step === 'start' && (
            <motion.div 
              key="start"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid gap-12 md:grid-cols-2 items-center"
            >
              <div className="space-y-8">
                <div className="space-y-4">
                  <span className="px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-black uppercase tracking-widest">
                    Công nghệ Adaptive Learning
                  </span>
                  <h2 className="text-5xl font-black leading-tight tracking-tight">
                    Bạn muốn chinh phục <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Kiến thức nào?</span>
                  </h2>
                  <p className="text-slate-400 leading-relaxed max-w-md">
                    Nhập chủ đề bạn đang nghiên cứu. AI sẽ tạo bài kiểm tra năng lực, phân tích lỗ hổng và xây dựng lộ trình 7 ngày chi tiết dành riêng cho bạn.
                  </p>
                </div>

                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-rose-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
                  <div className="relative bg-slate-900 border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input 
                        type="text"
                        placeholder="VD: Lập trình ReactJS nâng cao, Machine Learning..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartGeneration()}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold"
                      />
                    </div>
                    <button 
                      onClick={handleStartGeneration}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
                    >
                      Bắt đầu kiến tạo <Search className="w-4 h-4 text-amber-300" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-slate-500">
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span className="text-xs font-bold">Phân tích sâu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    <span className="text-xs font-bold">Đánh giá chuẩn</span>
                  </div>
                   <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span className="text-xs font-bold">Lộ trình 7 ngày</span>
                  </div>
                </div>
              </div>

              <div className="hidden md:block relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-rose-500/20 blur-3xl rounded-full animate-pulse" />
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] shadow-2xl"
                >
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <LayoutDashboard className="w-6 h-6" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-2 w-32 bg-white/10 rounded-full" />
                        <div className="h-2 w-20 bg-white/5 rounded-full" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-12 w-full bg-white/5 rounded-2xl border border-white/5 flex items-center px-4 gap-3">
                          <div className="w-4 h-4 rounded-full border border-white/20" />
                          <div className="h-2 w-2/3 bg-white/10 rounded-full" />
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: LOADING */}
          {step === 'loading' && (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center space-y-8"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl animate-pulse" />
                <div className="w-24 h-24 border-4 border-white/10 border-t-blue-500 rounded-full animate-spin" />
                <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black tracking-tight">{loadingStatus}</h3>
                <p className="text-slate-500 font-medium">Hệ thống đang xử lý dữ liệu phức hợp...</p>
              </div>
            </motion.div>
          )}

          {/* STEP 3: QUIZ */}
          {step === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-3xl mx-auto space-y-12"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-rose-500 text-xs font-black uppercase tracking-widest">Đánh giá năng lực</p>
                  <h3 className="text-2xl font-black">Câu hỏi {currentQuestionIndex + 1}/{testContent.length}</h3>
                </div>
                <div className="flex gap-1">
                  {testContent.map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-1.5 w-8 rounded-full transition-all ${
                        i === currentQuestionIndex ? 'bg-blue-500' : 
                        i < currentQuestionIndex ? 'bg-emerald-500' : 'bg-white/10'
                      }`} 
                    />
                  ))}
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
                <div className="p-8 md:p-12 space-y-8">
                  <p className="text-xl font-bold leading-relaxed text-slate-100">
                    {testContent[currentQuestionIndex].question}
                  </p>

                  <div className="grid gap-4">
                    {testContent[currentQuestionIndex].options.map((option, idx) => (
                      <button 
                        key={idx}
                        onClick={() => handleSelectAnswer(option)}
                        className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 font-bold flex items-center justify-between group ${
                          userAnswers[currentQuestionIndex]?.selectedAnswer === option
                          ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                          : 'bg-white/5 border-white/10 hover:border-white/30 text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{option}</span>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          userAnswers[currentQuestionIndex]?.selectedAnswer === option
                          ? 'bg-blue-500 border-blue-400'
                          : 'border-white/20'
                        }`}>
                          {userAnswers[currentQuestionIndex]?.selectedAnswer === option && <CheckCircle className="w-4 h-4 text-white" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="px-8 py-6 bg-white/5 border-t border-white/10 flex justify-end">
                  <button 
                    onClick={handleNextQuestion}
                    disabled={!userAnswers[currentQuestionIndex]}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase text-sm tracking-widest transition-all flex items-center gap-2"
                  >
                    {currentQuestionIndex === testContent.length - 1 ? 'Hoàn tất & Chấm điểm' : 'Tiếp theo'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: RESULTS */}
          {step === 'results' && results && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center size-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 mb-4">
                  <Trophy className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">Phân tích kết quả</h2>
                <div className="flex justify-center items-baseline gap-2">
                  <span className="text-6xl font-black text-rose-500">{results.score}</span>
                  <span className="text-2xl text-slate-500 font-bold">/ {results.total}</span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] space-y-6">
                  <h4 className="font-black uppercase tracking-widest text-xs text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Điểm yếu cần chú ý
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {results.analysis.weak_tags.map((tag, i) => (
                      <span key={i} className="px-4 py-2 bg-rose-500/10 text-rose-400 rounded-xl text-xs font-bold border border-rose-500/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    AI đã nhận diện các lỗ hổng trên dựa trên sai sót của bài test. Lộ trình của bạn sẽ tập trung sâu vào các mảng này.
                  </p>
                </div>

                <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] space-y-6">
                  <h4 className="font-black uppercase tracking-widest text-xs text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Kỹ năng đã thành thạo
                  </h4>
                   <div className="flex flex-wrap gap-2">
                    {results.analysis.strong_tags.map((tag, i) => (
                      <span key={i} className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold border border-emerald-500/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Các mảng kiến thức này bạn đã nắm vững, AI sẽ lồng ghép ôn tập thay vì giới thiệu lại từ đầu.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setStep('roadmap')}
                className="w-full py-5 bg-white text-slate-900 rounded-3xl font-black uppercase text-sm tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-4 group"
              >
                Khám phá lộ trình cá nhân hóa
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {/* STEP 5: ROADMAP */}
          {step === 'roadmap' && (
            <motion.div 
              key="roadmap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                      <Target className="w-5 h-5" />
                    </div>
                    <h2 className="text-4xl font-black tracking-tight uppercase">Bản đồ học tập 7 ngày</h2>
                  </div>
                  <p className="text-slate-400 font-medium max-w-xl leading-relaxed">
                    Được thiết kế dưạ trên năng lực thực tế. Hãy chinh phục từng cột mốc để nắm vững chủ đề này.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <div className="px-6 py-4 bg-white/5 rounded-2xl border border-white/10 text-center">
                    <p className="text-[10px] font-black text-rose-500 uppercase mb-1">Tiến độ</p>
                    <p className="text-xl font-black">20%</p>
                  </div>
                  <button 
                  onClick={() => setStep('start')}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 font-bold text-sm transition-all flex items-center gap-2">
                    <Search className="w-4 h-4 text-amber-300" />
                    Tạo lộ trình mới
                  </button>
                </div>
              </div>

              <div className="grid gap-12 relative">
                {/* Connecting Line */}
                <div className="absolute left-[39px] top-0 bottom-0 w-px bg-gradient-to-b from-blue-500 via-rose-500 to-emerald-500 opacity-20 hidden md:block" />

                {roadmap.map((day, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col md:flex-row gap-8 relative group"
                  >
                    {/* Day Marker */}
                    <div className="flex-shrink-0 relative z-10 hidden md:block mt-2">
                      <div className="size-20 rounded-3xl bg-[#0f172a] border border-white/10 shadow-2xl flex flex-col items-center justify-center group-hover:scale-110 transition-transform duration-500">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Day</span>
                        <span className="text-3xl font-black text-blue-500">0{day.day}</span>
                      </div>
                    </div>

                    {/* Content Card */}
                    <div className="flex-1 bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:bg-white/[0.08] transition-all duration-300 group/card shadow-xl group-hover:border-white/20">
                      <div className="flex flex-col lg:flex-row justify-between gap-8">
                        <div className="flex-1 space-y-6">
                          <div className="space-y-1">
                            <div className="flex items-center gap-3 md:hidden mb-2">
                               <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-[10px] font-black uppercase">Day 0{day.day}</span>
                            </div>
                            <h3 className="text-2xl font-black text-slate-100 group-hover/card:text-white transition-colors">{day.title}</h3>
                          </div>
                          
                          <div className="space-y-3">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
                              {/* <Clock className="w-3 h-3" /> Nhiệm vụ cần hoàn thành */}
                            </p>
                            <div className="grid gap-2">
                              {day.tasks.map((task, tidx) => (
                                <div key={tidx} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 font-medium text-sm text-slate-300">
                                  <div className="mt-1 w-4 h-4 rounded-md border border-white/20 flex-shrink-0" />
                                  {task}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="w-full lg:w-72 space-y-6">
                           <div className="p-6 bg-slate-900/50 rounded-2xl border border-white/10 space-y-4">
                              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen className="w-3 h-3" /> Học liệu được AI chọn lọc
                              </h4>
                              <div className="space-y-3">
                                {day.resources.map((res, ridx) => (
                                  <a 
                                    key={ridx}
                                    href={res.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-between p-3 bg-white/5 hover:bg-blue-500/20 border border-white/5 hover:border-blue-500/30 rounded-xl transition-all group/link"
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-xs font-bold text-slate-300 group-hover/link:text-blue-300">{res.title}</span>
                                      <span className="text-[9px] font-black text-slate-500 uppercase tracking-tighter">{res.type}</span>
                                    </div>
                                    <ExternalLink className="w-3 h-3 text-slate-600 group-hover/link:text-blue-500" />
                                  </a>
                                ))}
                              </div>
                           </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdaptiveLearningRoadmap;
