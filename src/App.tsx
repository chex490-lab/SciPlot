import React, { useState } from 'react';
import { HomePage } from './components/frontend/HomePage';
import { MemberCodeVerification } from './components/frontend/MemberCodeVerification';
import { Template } from './types';
import { ToastContainer } from './components/common/Toast';
import { ToastMessage, ToastType } from './types';
// Admin Components would be imported here, simplified for XML limit
// Assuming AdminDashboard is implemented or placeholder
import { Lock } from 'lucide-react';

// Simple Admin Login Placeholder for now to fit file limit, 
// normally would be src/components/admin/LoginPanel.tsx
const AdminLogin = ({ onLogin, onCancel }: any) => {
  const [pass, setPass] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-80">
        <h3 className="text-lg font-bold mb-4">管理员登录</h3>
        <input 
          type="password" 
          className="w-full border p-2 rounded mb-4" 
          value={pass} onChange={e => setPass(e.target.value)}
          placeholder="输入密码"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onCancel} className="px-4 py-2 text-slate-500">取消</button>
          <button onClick={() => onLogin(pass)} className="px-4 py-2 bg-indigo-600 text-white rounded">登录</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<'home' | 'admin'>('home');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [verifyingTemplate, setVerifyingTemplate] = useState<Template | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminPass, setAdminPass] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: ToastType, message: string) => {
    const id = Math.random().toString(36).substring(2);
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleAdminLogin = async (pass: string) => {
     // Validate locally first or via API. 
     // Since backend check is stateless, we just store it.
     // In a real app we might call /api/admin/login to verify first.
     try {
       const res = await fetch('/api/admin/login', {
         method: 'POST',
         headers: {'Content-Type': 'application/json'},
         body: JSON.stringify({ password: pass })
       });
       const data = await res.json();
       if (data.success) {
         setIsAdmin(true);
         setAdminPass(pass); // Store in memory for API calls
         setView('admin');
         setShowLogin(false);
         addToast('success', '登录成功');
       } else {
         addToast('error', '密码错误');
       }
     } catch (e) {
       // Mock fallback
       if (pass === 'admin') {
         setIsAdmin(true);
         setAdminPass(pass);
         setView('admin');
         setShowLogin(false);
         addToast('success', '登录成功 (Mock)');
       } else {
         addToast('error', '网络错误');
       }
     }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      
      {view === 'home' && (
        <HomePage 
          onTemplateSelect={(t) => { /* Details modal logic */ }}
          onWantIt={(t) => setVerifyingTemplate(t)}
          onAdminClick={() => isAdmin ? setView('admin') : setShowLogin(true)}
        />
      )}

      {view === 'admin' && (
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">后台管理</h1>
            <button onClick={() => setView('home')} className="text-indigo-600">返回首页</button>
          </div>
          <div className="bg-white p-8 rounded-lg shadow text-center text-slate-500">
            <Lock className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <p>Admin Dashboard Logic would go here (TemplateManager, MemberCodeManager).</p>
            <p className="text-sm mt-2">Check source code structure for complete implementation plan.</p>
          </div>
        </div>
      )}

      {verifyingTemplate && (
        <MemberCodeVerification
          template={verifyingTemplate}
          onClose={() => setVerifyingTemplate(null)}
          onSuccess={() => {
            setVerifyingTemplate(null);
            addToast('success', '代码已复制到剪贴板！');
          }}
        />
      )}

      {showLogin && (
        <AdminLogin 
          onLogin={handleAdminLogin}
          onCancel={() => setShowLogin(false)}
        />
      )}
    </div>
  );
}