import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';
import { Button } from './Button';
import { useLanguage } from '../contexts/LanguageContext';

interface LoginModalProps {
  onLogin: (password: string) => void;
  onClose: () => void;
  error?: string | boolean; // Changed to accept string for detailed messages
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLogin, onClose, error }) => {
  const [password, setPassword] = useState('');
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(password);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Lock size={16} className="text-indigo-600" />
            {t.adminLogin}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {t.password}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              autoFocus
            />
            {error && (
              <div className="mt-2 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                {typeof error === 'string' ? error : t.wrongPassword}
              </div>
            )}
          </div>
          
          <Button type="submit" className="w-full">
            {t.login}
          </Button>
        </form>
      </div>
    </div>
  );
};