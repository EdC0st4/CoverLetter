import React, { useRef, useState } from 'react';
import { GeneratorOptions, UploadedFile, JobMode } from '../types';
import { Briefcase, FileText, Settings, User, Upload, X, FileCheck, Link as LinkIcon, AlignLeft, ChevronDown, ChevronUp } from 'lucide-react';
// @ts-ignore
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
  const [isPersonalizationOpen, setIsPersonalizationOpen] = useState(false);

  const handleOptionChange = (field: keyof GeneratorOptions, value: string) => {
    setOptions({ ...options, [field]: value });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Bestand is te groot. Upload een bestand kleiner dan 5MB.");
      return;
    }

    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    setCvFile(null);
    setCvText('');

    if (fileType === 'application/pdf' || fileType.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(',')[1];
        
        setCvFile({
          data: base64Data,
          mimeType: fileType,
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    } 
    else if (fileName.endsWith('.docx') || fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      setExtractingText(true);
      const reader = new FileReader();
      reader.onloadend = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        try {
          const result = await mammoth.extractRawText({ arrayBuffer });
          setCvText(result.value);
        } catch (err) {
          console.error("Failed to extract text from DOCX", err);
          alert("Kan het .docx bestand niet lezen. Probeer het te converteren naar PDF of plak de tekst.");
        } finally {
          setExtractingText(false);
        }
      };
      reader.readAsArrayBuffer(file);
    }
    else if (fileName.endsWith('.txt') || fileType === 'text/plain') {
      const reader = new FileReader();
      reader.onloadend = (event) => {
        const text = event.target?.result as string;
        setCvText(text);
      };
      reader.readAsText(file);
    } else {
      alert("Niet-ondersteund bestandstype. Upload PDF, DOCX, TXT of een afbeelding.");
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearFile = () => {
    setCvFile(null);
    setCvText('');
  };

  const isJobValid = jobDescription.trim().length > 5;
  const isCvValid = cvText.trim().length > 20 || cvFile !== null;
  const isFormValid = isJobValid && isCvValid;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full transition-colors duration-300">
      <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          Sollicitatiegegevens
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Geef de context voor je brief.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        
        {/* Job Description Input */}
        <div className="space-y-2">
           <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                Vacature
              </label>
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-0.5">
                  <button
                    onClick={() => setJobMode('text')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${jobMode === 'text' ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-brand-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    <div className="flex items-center gap-1">
                      <AlignLeft className="w-3 h-3" />
                      Tekst
                    </div>
                  </button>
                  <button
                    onClick={() => setJobMode('url')}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${jobMode === 'url' ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-brand-300 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
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
              className="w-full h-40 p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none bg-slate-50 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100"
              placeholder="Plak hier de vacaturetekst..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          ) : (
            <div className="relative">
              <input 
                type="url" 
                className="w-full p-3 pl-10 text-sm rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all bg-slate-50 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100"
                placeholder="https://www.linkedin.com/jobs/..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
              />
              <LinkIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Geef een directe link naar de vacature. De AI zal de details opzoeken.
              </p>
            </div>
          )}
        </div>

        {/* CV Input Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Je CV / Resume
            </label>
            {!cvFile && !cvText && (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Upload Bestand
              </button>
            )}
            {cvText && !cvFile && (
               <button 
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 font-medium flex items-center gap-1"
              >
                <Upload className="w-3 h-3" />
                Vervang Bestand
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
             <div className="w-full p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <svg className="animate-spin h-4 w-4 text-brand-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Document lezen...
             </div>
          )}

          {!extractingText && cvFile ? (
            <div className="relative group w-full p-4 rounded-lg border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/20 flex items-center gap-3">
              <div className="p-2 bg-white dark:bg-slate-800 rounded-md shadow-sm">
                <FileCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{cvFile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Bestand gekoppeld (PDF/Afbeelding)</p>
              </div>
              <button 
                onClick={clearFile}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                title="Verwijder bestand"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : !extractingText ? (
            <div className="relative">
              <textarea
                className="w-full h-40 p-3 text-sm rounded-lg border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none bg-slate-50 dark:bg-slate-900 placeholder-slate-400 dark:placeholder-slate-500 text-slate-900 dark:text-slate-100"
                placeholder="Plak hier je CV tekst..."
                value={cvText}
                onChange={(e) => setCvText(e.target.value)}
              />
              {!cvText && (
                 <div className="absolute bottom-3 right-3 pointer-events-none opacity-50">
                    <span className="text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-800 px-2 py-1 rounded border border-slate-100 dark:border-slate-700 shadow-sm">
                      Of plak tekst hierboven
                    </span>
                 </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Optional Fields (Collapsible) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
          <button 
            onClick={() => setIsPersonalizationOpen(!isPersonalizationOpen)}
            className="flex items-center justify-between w-full mb-4 group"
          >
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">Personalisatie (Optioneel)</span>
            </div>
            {isPersonalizationOpen ? (
              <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-brand-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-brand-500" />
            )}
          </button>
          
          {isPersonalizationOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Je Naam</label>
                  <input
                    type="text"
                    className="w-full p-2 text-sm rounded border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-white"
                    placeholder="John Doe"
                    value={options.candidateName}
                    onChange={(e) => handleOptionChange('candidateName', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bedrijfsnaam</label>
                  <input
                    type="text"
                    className="w-full p-2 text-sm rounded border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-white"
                    placeholder="Acme Corp"
                    value={options.companyName}
                    onChange={(e) => handleOptionChange('companyName', e.target.value)}
                  />
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Doelfunctie</label>
                  <input
                    type="text"
                    className="w-full p-2 text-sm rounded border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-white"
                    placeholder="Senior Developer"
                    value={options.jobTitle}
                    onChange={(e) => handleOptionChange('jobTitle', e.target.value)}
                  />
                </div>
                 <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Taal</label>
                  <input
                    type="text"
                    className="w-full p-2 text-sm rounded border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-white"
                    placeholder="Nederlands"
                    value={options.language}
                    onChange={(e) => handleOptionChange('language', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Lengte van de Brief</label>
                  <select
                    className="w-full p-2 text-sm rounded border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white dark:bg-slate-700 dark:text-white"
                    value={options.length}
                    onChange={(e) => handleOptionChange('length', e.target.value)}
                  >
                    <option value="short">Kort (200-250 woorden)</option>
                    <option value="standard">Standaard (300-350 woorden)</option>
                    <option value="detailed">Gedetailleerd (400-450 woorden)</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-4">
                 <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Toon</label>
                 <div className="flex flex-wrap rounded-md shadow-sm" role="group">
                    {[
                      { key: 'professional', label: 'Professioneel' },
                      { key: 'enthusiastic', label: 'Enthousiast' },
                      { key: 'formal', label: 'Formeel' },
                      { key: 'match_cv', label: 'Match CV' }
                    ].map((t, idx, arr) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => handleOptionChange('tone', t.key as any)}
                        className={`px-3 py-2 text-xs font-medium border -ml-px flex-1 transition-colors first:ml-0
                          ${idx === 0 ? 'rounded-l-lg' : ''}
                          ${idx === arr.length - 1 ? 'rounded-r-lg' : ''}
                          ${options.tone === t.key 
                            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700 z-10 ring-1 ring-brand-200 dark:ring-brand-700' 
                            : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'}`}
                      >
                        {t.label}
                      </button>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={onGenerate}
          disabled={!isFormValid || isGenerating}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-all shadow-md
            ${!isFormValid || isGenerating 
              ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed' 
              : 'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600 shadow-brand-500/25 active:scale-[0.98]'}`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Je brief schrijven...
            </>
          ) : (
            <>
              Genereer Brief
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </>
          )}
        </button>
        {!isFormValid && (
           <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-2">
             {jobMode === 'url' && jobDescription.length <= 5 ? 'Voer een geldige URL in.' : 'Voeg meer details toe aan de Vacature en CV velden om te beginnen.'}
           </p>
        )}
      </div>
    </div>
  );
};

export default FormSection;