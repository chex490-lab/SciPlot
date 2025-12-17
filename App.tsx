import React, { useState, useMemo, useEffect } from 'react';
import { Template } from './types';
import { TemplateCard } from './components/TemplateCard';
import { TemplateModal } from './components/TemplateModal';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { Button } from './components/Button';
import { Search, Plus, LayoutGrid, Beaker, Globe, UserCog, LogOut } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { backend } from './services/backend';

export default function App() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  const { t, language, setLanguage } = useLanguage();

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setLoading(true);
    const data = await backend.getTemplates();
    setTemplates(data);
    setLoading(false);
  };

  const filteredTemplates = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return templates.filter(t => 
      t.title.toLowerCase().includes(term) || 
      t.description.toLowerCase().includes(term) ||
      t.tags.some(tag => tag.toLowerCase().includes(term))
    );
  }, [templates, searchTerm]);

  const handleAddTemplate = async (newTemplate: Template) => {
    try {
      const savedTemplate = await backend.addTemplate(newTemplate);
      setTemplates(prev => [savedTemplate, ...prev]);
      setShowAdminPanel(false);
    } catch (e) {
      alert("Failed to upload template");
    }
  };
  
  const handleDeleteTemplate = async (id: string) => {
    try {
      await backend.deleteTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      alert("Failed to delete template");
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'zh' : 'en');
  };

  const handleLogin = async (password: string) => {
    const success = await backend.login(password);
    if (success) {
      setIsAdmin(true);
      setShowLoginModal(false);
      setLoginError(false);
      setShowAdminPanel(true); // Automatically open panel on success login
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowAdminPanel(false);
    // Ideally we would also clear the token in backend service, but for this simple app state reset is enough
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50">
      {/* Header */}
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
              className="block w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleLanguage} className="hidden sm:flex text-slate-600">
              <Globe size={16} className="mr-1.5" />
              {language === 'en' ? '中文' : 'English'}
            </Button>

            {isAdmin ? (
               <div className="flex gap-2">
                 <Button onClick={() => setShowAdminPanel(true)} size="sm" className="whitespace-nowrap">
                  <Plus size={16} className="mr-1.5" />
                  <span className="hidden sm:inline">{t.uploadTemplate}</span>
                  <span className="sm:hidden">{t.upload}</span>
                </Button>
                <Button onClick={handleLogout} variant="secondary" size="sm" title={t.logout}>
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

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {showAdminPanel ? (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
            <AdminPanel 
              onAddTemplate={handleAddTemplate} 
              onClose={() => setShowAdminPanel(false)} 
            />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <LayoutGrid size={18} className="text-indigo-500" />
                {t.availableTemplates}
              </h2>
              <span className="text-sm text-slate-500">
                {loading ? 'Loading...' : `${filteredTemplates.length} ${filteredTemplates.length !== 1 ? t.results : t.result}`}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                 {[1,2,3].map(i => (
                   <div key={i} className="bg-slate-200 h-80 rounded-xl"></div>
                 ))}
              </div>
            ) : filteredTemplates.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map(template => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isAdmin={isAdmin}
                    onClick={setSelectedTemplate}
                    onDelete={handleDeleteTemplate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                  <Search size={32} className="text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 mb-1">{t.noTemplates}</h3>
                <p className="text-slate-500">{t.noTemplatesDesc}</p>
                <Button 
                  variant="ghost" 
                  className="mt-4" 
                  onClick={() => setSearchTerm('')}
                >
                  {t.clearSearch}
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>{t.footer.replace('{year}', new Date().getFullYear().toString())}</p>
        </div>
      </footer>

      {/* Modals */}
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          isAdmin={isAdmin}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
      
      {showLoginModal && (
        <LoginModal 
          onLogin={handleLogin} 
          onClose={() => { setShowLoginModal(false); setLoginError(false); }}
          error={loginError}
        />
      )}
    </div>
  );
}