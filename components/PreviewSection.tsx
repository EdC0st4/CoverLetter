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
    element.download = "motivatiebrief.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!content && !isGenerating) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full flex items-center justify-center p-8 bg-slate-50/50 dark:bg-slate-900/50 transition-colors duration-300">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
             <Edit2 className="w-8 h-8 text-brand-300 dark:text-brand-500" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Klaar om te Schrijven</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Voer de vacature en je CV details aan de linkerkant in en klik op "Genereer Brief" om het resultaat te zien.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 h-full flex flex-col overflow-hidden relative transition-colors duration-300">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800 sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Gegenereerde Brief</h2>
        <div className="flex gap-2">
           <button
            onClick={() => setIsEditing(!isEditing)}
            disabled={isGenerating}
            className={`p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-slate-700 transition-colors ${isEditing ? 'bg-brand-50 dark:bg-slate-700 text-brand-600 dark:text-brand-400' : ''}`}
            title="Bewerk Tekst"
          >
            <Edit2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="p-2 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 dark:text-slate-400 dark:hover:text-brand-400 dark:hover:bg-slate-700 transition-colors"
            title="Downloaden als .txt"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={handleCopy}
            disabled={isGenerating}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 dark:bg-brand-600 text-white hover:bg-slate-800 dark:hover:bg-brand-500 transition-colors text-sm font-medium"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Gekopieerd
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Kopieer
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative bg-white dark:bg-slate-800">
        {isGenerating && (
          <div className="absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-4 text-center">
             <div className="w-12 h-12 border-4 border-brand-200 dark:border-brand-900 border-t-brand-600 dark:border-t-brand-500 rounded-full animate-spin mb-4"></div>
             <p className="text-slate-600 dark:text-slate-300 font-medium animate-pulse">CV & Vacature-eisen analyseren...</p>
          </div>
        )}
        
        <div className="p-8 min-h-full">
          {isEditing ? (
             <textarea 
                className="w-full h-full min-h-[500px] resize-none outline-none text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 leading-relaxed whitespace-pre-wrap font-sans text-base p-2 border border-brand-100 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-brand-100 dark:focus:ring-slate-500"
                value={content}
                onChange={(e) => onUpdate(e.target.value)}
             />
          ) : (
             <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-sans text-base">
               {content}
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreviewSection;