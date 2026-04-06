import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  BrainCircuit, 
  AlertCircle,
  ChevronRight,
  TrendingUp,
  Target,
  Calendar,
  ExternalLink,
  ChevronLeft,
  RefreshCcw,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';

interface Resource {
  title: string;
  link: string;
  type: string;
}

interface RoadmapDay {
  day: number;
  title: string;
  tasks: string[];
  resources: Resource[];
  isCompleted: boolean;
}

interface TestQuestion {
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

export function AdaptiveLearningRoadmap() {
  const [step, setStep] = useState<'input' | 'loading' | 'test' | 'result' | 'roadmap'>('input');
  const [topic, setTopic] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<{ questionIndex: number, selectedAnswer: string }[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapDay[]>([]);
  const [score, setScore] = useState(0);

  // Fetch latest roadmap on mount
  useEffect(() => {
    fetchLatestRoadmap();
  }, []);

  const fetchLatestRoadmap = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiKey = localStorage.getItem('custom_gemini_api_key');
      if (!token) return;

      const res = await fetch('/api/adaptive/roadmap', {
        headers: { 
          Authorization: `Bearer ${token}`,
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
      console.error('Failed to fetch latest roadmap', err);
    }
  };

  const handleGenerateTest = async () => {
    if (!topic.trim()) {
      toast.error('Vui lòng nhập chủ đề');
      return;
    }

    setStep('loading');
    try {
      const token = localStorage.getItem('token');
      const apiKey = localStorage.getItem('custom_gemini_api_key');
      const res = await fetch('/api/adaptive/generate-test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-gemini-api-key': apiKey || ''
        },
        body: JSON.stringify({ topic })
      });
      
      if (!res.ok) throw new Error('Failed to generate test');
      
      const data = await res.json();
      setSessionId(data.sessionId);
      setQuestions(data.testContent);
      setStep('test');
      setCurrentQuestionIndex(0);
      setUserAnswers([]);
    } catch (err) {
      toast.error('Không thể tạo bài kiểm tra. Vui lòng thử lại.');
      setStep('input');
    }
  };

  const handleSelectAnswer = (answer: string) => {
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
      const token = localStorage.getItem('token');
      const apiKey = localStorage.getItem('custom_gemini_api_key');
      const res = await fetch('/api/adaptive/submit-test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-gemini-api-key': apiKey || ''
        },
        body: JSON.stringify({ sessionId, answers: userAnswers })
      });
      
      if (!res.ok) throw new Error('Failed to submit test');
      
