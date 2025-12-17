import React from 'react';
import { Template } from '../../types';
import { Button } from '../common/Button';
import { BarChart, Eye, Copy, Lock } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
  onViewDetail: (template: Template) => void;
  onWantIt: (template: Template) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onViewDetail, onWantIt }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col h-full group">
      <div 
        className="aspect-[4/3] bg-slate-100 relative overflow-hidden cursor-pointer"
        onClick={() => onViewDetail(template)}
      >
        {template.image_url ? (
          <img src={template.image_url} alt={template.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <BarChart size={48} />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
          {template.category}
        </div>
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-slate-900 mb-1 line-clamp-1">{template.title}</h3>
        <p className="text-slate-500 text-sm line-clamp-2 mb-4 flex-grow">{template.description}</p>
        
        <div className="flex items-center justify-between gap-2 mt-auto pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">已使用 {template.used_count} 次</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => onViewDetail(template)}>
              <Eye size={16} className="mr-1" />
              详情
            </Button>
            <Button variant="primary" size="sm" onClick={() => onWantIt(template)}>
              想要同款
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};