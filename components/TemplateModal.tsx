import React, { useState } from 'react';
import { Template } from '../types';
import { X, Copy, Check, ZoomIn } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface TemplateModalProps {
  template: Template;
  isAdmin: boolean;
  onClose: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ template, isAdmin, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const { t } = useLanguage();

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            <div className="p-4 bg-white border-b border-slate-100 grid grid-cols-2 gap-3 shrink-0">
              <Button 
                variant="secondary" 
                onClick={() => setShowZoom(true)}
                className="flex items-center gap-2"
              >
                <ZoomIn size={16} />
                {t.enlargePreview}
              </Button>
              <Button 
                onClick={handleCopy} 
                className={`flex items-center gap-2 shadow-sm ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? t.copiedClipboard : t.copyClipboard}
              </Button>
            </div>

            {/* Info Section */}
            <div className="p-6 overflow-y-auto flex-grow bg-slate-50">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{template.title}</h2>
              <div className="flex gap-2 mb-4">
                 {template.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-0.5 rounded-full bg-white text-indigo-700 text-xs font-medium border border-indigo-100 shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-slate-600 leading-relaxed text-sm">
                {template.description}
              </p>
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