
import React, { useState, useMemo, useEffect } from 'react';
import { Template } from './types';
import { TemplateCard } from './components/TemplateCard';
import { TemplateModal } from './components/TemplateModal';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { MemberCodeModal } from './components/MemberCodeModal';
import { Button } from './components/Button';
import { Search, Plus, LayoutGrid, Beaker, Globe, UserCog, LogOut, Loader2, Inbox } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { api } from './src/services/api';

export default function App() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [verifyingTemplate, setVerifyingTemplate] = useState<Template | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const { t, language, setLanguage } = useLanguage();

  useEffect(() => {
    loadTemplates();
    const token = localStorage.getItem('auth_token');
    if (token) setIsAdmin(true);
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await api.getTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    if (!Array.isArray(templates)) return [];
    const term = searchTerm.toLowerCase().trim();
    if (!term) return templates;

    return templates.filter(t => {
      const title = (t.title || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      const tags = Array.isArray(t.tags) ? t.tags : [];
      
      return title.includes(term) || 
             desc.includes(term) ||
             tags.some(tag => tag.toLowerCase().includes(term));
    });
  }, [templates, searchTerm]);

  const handleLogin = async (password: string) => {
    const res = await api.login('admin', password);
    if (res.success && res.token) {
      localStorage.setItem('auth_token', res.token);
      setIsAdmin(true);
      setShowLoginModal(false);
      setShowAdminPanel(true);
    } else {
      alert(t.wrongPassword);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    setIsAdmin(false);
    setShowAdminPanel(false);
    loadTemplates();
  };

  const handleTemplateClick = (t: Template) => {
    setSelectedTemplate(t);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg text-white">
              <Beaker size={20} strokeWidth={2.5} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
              {t.appTitle}
            </h1>
          </div>

          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setLanguage(language === 'en' ? 'zh' : 'en')} className="hidden sm:flex text-slate-600">
              <Globe size={16} className="mr-1.5" />
              {language === 'en' ? '中文' : 'English'}
            </Button>

            {isAdmin ? (
               <div className="flex gap-2">
                 <Button onClick={() => setShowAdminPanel(true)} size="sm" className="whitespace-nowrap">
                  <UserCog size={16} className="mr-1.5" />
                  Dashboard
                </Button>
                <Button onClick={handleLogout} variant="secondary" size="sm">
                  <LogOut size={16} />
                </Button>
               </div>
            ) : (
                <Button onClick={() => setShowLoginModal(true)} variant="ghost" size="sm" className="text-slate-600">
                  <UserCog size={18} />
                </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {showAdminPanel ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <AdminPanel 
              onAddTemplate={() => {}} 
              onClose={() => { setShowAdminPanel(false); loadTemplates(); }} 
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <LayoutGrid size={18} className="text-indigo-500" />
                {t.availableTemplates}
              </h2>
              {loading && <Loader2 className="animate-spin text-indigo-500" />}
            </div>

            {filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isAdmin={isAdmin}
                    onClick={handleTemplateClick}
                    onDelete={async (id) => {
                       // redundant confirm removed as TemplateCard handles it
                       try {
                          await api.deleteTemplate(id);
                          loadTemplates();
                       } catch (err: any) {
                          alert("Delete failed: " + (err.message || "Unknown error"));
                       }
                    }}
                  />
                ))}
              </div>
            ) : !loading && (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white rounded-2xl border border-dashed border-slate-300">
                <Inbox size={48} strokeWidth={1} className="mb-4 opacity-50" />
                <p className="text-lg font-medium">{t.noTemplates}</p>
                <p className="text-sm">{t.noTemplatesDesc}</p>
              </div>
            )}
          </>
        )}
      </main>

      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          isAdmin={isAdmin}
          onClose={() => setSelectedTemplate(null)}
          isVerified={isAdmin} 
          onVerifyRequest={() => {
             setSelectedTemplate(null);
             setVerifyingTemplate(selectedTemplate);
          }}
        />
      )}

      {verifyingTemplate && (
        <MemberCodeModal
          templateId={verifyingTemplate.id}
          onSuccess={() => {
            const t = verifyingTemplate;
            setVerifyingTemplate(null);
            setSelectedTemplate({...t, showCodeOverride: true} as any);
          }}
          onClose={() => setVerifyingTemplate(null)}
        />
      )}
      
      {showLoginModal && (
        <LoginModal 
          onLogin={handleLogin} 
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </div>
  );
}
