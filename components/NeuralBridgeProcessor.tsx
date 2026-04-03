
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { extractActionPlan, analyzeProjectStructure } from '../services/geminiService'; // Import new service

// Initialize AI Client
const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

interface NeuralBridgeProcessorProps {
    sourceContent: string;
    targetFeature: 'alchemy' | 'graph' | 'todo' | 'note' | 'drive' | 'community' | 'todo_bulk' | 'project_to_graph'; // Added project_to_graph
    onComplete: (target: string, processedData: any) => void;
    onCancel: () => void;
}

export const NeuralBridgeProcessor: React.FC<NeuralBridgeProcessorProps> = ({ sourceContent, targetFeature, onComplete, onCancel }) => {
    const [status, setStatus] = useState<'analyzing' | 'structuring' | 'optimizing' | 'ready'>('analyzing');
    const [progress, setProgress] = useState(0);
    const [previewData, setPreviewData] = useState<any>(null);

    useEffect(() => {
        const processContent = async () => {
            try {
                // Phase 1: Analyzing
                setStatus('analyzing');
                setProgress(20);
                
                // Specific handling for Bulk Action Plan
                if (targetFeature === 'todo_bulk') {
                    // Use specialized service
                    const tasks = await extractActionPlan(sourceContent);
                    
                    setPreviewData({
                        label: `Kế hoạch hành động (${tasks.length} tasks)`,
                        tasks: tasks,
                        type: 'bulk-create' // Metadata for ThingsToDo
                    });
                    
                    setProgress(90);
                    setStatus('ready');

                    setTimeout(() => {
                        onComplete('todo', { 
                            type: 'bulk-create',
                            tasks: tasks
                        });
                    }, 1000);
                    return;
                }

                // Specific handling for Project Visualizer (Tasks -> Graph)
                if (targetFeature === 'project_to_graph') {
                    let tasks = [];
                    try {
                        tasks = JSON.parse(sourceContent);
                    } catch(e) { tasks = []; }

                    if (tasks.length > 0) {
                        const graphStructure = await analyzeProjectStructure(tasks);
                        
                        setPreviewData({
                            label: `Dự án hóa Sơ đồ (${graphStructure.nodes.length} nodes)`,
                            graphData: graphStructure,
                            type: 'project-visualizer'
                        });

                        setProgress(100);
                        setStatus('ready');

                        setTimeout(() => {
                            onComplete('graph', {
                                type: 'project-visualizer',
                                data: graphStructure
                            });
                        }, 1000);
                        return;
                    }
                }

                // Standard processing for other targets
                let systemInstruction = "";
                let jsonSchema = "";

                switch (targetFeature) {
                    case 'todo':
                        systemInstruction = "You are a Task Manager AI. Extract actionable tasks. Decompose the context into a concise 'label' (Title), a detailed 'data' (Description), and a 'priority' number (1=High/Urgent, 2=Medium, 3=Normal, 4=Low).";
                        jsonSchema = `{ "label": "Task Title", "data": "Detailed description string", "priority": 1 }`;
                        break;
                    case 'note':
                        systemInstruction = "You are a Knowledge Management AI. Structure this content into a formatted Note. 'label' is the Title. 'data' is the full content in Markdown format (use headers, bullets).";
                        jsonSchema = `{ "label": "Note Title", "data": "# Header\\n\\nContent..." }`;
                        break;
                    case 'graph':
                        systemInstruction = "You are a Knowledge Graph Architect. Distill this conversation into a SINGLE core concept node. 'label' is the Node Title (Short). 'data' is the Node Summary/Definition.";
                        jsonSchema = `{ "label": "Concept Name", "data": "Brief Definition or Summary" }`;
                        break;
                    case 'alchemy':
                        systemInstruction = "You are a Prompt Engineer. Convert this context into an OPTIMIZED prompt for generating educational content. 'initialQuery' is the prompt.";
                        jsonSchema = `{ "initialQuery": "Generate a [Type] about [Topic]..." }`;
                        break;
                    default:
                        systemInstruction = "Summarize this content.";
                        jsonSchema = `{ "data": "Summary" }`;
                }

                await new Promise(r => setTimeout(r, 800)); // Visual delay
                setProgress(50);
                setStatus('structuring');

                const prompt = `
                    Source Text: "${sourceContent.substring(0, 5000)}"
                    
                    Target System: ${targetFeature.toUpperCase()}
                    Task: Convert source text into valid JSON matching the schema. Do not include markdown formatting like \`\`\`json. Just return the raw JSON object.
                    Strict JSON Schema: ${jsonSchema}
                `;

                const ai = getAI();
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: { responseMimeType: "application/json" }
                });

                setProgress(80);
                setStatus('optimizing');
                
                let result;
                try {
                    // Remove any accidental markdown fencing if AI ignores instruction
                    const rawText = response.text?.replace(/```json/g, '').replace(/```/g, '').trim() || '{}';
                    result = JSON.parse(rawText);
                } catch (e) {
                    console.warn("JSON Parse Failed, falling back to text", e);
                    // Fallback if AI fails JSON
                    result = { label: "Imported Content", data: sourceContent };
                }

                setPreviewData(result);
                
                await new Promise(r => setTimeout(r, 600)); // Visual delay
                setProgress(100);
                setStatus('ready');

                // Auto-redirect after short pause
                setTimeout(() => {
                    // Normalize the data structure for the App.tsx handler
                    let finalPayload = result;
                    
                    // Add 'type' for Alchemy/Graph if missing so App.tsx recognizes intent
                    if (targetFeature === 'alchemy') finalPayload.type = 'create';
                    if (targetFeature === 'graph') finalPayload.type = 'create'; 
                    
                    onComplete(targetFeature, finalPayload);
                }, 1000);

            } catch (e) {
                console.error("Bridge Error:", e);
                // Fallback: Just pass raw text
                onComplete(targetFeature, { label: "AI Extract", data: sourceContent, initialQuery: sourceContent, type: 'create' });
            }
        };

        processContent();
    }, [sourceContent, targetFeature]);

    return (
        <div className="fixed inset-0 z-[200] bg-[#020617]/95 backdrop-blur-xl flex flex-col items-center justify-center font-display text-white">
            {/* Background Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_transparent_0%,_#020617_100%)]"></div>
            </div>

            <div className="relative z-10 w-full max-w-lg text-center p-8">
                <div className="mb-8 relative">
                    <div className="w-24 h-24 mx-auto bg-black rounded-full border-4 border-cyan-500/30 flex items-center justify-center shadow-[0_0_50px_rgba(6,182,212,0.4)] relative">
                        <span className={`material-symbols-outlined text-5xl text-cyan-400 ${status !== 'ready' ? 'animate-spin' : ''}`}>
                            {status === 'ready' ? 'check_circle' : 'neurology'}
                        </span>
                        
                        {/* Orbiting particles */}
                        {status !== 'ready' && (
                            <>
                                <div className="absolute inset-0 rounded-full border-t-2 border-cyan-400 animate-[spin_2s_linear_infinite]"></div>
                                <div className="absolute inset-2 rounded-full border-b-2 border-purple-500 animate-[spin_3s_linear_infinite_reverse]"></div>
                            </>
                        )}
                    </div>
                    {status === 'ready' && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-green-500 text-black text-[10px] font-bold px-2 py-0.5 rounded">HOÀN TẤT</div>}
                </div>

                <h2 className="text-3xl font-black mb-2 tracking-tight">
                    {status === 'analyzing' && "Đang Đọc Tín Hiệu..."}
                    {status === 'structuring' && "Đang Tái Cấu Trúc..."}
                    {status === 'optimizing' && "Đang Tối Ưu Hóa..."}
                    {status === 'ready' && "Dữ Liệu Đã Sẵn Sàng!"}
                </h2>
                
                <p className="text-slate-400 text-sm mb-8 h-6">
                    {status === 'analyzing' && "AI đang phân tích ngữ cảnh hội thoại..."}
                    {status === 'structuring' && `Đang chuyển đổi sang định dạng ${targetFeature.toUpperCase().replace('_', ' ')}...`}
                    {status === 'optimizing' && "Đang làm sạch và bổ sung thông tin thiếu..."}
                    {status === 'ready' && "Đang chuyển hướng đến đích..."}
                </p>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-6 relative">
                    <div 
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-500 ease-out relative"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute inset-0 bg-white/30 w-full animate-[shimmer_1s_infinite]"></div>
                    </div>
                </div>

                {/* Data Preview (Fades in) */}
                {previewData && (
                    <div className="bg-[#1e293b]/80 border border-white/10 rounded-xl p-4 text-left animate-[fadeInUp_0.5s]">
                        <div className="flex items-center gap-2 mb-2 text-xs font-bold text-cyan-400 uppercase">
                            <span className="material-symbols-outlined text-sm">data_object</span>
                            Dữ liệu trích xuất
                        </div>
                        <div className="text-sm text-slate-300 font-mono bg-black/40 p-3 rounded-lg overflow-hidden text-ellipsis whitespace-nowrap">
                           {previewData.label || previewData.initialQuery || (previewData.tasks ? `List of ${previewData.tasks.length} items` : (previewData.graphData ? `${previewData.graphData.nodes.length} Visual Nodes` : previewData.data?.substring(0, 50))) || "Processing..."}
                        </div>
                    </div>
                )}

                <button 
                    onClick={onCancel}
                    className="mt-8 text-slate-500 hover:text-white text-sm underline decoration-slate-600 underline-offset-4"
                >
                    Hủy bỏ & Quay lại
                </button>
            </div>
        </div>
    );
};
