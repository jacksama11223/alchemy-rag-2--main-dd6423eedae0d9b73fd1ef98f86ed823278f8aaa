
import React, { useState } from 'react';

// 11. YouTubeEmbedPlayer
export const YouTubeEmbedPlayer: React.FC<{ url: string }> = ({ url }) => (
    <div className="absolute top-1/4 right-1/4 z-20 w-64 bg-black rounded-lg overflow-hidden border border-red-600/50 shadow-2xl">
        <div className="bg-red-600 h-1 w-full"></div>
        <div className="aspect-video flex items-center justify-center bg-zinc-900 text-red-500">
            <span className="material-symbols-outlined text-4xl">play_circle</span>
        </div>
        <div className="p-2 text-xs text-white truncate">Video ID: {url}</div>
    </div>
);

// 12. PDFNativeViewer
export const PDFNativeViewer: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="absolute top-20 right-6 w-[400px] h-[600px] bg-zinc-800 border border-white/10 shadow-2xl z-40 flex flex-col rounded-lg animate-slide-left">
            <div className="bg-zinc-900 p-2 flex justify-between items-center border-b border-white/5">
                <span className="text-xs text-slate-300 font-bold">Document.pdf</span>
                <button onClick={onClose}><span className="material-symbols-outlined text-slate-400 text-sm">close</span></button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
                <div className="bg-white h-[800px] w-full opacity-80 rounded flex items-center justify-center text-black font-serif">
                    PDF Content Placeholder
                </div>
            </div>
        </div>
    );
};

// 13. AudioMemoRecorder (Node attachment)
export const AudioMemoRecorder: React.FC = () => (
    <button className="w-6 h-6 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center transition-colors border border-red-500/50" title="Ghi âm note">
        <span className="material-symbols-outlined text-[14px]">mic</span>
    </button>
);

// 14. IframeWidget
export const IframeWidget: React.FC<{ url: string }> = ({ url }) => (
    <div className="absolute inset-0 m-20 z-20 bg-white rounded-xl overflow-hidden shadow-2xl border-4 border-slate-800 pointer-events-none opacity-50">
        <div className="bg-slate-100 p-2 text-center text-xs text-slate-500 border-b">{url}</div>
        <div className="h-full w-full bg-slate-50 flex items-center justify-center">External Content</div>
    </div>
);

// 15. CodeRunnerSandbox: Interactive JS Sandbox in Graph View
export const CodeRunnerSandbox: React.FC<{ isOpen: boolean }> = ({ isOpen }) => {
    const [code, setCode] = useState("console.log('Graph Node Running...');\n\nconst x = 5;\nconst y = 10;\nreturn x * y;");
    const [output, setOutput] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    
    const run = async () => {
        setIsRunning(true);
        setOutput(null);
        await new Promise(r => setTimeout(r, 200));
        
        const logs: string[] = [];
        const mockConsole = {
            log: (...args: any[]) => logs.push(args.join(' ')),
            error: (...args: any[]) => logs.push('Err: ' + args.join(' ')),
            warn: (...args: any[]) => logs.push('Warn: ' + args.join(' ')),
        };

        try {
            const func = new Function('console', code);
            const res = func(mockConsole);
            if (logs.length > 0) setOutput(logs.join('\n'));
            if (res !== undefined) setOutput(prev => (prev ? prev + '\n' : '') + 'Return: ' + String(res));
            if (!logs.length && res === undefined) setOutput("Executed successfully.");
        } catch (e: any) {
            setOutput('Error: ' + e.message);
        } finally {
            setIsRunning(false);
        }
    };

    if (!isOpen) return null;
    return (
        <div className="absolute bottom-6 right-6 w-96 bg-[#1e1e1e] border border-green-500/30 rounded-xl shadow-xl z-30 overflow-hidden font-mono text-xs flex flex-col h-64">
            <div className="bg-green-900/20 p-2 border-b border-green-500/20 flex justify-between items-center">
                <span className="text-green-400 font-bold flex items-center gap-2"><span className="material-symbols-outlined text-sm">terminal</span> JS Sandbox</span>
                <button 
                    onClick={run}
                    disabled={isRunning}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-500 text-white px-2 py-0.5 rounded transition-colors disabled:opacity-50"
                >
                    <span className="material-symbols-outlined text-sm">{isRunning ? 'sync' : 'play_arrow'}</span>
                    {isRunning ? 'Run...' : 'Run'}
                </button>
            </div>
            <div className="flex-1 relative">
                <textarea 
                    className="w-full h-full bg-[#1e1e1e] text-slate-300 p-2 resize-none focus:outline-none border-b border-white/10"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck={false}
                />
            </div>
            {output && (
                <div className="h-20 bg-black/40 p-2 overflow-y-auto text-green-300 border-t border-white/10">
                    <pre className="whitespace-pre-wrap font-mono">{output}</pre>
                </div>
            )}
        </div>
    );
};
