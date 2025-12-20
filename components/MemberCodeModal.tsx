
import React, { useState } from 'react';
import { X, Lock, Loader2 } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';

interface Props {
  templateId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const MemberCodeModal: React.FC<Props> = ({ templateId, onSuccess, onClose }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 1. Remove all non-alphanumeric characters and convert to uppercase
    let val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    // 2. Limit to 8 characters (the actual code is 8 chars excluding the hyphen)
    if (val.length > 8) {
      val = val.slice(0, 8);
    }

    // 3. Format with hyphen: XXXX-XXXX
    let formatted = val;
    if (val.length > 4) {
      formatted = val.slice(0, 4) + '-' + val.slice(4);
    }
    
    setCode(formatted);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length < 9) {
      setError('请输入完整的 8 位会员码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await api.verifyCode(code.trim(), templateId);
      if (result.success) {
        onSuccess();
      } else {
        setError(result.error || '验证失败，请检查会员码');
      }
    } catch (err: any) {
      setError(err.message || '网络请求失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Lock size={16} className="text-indigo-600" />
            {t.verifyTitle}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-sm text-slate-600">{t.verifyDesc}</p>
          <div>
            <input
              type="text"
              value={code}
              onChange={handleCodeChange}
              placeholder={t.verifyPlaceholder}
              maxLength={9}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono text-center text-xl tracking-widest bg-slate-50 focus:bg-white transition-all shadow-inner"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-2 text-center font-medium">{error}</p>}
          </div>
          
          <Button type="submit" className="w-full py-3 text-base shadow-md" disabled={loading}>
            {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
            {t.verifyBtn}
          </Button>
          
          <p className="text-[10px] text-slate-400 text-center uppercase tracking-tighter">
            格式示例: ABCD-1234
          </p>
        </form>
      </div>
    </div>
  );
};
