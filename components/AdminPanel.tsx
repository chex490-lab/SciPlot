
import React, { useState, useEffect } from 'react';
import { Template, MemberCode, UsageLog } from '../types';
import { Button } from './Button';
import { api } from '../src/services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Trash2, RotateCw, CheckCircle, XCircle, Database, AlertCircle } from 'lucide-react';

interface AdminPanelProps {
  onAddTemplate: (template: Template) => void; 
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'codes' | 'logs'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [codes, setCodes] = useState<MemberCode[]>([]);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { t } = useLanguage();

  // Form States
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    language: 'python',
    tags: []
  });
  
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [newCode, setNewCode] = useState({ name: '', maxUses: 0, expiresAt: '' });

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setDbError(null);
    try {
      if (activeTab === 'templates') await fetchTemplates();
      if (activeTab === 'codes') await fetchCodes();
      if (activeTab === 'logs') await fetchLogs();
    } catch (err: any) {
      if (err.message?.includes('relation') || err.message?.includes('does not exist')) {
        setDbError('Database tables not found. Please initialize the database.');
      } else {
        setDbError(err.message);
      }
    }
  };

  const handleInitDatabase = async () => {
    setIsInitializing(true);
    try {
      await api.initDatabase();
      alert('Database initialized successfully!');
      setDbError(null);
      loadData();
    } catch (err: any) {
      alert('Initialization failed: ' + err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  const fetchTemplates = async () => {
    const data = await api.getTemplates();
    setTemplates(data);
  };

  const fetchCodes = async () => {
    const data = await api.getMemberCodes();
    setCodes(data);
  };

  const fetchLogs = async () => {
    const data = await api.getLogs();
    setLogs(data);
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title || !newTemplate.code) return;
    
    setIsSubmittingTemplate(true);
    try {
      const tags = typeof newTemplate.tags === 'string' ? (newTemplate.tags as string).split(',').map((s: string) => s.trim()) : newTemplate.tags;
      await api.createTemplate({ ...newTemplate, tags });
      setShowTemplateForm(false);
      setNewTemplate({ language: 'python', tags: [] });
      await fetchTemplates();
    } catch (err: any) {
      alert(err.message || "Failed to create template");
    } finally {
      setIsSubmittingTemplate(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingCode(true);
    try {
      const expiresAtIso = newCode.expiresAt ? new Date(newCode.expiresAt).toISOString() : null;
      await api.createMemberCode({ 
        name: newCode.name, 
        maxUses: Number(newCode.maxUses) || 0, 
        expiresAt: expiresAtIso
      });
      setShowCodeForm(false);
      setNewCode({ name: '', maxUses: 0, expiresAt: '' });
      await fetchCodes();
    } catch (err: any) {
      alert(err.message || "Failed to generate member code.");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const toggleTemplateActive = async (t_item: Template) => {
    try {
      await api.updateTemplate({ id: t_item.id, isActive: !t_item.isActive });
      await fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleCodeActive = async (c: MemberCode) => {
    try {
      await api.updateMemberCode({ id: c.id, is_active: !c.is_active });
      await fetchCodes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await api.deleteTemplate(id);
      await fetchTemplates();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="h-[80vh] flex flex-col">
       <div className="flex items-center justify-between p-6 border-b border-slate-100">
         <div className="flex gap-4">
           <button 
             onClick={() => setActiveTab('templates')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'templates' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             {t.templatesTab}
           </button>
           <button 
             onClick={() => setActiveTab('codes')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'codes' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             {t.codesTab}
           </button>
           <button 
             onClick={() => setActiveTab('logs')}
             className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === 'logs' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             {t.logsTab}
           </button>
         </div>
         <Button variant="ghost" onClick={onClose}>{t.cancel}</Button>
       </div>

       <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
         
         {dbError && (
           <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
             <div className="flex items-center gap-3 text-amber-800 text-sm">
               <AlertCircle size={20} className="shrink-0" />
               <p className="font-medium">{dbError}</p>
             </div>
             <Button 
               size="sm" 
               variant="primary" 
               onClick={handleInitDatabase} 
               isLoading={isInitializing}
               className="bg-amber-600 hover:bg-amber-700 border-none shrink-0"
             >
               <Database size={16} className="mr-2" />
               Initialize DB
             </Button>
           </div>
         )}

         {/* Templates Tab */}
         {activeTab === 'templates' && (
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-800">{t.mgmtTitle}</h3>
               {!showTemplateForm && (
                 <Button onClick={() => setShowTemplateForm(true)} size="sm">
                   <Plus size={16} className="mr-2"/> {t.newTemplate}
                 </Button>
               )}
             </div>
             
             {showTemplateForm && (
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                 <form onSubmit={handleTemplateSubmit} className="space-y-4">
                    <input required className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t.templateTitle} value={newTemplate.title || ''} onChange={e => setNewTemplate({...newTemplate, title: e.target.value})} />
                    <textarea className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t.description} rows={3} value={newTemplate.description || ''} onChange={e => setNewTemplate({...newTemplate, description: e.target.value})} />
                    <textarea required className="w-full border border-slate-200 p-2.5 rounded-lg font-mono text-xs h-48 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t.sourceCode} value={newTemplate.code || ''} onChange={e => setNewTemplate({...newTemplate, code: e.target.value})} />
                    <input className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t.previewImage + " URL"} value={newTemplate.imageUrl || ''} onChange={e => setNewTemplate({...newTemplate, imageUrl: e.target.value})} />
                    <input className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder={t.tags + " (e.g. Python, Plotly, 3D)"} value={newTemplate.tags || ''} onChange={e => setNewTemplate({...newTemplate, tags: e.target.value as any})} />
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="secondary" onClick={() => setShowTemplateForm(false)}>{t.cancel}</Button>
                      <Button type="submit" isLoading={isSubmittingTemplate}>{t.save}</Button>
                    </div>
                 </form>
               </div>
             )}

             <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">{t.templateTitle}</th>
                      <th className="p-4">{t.status}</th>
                      <th className="p-4">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.length > 0 ? templates.map(tmp => (
                      <tr key={tmp.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-700">{tmp.title}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tmp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {tmp.isActive ? t.active : t.inactive}
                          </span>
                        </td>
                        <td className="p-4 flex gap-3">
                           <button onClick={() => toggleTemplateActive(tmp)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Toggle Status"><RotateCw size={16}/></button>
                           <button onClick={() => handleDeleteTemplate(tmp.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all" title="Delete"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} className="p-8 text-center text-slate-400 italic">No templates found</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
         )}

         {/* Codes Tab */}
         {activeTab === 'codes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-800">{t.codesTab}</h3>
               {!showCodeForm && (
                 <Button onClick={() => setShowCodeForm(true)} size="sm">
                   <Plus size={16} className="mr-2"/> {t.generateCode}
                 </Button>
               )}
             </div>

             {showCodeForm && (
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2 duration-200">
                 <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{t.nameNote}</label>
                      <input required className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. VIP User 001" value={newCode.name} onChange={e => setNewCode({...newCode, name: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{t.maxUses} (0 = ∞)</label>
                        <input type="number" min="0" className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newCode.maxUses} onChange={e => setNewCode({...newCode, maxUses: parseInt(e.target.value) || 0})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">Expiration Date</label>
                        <input type="date" className="w-full border border-slate-200 p-2.5 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={newCode.expiresAt} onChange={e => setNewCode({...newCode, expiresAt: e.target.value})} />
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <Button type="button" variant="secondary" onClick={() => setShowCodeForm(false)}>{t.cancel}</Button>
                      <Button type="submit" isLoading={isGeneratingCode}>{t.generateCode}</Button>
                    </div>
                 </form>
               </div>
             )}

             <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">{t.name}</th>
                      <th className="p-4">{t.code}</th>
                      <th className="p-4">{t.usage}</th>
                      <th className="p-4">{t.status}</th>
                      <th className="p-4">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.length > 0 ? codes.map(c => (
                      <tr key={c.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-medium text-slate-700">{c.name}</td>
                        <td className="p-4"><span className="font-mono bg-slate-100 px-2 py-1 rounded text-indigo-700 select-all">{c.code}</span></td>
                        <td className="p-4 text-slate-600">{c.used_count} / {c.max_uses === 0 ? '∞' : c.max_uses}</td>
                        <td className="p-4">
                           {c.is_active ? <CheckCircle size={18} className="text-green-500"/> : <XCircle size={18} className="text-red-500"/>}
                        </td>
                        <td className="p-4">
                          <button onClick={() => toggleCodeActive(c)} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"><RotateCw size={16}/></button>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No member codes found</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
            </div>
         )}

         {/* Logs Tab */}
         {activeTab === 'logs' && (
           <div className="space-y-4">
              <h3 className="text-lg font-bold text-slate-800">{t.logsTab}</h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="p-4">{t.time}</th>
                      <th className="p-4">{t.code}</th>
                      <th className="p-4">{t.template}</th>
                      <th className="p-4">{t.ip}</th>
                      <th className="p-4">{t.logResult}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.length > 0 ? logs.map(l => (
                      <tr key={l.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(l.created_at).toLocaleString()}</td>
                        <td className="p-4 font-mono text-indigo-600">{l.code}</td>
                        <td className="p-4 text-slate-700 truncate max-w-[150px]">{l.template_title}</td>
                        <td className="p-4 font-mono text-[10px] text-slate-400">{l.user_ip}</td>
                        <td className="p-4">
                          {l.success ? 
                            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">{t.success}</span> : 
                            <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">{t.failed}</span>}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No usage logs found</td></tr>
                    )}
                  </tbody>
                </table>
             </div>
           </div>
         )}
       </div>
    </div>
  );
};
