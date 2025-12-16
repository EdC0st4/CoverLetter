import React, { useRef, useState } from 'react';
import { GeneratorOptions, UploadedFile, JobMode } from '../types';
import { Briefcase, FileText, Settings, User, Upload, X, FileCheck, Link as LinkIcon, AlignLeft } from 'lucide-react';
import mammoth from 'mammoth';

interface FormSectionProps {
  jobDescription: string;
  setJobDescription: (val: string) => void;
  jobMode: JobMode;
  setJobMode: (mode: JobMode) => void;
  cvText: string;
  setCvText: (val: string) => void;
  cvFile: UploadedFile | null;
  setCvFile: (file: UploadedFile | null) => void;
  options: GeneratorOptions;
  setOptions: (val: GeneratorOptions) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

const FormSection: React.FC<FormSectionProps> = ({
  jobDescription,
  setJobDescription,
  jobMode,
  setJobMode,
  cvText,
  setCvText,
  cvFile,
  setCvFile,
  options,
  setOptions,
  onGenerate,
  isGenerating,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [extractingText, setExtractingText] = useState(false);

  const handleOptionChange = (field: keyof GeneratorOptions, value: string) => {
    setOptions({ ...options, [field]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size (e.g. 5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Please upload a file smaller than 5MB.");
      return;
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    // Reset current states
    setCvFile(null);
    setCvText('');

    // Handle PDF and Images (Native Support)
    if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove data URL prefix
        const base64Data = base64String.split(',')[1];
        
        setCvFile({
          data: base64Data,
          mimeType: fileType,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    } 
    // Handle DOCX (Text Extraction via Mammoth)
    else if (fileName.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setExtractingText(true);
      const reader = new FileReader();
      reader.onloadend = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (arrayBuffer) {
          try {
            const result = await mammoth.extractRawText({ arrayBuffer });
            setCvText(result.value);
          } catch (err) {
            console.error("Failed to extract text from DOCX", err);
            alert("Could not read the .docx file. Please try converting to PDF or pasting the text.");
          } finally {
            setExtractingText(false);
          }
        }
      };
      reader.readAsArrayBuffer(file);
    }
    // Handle Text Files
    else if (fileName.endsWith('.txt') || fileType === 'text/plain') {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const text = event.target?.result as string;
        setCvText(text);
      };
      reader.readAsText(file);
    } else {
      alert("Unsupported file type. Please upload PDF, DOCX, TXT, or Image.");
    }
    
    // Reset input value to allow re-uploading same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearFile = () => {
    setCvFile(null);
    setCvText('');
  };

  const isJobValid = jobDescription.trim().length > 5; // Minimal check, URL or Text
  const isCvValid = cvText.trim().length > 20 || cvFile !== null;
  const isFormValid = isJobValid && isCvValid;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-slate-100 bg-slate-50">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600" />
          Application Details
        </h2>
        <p className="text-sm text-slate-500 mt-1">Provide the context for your letter.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Job Description Input */}
        <div className="space-y-2">
           <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Job Vacancy
              </label>
              <div className="flex bg-slate-100 rounded-lg p-0.5">
                  <button
                    onClick={() => setJobMode('text')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${jobMode === 'text' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <div className="flex items-center gap-1">
                      <AlignLeft className="w-3 h-3" />
                      Text
                    </div>
                  </button>
                  <button
                    onClick={() => setJobMode('url')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${jobMode === 'url' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                     <div className="flex items-center gap-1">
                      <LinkIcon className="w-3 h-3" />
                      Link
                    </div>
                  </button>
              </div>
           </div>
          
          {jobMode === 'text' ? (
            <textarea
              className="w-full h-40 p-3 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none bg-slate-50 placeholder-slate-400"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          ) : (
            <div className="relative">
              <input 
                type="url" 
                className="w-full p-3 pl-10 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-slate-50 placeholder-slate-400"
                placeholder="https://www.linkedin.com/jobs/..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <p className="text-xs text-slate-500 mt-2">
                Provide a direct link to the job posting. The AI will search for the details.
              </p>
            </div>
          )}
        </div>

        {/* CV Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Your CV / Resume
            </label>
            {!cvFile && !cvText && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Upload File
              </button>
            )}
            {/* Show change button if text is present but not file (e.g. extracted text) */}
            {cvText && !cvFile && (
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-slate-500 hover:text-brand-600 font-medium flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Replace File
              </button>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,application/pdf,image/*,.docx,.doc,.txt,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />

          {extractingText && (
             <div className="w-full p-4 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center gap-2 text-sm text-slate-500">
                <svg className="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Reading document...
             </div>
          )}

          {!extractingText && cvFile ? (
            <div className="relative group w-full p-4 rounded-lg border border-brand-200 bg-brand-50 flex items-center gap-3">
              <div className="p-2 bg-white rounded-md shadow-sm">
                <FileCheck className="w-5 h-5 text-brand-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 truncate">{cvFile.name}</p>
                <p className="text-xs text-slate-500">File Attached (PDF/Image)</p>
              </div>
              <button 
                onClick={clearFile}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : !extractingText ? (
            <div className="relative">
              <textarea
                className="w-full h-40 p-3 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none bg-slate-50 placeholder-slate-400"
                placeholder="Paste your CV text here..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
              />
              {!cvText && (
                 <div className="absolute bottom-3 right-3 pointer-events-none opacity-50">
                    <span className="text-xs text-slate-400 bg-white px-2 py-1 rounded border border-slate-100 shadow-sm">
                      Or paste text above
                    </span>
                 </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Optional Fields */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Personalization (Optional)</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Your Name</label>
              <input
                type="text"
                className="w-full p-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="John Doe"
                value={options.candidateName}
                onChange={(e) => handleOptionChange('candidateName', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Company Name</label>
              <input
                type="text"
                className="w-full p-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Acme Corp"
                value={options.companyName}
                onChange={(e) => handleOptionChange('companyName', e.target.value)}
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Target Job Title</label>
              <input
                type="text"
                className="w-full p-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Senior Developer"
                value={options.jobTitle}
                onChange={(e) => handleOptionChange('jobTitle', e.target.value)}
              />
            </div>
             <div>
              <label className="block text-xs font-medium text-slate-500 mb-1">Language</label>
              <input
                type="text"
                className="w-full p-2 text-sm rounded border border-slate-300 focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="English"
                value={options.language}
                onChange={(e) => handleOptionChange('language', e.target.value)}
              />
            </div>
          </div>
          
          <div className="mt-4">
             <label className="block text-xs font-medium text-slate-500 mb-1">Tone</label>
             <div className="flex flex-wrap rounded-md shadow-sm" role="group">
                {['professional', 'enthusiastic', 'formal', 'match_cv'].map((t, idx, arr) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleOptionChange('tone', t)}
                    className={`px-3 py-2 text-xs font-medium border -ml-px flex-1 capitalize transition-colors first:ml-0
                      ${idx === 0 ? 'rounded-l-lg' : ''}
                      ${idx === arr.length - 1 ? 'rounded-r-lg' : ''}
                      ${options.tone === t 
                        ? 'bg-brand-50 text-brand-700 border-brand-200 z-10 ring-1 ring-brand-200' 
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    {t === 'match_cv' ? 'Match CV' : t}
                  </button>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-slate-50 border-t border-slate-200">
        <button
          onClick={onGenerate}
          disabled={!isFormValid || isGenerating}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-all shadow-md
            ${!isFormValid || isGenerating 
              ? 'bg-slate-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-brand-500/25 active:scale-[0.98]'}`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Writing your letter...
            </>
          ) : (
            <>
              Generate Letter
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </button>
        {!isFormValid && (
           <p className="text-xs text-center text-slate-400 mt-2">
             {jobMode === 'url' && jobDescription.length <= 5 ? 'Please enter a valid URL.' : 'Please add more details to Job and CV fields to start.'}
           </p>
        )}
      </div>
    </div>
  );
};

export default FormSection;