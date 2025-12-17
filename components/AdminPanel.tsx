import React, { useState } from 'react';
import { Template } from '../types';
import { Button } from './Button';
import { Image as ImageIcon, FileCode, Tag, Type } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AdminPanelProps {
  onAddTemplate: (template: Template) => void;
  onClose: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onAddTemplate, onClose }) => {
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
    <div className="p-6 sm:p-8">
       <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-4">
         <div>
           <h2 className="text-2xl font-bold text-slate-900">{t.uploadNewTitle}</h2>
           <p className="text-slate-500 text-sm mt-1">{t.uploadNewDesc}</p>
         </div>
         <Button variant="ghost" onClick={onClose}>{t.cancel}</Button>
       </div>

       <form onSubmit={handleSubmit} className="space-y-8">
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Left Column: Meta Info */}
           <div className="space-y-6">
             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2">
                 {t.templateTitle}
               </label>
               <input
                 type="text"
                 value={title}
                 onChange={(e) => setTitle(e.target.value)}
                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                 placeholder="e.g. Dual Y-Axis Time Series"
                 required
               />
             </div>

             <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2">
                 {t.description}
               </label>
               <textarea
                 value={description}
                 onChange={(e) => setDescription(e.target.value)}
                 className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-28 resize-none text-sm"
                 placeholder={t.descriptionPlaceholder}
               />
             </div>

             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Type size={14} /> {t.language}
                    </div>
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
                    <div className="flex items-center gap-1.5">
                      <Tag size={14} /> {t.tags}
                    </div>
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="2D, Heatmap, etc."
                  />
               </div>
             </div>

             <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <div className="flex items-center gap-1.5">
                    <ImageIcon size={14} /> {t.previewImage}
                  </div>
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
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                        <div className="flex text-sm text-slate-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                            <span>{t.uploadFile}</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} required />
                          </label>
                          <p className="pl-1">{t.dragDrop}</p>
                        </div>
                        <p className="text-xs text-slate-500">{t.fileLimit}</p>
                      </>
                    )}
                  </div>
                </div>
             </div>
           </div>

           {/* Right Column: Code */}
           <div className="flex flex-col h-full">
             <label className="block text-sm font-semibold text-slate-700 mb-2">
               <div className="flex items-center gap-1.5">
                 <FileCode size={14} /> {t.sourceCode}
               </div>
             </label>
             <div className="flex-grow relative">
               <textarea
                 value={code}
                 onChange={(e) => setCode(e.target.value)}
                 className="w-full h-full min-h-[400px] px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all font-mono text-sm bg-slate-800 text-slate-200"
                 placeholder={t.codePlaceholder}
                 required
                 spellCheck={false}
               />
             </div>
           </div>
         </div>

         <div className="flex justify-end pt-6 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} className="mr-3">
              {t.cancel}
            </Button>
            <Button type="submit" size="lg">
              {t.uploadTemplate}
            </Button>
         </div>
       </form>
    </div>
  );
};