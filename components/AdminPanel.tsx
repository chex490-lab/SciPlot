
import React, { useState, useEffect, useRef } from 'react';
import { Template, MemberCode, UsageLog, Category } from '../types';
import { Button } from './Button';
import { api } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Trash2, RotateCw, CheckCircle, XCircle, Database, AlertCircle, Upload, X as CloseIcon, Image as ImageIcon, Pencil, Calendar, Layers, ShieldCheck, Eye, EyeOff, Timer, Infinity } from 'lucide-react';

interface AdminPanelProps {
  onAddTemplate: (template: Template) => void; 
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'codes' | 'logs' | 'categories'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [codes, setCodes] = useState<MemberCode[]>([]);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Template Form States
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [isSubmittingTemplate, setIsSubmittingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    language: 'python',
    tags: [],
    category_id: null,
    isHidden: true
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Member Code Form States
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [editingCodeId, setEditingCodeId] = useState<number | null>(null);
  const [newCode, setNewCode] = useState({ name: '', maxUses: 0, expiresAt: '', isLongTerm: false });

  // Category Form States
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setDbError(null);
    try {
      if (activeTab === 'templates') {
        await fetchTemplates();
        await fetchCategories();
      }
      if (activeTab === 'codes') await fetchCodes();
      if (activeTab === 'logs') await fetchLogs();
      if (activeTab === 'categories') await fetchCategories();
    } catch (err: any) {
      setDbError(err.message || "Unable to fetch data");
    }
  };

