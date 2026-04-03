import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { sendOmniMessage } from '../services/omniAgentService';

const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Chào bạn! Tôi là **Gia sư AI** của LearnAI 🎓\n\nTôi có thể giúp bạn học từ vựng, ngữ pháp, khoa học hay bất kỳ chủ đề nào. Hôm nay bạn muốn học gì?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px';
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    let history = messages.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    if (history.length > 0 && history[0].role === 'model') {
      history = history.slice(1);
    }

    try {
      let token = '';
      const sessionStr = window.localStorage.getItem('learnai_session');
      if (sessionStr) {
        try {
          const session = JSON.parse(sessionStr);
          token = session.token || '';
        } catch (e) {}
      }

      const systemPrompt = 'Bạn là một gia sư AI thông minh, thân thiện. Bạn có thể truy xuất dữ liệu từ kho RAG của người dùng để trả lời câu hỏi. Trả lời ngắn gọn, súc tích, dùng markdown khi cần.';
      const apiKey = window.localStorage.getItem('custom_gemini_api_key') || undefined;
      const responseText = await sendOmniMessage(input, history, systemPrompt, token, apiKey, isThinkingMode);

      const botMessage: ChatMessage = {
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {
        role: 'model',
        text: '❌ Đã xảy ra lỗi. Vui lòng thử lại.',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Enter để gửi (Shift+Enter để xuống dòng)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    '📚 Giải thích khái niệm này',
    '🔁 Tạo câu hỏi ôn tập',
    '💡 Cho ví dụ thực tế',
    '🗂️ Tóm tắt nội dung',
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto bg-white dark:bg-[#0f172a]">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-10 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center size-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
            <span className="material-symbols-outlined text-white text-xl">smart_toy</span>
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-base leading-tight">Gia sư AI</h3>
            <span className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse inline-block"></span>
              Trực tuyến · RAG-powered
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsThinkingMode(!isThinkingMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            isThinkingMode
              ? 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
              : 'text-slate-400 border-slate-200 dark:border-slate-700 hover:border-purple-300 hover:text-purple-500'
          }`}
          title="Chế độ Tư Duy Sâu (Gemini Pro)"
        >
          <span className="material-symbols-outlined text-base">network_intelligence</span>
          {isThinkingMode ? 'Deep Think' : 'Think'}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 scroll-smooth" style={{ scrollBehavior: 'smooth' }}>

        {/* Quick prompts - only show when no user messages */}
        {messages.length === 1 && (
          <div className="flex flex-wrap gap-2 justify-center mt-2 mb-6 animate-[fadeIn_.4s_ease]">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => { setInput(qp.replace(/^[^\s]+ /, '')); textareaRef.current?.focus(); }}
                className="px-3 py-2 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 border border-slate-200 hover:border-blue-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700 dark:hover:bg-slate-700 transition-all"
              >
                {qp}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="size-8 rounded-xl bg-gradient-to-br from-blue-400/20 to-indigo-500/20 border border-blue-100 dark:border-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-blue-500 text-base">smart_toy</span>
              </div>
            )}
            <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-first' : ''}`}>
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-br-sm shadow-blue-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              <p className={`text-[10px] text-slate-400 mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                {msg.timestamp?.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="size-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm shadow-blue-500/30">
                <span className="material-symbols-outlined text-white text-base">person</span>
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="size-8 rounded-xl bg-blue-400/20 border border-blue-100 dark:border-blue-900 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-blue-500 text-base animate-spin">progress_activity</span>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-slate-100 dark:border-slate-700 shadow-sm">
              <div className="flex gap-1.5 items-center h-5">
                <div className="size-2 bg-blue-400 rounded-full animate-bounce [animation-delay:0ms]"></div>
                <div className="size-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:150ms]"></div>
                <div className="size-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-4 pb-4 pt-2 bg-white dark:bg-[#0f172a] border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-end gap-2 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 px-4 py-2 focus-within:ring-2 focus-within:ring-blue-400/50 focus-within:border-blue-300 dark:focus-within:border-blue-600 transition-all">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi... (Enter gửi · Shift+Enter xuống dòng)"
            rows={1}
            className="flex-1 resize-none bg-transparent text-slate-700 dark:text-slate-200 text-sm focus:outline-none placeholder:text-slate-400 py-2 leading-relaxed max-h-36 overflow-y-auto"
            disabled={isLoading}
            style={{ minHeight: '40px' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className={`flex-shrink-0 mb-1 flex items-center justify-center size-9 rounded-xl transition-all ${
              input.trim() && !isLoading
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/30 hover:shadow-lg hover:shadow-blue-500/40 hover:scale-105'
                : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
            }`}
          >
            <span className="material-symbols-outlined text-lg">send</span>
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-1.5">
          Enter để gửi · Shift+Enter để xuống dòng
        </p>
      </div>
    </div>
  );
};

export default React.memo(AITutor);