      const data = await res.json();
      setScore(data.score);
      setAnalysis(data.analysis);
      setRoadmap(data.roadmap);
      setStep('result');
    } catch (err) {
      toast.error('Lỗi khi nộp bài. Vui lòng thử lại.');
      setStep('test');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'input':
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center text-center space-y-6"
          >
            <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-2 shadow-inner">
              <BrainCircuit className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Học tập Thích ứng</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                AI sẽ tạo bài kiểm tra dựa trên kho kiến thức của bạn để tạo lộ trình học tập cá nhân hóa.
              </p>
            </div>
            <div className="w-full max-w-md relative">
              <input 
                type="text" 
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Ví dụ: Lập trình React Hooks, Machine Learning..."
                className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm"
              />
              <button 
                onClick={handleGenerateTest}
                className="absolute right-2 top-2 bottom-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center transition-colors group shadow-lg"
              >
                <Sparkles className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Dựng lộ trình
              </button>
            </div>
          </motion.div>
        );

      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin"></div>
              <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-gray-900 dark:text-white">AI đang phân tích dữ liệu...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Điều này có thể mất vài giây để hình thành bài test chuẩn xác.</p>
            </div>
          </div>
        );

      case 'test':
        const currentQ = questions[currentQuestionIndex];
        return (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                Câu hỏi {currentQuestionIndex + 1} / {questions.length}
              </span>
              <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full mx-6 overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-600"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
              </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-tight">
              {currentQ.question}
            </h3>

            <div className="grid grid-cols-1 gap-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = userAnswers.find(a => a.questionIndex === currentQuestionIndex)?.selectedAnswer === option;
                return (
                  <button 
                    key={idx}
                    onClick={() => handleSelectAnswer(option)}
                    className={`flex items-center p-4 rounded-xl border text-left transition-all ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-500 shadow-md' 
                        : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-gray-900 shadow-sm'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 ${
                      isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 dark:border-gray-700'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className={`font-medium ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-gray-700 dark:text-gray-300'}`}>
                      {option}
                    </span>
                  </button>
                );
              })}
            </div>

            <button 
              onClick={handleNextQuestion}
              disabled={!userAnswers.find(a => a.questionIndex === currentQuestionIndex)}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-[0.98]"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Hoàn thành bài kiểm tra' : 'Tiếp tục'}
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          </motion.div>
        );

      case 'result':
        return (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-8 py-4"
          >
            <div className="relative inline-block">
              <div className="w-32 h-32 rounded-full border-8 border-indigo-100 dark:border-indigo-900 flex items-center justify-center">
                <span className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                  {Math.round((score / (questions.length || 1)) * 100)}%
                </span>
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -right-2 -bottom-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-900"
              >
                <Trophy className="w-6 h-6 text-white" />
              </motion.div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Hoàn thành bài test!</h3>
              <p className="text-gray-500 dark:text-gray-400 italic">"{analysis?.aiSummary}"</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-left">
                <div className="flex items-center text-emerald-600 mb-2">
                  <Target className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Thế mạnh</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis?.strong_tags.map(tag => (
                    <span key={tag} className="text-xs font-medium px-2 py-1 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                  {(!analysis?.strong_tags || analysis.strong_tags.length === 0) && (
                    <span className="text-xs text-emerald-600/60 italic">Cần nỗ lực hơn...</span>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-left">
                <div className="flex items-center text-rose-600 mb-2">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Cần cải thiện</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis?.weak_tags.map(tag => (
                    <span key={tag} className="text-xs font-medium px-2 py-1 bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 rounded-lg">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => setStep('roadmap')}
              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-[0.98]"
            >
              Xem lộ trình học tập tối ưu
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
          </motion.div>
        );

      case 'roadmap':
        return (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-indigo-600" />
                  Lộ trình: {topic}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Dành cho 7 ngày tới dựa trên kết quả của bạn</p>
              </div>
              <button 
                onClick={() => setStep('input')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                title="Tạo lộ trình mới"
              >
                <RefreshCcw className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
              {roadmap.map((day, idx) => (
                <div key={idx} className="relative pl-8 group">
                  {/* Vertical Line Connector */}
                  {idx !== roadmap.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-[-24px] w-0.5 bg-gray-200 dark:bg-gray-800 group-hover:bg-indigo-300 transition-colors" />
                  )}
                  
                  {/* Indicator */}
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white dark:bg-gray-900 border-2 border-indigo-600 flex items-center justify-center z-10">
                    <span className="text-[10px] font-black">{day.day}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm group-hover:border-indigo-200 dark:group-hover:border-indigo-900 transition-all hover:shadow-md">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-2">{day.title}</h4>
                    <ul className="space-y-2 mb-4">
                      {day.tasks.map((task, tidx) => (
                        <li key={tidx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-2 mt-0.5 text-emerald-500 shrink-0" />
                          {task}
                        </li>
                      ))}
                    </ul>
                    {day.resources && day.resources.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50 dark:border-gray-800">
                        {day.resources.map((res, ridx) => (
                          <a 
                            key={ridx}
                            href={res.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors uppercase tracking-wider"
                          >
                            <ExternalLink className="w-3 h-3 mr-1.5" />
                            {res.title}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-indigo-600 text-white shadow-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider opacity-80">Tiến độ hiện tại</p>
                <h4 className="text-xl font-black">Năng lượng: {Math.round((score / (questions.length || 1)) * 100)}%</h4>
              </div>
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <div key={step}>
          {renderStep()}
        </div>
      </AnimatePresence>
    </div>
  );
}
