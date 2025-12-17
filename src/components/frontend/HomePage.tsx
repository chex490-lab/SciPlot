import React, { useState, useEffect } from 'react';
import { Template } from '../../types';
import { fetchTemplates } from '../../utils/api';
import { TemplateCard } from './TemplateCard';
import { Button } from '../common/Button';
import { Search, Loader2 } from 'lucide-react';

interface HomePageProps {
  onTemplateSelect: (t: Template) => void;
  onWantIt: (t: Template) => void;
  onAdminClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onTemplateSelect, onWantIt, onAdminClick }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('');

  useEffect(() => {
    loadTemplates();
  }, [category]);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await fetchTemplates(category);
      setTemplates(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['', 'bar', 'line', 'scatter', 'heatmap', '3d'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900">SciPlot Hub</h1>
           <p className="text-slate-500 mt-1">高质量科研绘图模板库</p>
        </div>
        <Button variant="ghost" onClick={onAdminClick}>管理员后台</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              category === c 
                ? 'bg-indigo-600 text-white shadow-md' 
                : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            {c === '' ? '全部' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      ) : templates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map(t => (
            <TemplateCard 
              key={t.id} 
              template={t} 
              onViewDetail={onTemplateSelect}
              onWantIt={onWantIt}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-500">
          暂无模板
        </div>
      )}
    </div>
  );
};