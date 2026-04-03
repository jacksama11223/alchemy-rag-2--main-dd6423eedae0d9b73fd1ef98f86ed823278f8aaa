import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Markdown from 'react-markdown';
import { extractAndSaveUserFacts } from '../../services/geminiService';
import { sendOmniMessage } from '../../services/omniAgentService';

interface RagChatbotProps {
  contextData?: string; // Data from the current page (e.g., extracted URL text, OCR text)
  pageTitle?: string;
  isGlobal?: boolean; // If true, it searches across all RAG documents
}

export const RagChatbot: React.FC<RagChatbotProps> = ({ contextData, pageTitle, isGlobal = false }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string }[]>(() => {
    if (isGlobal) {
      const saved = localStorage.getItem('rag_chat_history');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Error parsing chat history", e);
        }
      }
    }
    return [];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 0) {
      if (contextData && !isGlobal) {
        setMessages([{
          role: 'model',
          text: `Xin chào! Tôi là trợ lý AI cho trang ${pageTitle || 'này'}. Tôi đã nhận được dữ liệu từ trang này. Bạn muốn phân tích hay hỏi gì về dữ liệu này?`
        }]);
      } else if (isGlobal) {
        setMessages([{
          role: 'model',
          text: `Xin chào! Tôi là trợ lý AI Tổng hợp và Phân tích. Tôi có thể truy xuất dữ liệu từ kho RAG của bạn. Bạn muốn tìm kiếm và tổng hợp thông tin gì?`
        }]);
      }
    }
  }, [contextData, pageTitle, isGlobal]);

  useEffect(() => {
    if (isGlobal && messages.length > 0) {
      localStorage.setItem('rag_chat_history', JSON.stringify(messages));
    }
  }, [messages, isGlobal]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Extract and save user facts in the background
    extractAndSaveUserFacts(userMessage);

    try {
      let ragContext = '';
      let memoryContext = '';
      const customKey = localStorage.getItem('custom_gemini_api_key') || undefined;

      let token = localStorage.getItem('token');
      if (!token) {
        const sessionStr = localStorage.getItem('learnai_session');
        if (sessionStr) {
          try {
            token = JSON.parse(sessionStr).token;
          } catch (e) {}
        }
      }

      // Fetch user memory
      try {
        const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`
        };
        if (customKey) {
          headers['x-gemini-api-key'] = customKey;
        }

        const memResponse = await fetch(`/api/user-memory/search?query=${encodeURIComponent(userMessage)}`, {
          headers
        });
        if (memResponse.ok) {
          const memories = await memResponse.json();
          if (memories && memories.length > 0) {
            memoryContext = memories.map((m: any) => m.fact).join('\n');
          }
        }
      } catch (e) {
        console.error("Error fetching user memory", e);
      }

      if (isGlobal) {
        // Fetch from RAG database
        try {
          const headers: Record<string, string> = {
            'Authorization': `Bearer ${token}`
          };
          if (customKey) {
            headers['x-gemini-api-key'] = customKey;
          }
          const response = await fetch(`/api/rag/search?query=${encodeURIComponent(userMessage)}`, {
            headers
          });
          if (response.ok) {
            const docs = await response.json();
            if (docs && docs.length > 0) {
              ragContext = docs.map((d: any) => d.content).join('\n\n');
            }
          }
        } catch (e) {
          console.error("Error fetching RAG docs", e);
        }
      } else {
        ragContext = contextData || '';
      }
      
      let prompt = userMessage;
      let combinedContext = '';
      if (memoryContext) combinedContext += `Thông tin về người dùng:\n${memoryContext}\n\n`;
      if (ragContext) combinedContext += `Tài liệu tham khảo:\n${ragContext}\n\n`;

      if (combinedContext) {
        prompt = `Dựa vào thông tin sau đây (Context):\n${combinedContext}\nHãy trả lời câu hỏi của người dùng:\n${userMessage}`;
      }

      const systemInstruction = `Bạn là một trợ lý AI thông minh, chuyên phân tích và tổng hợp dữ liệu. 
Hãy trả lời bằng tiếng Việt, rõ ràng, súc tích và chính xác dựa trên Context được cung cấp. 
ĐẶC BIỆT QUAN TRỌNG: Nếu người dùng hỏi về thông tin cá nhân (như "tên tôi là gì", "tôi là ai") hoặc các thông tin đã nói trước đó, HÃY TÌM TRONG LỊCH SỬ TRÒ CHUYỆN (Chat History) và "Thông tin về người dùng" trong Context.
Nếu Context không có thông tin, hãy nói rõ là bạn không tìm thấy thông tin trong dữ liệu được cung cấp.`;
      
      // Use the centralized gemini service which handles API keys properly
      const aiResponseText = await sendOmniMessage(prompt, messages, systemInstruction, token || '', customKey, isThinkingMode);

      setMessages(prev => [...prev, { role: 'model', text: aiResponseText || 'Xin lỗi, tôi không thể trả lời lúc này.' }]);
    } catch (error) {
      console.error('Error generating AI response:', error);
      setMessages(prev => [...prev, { role: 'model', text: 'Đã có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSaveToRag = async () => {
    if (!contextData) {
      alert("Không có dữ liệu để lưu vào RAG.");
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const customKey = localStorage.getItem('custom_gemini_api_key') || undefined;
      
      const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
      };
      if (customKey) {
          headers['x-gemini-api-key'] = customKey;
      }
      
      const response = await fetch('/api/rag', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          content: contextData,
          metadata: {
            title: pageTitle || 'Dữ liệu thu thập',
            source: 'Alchemy Input',
            type: 'text'
          }
        })
      });
      if (response.ok) {
        alert("Đã lưu dữ liệu vào cơ sở dữ liệu RAG thành công!");
      } else {
        alert("Lỗi khi lưu vào RAG.");
      }
    } catch (error) {
      console.error("Error saving to RAG:", error);
      alert("Đã có lỗi xảy ra khi lưu vào RAG.");
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 border-b border-sky-100">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-sky-500">smart_toy</span>
          <h3 className="font-bold text-slate-700 text-sm">Trợ lý AI {isGlobal ? 'Tổng hợp' : 'Phân tích'}</h3>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsThinkingMode(!isThinkingMode)} 
            className={`p-1.5 rounded-full transition-all ${isThinkingMode ? 'text-purple-600 bg-purple-100' : 'text-slate-400 hover:text-purple-500'}`} 
            title="Thinking Mode (Gemini 3 Pro)"
          >
            <span className="material-symbols-outlined text-[16px]">network_intelligence</span>
          </button>
          {!isGlobal && contextData && (
            <button 
              onClick={handleSaveToRag}
              className="text-xs flex items-center gap-1 bg-white px-2 py-1 rounded border border-sky-200 text-sky-600 hover:bg-sky-50 transition-colors"
              title="Lưu dữ liệu hiện tại vào cơ sở dữ liệu RAG để tìm kiếm sau này"
            >
              <span className="material-symbols-outlined text-[14px]">database</span>
              Lưu vào RAG
            </button>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={idx} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[85%] rounded-2xl px-4 py-2 ${
              msg.role === 'user' 
                ? 'bg-sky-500 text-white rounded-tr-sm' 
                : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
            }`}>
              {msg.role === 'model' ? (
                <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0">
                  <Markdown>{msg.text}</Markdown>
                </div>
              ) : (
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex gap-1">
              <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-sky-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 bg-white border-t border-slate-200">
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 focus-within:border-sky-400 focus-within:ring-1 focus-within:ring-sky-400 transition-all">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Hỏi AI về dữ liệu này..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="text-sky-500 hover:text-sky-600 disabled:text-slate-300 disabled:cursor-not-allowed transition-colors"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
