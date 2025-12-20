
import React, { useState, useMemo, useEffect } from 'react';
import { Template, Category } from './types';
import { TemplateCard } from './components/TemplateCard';
import { TemplateModal } from './components/TemplateModal';
import { AdminPanel } from './components/AdminPanel';
import { LoginModal } from './components/LoginModal';
import { MemberCodeModal } from './components/MemberCodeModal';
import { Button } from './components/Button';
import { Search, Plus, LayoutGrid, Beaker, UserCog, LogOut, Loader2, Inbox, Mail, CheckCircle2, Filter } from 'lucide-react';
import { useLanguage } from './contexts/LanguageContext';
import { api } from './services/api';

export default function App() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [verifyingTemplate, setVerifyingTemplate] = useState<Template | null>(null);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showEmailToast, setShowEmailToast] = useState(false);
  
  const { t } = useLanguage();

  useEffect(() => {
    loadData();
    const token = localStorage.getItem('auth_token');
    if (token) setIsAdmin(true);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, categoriesData] = await Promise.all([
        api.getTemplates(),
        api.getCategories()
      ]);
      setTemplates(Array.isArray(templatesData) ? templatesData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (e) {
      console.error(e);
      setTemplates([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = useMemo(() => {
    let result = [...templates];
    
    // Filter by Category
    if (selectedCategoryId !== null) {
      result = result.filter(t => t.category_id === selectedCategoryId);
    }

    // Filter by Search Term
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      result = result.filter(t => {
        const title = (t.title || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        const tags = Array.isArray(t.tags) ? t.tags : [];
        const catName = (t.category_name || '').toLowerCase();
        
        return title.includes(term) || 
               desc.includes(term) ||
               catName.includes(term) ||
               tags.some(tag => tag.toLowerCase().includes(term));
      });
    }

    return result;
  }, [templates, searchTerm, selectedCategoryId]);

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
    loadData();
  };

  const handleTemplateClick = (t: Template) => {
    setSelectedTemplate(t);
  };

  const handleContactAdmin = async () => {
    const email = 'chex490@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      setShowEmailToast(true);
      setTimeout(() => setShowEmailToast(false), 3000);
    } catch (err) {
      const tempInput = document.createElement('input');
      tempInput.value = email;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);
      setShowEmailToast(true);
      setTimeout(() => setShowEmailToast(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-slate-50 relative">
      {showEmailToast && (
        <div className="fixed top-20 right-4 z-[100] bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-right-10 duration-300">
          <CheckCircle2 size={18} />
          <span className="text-sm font-medium">{t.emailCopied}</span>
        </div>
      )}

      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg text-white">
              <Beaker size={18} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
            </div>
            <h1 className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600 hidden sm:block">
              {t.appTitle}
            </h1>
          </div>

          <div className="flex-1 max-w-md relative min-w-0">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none text-slate-400">
              <Search size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              className="block w-full pl-8 sm:pl-10 pr-3 py-1.5 sm:py-2 border border-slate-300 rounded-lg bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-xs sm:text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1 sm:gap-2 lg:gap-4 shrink-0">
            <button 
              onClick={handleContactAdmin}
              className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 text-sm font-medium text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all border border-transparent hover:border-indigo-100 shrink-0"
              title="chex490@gmail.com"
            >
              <Mail size={18} className="sm:w-4 sm:h-4" />
              <span className="whitespace-nowrap hidden lg:inline">{t.contactAdmin}</span>
              <span className="whitespace-nowrap hidden sm:inline lg:hidden">联系管理员</span>
            </button>

            {isAdmin ? (
               <div className="flex gap-1 sm:gap-2">
                 <Button onClick={() => setShowAdminPanel(true)} size="sm" className="whitespace-nowrap px-2 sm:px-4">
                  <UserCog size={16} className="sm:mr-1.5" />
                  <span className="hidden sm:inline">{t.dashboard}</span>
                </Button>
                <Button onClick={handleLogout} variant="secondary" size="sm" className="px-2">
                  <LogOut size={16} />
                </Button>
               </div>
            ) : (
                <Button onClick={() => setShowLoginModal(true)} variant="ghost" size="sm" className="text-slate-600 px-2">
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
              onClose={() => { setShowAdminPanel(false); loadData(); }} 
            />
          </div>
        ) : (
          <>
            {/* Category Filter Bar */}
            <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 mr-4 pr-4 border-r border-slate-200 text-slate-400">
                  <Filter size={18} />
                  <span className="text-xs font-semibold uppercase tracking-wider whitespace-nowrap">{t.category}</span>
                </div>
                <button
                  onClick={() => setSelectedCategoryId(null)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategoryId === null ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                >
                  {t.allCategories}
                </button>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategoryId === cat.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300 hover:text-indigo-600'}`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <LayoutGrid size={18} className="text-indigo-500" />
                {selectedCategoryId ? categories.find(c => c.id === selectedCategoryId)?.name : t.availableTemplates}
                <span className="text-sm font-normal text-slate-400 ml-2">({filteredTemplates.length})</span>
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
                       try {
                          await api.deleteTemplate(id);
                          loadData();
                       } catch (err: any) {
                          alert("删除失败: " + (err.message || "未知错误"));
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
                <Button variant="ghost" onClick={() => { setSelectedCategoryId(null); setSearchTerm(''); }} className="mt-4 text-indigo-600">{t.clearSearch}</Button>
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
             if (selectedTemplate.isHidden !== false) {
                setSelectedTemplate(null);
                setVerifyingTemplate(selectedTemplate);
             } else {
                handleContactAdmin();
             }
          }}
        />
      )}

      {verifyingTemplate && (
        <MemberCodeModal
          templateId={verifyingTemplate.id}
          onSuccess={() => {
            const temp = verifyingTemplate;
            setVerifyingTemplate(null);
            setSelectedTemplate({...temp, showCodeOverride: true} as any);
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
