import React, { useState, useMemo, useEffect } from 'react';
import { Template } from './types';
import { TemplateCard } from './components/TemplateCard';
import { TemplateModal } from './components/TemplateModal';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { MemberCodeModal } from './components/MemberCodeModal';
import { Button } from './components/Button';
import { Search, Plus, LayoutGrid, Beaker, Globe, UserCog, LogOut, Loader2 } from 'lucide-react';
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
      setTemplates(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return templates.filter(t => 
      t.title.toLowerCase().includes(term) || 
      t.description.toLowerCase().includes(term) ||
      t.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }, [templates, searchTerm]);

  const handleLogin = async (password: string) => {
    // We use password as username and password for simplicity in this MVP 
    // or assume user enters credentials in the LoginModal.
    // The existing LoginModal only has Password field. 
    // Let's assume ADMIN_USERNAME is 'admin' for now.
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
    loadTemplates(); // Reload to hide inactive
  };

  const handleTemplateClick = (t: Template) => {
    if (isAdmin) {
        setSelectedTemplate(t); // Admins see code immediately
    } else {
        // Users see details but not code initially (handled inside modal or here)
        // For this flow: Click -> Details. Inside Details -> "Get Code" -> Verification
        setSelectedTemplate(t);
    }
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map(template => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  isAdmin={isAdmin}
                  onClick={handleTemplateClick}
                  onDelete={async (id) => {
                     if(confirm('Delete?')) {
                        await api.deleteTemplate(id);
                        loadTemplates();
                     }
                  }}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Detail Modal */}
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          isAdmin={isAdmin}
          onClose={() => setSelectedTemplate(null)}
          // If not admin, the "Copy Code" action in TemplateModal should trigger verification
          // We can pass a custom onCopy handler or handle it here if TemplateModal emits an event.
          // For now, let's assume we modify TemplateModal to accept an onVerify prop or we assume "isAdmin" controls visibility.
          // Actually, let's modify TemplateModal to support the verification flow
          isVerified={isAdmin} 
          onVerifyRequest={() => {
             setSelectedTemplate(null); // Close details
             setVerifyingTemplate(selectedTemplate); // Open verification
          }}
        />
      )}

      {/* Verification Modal */}
      {verifyingTemplate && (
        <MemberCodeModal
          templateId={verifyingTemplate.id}
          onSuccess={() => {
            // After success, show the details again but this time effectively "verified" (we can use a transient state or just copy code directly)
            // Simpler: Just copy code to clipboard and show success message, or reopen modal in "admin/verified" mode
            // Let's reopen modal with isAdmin=true equivalent for viewing code
            const t = verifyingTemplate;
            setVerifyingTemplate(null);
            
            // Hack: Temporarily treat as admin for this modal instance to show code
            // Better: Add "showCode" prop to TemplateModal
            // For MVP: We will assume verification copies code directly or we show a special "Code View" modal.
            // Let's reuse TemplateModal but pass a forced "showCode" prop.
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