import React, { useState } from 'react';
import { Template } from '../../types';
import { verifyCode } from '../../utils/api';
import { Button } from '../common/Button';
import { X, Lock, Check } from 'lucide-react';
import { copyToClipboard } from '../../utils/helpers';

interface Props {
  template: Template;
  onClose: () => void;
  onSuccess: () => void;
}

export const MemberCodeVerification: React.FC<Props> = ({ template, onClose, onSuccess }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await verifyCode(code, template.template_id, template.title);
      if (res.success) {
        await copyToClipboard(template.code);
        onSuccess();
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || '验证失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-semibold text-slate-800 flex items-center gap-2">
            <Lock size={16} className="text-indigo-600" />
            会员验证
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">
            请输入会员码以获取模板 <strong>{template.title}</strong> 的源代码。验证成功后代码将自动复制。
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="请输入会员码 (例如: VIP8888)"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none uppercase"
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            </div>

            <Button type="submit" className="w-full" isLoading={loading}>
              验证并复制
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};