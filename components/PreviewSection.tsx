import React, { useState } from 'react';
import { Copy, Check, Download, Edit2, RotateCcw } from 'lucide-react';

interface PreviewSectionProps {
  content: string;
  isGenerating: boolean;
  onUpdate: (newContent: string) => void;
}

const PreviewSection: React.FC<PreviewSectionProps> = ({ content, isGenerating, onUpdate }) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "motivation_letter.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!content && !isGenerating) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex items-center justify-center p-8 bg-slate-50/50">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mx-auto mb-4">
             <Edit2 className="w-8 h-8 text-brand-300" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">Ready to Write</h3>
          <p className="text-slate-500">
            Enter the job description and your CV details on the left, then click "Generate Letter" to see the magic happen.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col overflow-hidden relative">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-slate-800">Generated Letter</h2>
        <div className="flex gap-2">
           <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isGenerating}
            className={`p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors ${isEditing ? 'bg-brand-50 text-brand-600' : ''}`}
            title="Edit Text"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
            title="Download .txt"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleCopy}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative bg-white">
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
             <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
             <p className="text-slate-600 font-medium animate-pulse">Analyzing CV & Job requirements...</p>
          </div>
        )}
        
        <div className="p-8 min-h-full">
          {isEditing ? (
             <textarea 
                className="w-full h-full min-h-[500px] resize-none outline-none text-slate-700 leading-relaxed whitespace-pre-wrap font-sans text-base p-2 border border-brand-100 rounded-md focus:ring-2 focus:ring-brand-100"
                value={content}
                onChange={(e) => onUpdate(e.target.value)}
             />
          ) : (
             <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap font-sans text-base">
               {content}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;
