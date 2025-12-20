
import React, { useState } from 'react';
import { Template } from '../types';
import { X, Copy, Check, ZoomIn, Lock, Layers, HeartHandshake } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface TemplateModalProps {
  template: Template & { showCodeOverride?: boolean };
  isAdmin: boolean;
  isVerified?: boolean;
  onClose: () => void;
  onVerifyRequest?: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ 
  template, 
  isAdmin, 
  isVerified, 
  onClose,
  onVerifyRequest 
}) => {
  const [copied, setCopied] = useState(false);
  const [showZoom, setShowZoom] = useState(false);
  const { t } = useLanguage();

  const canViewCode = isAdmin || isVerified || template.showCodeOverride;

  const handleCopy = async () => {
    if (canViewCode) {
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(template.code);
            setCopied(true);
          } else {
            throw new Error('Clipboard API unavailable');
          }
        } catch (err) {
          try {
            const textArea = document.createElement("textarea");
            textArea.value = template.code;
            textArea.style.position = "fixed";
            textArea.style.left = "-9999px";
            textArea.style.top = "0";
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
              setCopied(true);
            }
          } catch (fallbackErr) {
            console.error('Fallback copy failed', fallbackErr);
            alert('复制失败，请尝试长按代码手动复制');
          }
        }
        
        if (copied || true) {
          setTimeout(() => setCopied(false), 2000);
        }
    } else {
        onVerifyRequest?.();
    }
  };

  const handleContactAdminAction = () => {
     const email = 'chex490@gmail.com';
     try {
       navigator.clipboard.writeText(email);
       alert(t.emailCopied);
     } catch (e) {
       alert('请联系管理员邮箱: ' + email);
     }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <div 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
          onClick={onClose}
        />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
          {/* Header Close Button - Sticky */}
          <div className="absolute top-4 right-4 z-20">
            <button 
              onClick={onClose}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-md hover:shadow-lg text-slate-500 hover:text-slate-800 transition-all border border-slate-100"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Scrollable Body */}
          <div className="flex-grow overflow-y-auto custom-scrollbar bg-slate-50">
            {/* Image Preview Area */}
            <div className="w-full bg-white relative border-b border-slate-100 min-h-[300px] sm:min-h-[450px] flex items-center justify-center p-8">
              <img 
                src={template.imageUrl} 
                alt={template.title}
                className="max-w-full max-h-[400px] sm:max-h-[600px] object-contain shadow-lg rounded-lg bg-white cursor-pointer transition-transform hover:scale-[1.01]"
                onClick={() => setShowZoom(true)}
              />
            </div>

            {/* Action Buttons Bar */}
            <div className="sticky top-0 z-10 p-4 bg-white/95 backdrop-blur-sm border-b border-slate-100 grid grid-cols-2 gap-3 shadow-sm">
              <Button 
                variant="secondary" 
                onClick={() => setShowZoom(true)}
                className="flex items-center justify-center gap-2 py-2.5"
              >
                <ZoomIn size={18} />
                <span className="hidden sm:inline">{t.enlargePreview}</span>
                <span className="sm:hidden">查看大图</span>
              </Button>
              <Button 
                onClick={template.isHidden !== false ? handleCopy : handleContactAdminAction} 
                className={`flex items-center justify-center gap-2 py-2.5 shadow-sm transition-all ${copied ? 'bg-emerald-600 hover:bg-emerald-700' : ''}`}
              >
                {copied ? <Check size={18} /> : (canViewCode ? <Copy size={18} /> : (template.isHidden !== false ? <Lock size={18} /> : <HeartHandshake size={18} />))}
                <span>{copied ? t.copied : (canViewCode ? t.copyCode : (template.isHidden !== false ? t.copyClipboard : t.contactAdminBtn))}</span>
              </Button>
            </div>

            {/* Content Details */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                    {template.title}
                  </h2>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                     {template.category_name && (
                       <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 shadow-sm">
                         <Layers size={14} />
                         {template.category_name}
                       </span>
                     )}
                     {template.isHidden === false && !canViewCode && (
                       <span className="px-2 py-1 rounded bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200 shadow-sm animate-pulse">
                         限时免费
                       </span>
                     )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                   {template.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-white text-slate-500 text-[11px] font-bold border border-slate-200 shadow-sm uppercase tracking-wider">
                      #{tag}
                    </span>
                  ))}
                </div>

                <p className="text-slate-600 leading-relaxed text-base">
                  {template.description}
                </p>
              </div>
              
              {/* Code Section */}
              <div className="pt-4">
                <div className="flex items-center justify-between mb-3 px-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    {template.language || 'Source Code'}
                  </span>
                  {canViewCode && (
                    <span className="text-[10px] text-slate-400 font-medium italic">
                      * 支持左右滑动查看完整代码
                    </span>
                  )}
                </div>

                {canViewCode ? (
                  <div className="relative group">
                      <pre className="bg-slate-900 text-slate-100 p-5 rounded-xl text-sm overflow-x-auto font-mono custom-scrollbar border border-slate-800 shadow-inner leading-relaxed">
                          {template.code}
                      </pre>
                  </div>
                ) : (
                  <div className={`border-2 border-dashed rounded-xl p-10 text-center group transition-colors ${template.isHidden !== false ? 'bg-slate-100 border-slate-200 hover:border-indigo-200' : 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'}`}>
                      <div className="bg-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                        {template.isHidden !== false ? <Lock className="text-slate-400" size={32} /> : <HeartHandshake className="text-emerald-500" size={32} />}
                      </div>
                      <p className="text-lg text-slate-700 font-bold mb-1">
                        {template.isHidden !== false ? t.codeHidden : '免费代码获取'}
                      </p>
                      <p className="text-sm text-slate-500 max-w-xs mx-auto">
                        {template.isHidden !== false ? t.codeHiddenDesc : t.contactForFree}
                      </p>
                      <Button 
                        onClick={template.isHidden !== false ? onVerifyRequest : handleContactAdminAction} 
                        className="mt-6" 
                        size="lg"
                        variant={template.isHidden !== false ? 'primary' : 'secondary'}
                      >
                        {template.isHidden !== false ? t.copyClipboard : t.contactAdminBtn}
                      </Button>
                  </div>
                )}
              </div>
              
              {/* Footer Spacer */}
              <div className="h-8"></div>
            </div>
          </div>
        </div>
      </div>

      {showZoom && (
        <div 
          className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={() => setShowZoom(false)}
        >
          <button className="absolute top-6 right-6 text-white/70 hover:text-white p-2">
            <X size={32} />
          </button>
          <img 
            src={template.imageUrl} 
            alt={template.title}
            className="max-w-full max-h-full object-contain shadow-2xl rounded-lg"
          />
        </div>
      )}
    </>
  );
};