  const handleInitDatabase = async () => {
    setIsInitializing(true);
    try {
      await api.initDatabase();
      alert('数据库初始化/修复成功！权限已重置。');
      setDbError(null);
      loadData();
    } catch (err: any) {
      alert('初始化失败: ' + err.message);
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

  const fetchCategories = async () => {
    const data = await api.getCategories();
    setCategories(data);
  };

  const processFile = (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert(t.fileLimit);
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setNewTemplate(prev => ({ ...prev, imageUrl: base64String }));
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          processFile(file);
          break;
        }
      }
    }
  };

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplate.title || !newTemplate.code) return;
    
    setIsSubmittingTemplate(true);
    try {
      const tags = typeof newTemplate.tags === 'string' 
        ? (newTemplate.tags as string).split(',').map((s: string) => s.trim()) 
        : newTemplate.tags;
      
      if (newTemplate.id) {
        await api.updateTemplate({ ...newTemplate, tags });
      } else {
        await api.createTemplate({ ...newTemplate, tags });
      }
      
      setShowTemplateForm(false);
      setNewTemplate({ language: 'python', tags: [], category_id: null, isHidden: true });
      setImagePreview(null);
      await fetchTemplates();
    } catch (err: any) {
      alert(err.message || "保存模板失败");
    } finally {
      setIsSubmittingTemplate(false);
    }
  };

  const handleEditTemplate = (template: Template) => {
    setNewTemplate({
      id: template.id,
      title: template.title,
      description: template.description,
      code: template.code,
      language: template.language || 'python',
      tags: Array.isArray(template.tags) ? template.tags : [],
      category_id: template.category_id || null,
      imageUrl: template.imageUrl,
      isHidden: template.isHidden !== undefined ? template.isHidden : true
    });
    setImagePreview(template.imageUrl);
    setShowTemplateForm(true);
  };

  const handleAddNewTemplateClick = () => {
    setNewTemplate({ language: 'python', tags: [], category_id: null, isHidden: true });
    setImagePreview(null);
    setShowTemplateForm(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    setIsSubmittingCategory(true);
    try {
      if (editingCategoryId) {
        await api.updateCategory(editingCategoryId, newCategoryName);
      } else {
        await api.createCategory(newCategoryName);
      }
      setNewCategoryName('');
      setEditingCategoryId(null);
      setShowCategoryForm(false);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || "操作失败");
    } finally {
      setIsSubmittingCategory(false);
    }
  };

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setNewCategoryName(cat.name);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async (id: number) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await api.deleteCategory(id);
      await fetchCategories();
    } catch (err: any) {
      alert(err.message || "删除失败");
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingCode(true);
    try {
      const expiresAtIso = newCode.expiresAt ? new Date(newCode.expiresAt).toISOString() : null;
      if (editingCodeId) {
        await api.updateMemberCode({ 
          id: editingCodeId,
          name: newCode.name, 
          max_uses: Number(newCode.maxUses) || 0, 
          expires_at: expiresAtIso,
          is_long_term: newCode.isLongTerm
        });
      } else {
        await api.createMemberCode({ 
          name: newCode.name, 
          maxUses: Number(newCode.maxUses) || 0, 
          expiresAt: expiresAtIso,
          isLongTerm: newCode.isLongTerm
        });
      }
      setShowCodeForm(false);
      setEditingCodeId(null);
      setNewCode({ name: '', maxUses: 0, expiresAt: '', isLongTerm: false });
      await fetchCodes();
    } catch (err: any) {
      alert(err.message || "保存会员码失败");
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleEditCode = (c: MemberCode) => {
    setEditingCodeId(c.id);
    setNewCode({
      name: c.name || '',
      maxUses: c.max_uses || 0,
      expiresAt: c.expires_at ? new Date(c.expires_at).toISOString().split('T')[0] : '',
      isLongTerm: c.is_long_term
    });
    setShowCodeForm(true);
  };

  const handleDeleteCode = async (id: number) => {
    if (!confirm("确定要删除此会员码吗？")) return;
    try {
      await api.deleteMemberCode(id);
      await fetchCodes();
    } catch (err: any) {
      alert("删除失败: " + err.message);
    }
  };

  const handleAddNewCodeClick = () => {
    setEditingCodeId(null);
    setNewCode({ name: '', maxUses: 0, expiresAt: '', isLongTerm: false });
    setShowCodeForm(true);
  };

  const toggleTemplateActive = async (t_item: Template) => {
    try {
      await api.updateTemplate({ id: t_item.id, isActive: !t_item.isActive });
      await fetchTemplates();
    } catch (err: any) {
      alert("更新状态失败: " + err.message);
    }
  };

  const toggleCodeActive = async (c: MemberCode) => {
    try {
      await api.updateMemberCode({ id: c.id, is_active: !c.is_active });
      await fetchCodes();
    } catch (err: any) {
      alert("更新状态失败: " + (err.message || "未知错误"));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm(t.deleteConfirm)) return;
    try {
      await api.deleteTemplate(id);
      await fetchTemplates();
    } catch (err: any) {
      alert("删除失败: " + (err.message || "未知错误"));
    }
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="h-[80vh] flex flex-col">
       <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white">
         <div className="flex gap-4">
           {['templates', 'categories', 'codes', 'logs'].map((tab) => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab as any)}
               className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
             >
               {tab === 'templates' && t.templatesTab}
               {tab === 'categories' && t.categoriesTab}
               {tab === 'codes' && t.codesTab}
               {tab === 'logs' && t.logsTab}
             </button>
           ))}
         </div>
         <div className="flex items-center gap-2">
           <Button variant="secondary" size="sm" onClick={handleInitDatabase} isLoading={isInitializing} className="border-indigo-200 text-indigo-600">
             <ShieldCheck size={16} className="mr-2" />
             修复数据库权限
           </Button>
           <Button variant="ghost" onClick={onClose}>{t.cancel}</Button>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
         {dbError && (
           <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
             <div className="flex items-center gap-3 text-red-800 text-sm">
               <AlertCircle size={20} className="shrink-0" />
               <div><p className="font-bold">数据库连接异常</p><p className="text-xs opacity-80">{dbError}</p></div>
             </div>
             <Button size="sm" variant="primary" onClick={handleInitDatabase} isLoading={isInitializing} className="bg-red-600 hover:bg-red-700 border-none shrink-0">
               <Database size={16} className="mr-2" />
               一键修复环境
             </Button>
           </div>
         )}

         {activeTab === 'templates' && (
           <div className="space-y-4">
             <div className="flex justify-between items-center">
               <h3 className="text-lg font-bold text-slate-800">{t.mgmtTitle}</h3>
               {!showTemplateForm && <Button onClick={handleAddNewTemplateClick} size="sm"><Plus size={16} className="mr-2"/> {t.newTemplate}</Button>}
             </div>
             
             {showTemplateForm && (
               <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2 mb-6">
                 <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-bold text-slate-700">{newTemplate.id ? t.editTemplateTitle : t.uploadNewTitle}</h4>
                    <button onClick={() => setShowTemplateForm(false)} className="text-slate-400 hover:text-slate-600"><CloseIcon size={20}/></button>
                 </div>
                 <form onSubmit={handleTemplateSubmit} onPaste={handlePaste} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <input required className="w-full border border-slate-200 p-2.5 rounded-lg outline-none" placeholder={t.templateTitle} value={newTemplate.title || ''} onChange={e => setNewTemplate({...newTemplate, title: e.target.value})} />
                        <div className="grid grid-cols-2 gap-3">
                           <select className="w-full border border-slate-200 p-2.5 rounded-lg outline-none" value={newTemplate.category_id || ''} onChange={e => setNewTemplate({...newTemplate, category_id: e.target.value ? parseInt(e.target.value) : null})}>
                             <option value="">{t.selectCategory} ({t.noCategory})</option>
                             {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                           </select>
                           <div className="flex items-center gap-2 border border-slate-200 p-2 rounded-lg bg-slate-50">
                              <span className="text-xs font-semibold text-slate-500 uppercase">{t.isHiddenLabel}</span>
                              <select className="flex-1 bg-transparent text-sm font-medium outline-none text-indigo-600" value={newTemplate.isHidden ? 'yes' : 'no'} onChange={e => setNewTemplate({...newTemplate, isHidden: e.target.value === 'yes'})}>
                                 <option value="yes">{t.yes}</option><option value="no">{t.no}</option>
                              </select>
                           </div>
                        </div>
                        <textarea className="w-full border border-slate-200 p-2.5 rounded-lg outline-none" placeholder={t.description} rows={3} value={newTemplate.description || ''} onChange={e => setNewTemplate({...newTemplate, description: e.target.value})} />
                        <input className="w-full border border-slate-200 p-2.5 rounded-lg outline-none" placeholder={t.tags + " (例如: Python, 柱状图, 3D)"} value={Array.isArray(newTemplate.tags) ? newTemplate.tags.join(', ') : newTemplate.tags || ''} onChange={e => setNewTemplate({...newTemplate, tags: e.target.value as any})} />
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg"><p className="text-[10px] text-amber-700 italic"><strong>提示:</strong> {t.isHiddenDesc}</p></div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-2"><ImageIcon size={14} /> {t.previewImage}</label>
                        <div onClick={() => fileInputRef.current?.click()} className={`min-h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${imagePreview ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-200 hover:border-indigo-400 hover:bg-slate-50'}`}>
                          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                          {imagePreview ? <img src={imagePreview} className="max-h-40 rounded-lg" /> : <><Upload size={24}/><p className="text-sm">{t.uploadFile}</p></>}
                        </div>
                      </div>
                    </div>
                    <textarea required className="w-full border border-slate-200 p-2.5 rounded-lg font-mono text-xs h-64 outline-none" placeholder={t.sourceCode} value={newTemplate.code || ''} onChange={e => setNewTemplate({...newTemplate, code: e.target.value})} />
                    <div className="flex justify-end gap-3"><Button type="button" variant="secondary" onClick={() => setShowTemplateForm(false)}>{t.cancel}</Button><Button type="submit" isLoading={isSubmittingTemplate} disabled={!imagePreview}>{t.save}</Button></div>
                 </form>
               </div>
             )}

             <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                    <tr><th className="p-4">{t.templateTitle}</th><th className="p-4">{t.category}</th><th className="p-4">{t.status}</th><th className="p-4">隐藏代码</th><th className="p-4">{t.actions}</th></tr>
                  </thead>
                  <tbody>
                    {templates.map(tmp => (
                      <tr key={tmp.id} className="border-t border-slate-100 hover:bg-slate-50">
                        <td className="p-4 font-medium flex items-center gap-3"><img src={tmp.imageUrl} className="w-10 h-10 object-cover rounded" /> {tmp.title}</td>
                        <td className="p-4">{tmp.category_name || t.noCategory}</td>
                        <td className="p-4"><span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${tmp.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{tmp.isActive ? t.active : t.inactive}</span></td>
                        <td className="p-4 flex items-center gap-1.5">{tmp.isHidden ? <EyeOff size={14} /> : <Eye size={14} />} {tmp.isHidden ? t.yes : t.no}</td>
                        <td className="p-4 flex gap-2">
                           <button onClick={() => handleEditTemplate(tmp)} className="p-1.5 hover:text-indigo-600"><Pencil size={16}/></button>
                           <button onClick={() => toggleTemplateActive(tmp)} className="p-1.5 hover:text-indigo-600"><RotateCw size={16}/></button>
                           <button onClick={() => handleDeleteTemplate(tmp.id)} className="p-1.5 hover:text-red-600"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
         )}

         {activeTab === 'categories' && (
           <div className="space-y-4">
              <div className="flex justify-between items-center"><h3 className="text-lg font-bold">{t.categoriesTab}</h3><Button onClick={() => setShowCategoryForm(true)} size="sm"><Plus size={16} className="mr-2"/> {t.newCategory}</Button></div>
              {showCategoryForm && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 mb-4">
                  <form onSubmit={handleCategorySubmit} className="flex gap-4">
                    <input required className="flex-1 border p-2.5 rounded-lg outline-none" placeholder={t.categoryName} value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} />
                    <Button type="submit" isLoading={isSubmittingCategory}>{t.save}</Button>
                  </form>
                </div>
              )}
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50"><tr><th className="p-4">{t.name}</th><th className="p-4">{t.time}</th><th className="p-4">{t.actions}</th></tr></thead>
                  <tbody>{categories.map(cat => (
                    <tr key={cat.id} className="border-t">
                      <td className="p-4">{cat.name}</td><td className="p-4">{new Date(cat.created_at).toLocaleDateString()}</td>
                      <td className="p-4 flex gap-2"><button onClick={() => handleEditCategory(cat)}><Pencil size={16}/></button><button onClick={() => handleDeleteCategory(cat.id)}><Trash2 size={16}/></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
           </div>
         )}

         {activeTab === 'codes' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-slate-800">{t.codesTab}</h3>{!showCodeForm && <Button onClick={handleAddNewCodeClick} size="sm"><Plus size={16} className="mr-2"/> {t.generateCode}</Button>}</div>

              {showCodeForm && (
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-in slide-in-from-top-2">
                  <div className="flex justify-between items-center mb-4"><h4 className="text-md font-bold">{editingCodeId ? t.edit + ' ' + t.code : t.generateCode}</h4><button onClick={() => setShowCodeForm(false)}><CloseIcon size={20}/></button></div>
                  <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{t.nameNote}</label><input required className="w-full border p-2.5 rounded-lg outline-none" placeholder="例如: VIP会员001" value={newCode.name} onChange={e => setNewCode({...newCode, name: e.target.value})} /></div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">会员码类型</label>
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                          <button type="button" onClick={() => setNewCode({...newCode, isLongTerm: false})} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-md transition-all ${!newCode.isLongTerm ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}><Timer size={14}/> 短期</button>
                          <button type="button" onClick={() => setNewCode({...newCode, isLongTerm: true})} className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-md transition-all ${newCode.isLongTerm ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-slate-200'}`}><Infinity size={14}/> 长期</button>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{t.maxUses} (0 为不限)</label><input type="number" min="0" className="w-full border p-2.5 rounded-lg outline-none" value={newCode.maxUses} onChange={e => setNewCode({...newCode, maxUses: parseInt(e.target.value) || 0})} /></div>
                      <div><label className="block text-xs font-semibold text-slate-500 uppercase mb-1.5">{t.expiration}</label><input type="date" className="w-full border p-2.5 rounded-lg outline-none" value={newCode.expiresAt} onChange={e => setNewCode({...newCode, expiresAt: e.target.value})} /></div>
                    </div>
                    {!newCode.isLongTerm && <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded">短期会员码将在次数用完或过期后从列表中自动删除。</p>}
                    <div className="flex justify-end gap-3 pt-2"><Button type="button" variant="secondary" onClick={() => setShowCodeForm(false)}>{t.cancel}</Button><Button type="submit" isLoading={isGeneratingCode}>{editingCodeId ? t.save : t.generateCode}</Button></div>
                  </form>
                </div>
              )}

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                    <tr><th className="p-4">{t.name}</th><th className="p-4">类型</th><th className="p-4">{t.code}</th><th className="p-4">{t.usage}</th><th className="p-4">{t.expiration}</th><th className="p-4">{t.status}</th><th className="p-4">{t.actions}</th></tr>
                  </thead>
                  <tbody>
                    {codes.map(c => (
                      <tr key={c.id} className="border-t hover:bg-slate-50">
                        <td className="p-4 font-medium">{c.name}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${c.is_long_term ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                            {c.is_long_term ? <Infinity size={10}/> : <Timer size={10}/>}
                            {c.is_long_term ? '长期' : '短期'}
                          </span>
                        </td>
                        <td className="p-4"><span className="font-mono bg-indigo-50 px-2 py-1 rounded text-indigo-700 border border-indigo-100">{c.code}</span></td>
                        <td className="p-4">{c.used_count} / {c.max_uses === 0 ? t.unlimited : c.max_uses}</td>
                        <td className="p-4 text-xs">{c.expires_at ? new Date(c.expires_at).toLocaleDateString() : t.permanent}</td>
                        <td className="p-4">{c.is_active ? <CheckCircle size={18} className="text-green-500"/> : <XCircle size={18} className="text-red-500"/>}</td>
                        <td className="p-4 flex gap-2">
                          <button onClick={() => handleEditCode(c)} className="p-1.5 hover:bg-indigo-50 rounded" title={t.edit}><Pencil size={16}/></button>
                          <button onClick={() => toggleCodeActive(c)} className="p-1.5 hover:bg-indigo-50 rounded" title="切换状态"><RotateCw size={16}/></button>
                          <button onClick={() => handleDeleteCode(c.id)} className="p-1.5 hover:bg-red-50 text-red-400 hover:text-red-600 rounded" title="删除"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
         )}

         {activeTab === 'logs' && (
           <div className="space-y-4">
              <h3 className="text-lg font-bold">{t.logsTab}</h3>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 uppercase text-[10px]">
                    <tr><th className="p-4">{t.time}</th><th className="p-4">{t.code}</th><th className="p-4">{t.template}</th><th className="p-4">{t.ip}</th><th className="p-4">{t.logResult}</th></tr>
                  </thead>
                  <tbody>{logs.map(l => (
                    <tr key={l.id} className="border-t">
                      <td className="p-4 text-slate-500">{new Date(l.created_at).toLocaleString()}</td>
                      <td className="p-4 font-mono text-indigo-600">{l.code}</td>
                      <td className="p-4">{l.template_title}</td>
                      <td className="p-4 font-mono text-[10px] text-slate-400">{l.user_ip}</td>
                      <td className="p-4">{l.success ? <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded-full text-xs font-medium">{t.success}</span> : <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-full text-xs font-medium">{t.failed}</span>}</td>
                    </tr>
                  ))}</tbody>
                </table>
             </div>
           </div>
         )}
       </div>
    </div>
  );
};
