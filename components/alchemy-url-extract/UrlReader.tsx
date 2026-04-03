import React from 'react';

interface UrlReaderProps {
    urlData: any;
    contentRef?: React.Ref<HTMLDivElement>;
}

const UrlReader: React.FC<UrlReaderProps> = ({ urlData, contentRef }) => {
    if (!urlData) return null;

    return (
        <div ref={contentRef} className="prose prose-slate max-w-none pb-24">
            <h1 className="text-2xl font-bold text-slate-800 mb-4">{urlData.title}</h1>
            <a href={urlData.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm mb-6 inline-block">
                {urlData.url}
            </a>
            <div 
                className="text-slate-700 leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: urlData.textContent || urlData.htmlContent || 'Nội dung trống' }}
            />
        </div>
    );
};

export default UrlReader;
