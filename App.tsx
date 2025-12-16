import React, { useState } from 'react';
import FormSection from './components/FormSection';
import PreviewSection from './components/PreviewSection';
import { INITIAL_OPTIONS, GeneratorOptions, UploadedFile, JobMode } from './types';
import { generateMotivationLetter } from './services/gemini';
import { PenTool, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [jobMode, setJobMode] = useState<JobMode>('text');
  const [cvText, setCvText] = useState('');
  const [cvFile, setCvFile] = useState<UploadedFile | null>(null);
  const [options, setOptions] = useState<GeneratorOptions>(INITIAL_OPTIONS);
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [webSources, setWebSources] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setWebSources([]);
    try {
      const { text, webSources: sources } = await generateMotivationLetter(jobDescription, jobMode, cvText, cvFile, options);
      setGeneratedLetter(text);
      if (sources) {
        setWebSources(sources);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong while generating the letter. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
               <PenTool className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">
              CoverLetter<span className="text-brand-600">.ai</span>
            </h1>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 rounded-full">
              <Sparkles className="w-3 h-3 text-amber-500" />
              Powered by Gemini 2.5
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-10rem)] min-h-[600px]">
          {/* Left Column: Input Form */}
          <div className="h-full">
            <FormSection
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              jobMode={jobMode}
              setJobMode={setJobMode}
              cvText={cvText}
              setCvText={setCvText}
              cvFile={cvFile}
              setCvFile={setCvFile}
              options={options}
              setOptions={setOptions}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
            />
          </div>

          {/* Right Column: Preview */}
          <div className="h-full">
            <PreviewSection
              content={generatedLetter}
              isGenerating={isGenerating}
              onUpdate={setGeneratedLetter}
              webSources={webSources}
            />
          </div>
        </div>
      </main>
      
      {/* Footer for mobile spacing */}
      <div className="h-6 sm:hidden"></div>
    </div>
  );
};

export default App;