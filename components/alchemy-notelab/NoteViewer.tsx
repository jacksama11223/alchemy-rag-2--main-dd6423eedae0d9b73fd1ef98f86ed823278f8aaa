import React from 'react';

interface NoteViewerProps {
    note: any;
    contentRef?: React.Ref<HTMLDivElement>;
}

const NoteViewer: React.FC<NoteViewerProps> = ({ note, contentRef }) => {
    if (!note) return null;

    const renderContent = () => {
        if (note.blocks && Array.isArray(note.blocks)) {
            return note.blocks.map((block: any, index: number) => {
                // Handle Editor.js format (mock data)
                if (block.data && block.data.text) {
                    if (block.type === 'paragraph') {
                        return <p key={index} className="mb-4 text-slate-700 leading-relaxed">{block.data.text}</p>;
                    } else if (block.type === 'header') {
                        const Tag = `h${block.data.level}` as any;
                        return <Tag key={index} className="font-bold text-slate-900 mt-6 mb-3">{block.data.text}</Tag>;
                    } else if (block.type === 'list') {
                        const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
                        return (
                            <ListTag key={index} className={`pl-5 mb-4 text-slate-700 ${block.data.style === 'ordered' ? 'list-decimal' : 'list-disc'}`}>
                                {block.data.items.map((item: string, i: number) => (
                                    <li key={i} className="mb-1">{item}</li>
                                ))}
                            </ListTag>
                        );
                    }
                } 
                // Handle NoteLab format
                else if (block.content !== undefined) {
                    if (block.type === 'text') {
                        return <p key={index} className="mb-4 text-slate-700 leading-relaxed">{block.content}</p>;
                    } else if (block.type === 'h1') {
                        return <h1 key={index} className="text-3xl font-bold text-slate-900 mt-6 mb-3">{block.content}</h1>;
                    } else if (block.type === 'h2') {
                        return <h2 key={index} className="text-2xl font-bold text-slate-900 mt-5 mb-3">{block.content}</h2>;
                    } else if (block.type === 'h3') {
                        return <h3 key={index} className="text-xl font-bold text-slate-900 mt-4 mb-2">{block.content}</h3>;
                    } else if (block.type === 'todo') {
                        return (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <input type="checkbox" checked={block.checked || false} readOnly className="w-4 h-4 text-indigo-600 rounded border-slate-300" />
                                <span className={`text-slate-700 ${block.checked ? 'line-through text-slate-400' : ''}`}>{block.content}</span>
                            </div>
                        );
                    } else if (block.type === 'bullet') {
                        return <li key={index} className="ml-5 list-disc text-slate-700 mb-1">{block.content}</li>;
                    } else if (block.type === 'code') {
                        return <pre key={index} className="bg-slate-800 text-slate-200 p-4 rounded-xl mb-4 overflow-x-auto"><code>{block.content}</code></pre>;
                    } else if (block.type === 'quote') {
                        return <blockquote key={index} className="border-l-4 border-indigo-500 pl-4 italic text-slate-600 mb-4">{block.content}</blockquote>;
                    } else if (block.type === 'image') {
                        return <img key={index} src={block.content} alt="Note image" className="max-w-full rounded-xl mb-4" referrerPolicy="no-referrer" />;
                    }
                }
                return null;
            });
        }

        return <div className="text-slate-700 whitespace-pre-wrap">{note.content || 'Nội dung trống'}</div>;
    };

    return (
        <div ref={contentRef} className="prose prose-slate max-w-none pb-24">
            {renderContent()}
        </div>
    );
};

export default NoteViewer;
