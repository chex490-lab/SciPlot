import React from 'react';
import { Template } from '../types';
import { Trash2 } from 'lucide-react';
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

  return (
    <div 
      className="group bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col h-full relative"
      onClick={() => onClick(template)}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        <img 
          src={template.imageUrl} 
          alt={template.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full uppercase font-semibold">
            {template.language}
          </div>
        </div>
      </div>
      
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
            {template.title}
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
          {template.description}
        </p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {template.tags.map(tag => (
            <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
