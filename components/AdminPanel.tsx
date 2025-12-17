import React, { useState, useEffect } from 'react';
import { Template, AccessKey, UsageLog } from '../types';
import { Button } from './Button';
import { Image as ImageIcon, FileCode, Tag, Type, Key, Layout, Plus, ClipboardList, Activity, Timer, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { backend } from '../services/backend';

interface AdminPanelProps {
  onAddTemplate: (template: Template) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAddTemplate, onClose }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'keys' | 'logs'>('upload');
  const { t } = useLanguage();

  return (
    <div className="flex flex-col h-[80vh] max-h-[800px]">
       {/* Admin Header */}
       <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
         <div>
           <h2 className="text-xl font-bold text-slate-900">{t.adminDashboard}</h2>
         </div>
         <Button variant="ghost" onClick={onClose} size="sm">{t.cancel}</Button>
       </div>

       {/* Tabs */}
       <div className="flex border-b border-slate-200 px-6 gap-6">
         <TabButton active={activeTab === 'upload'} onClick={() => setActiveTab('upload')} icon={<Layout size={16} />} label={t.tabUpload} />
         <TabButton active={activeTab === 'keys'} onClick={() => setActiveTab('keys')} icon={<Key size={16} />} label={t.tabKeys} />
         <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<Activity size={16} />} label="Usage Logs" />
       </div>

       {/* Content Area */}
       <div className="flex-1 overflow-y-auto bg-white p-6">
         {activeTab === 'upload' && <UploadForm onAddTemplate={onAddTemplate} onClose={onClose} />}
         {activeTab === 'keys' && <KeysManager />}
         {activeTab === 'logs' && <LogsViewer />}
       </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
      active 
        ? 'border-indigo-600 text-indigo-600' 
        : 'border-transparent text-slate-500 hover:text-slate-700'
    }`}
  >
    {icon}
    {label}
  </button>
);

// --- Subcomponent: Upload Form ---
const UploadForm: React.FC<{onAddTemplate: any, onClose: any}> = ({ onAddTemplate, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [code, setCode] = useState('');
  const [tags, setTags] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [language, setLanguage] = useState<'python' | 'r' | 'matlab' | 'latex'>('python');
  
  const { t } = useLanguage();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !code || !previewUrl) {
      alert(t.requiredFields);
      return;
    }

    const newTemplate: Template = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      title,
      description,
      code,
      imageUrl: previewUrl,
      language,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      createdAt: Date.now()
    };

    onAddTemplate(newTemplate);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Meta Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.templateTitle}</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Dual Y-Axis Time Series"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">{t.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-28 resize-none text-sm"
              placeholder={t.descriptionPlaceholder}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-1.5"><Type size={14} /> {t.language}</div>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="python">Python</option>
                <option value="r">R</option>
                <option value="matlab">MATLAB</option>
                <option value="latex">LaTeX</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <div className="flex items-center gap-1.5"><Tag size={14} /> {t.tags}</div>
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="2D, Heatmap"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              <div className="flex items-center gap-1.5"><ImageIcon size={14} /> {t.previewImage}</div>
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg hover:bg-slate-50 transition-colors cursor-pointer relative">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <div className="relative">
                    <img src={previewUrl} alt="Preview" className="mx-auto h-48 object-contain rounded-md shadow-sm" />
                    <button 
                      type="button" 
                      onClick={(e) => { e.preventDefault(); setPreviewUrl(''); }}
                      className="absolute top-0 right-0 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    >
                      <span className="sr-only">{t.remove}</span>
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                        <span>{t.uploadFile}</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required />
                      </label>
                      <p className="pl-1">{t.dragDrop}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Code */}
        <div className="flex flex-col h-full">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            <div className="flex items-center gap-1.5"><FileCode size={14} /> {t.sourceCode}</div>
          </label>
          <div className="flex-grow relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full min-h-[400px] px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm bg-slate-800 text-slate-200"
              placeholder={t.codePlaceholder}
              required
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-slate-100">
        <Button type="submit" size="lg">{t.uploadTemplate}</Button>
      </div>
    </form>
  );
};

// --- Subcomponent: Keys Manager ---
const KeysManager: React.FC = () => {
  const { t } = useLanguage();
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  // New Key Form State
  const [keyName, setKeyName] = useState('');
  const [maxUses, setMaxUses] = useState(10);
  const [expiryDays, setExpiryDays] = useState(30);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    const data = await backend.getAccessKeys();
    setKeys(data);
    setLoading(false);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
        await backend.generateAccessKey(keyName || 'Standard Key', maxUses, expiryDays);
        await loadKeys();
        setKeyName('');
    } catch (e) {
        alert("Error generating key");
    } finally {
        setGenerating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    await backend.toggleKeyStatus(id, !currentStatus);
    loadKeys();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Generate Section */}
      <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Generate New Key</h3>
        <div className="flex flex-wrap items-end gap-4">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-slate-500 mb-1">Key Name / Owner</label>
                <input 
                    type="text" 
                    value={keyName} 
                    onChange={e => setKeyName(e.target.value)}
                    placeholder="e.g. Student Group A"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
            </div>
            <div className="w-32">
                <label className="block text-xs font-medium text-slate-500 mb-1">Max Uses</label>
                <input 
                    type="number" 
                    value={maxUses} 
                    onChange={e => setMaxUses(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
            </div>
            <div className="w-32">
                <label className="block text-xs font-medium text-slate-500 mb-1">Expiry (Days)</label>
                <input 
                    type="number" 
                    value={expiryDays} 
                    onChange={e => setExpiryDays(parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
            </div>
            <Button onClick={handleGenerate} isLoading={generating} className="flex items-center gap-2">
                <Plus size={16} /> Generate
            </Button>
        </div>
      </div>

      {/* List Section */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Active Keys</h3>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Key Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Expires</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
                ) : keys.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">No keys found.</td></tr>
                ) : (
                keys.map((key) => (
                    <tr key={key.id} className={!key.isActive ? 'bg-slate-50 opacity-75' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono font-bold text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded select-all">
                        {key.code}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">{key.name || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                        <span className={key.usedCount >= key.maxUses ? 'text-red-600 font-bold' : ''}>
                            {key.usedCount}
                        </span> 
                        <span className="text-slate-400"> / {key.maxUses}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {key.expiresAt ? new Date(key.expiresAt).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        key.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {key.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                            onClick={() => toggleStatus(key.id, key.isActive)}
                            className={`text-xs px-2 py-1 rounded border ${
                                key.isActive 
                                ? 'border-red-200 text-red-600 hover:bg-red-50' 
                                : 'border-green-200 text-green-600 hover:bg-green-50'
                            }`}
                        >
                            {key.isActive ? 'Revoke' : 'Activate'}
                        </button>
                    </td>
                    </tr>
                ))
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

// --- Subcomponent: Logs Viewer ---
const LogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    const data = await backend.getUsageLogs();
    setLogs(data);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto">
        <div className="flex justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Usage Audit Log</h3>
            <Button size="sm" variant="ghost" onClick={loadLogs}>Refresh</Button>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
            <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
                <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Key Used</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Template</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">IP</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                    <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">Loading logs...</td></tr>
                ) : logs.map((log) => (
                <tr key={log.id}>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-500">
                        {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm font-mono text-slate-600">
                        {log.keyCode || 'Unknown'}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-900">
                        {log.templateTitle}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                         <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            log.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {log.success ? 'Success' : 'Failed'}
                        </span>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-400 font-mono">
                        {log.ipAddress}
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
    </div>
  );
};