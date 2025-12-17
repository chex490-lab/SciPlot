import React, { useState } from 'react';
import { Template } from '../types';
import { X, Copy, Check, ZoomIn, Lock, Unlock, Key, ClipboardCopy } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { backend } from '../services/backend';

interface TemplateModalProps {
  template: Template;
  isAdmin: boolean;
  onClose: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ template, isAdmin, onClose }) => {
  const [isUnlocked, setIsUnlocked] = useState(isAdmin);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [verifyError, setVerifyError] = useState('');
  
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const [fullCode, setFullCode] = useState(template.codeContent || template.code);
  const { t } = useLanguage();

  const handleCopy = async () => {
    // If unlocked, just copy the currently visible code
    await navigator.clipboard.writeText(fullCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGetCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputCode) return;

    setIsVerifying(true);
    setVerifyError('');

    try {
      const result = await backend.getCode(inputCode, template.id);
      if (result.success && result.code) {
        setFullCode(result.code);
        setIsUnlocked(true);
        setShowInput(false);
        
        // Auto copy to clipboard
        await navigator.clipboard.writeText(result.code);
        
        // Show Toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      } else {
        setVerifyError(result.error || t.unlockFail);
      }
    } catch (error) {
      console.error(error);
      setVerifyError(t.unlockFail);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm hover:shadow text-slate-500 hover:text-slate-800 transition-all"
          >
            <X size={20} />
          </button>

          {/* Toast Notification */}
          {showToast && (
             <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-top-4 fade-in duration-300">
               <Check size={16} />
               <span className="font-medium text-sm">{t.codeCopiedToast}</span>
             </div>
          )}

          {/* Main Content */}
          <div className="w-full flex flex-col bg-slate-50 h-full">
            {/* Image Section */}
            <div className="h-64 sm:h-96 bg-white relative bg-pattern group shrink-0 border-b border-slate-100">
               <div className="absolute inset-0 flex items-center justify-center p-6">
                 <img 
                   src={template.imageUrl} 
                   alt={template.title}
                   className="max-w-full max-h-full object-contain shadow-sm rounded bg-white cursor-pointer transition-transform hover:scale-[1.02]"
                   onClick={() => setShowZoom(true)}
                 />
               </div>
               <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                 <button 
                    onClick={() => setShowZoom(true)}
                    className="p-2 bg-black/50 text-white rounded-lg hover:bg-black/70 backdrop-blur-sm"
                    title={t.enlargePreview}
                 >
                   <ZoomIn size={18} />
                 </button>
               </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
              <Button 
                variant="secondary" 
                onClick={() => setShowZoom(true)}
                className="flex items-center gap-2"
              >
                <ZoomIn size={16} />
                <span className="hidden sm:inline">{t.enlargePreview}</span>
              </Button>

              <div className="flex gap-2">
                {!isUnlocked ? (
                  showInput ? (
                    <form onSubmit={handleGetCode} className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4">
                      <div className="relative">
                        <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          value={inputCode}
                          onChange={(e) => { setInputCode(e.target.value); setVerifyError(''); }}
                          placeholder={t.enterMemberCode}
                          className={`pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 w-40 sm:w-48 ${
                            verifyError 
                              ? 'border-red-300 focus:ring-red-200 bg-red-50 text-red-900 placeholder-red-300' 
                              : 'border-slate-300 focus:ring-indigo-500'
                          }`}
                          autoFocus
                        />
                      </div>
                      <Button 
                        type="submit" 
                        isLoading={isVerifying}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        {t.verify}
                      </Button>
                    </form>
                  ) : (
                    <Button 
                      onClick={() => setShowInput(true)}
                      className="flex items-center gap-2 shadow-sm bg-slate-900 hover:bg-slate-800 text-white"
                    >
                      <ClipboardCopy size={16} />
                      {t.copyClipboard}
                    </Button>
                  )
                ) : (
                  <Button 
                    onClick={handleCopy} 
                    className={`flex items-center gap-2 shadow-sm ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? t.copiedClipboard : t.copyCode}
                  </Button>
                )}
              </div>
            </div>

            {/* Info Section + Code */}
            <div className="flex-grow flex flex-col min-h-0 bg-slate-50">
               <div className="p-6 pb-2">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{template.title}</h2>
                <div className="flex gap-2 mb-4">
                  {template.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white text-indigo-700 text-xs font-medium border border-indigo-100 shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="text-slate-600 leading-relaxed text-sm mb-4">
                  {template.description}
                </p>
                {/* Error Message Display below description if input not visible */}
                {verifyError && showInput && (
                    <p className="text-red-500 text-xs mt-1 mb-2 animate-pulse">{verifyError}</p>
                )}
               </div>

               {/* Code Section */}
               <div className="flex-grow p-6 pt-0 relative overflow-hidden">
                 <div className={`h-full rounded-lg bg-slate-800 border border-slate-700 overflow-hidden relative flex flex-col ${!isUnlocked ? 'select-none' : ''}`}>
                    <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-700 text-slate-400 text-xs uppercase tracking-wider font-mono">
                      <span>{template.language}</span>
                      {isUnlocked && <span className="text-emerald-500 flex items-center gap-1"><Unlock size={12} /> {t.unlockSuccess}</span>}
                    </div>
                    
                    <div className="relative flex-grow overflow-auto custom-scrollbar bg-slate-800 p-4">
                      <pre className={`font-mono text-sm text-slate-300 ${!isUnlocked ? 'blur-sm opacity-50' : ''}`}>
                        {fullCode}
                      </pre>
                      
                      {/* Locked Overlay */}
                      {!isUnlocked && (
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4 text-center">
                          <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-slate-700/50 max-w-xs transform hover:scale-105 transition-transform duration-300">
                             <div className="w-12 h-12 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                               <Lock size={24} />
                             </div>
                             <h3 className="text-white font-bold text-lg mb-2">{t.lockedContent}</h3>
                             <p className="text-slate-400 text-sm mb-4">
                               {verifyError && !showInput ? <span className="text-red-400">{verifyError}</span> : t.lockedContentDesc}
                             </p>
                             <Button 
                                size="sm" 
                                onClick={() => setShowInput(true)}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 border-none flex items-center justify-center gap-2"
                              >
                                <ClipboardCopy size={16} />
                                {t.copyClipboard}
                              </Button>
                          </div>
                        </div>
                      )}
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Zoom Modal */}
      {showZoom && (
        <div 
          className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setShowZoom(false)}
        >
          <button 
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            onClick={() => setShowZoom(false)}
          >
            <X size={24} />
          </button>
          <img 
            src={template.imageUrl} 
            alt={template.title}
            className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg"
          />
        </div>
      )}
    </>
  );
};