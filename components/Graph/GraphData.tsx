
import React, { useState, useMemo } from 'react';
import { GoogleGenAI } from "@google/genai";
import { KnowledgeNode } from '../../types';

// Initialize AI Client
const getAI = () => {
    const customKey = localStorage.getItem('custom_gemini_api_key');
    return new GoogleGenAI({ apiKey: customKey || process.env.API_KEY || '' });
};

// ----------------------------------------------------------------------
// 1. DATA HEALTH DASHBOARD: Visual Analytics with Real Data & Gemini 2.5
// ----------------------------------------------------------------------

interface DataHealthDashboardProps {
    nodes: KnowledgeNode[];
}

interface AIAnalysisResult {
    analysis: string;
    strategy: string;
    actions: string[];
}

export const DataHealthDashboard: React.FC<DataHealthDashboardProps> = ({ nodes }) => {
    // --- REAL STATS CALCULATION ---
    const stats = useMemo(() => {
        const totalNodes = nodes.length;
        
        let linkCount = 0;
        nodes.forEach(n => {
            if (n.connectedNodeIds) linkCount += n.connectedNodeIds.length;
        });

        // Density: Actual / Possible
        const maxConnections = totalNodes * (totalNodes - 1);
        const density = totalNodes > 1 ? (linkCount / maxConnections).toFixed(2) : "0";

        // Orphans
        const orphans = nodes.filter(n => !n.connectedNodeIds || n.connectedNodeIds.length === 0).length;

        // Clusters (Tags)
        const uniqueTags = new Set(nodes.flatMap(n => n.tags || []));

        return {
            nodes: totalNodes,
            links: linkCount,
            density,
            orphans,
            clusters: uniqueTags.size
        };
    }, [nodes]);

    // --- AI ANALYSIS STATE ---
    const [isThinking, setIsThinking] = useState(false);
    const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);

    const handleDeepAnalysis = async () => {
        if (nodes.length === 0) {
            alert("Chưa có dữ liệu để phân tích.");
            return;
        }

        setIsThinking(true);
        try {
            // Lightweight graph topology for AI
            const graphSample = nodes.slice(0, 50).map(n => ({
                title: n.title,
                type: n.type,
                tags: n.tags,
                connections: n.connectedNodeIds?.length || 0
            }));

            const prompt = `
                Act as a Data Scientist and Learning Strategist. Analyze this Knowledge Graph structure.
                
                Stats:
                - Total Nodes: ${stats.nodes}
                - Total Links: ${stats.links}
                - Isolated Nodes (Orphans): ${stats.orphans}
                - Topics (Tags): ${stats.clusters}

                Graph Sample (First 50):
                ${JSON.stringify(graphSample)}

                Task:
                1. Analyze the structure (Is it fragmented? Connected? Diverse?).
                2. Suggest a 'Learning Strategy' based on the topology (e.g., Connect orphans, deepen specific clusters).
                3. Propose 3 actionable improvements.

                Return ONLY JSON format:
                {
                    "analysis": "Short analysis of the graph health...",
                    "strategy": "Recommended learning strategy...",
                    "actions": ["Action 1", "Action 2", "Action 3"]
                }
            `;

            const ai = getAI();
            // Using Gemini 2.5 Flash as requested for efficient analysis
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            if (response.text) {
                setAnalysisResult(JSON.parse(response.text));
            }
        } catch (e) {
            console.error("AI Analysis Failed", e);
            alert("Lỗi phân tích. Vui lòng thử lại.");
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-white font-bold text-lg flex items-center gap-2">
                        <span className="material-symbols-outlined text-green-400">health_and_safety</span> 
                        Chỉ Số Sức Khỏe Mạng Lưới (Graph Health Metrics)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Phân tích thời gian thực trên {stats.nodes} khái niệm trong cơ sở dữ liệu.</p>
                </div>
                <button 
                    onClick={handleDeepAnalysis}
                    disabled={isThinking}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg transition-all disabled:opacity-50"
                >
                    {isThinking ? (
                        <>
                            <span className="material-symbols-outlined text-sm animate-spin">neurology</span>
                            Đang xử lý mô hình học máy...
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-sm">psychology</span>
                            Kích hoạt Phân Tích Chuyên Sâu (AI)
                        </>
                    )}
                </button>
            </div>
            
            {/* Real Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-bold">Tổng số Khái Niệm</p>
                    <p className="text-2xl font-mono text-white mt-1">{stats.nodes}</p>
                    <div className="w-full h-1 bg-slate-700 mt-2 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500" style={{ width: '100%' }}></div>
                    </div>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-bold">Tổng số Liên Kết</p>
                    <p className="text-2xl font-mono text-white mt-1">{stats.links}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Mối quan hệ</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-bold">Mật Độ Kết Nối</p>
                    <p className="text-2xl font-mono text-white mt-1">{stats.density}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Chỉ số liên thông</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-bold">Khái niệm cô lập</p>
                    <p className={`text-2xl font-mono mt-1 ${stats.orphans > 0 ? 'text-red-400' : 'text-green-400'}`}>{stats.orphans}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{stats.orphans > 0 ? 'Cần thiết lập liên kết' : 'Tối ưu'}</p>
                </div>
                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                    <p className="text-xs text-slate-400 uppercase font-bold">Cụm Chủ Đề (Clusters)</p>
                    <p className="text-2xl font-mono text-yellow-400 mt-1">{stats.clusters}</p>
                    <p className="text-[10px] text-slate-500 mt-1">Chủ đề chính</p>
                </div>
            </div>

            {/* AI Analysis Result */}
            {analysisResult && (
                <div className="bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 animate-fade-in">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="material-symbols-outlined text-indigo-400">auto_awesome</span>
                        <h4 className="text-indigo-200 font-bold uppercase text-sm">Báo Cáo Phân Tích Từ AI (Gemini 2.5)</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div>
                                <h5 className="text-xs text-slate-400 font-bold uppercase mb-1">Đánh giá cấu trúc mạng lưới</h5>
                                <p className="text-sm text-slate-200 leading-relaxed">{analysisResult.analysis}</p>
                            </div>
                            <div>
                                <h5 className="text-xs text-slate-400 font-bold uppercase mb-1">Chiến lược tối ưu hóa</h5>
                                <p className="text-sm text-cyan-200 leading-relaxed font-medium">{analysisResult.strategy}</p>
                            </div>
                        </div>

                        <div className="bg-black/20 rounded-lg p-4 border border-white/5">
                            <h5 className="text-xs text-green-400 font-bold uppercase mb-3">Đề xuất hành động cụ thể</h5>
                            <ul className="space-y-2">
                                {analysisResult.actions.map((action, i) => (
                                    <li key={i} className="flex gap-2 text-xs text-slate-300">
                                        <span className="text-green-500">•</span>
                                        {action}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------------------------
// 2. AI SCHEMA MAPPER: Intelligent Import Tool
// ----------------------------------------------------------------------

export const AISchemaMapper: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState(1);
    const [rawInput, setRawInput] = useState("");
    const [isThinking, setIsThinking] = useState(false);
    const [mappedSchema, setMappedSchema] = useState<any>(null);

    const handleAnalyze = async () => {
        if (!rawInput.trim()) return;
        setIsThinking(true);
        try {
            const ai = getAI();
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Analyze this raw data snippet and propose a Knowledge Graph schema (Nodes and Edges).
                Raw Data:
                ${rawInput.substring(0, 1000)}...
                
                Return JSON format:
                {
                    "nodeTypes": ["TypeA", "TypeB"],
                    "edgeTypes": ["Relation1", "Relation2"],
                    "mappingSuggestion": "Explanation of how columns map to properties"
                }`,
                config: {
                    responseMimeType: "application/json"
                }
            });
            
            if (response.text) {
                setMappedSchema(JSON.parse(response.text));
                setStep(2);
            }
        } catch (e) {
            console.error(e);
            alert("Lỗi phân tích schema.");
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
            <div className="bg-[#1e1e1e] w-full max-w-4xl rounded-2xl border border-white/10 shadow-2xl flex flex-col max-h-[85vh]">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#0f172a] rounded-t-2xl">
                    <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-purple-400">schema</span> Công Cụ Ánh Xạ Cấu Trúc AI
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><span className="material-symbols-outlined">close</span></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-slate-300 text-sm">Nhập dữ liệu thô (CSV, JSON, văn bản) để AI tự động thiết kế cấu trúc mạng lưới tri thức.</p>
                            <textarea 
                                className="w-full h-64 bg-black/30 border border-white/10 rounded-xl p-4 text-xs font-mono text-white focus:border-purple-500 outline-none resize-none"
                                placeholder="Nhập dữ liệu thô tại đây..."
                                value={rawInput}
                                onChange={(e) => setRawInput(e.target.value)}
                            />
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleAnalyze}
                                    disabled={isThinking || !rawInput}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold flex items-center gap-2 disabled:opacity-50 transition-all"
                                >
                                    {isThinking ? <span className="material-symbols-outlined animate-spin">sync</span> : <span className="material-symbols-outlined">auto_fix</span>}
                                    {isThinking ? "Đang Phân Tích..." : "Phân Tích Cấu Trúc Dữ Liệu"}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 2 && mappedSchema && (
                        <div className="space-y-6 animate-slide-up">
                            <div className="bg-green-900/20 border border-green-500/30 p-4 rounded-xl">
                                <h4 className="text-green-300 font-bold mb-2">Đề Xuất Lược Đồ Dữ Liệu</h4>
                                <p className="text-slate-300 text-sm mb-4">{mappedSchema.mappingSuggestion}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <h5 className="text-blue-300 font-bold text-sm mb-3 uppercase">Loại Khái Niệm (Node Types)</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {mappedSchema.nodeTypes.map((t: string) => (
                                            <span key={t} className="px-3 py-1 bg-blue-900/40 text-blue-200 text-xs rounded-full border border-blue-500/30">{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <h5 className="text-orange-300 font-bold text-sm mb-3 uppercase">Loại Quan Hệ (Edge Types)</h5>
                                    <div className="flex flex-wrap gap-2">
                                        {mappedSchema.edgeTypes.map((t: string) => (
                                            <span key={t} className="px-3 py-1 bg-orange-900/40 text-orange-200 text-xs rounded-full border border-orange-500/30">{t}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button onClick={() => setStep(1)} className="px-4 py-2 text-slate-400 hover:text-white">Trở về</button>
                                <button onClick={onClose} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold">Tiến hành Nhập liệu</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// ... (Rest of component unchanged)
// 3. KNOWLEDGE BASE CONNECTOR: External Integrations
export const KnowledgeBaseConnector: React.FC = () => {
    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-cyan-400">link</span> 
                Tích Hợp Cơ Sở Tri Thức Ngoài
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png" className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" alt="Notion" />
                        <div>
                            <h4 className="text-sm font-bold text-white">Notion</h4>
                            <p className="text-[10px] text-green-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Đã kết nối</p>
                        </div>
                    </div>
                    <p className="text-xs text-slate-400">Đồng bộ trang thành khái niệm.</p>
                </div>
                
                <div className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-8 h-8 opacity-80 group-hover:opacity-100 transition-opacity" alt="Drive" />
                        <div>
                            <h4 className="text-sm font-bold text-white">Google Drive</h4>
                            <p className="text-[10px] text-slate-500">Chưa kết nối</p>
                        </div>
                    </div>
                    <button className="text-xs bg-blue-600/20 text-blue-300 px-2 py-1 rounded hover:bg-blue-600 hover:text-white transition-colors w-full">Kết nối</button>
                </div>

                <div className="p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="material-symbols-outlined text-3xl text-purple-400">diamond</span>
                        <div>
                            <h4 className="text-sm font-bold text-white">Obsidian</h4>
                            <p className="text-[10px] text-slate-500">Kho dữ liệu cục bộ</p>
                        </div>
                    </div>
                    <button className="text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded hover:bg-purple-600 hover:text-white transition-colors w-full">Chọn thư mục</button>
                </div>
            </div>
        </div>
    );
};

// 4. BULK OPERATIONS TOOLBAR
export const BulkOperationsToolbar: React.FC = () => {
    return (
        <div className="bg-[#1e293b] border border-white/10 rounded-xl p-4 flex items-center gap-4">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider border-r border-white/10 pr-4 mr-2">Thao Tác Hàng Loạt</h4>
            
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-sm">merge</span> Hợp nhất Khái Niệm
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-sm">label</span> Gán nhãn Tự động
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-slate-300 transition-colors">
                <span className="material-symbols-outlined text-sm">cleaning_services</span> Dọn dẹp Dữ liệu
            </button>
            <div className="flex-1"></div>
            <button className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">delete_sweep</span> Xóa Đã Chọn
            </button>
        </div>
    );
};

// EXPORT COMPONENT WRAPPER
export const DataManagementPanel: React.FC<{ userNodes: KnowledgeNode[] }> = ({ userNodes }) => {
    const [showMapper, setShowMapper] = useState(false);

    return (
        <div className="w-full max-w-6xl mx-auto p-4 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-black text-white">Trung Tâm Quản Trị Dữ Liệu</h2>
                <button 
                    onClick={() => setShowMapper(true)}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">add_circle</span> Nhập Dữ Liệu Mới
                </button>
            </div>
            
            {/* REAL DATA ANALYSIS */}
            <DataHealthDashboard nodes={userNodes} />
            
            <KnowledgeBaseConnector />
            <BulkOperationsToolbar />
            
            <AISchemaMapper isOpen={showMapper} onClose={() => setShowMapper(false)} />
        </div>
    );
};
