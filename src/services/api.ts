
import { Template, MemberCode, UsageLog } from '../../types';
import { INITIAL_TEMPLATES } from '../../constants';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const text = await res.text();
    try {
        const json = JSON.parse(text);
        throw new Error(json.error || `Request failed: ${res.status}`);
    } catch (e: any) {
        throw new Error(e.message || `Request failed: ${res.status}`);
    }
  }
  return res.json();
};

export const api = {
  login: async (username: string, password: string): Promise<{ success: boolean; token?: string; error?: string }> => {
    try {
        const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        cache: 'no-store'
        });
        return await res.json();
    } catch(e) {
        return { success: false, error: 'Network error or API unavailable' };
    }
  },

  initDatabase: async () => {
    const res = await fetch('/api/init-db', {
      method: 'POST',
      headers: getHeaders(),
      cache: 'no-store'
    });
    return handleResponse(res);
  },

  getTemplates: async (): Promise<Template[]> => {
    try {
        const res = await fetch('/api/templates', { 
          headers: getHeaders(),
          cache: 'no-store'
        });
        
        // If API explicitly fails with 500 or 404, we might consider fallback
        if (!res.ok) {
           const data = await res.json();
           // If DB not initialized, formatted error contains it
           if (data.error?.includes('relation "templates" does not exist')) {
              return INITIAL_TEMPLATES;
           }
           return []; // Return empty instead of hardcoded if it's a real DB error but initialized
        }
        
        const data = await res.json();
        return Array.isArray(data) ? data : [];

    } catch (e) {
        console.warn("API GetTemplates Error:", e);
        return INITIAL_TEMPLATES;
    }
  },

  createTemplate: async (template: Partial<Template>) => {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(template),
      cache: 'no-store'
    });
    return handleResponse(res);
  },

  updateTemplate: async (template: Partial<Template>) => {
    const res = await fetch('/api/templates', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(template),
      cache: 'no-store'
    });
    return handleResponse(res);
  },

  deleteTemplate: async (id: string) => {
    const res = await fetch(`/api/templates?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
      cache: 'no-store'
    });
    return handleResponse(res);
  },

  getMemberCodes: async (): Promise<MemberCode[]> => {
    const res = await fetch('/api/member-codes', { 
      headers: getHeaders(),
      cache: 'no-store' 
    });
    return await handleResponse(res);
  },

  createMemberCode: async (data: { name: string; maxUses: number; expiresAt: string | null }) => {
    const res = await fetch('/api/member-codes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
      cache: 'no-store'
    });
    return handleResponse(res);
  },

  updateMemberCode: async (data: Partial<MemberCode>) => {
    const res = await fetch('/api/member-codes', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
      cache: 'no-store'
    });
    return handleResponse(res);
  },

  verifyCode: async (code: string, templateId: string): Promise<{ success: boolean; remaining?: number; error?: string }> => {
    try {
        const res = await fetch('/api/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, templateId }),
            cache: 'no-store'
        });
        return await res.json();
    } catch (e) {
        return { success: false, error: 'Network error' };
    }
  },

  getLogs: async (): Promise<UsageLog[]> => {
    const res = await fetch('/api/member-codes?type=logs', { 
      headers: getHeaders(),
      cache: 'no-store' 
    });
    return await handleResponse(res);
  }
};
