import React, { useState, useEffect } from 'react';
import { Template, MemberCode, UsageLog } from '../types';
import { Button } from './Button';
import { api } from '../src/services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Trash2, Edit2, RotateCw, CheckCircle, XCircle } from 'lucide-react';

interface AdminPanelProps {
  onAddTemplate: (template: Template) => void; // Legacy prop, we'll refetch instead
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'codes' | 'logs'>('templates');
  const [templates, setTemplates] = useState<Template[]>([]);
  const [codes, setCodes] = useState<MemberCode[]>([]);
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const { t } = useLanguage();

  // Form States
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState<Partial<Template>>({
    language: 'python',
    tags: []
  });
  
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [newCode, setNewCode] = useState({ name: '', maxUses: 0, expiresAt: '' });

  useEffect(() => {
    if (activeTab === 'templates') fetchTemplates();
    if (activeTab === 'codes') fetchCodes();
    if (activeTab === 'logs') fetchLogs();
  }, [activeTab]);

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
    
    // Simple split for tags
    const tags = typeof newTemplate.tags === 'string' ? (newTemplate.tags as string).split(',').map((s: string) => s.trim()) : newTemplate.tags;
    
    await api.createTemplate({ ...newTemplate, tags });
    setShowTemplateForm(false);
    fetchTemplates();
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.createMemberCode({ 
      name: newCode.name, 
      maxUses: Number(newCode.maxUses), 
      expiresAt: newCode.expiresAt ? new Date(newCode.expiresAt).toISOString() : null 
    });
    setShowCodeForm(false);
    fetchCodes();
  };

  const toggleTemplateActive = async (t: Template) => {
    await api.updateTemplate({ id: t.id, isActive: !t.isActive });
    fetchTemplates();
  };

  const toggleCodeActive = async (c: MemberCode) => {
    await api.updateMemberCode({ id: c.id, is_active: !c.is_active });
    fetchCodes();
  };

  return (
    <div className="h-[80vh] flex flex-col">
       <div className="flex items-center justify-between p-6 border-b border-slate-100">
         <div className="flex gap-4">
           <button 
             onClick={() => setActiveTab('templates')}
             className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'templates' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             Templates
           </button>
           <button 
             onClick={() => setActiveTab('codes')}
             className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'codes' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             Member Codes
           </button>
           <button 
             onClick={() => setActiveTab('logs')}
             className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'logs' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             Logs
           </button>
         </div>
         <Button variant="ghost" onClick={onClose}>{t.cancel}</Button>
       </div>

       <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
         
         {/* Templates Tab */}
         {activeTab === 'templates' && (
           <div className="space-y-4">
             <div className="flex justify-between">
               <h3 className="text-lg font-bold">Template Management</h3>
               <Button onClick={() => setShowTemplateForm(true)} size="sm"><Plus size={16} className="mr-2"/> New Template</Button>
             </div>
             
             {showTemplateForm && (
               <div className="bg-white p-4 rounded-lg shadow mb-4">
                 <form onSubmit={handleTemplateSubmit} className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Title" value={newTemplate.title || ''} onChange={e => setNewTemplate({...newTemplate, title: e.target.value})} />
                    <textarea className="w-full border p-2 rounded" placeholder="Description" value={newTemplate.description || ''} onChange={e => setNewTemplate({...newTemplate, description: e.target.value})} />
                    <textarea className="w-full border p-2 rounded font-mono text-xs h-32" placeholder="Code" value={newTemplate.code || ''} onChange={e => setNewTemplate({...newTemplate, code: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Image URL" value={newTemplate.imageUrl || ''} onChange={e => setNewTemplate({...newTemplate, imageUrl: e.target.value})} />
                    <input className="w-full border p-2 rounded" placeholder="Tags (comma separated)" value={newTemplate.tags || ''} onChange={e => setNewTemplate({...newTemplate, tags: e.target.value as any})} />
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setShowTemplateForm(false)}>Cancel</Button>
                      <Button type="submit">Save</Button>
                    </div>
                 </form>
               </div>
             )}

             <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="p-3">Title</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {templates.map(t => (
                      <tr key={t.id} className="border-t border-slate-100">
                        <td className="p-3 font-medium">{t.title}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {t.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="p-3 flex gap-2">
                           <button onClick={() => toggleTemplateActive(t)} className="text-slate-400 hover:text-indigo-600"><RotateCw size={16}/></button>
                           <button onClick={() => api.deleteTemplate(t.id).then(fetchTemplates)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
         )}

         {/* Codes Tab */}
         {activeTab === 'codes' && (
            <div className="space-y-4">
              <div className="flex justify-between">
               <h3 className="text-lg font-bold">Member Codes</h3>
               <Button onClick={() => setShowCodeForm(true)} size="sm"><Plus size={16} className="mr-2"/> Generate Code</Button>
             </div>

             {showCodeForm && (
               <div className="bg-white p-4 rounded-lg shadow mb-4">
                 <form onSubmit={handleCodeSubmit} className="space-y-4">
                    <input className="w-full border p-2 rounded" placeholder="Name / Note" value={newCode.name} onChange={e => setNewCode({...newCode, name: e.target.value})} />
                    <div className="flex gap-4">
                      <input type="number" className="w-1/2 border p-2 rounded" placeholder="Max Uses (0 = unlimited)" value={newCode.maxUses} onChange={e => setNewCode({...newCode, maxUses: Number(e.target.value)})} />
                      <input type="date" className="w-1/2 border p-2 rounded" value={newCode.expiresAt} onChange={e => setNewCode({...newCode, expiresAt: e.target.value})} />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setShowCodeForm(false)}>Cancel</Button>
                      <Button type="submit">Generate</Button>
                    </div>
                 </form>
               </div>
             )}

             <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="p-3">Name</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Usage</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {codes.map(c => (
                      <tr key={c.id} className="border-t border-slate-100">
                        <td className="p-3">{c.name}</td>
                        <td className="p-3 font-mono bg-slate-50 rounded select-all">{c.code}</td>
                        <td className="p-3">{c.used_count} / {c.max_uses === 0 ? '∞' : c.max_uses}</td>
                        <td className="p-3">
                           {c.is_active ? <CheckCircle size={16} className="text-green-500"/> : <XCircle size={16} className="text-red-500"/>}
                        </td>
                        <td className="p-3">
                          <button onClick={() => toggleCodeActive(c)} className="text-slate-400 hover:text-indigo-600"><RotateCw size={16}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
            </div>
         )}

         {/* Logs Tab */}
         {activeTab === 'logs' && (
           <div className="space-y-4">
              <h3 className="text-lg font-bold">Usage Logs</h3>
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="p-3">Time</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Template</th>
                      <th className="p-3">IP</th>
                      <th className="p-3">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id} className="border-t border-slate-100">
                        <td className="p-3">{new Date(l.created_at).toLocaleString()}</td>
                        <td className="p-3 font-mono">{l.code}</td>
                        <td className="p-3">{l.template_title}</td>
                        <td className="p-3 font-mono text-xs">{l.user_ip}</td>
                        <td className="p-3">
                          {l.success ? <span className="text-green-600">Success</span> : <span className="text-red-600">Failed</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
           </div>
         )}
       </div>
    </div>
  );
};