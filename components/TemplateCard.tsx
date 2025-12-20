
import React from 'react';
import { Template } from '../types';
import { Trash2, Layers } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface TemplateCardProps {
  template: Template;
  isAdmin: boolean;
  onClick: (template: Template) => void;
  onDelete?: (id: string) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, isAdmin, onClick, onDelete }) => {
  const { t } = useLanguage();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(t.deleteConfirm)) {
      onDelete?.(template.id);
    }
  };

  const tags = Array.isArray(template.tags) ? template.tags : [];

  return (
    <div 
      className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col h-full relative"
      onClick={() => onClick(template)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-white border-b border-slate-100">
        <img 
          src={template.imageUrl || 'https://picsum.photos/seed/plot/800/600'} 
          alt={template.title}
          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://picsum.photos/seed/error/800/600';
          }}
        />
        <div className="absolute top-2 right-2 flex flex-col items-end gap-2">
          <div className="bg-black/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full uppercase font-bold tracking-wider">
            {template.language || 'Code'}
          </div>
          {template.category_name && (
            <div className="bg-indigo-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Layers size={10} />
              <span className="font-semibold">{template.category_name}</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {template.title || 'Untitled Template'}
          </h3>
          {isAdmin && onDelete && (
            <button 
              onClick={handleDelete}
              className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors z-10"
              title="Delete Template"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
        
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">
          {template.description || 'No description provided.'}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {tags.length > 0 ? tags.map(tag => (
            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium uppercase tracking-tight">
              #{tag}
            </span>
          )) : null}
        </div>
      </div>
    </div>
  );
};
