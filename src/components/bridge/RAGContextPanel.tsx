import React, { useState, useEffect } from 'react';
import { getHybridRAGContext } from '../../services/ragService';
import { useLearningContext } from '../../hooks/useLearningContext';

export const RAGContextPanel = () => {
  const { activeTopic } = useLearningContext();
  const [contexts, setContexts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (activeTopic) {
      fetchContexts();
    }
  }, [activeTopic]);

  const fetchContexts = async () => {
    setLoading(true);
    try {
      const data = await getHybridRAGContext(activeTopic || '');
      if (data.success) {
        setContexts(data.contexts);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const askAI = async () => {
    setSummarizing(true);
    // Real implementation would fire api/orchestrator using the populated `contexts` payload
    setTimeout(() => {
      setAiSummary("Here is a synthesized summary from the DB contexts: " + contexts.map(c => c.content).join(" ").substring(0, 50) + "...");
      setSummarizing(false);
    }, 1500);
  };

  if (!activeTopic) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 border-l border-gray-700 p-4 text-white overflow-y-auto z-40">
      <h2 className="text-xl font-bold mb-4">Hybrid Context</h2>
      <p className="text-sm text-gray-400 mb-4">Topic: {activeTopic}</p>
      
      {loading ? (
        <div className="text-gray-400">Querying Vector Base...</div>
      ) : (
        <div className="flex flex-col gap-3">
          {contexts.map((ctx, idx) => (
            <div key={idx} className="bg-gray-800 p-3 rounded text-sm whitespace-pre-wrap">
              <span className="text-blue-400 text-xs block mb-1">[{ctx.metadata?.sourceType || 'document'}] Similarity: {ctx.score.toFixed(2)}</span>
              {ctx.content.substring(0, 150)}...
            </div>
          ))}
          
          {contexts.length > 0 && (
              <div className="mt-4 border-t border-gray-700 pt-4">
                 {!aiSummary && (
                   <button 
                     onClick={askAI} disabled={summarizing}
                     className="w-full bg-purple-600 hover:bg-purple-700 py-2 rounded font-bold"
                   >
                     {summarizing ? 'Synthesizing...' : 'Ask AI to Summarize'}
                   </button>
                 )}
                 {aiSummary && (
                   <div className="bg-purple-900/50 p-3 rounded text-sm text-purple-100">
                     <strong>AI Insight:</strong> {aiSummary}
                   </div>
                 )}
              </div>
          )}
        </div>
      )}
    </div>
  );
};
