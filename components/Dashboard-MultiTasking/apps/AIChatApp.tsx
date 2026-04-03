import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

export const AIChatApp: React.FC = () => {
  const [messages, setMessages] = useState<{ role: 'user' | 'model', text: string, uiAction?: string, uiData?: any }[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('token');
      const apiKey = localStorage.getItem('gemini_api_key');
      
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(apiKey ? { 'x-gemini-api-key': apiKey } : {})
        },
        body: JSON.stringify({
          message: userMsg,
          history: messages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { 
        role: 'model', 
        text: data.reply || 'No response',
        uiAction: data.ui_action,
        uiData: data.data
      }]);
    } catch (error) {
      console.error('Error generating chat:', error);
      setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, I encountered an error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0f172a]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-white/10 text-slate-200 rounded-tl-none border border-white/5'
              }`}
            >
              <div>{msg.text}</div>
              
              {/* UI Offloading Rendering */}
              {msg.uiAction === 'render_notes' && msg.uiData && (
                <div className="mt-3 flex flex-col gap-2">
                  {msg.uiData.map((note: any) => (
                    <div key={note.id} className="p-2 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
                      <span className="material-symbols-outlined text-cyan-400 text-sm">description</span>
                      <span className="truncate">{note.title}</span>
                      <span className="text-xs text-white/40 ml-auto px-2 py-0.5 bg-white/5 rounded">{note.type}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {msg.uiAction === 'render_nodes' && msg.uiData && (
                <div className="mt-3 flex flex-col gap-2">
                  {msg.uiData.map((node: any) => (
                    <div key={node.id} className="p-2 bg-white/5 rounded-lg border border-white/10 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400 text-sm">account_tree</span>
                        <span className="truncate font-medium">{node.title}</span>
                        <span className="text-xs text-white/40 ml-auto px-2 py-0.5 bg-white/5 rounded">{node.type}</span>
                      </div>
                      {node.tags && (
                        <div className="text-xs text-white/50 truncate">{node.tags}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-white/10 bg-black/20 shrink-0">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me anything..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="w-10 h-10 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};
