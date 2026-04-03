
import React, { useRef, useState, useEffect } from 'react';

interface AlchemyInputProps {
    inputValue: string;
    setInputValue: (val: string) => void;
    selectedImage: string | null;
    setSelectedImage: (img: string | null) => void;
    onScanStart: () => void;
    onDocTextLoaded: (text: string) => void;
}

export const AlchemyInput: React.FC<AlchemyInputProps> = ({ 
    inputValue, setInputValue, selectedImage, setSelectedImage, onScanStart, onDocTextLoaded 
}) => {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState<'text' | 'image' | 'voice' | 'batch'>('text');
    const [isListening, setIsListening] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [audioData, setAudioData] = useState<number[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // --- REFS ---
    const fileInputRef = useRef<HTMLInputElement>(null);
    const recognitionRef = useRef<any>(null);
    const audioIntervalRef = useRef<any>(null);
    const inputValueRef = useRef(inputValue);

    useEffect(() => {
        inputValueRef.current = inputValue;
    }, [inputValue]);

    // --- EFFECTS ---
    useEffect(() => {
        // Setup Web Speech API
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'vi-VN';

            recognitionRef.current.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setInputValue(inputValueRef.current + ' ' + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event: any) => {
                console.error("Speech error", event.error);
                setIsListening(false);
            };
            
            recognitionRef.current.onend = () => {
                // Auto restart if still listening state (optional, here we just stop)
                if(isListening) setIsListening(false);
            };
        }
    }, [setInputValue, isListening]);

    useEffect(() => {
        // Audio Visualizer Simulation
        if (isListening) {
            audioIntervalRef.current = setInterval(() => {
                const newData = Array.from({length: 20}, () => Math.random() * 100);
                setAudioData(newData);
            }, 100);
        } else {
            clearInterval(audioIntervalRef.current);
            setAudioData(Array(20).fill(10));
        }
        return () => clearInterval(audioIntervalRef.current);
    }, [isListening]);

    // --- HANDLERS ---
    const toggleListening = () => {
        if (!recognitionRef.current) {
            alert("Trình duyệt không hỗ trợ nhận diện giọng nói.");
            return;
        }
        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            recognitionRef.current.start();
            setIsListening(true);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (file: File) => {
        setFileName(file.name);
        setProcessing(true);
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result as string;
            
            if (file.type.startsWith('image/')) {
                setSelectedImage(result);
                setActiveTab('image');
            } else if (file.type === 'text/plain' || file.type === 'application/json') {
                onDocTextLoaded(result);
                setInputValue(result.substring(0, 1000) + '...'); // Preview
                setActiveTab('text');
            } else {
                // Mock PDF handling
                onDocTextLoaded(`[Content parsed from ${file.name}]`);
                setInputValue(`[PDF Content: ${file.name}]`);
                setActiveTab('text');
            }
            setProcessing(false);
        };
        
        if (file.type.startsWith('image/')) {
            reader.readAsDataURL(file);
        } else {
            reader.readAsText(file);
        }
    };

    // --- RENDER HELPERS ---
    const renderTabs = () => (
        <div className="flex gap-2 mb-4 border-b border-white/10 pb-2">
            {[
                { id: 'text', icon: 'edit_note', label: 'Văn bản' },
                { id: 'image', icon: 'image', label: 'Hình ảnh' },
                { id: 'voice', icon: 'mic', label: 'Giọng nói' },
                { id: 'batch', icon: 'layers', label: 'Hàng loạt' },
            ].map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-t-lg transition-all text-sm font-bold ${
                        activeTab === tab.id 
                        ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-500' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="w-full max-w-3xl flex flex-col gap-4 animate-[fadeIn_0.5s] bg-[#1e293b]/50 border border-white/10 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-400">input_circle</span>
                    Nguồn Dữ Liệu
                </h2>
                <div className="flex gap-2 text-xs">
                    <span className="px-2 py-1 rounded bg-black/30 border border-white/10 text-slate-400">Tokens: ~{inputValue.length / 4}</span>
                </div>
            </div>

            {renderTabs()}

            <div className="min-h-[200px] flex flex-col relative">
                
                {/* TEXT TAB */}
                {activeTab === 'text' && (
                    <div className="flex-1 flex flex-col gap-3 animate-fade-in">
                        <textarea 
                            className="w-full h-40 bg-black/30 border border-white/10 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none resize-none font-mono text-sm leading-relaxed"
                            placeholder="Nhập nội dung, dán link bài viết, hoặc ghi chú nhanh..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                        />
                        <div className="flex justify-between items-center text-xs text-slate-500 px-1">
                            <span>Hỗ trợ Markdown, Plain Text, URL</span>
                            <button onClick={() => setInputValue('')} className="text-red-400 hover:text-red-300">Xóa hết</button>
                        </div>
                    </div>
                )}

                {/* IMAGE TAB (DRAG DROP) */}
                {activeTab === 'image' && (
                    <div 
                        className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all animate-fade-in ${
                            dragActive ? 'border-emerald-400 bg-emerald-500/10' : 'border-slate-600 bg-black/20 hover:border-slate-400'
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        {selectedImage ? (
                            <div className="relative w-full h-full flex items-center justify-center group">
                                <img src={selectedImage} alt="Preview" className="max-h-48 object-contain rounded shadow-lg" />
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                    <button onClick={() => setSelectedImage(null)} className="p-2 bg-red-600 text-white rounded-full hover:bg-red-500"><span className="material-symbols-outlined">delete</span></button>
                                    <button className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-500"><span className="material-symbols-outlined">crop</span></button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center pointer-events-none">
                                <span className="material-symbols-outlined text-4xl text-slate-500 mb-3">cloud_upload</span>
                                <p className="text-sm text-slate-300 font-bold">Kéo thả ảnh hoặc tài liệu vào đây</p>
                                <p className="text-xs text-slate-500 mt-1">Hỗ trợ JPG, PNG, PDF (OCR)</p>
                                <button 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold pointer-events-auto transition-colors"
                                >
                                    Chọn file
                                </button>
                            </div>
                        )}
                        <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} accept="image/*,.pdf" />
                    </div>
                )}

                {/* VOICE TAB */}
                {activeTab === 'voice' && (
                    <div className="flex-1 flex flex-col items-center justify-center gap-6 animate-fade-in bg-black/20 rounded-xl border border-white/5 p-6">
                        <div className="flex items-end gap-1 h-16">
                            {audioData.map((h, i) => (
                                <div 
                                    key={i} 
                                    className="w-2 bg-emerald-500 rounded-t transition-all duration-100"
                                    style={{ height: `${h}%`, opacity: isListening ? 1 : 0.3 }}
                                ></div>
                            ))}
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-white mb-1">{isListening ? 'Đang lắng nghe...' : 'Nhấn để nói'}</p>
                            <p className="text-xs text-slate-400">Chuyển giọng nói thành văn bản tức thì</p>
                        </div>
                        <button 
                            onClick={toggleListening}
                            className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all shadow-lg ${
                                isListening 
                                ? 'bg-red-500 text-white animate-pulse shadow-red-500/50' 
                                : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/30 hover:scale-110'
                            }`}
                        >
                            <span className="material-symbols-outlined">{isListening ? 'stop' : 'mic'}</span>
                        </button>
                    </div>
                )}

                {/* BATCH TAB */}
                {activeTab === 'batch' && (
                    <div className="flex-1 flex flex-col gap-2 animate-fade-in">
                        <div className="p-4 border-2 border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-500 hover:border-slate-500 hover:bg-white/5 cursor-pointer transition-colors h-full">
                            <div className="text-center">
                                <span className="material-symbols-outlined text-3xl mb-2">folder_zip</span>
                                <p className="text-sm">Tải lên thư mục hoặc nhiều file</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions Footer */}
            <div className="flex justify-end gap-4 pt-4 border-t border-white/10 mt-2">
                {fileName && (
                    <div className="flex items-center gap-2 mr-auto bg-blue-900/30 px-3 py-1 rounded border border-blue-500/30 text-blue-200 text-xs">
                        <span className="material-symbols-outlined text-sm">description</span>
                        {fileName}
                        {processing && <span className="material-symbols-outlined text-sm animate-spin">sync</span>}
                    </div>
                )}
                
                <button 
                    onClick={() => { setInputValue(''); setSelectedImage(null); setFileName(null); }}
                    className="px-4 py-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors text-sm font-bold"
                >
                    Làm mới
                </button>
                <button 
                    onClick={onScanStart}
                    disabled={(!inputValue && !selectedImage) || processing}
                    className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                    <span className="material-symbols-outlined">science</span>
                    Phân Tích Ngay
                </button>
            </div>
        </div>
    );
};
