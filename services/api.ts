
import { Template, MemberCode, UsageLog, Category } from '../types';
import { INITIAL_TEMPLATES } from '../constants';

const getHeaders = () => {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

/**
 * Safely parse JSON response or return error message
 */
const handleResponse = async (res: Response) => {
  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');

  if (!res.ok) {
    let errorMessage = `Request failed: ${res.status}`;
    if (isJson) {
      try {
        const data = await res.json();
        errorMessage = data.error || errorMessage;
      } catch (e) {
        // Fallback if parsing fails
      }
    } else {
      try {
        const text = await res.text();
        if (text) errorMessage = text;
      } catch (e) {}
    }
    throw new Error(errorMessage);
  }

  if (isJson) {
    return res.json();
  }
  return res.text();
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
    } catch (e) {
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
      
      if (!res.ok) {
        // Safe check for database relation error
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.error?.includes('relation "templates" does not exist')) {
            return INITIAL_TEMPLATES;
          }
        }
        return [];
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

  // Category API
  getCategories: async (): Promise<Category[]> => {
    try {
      const res = await fetch('/api/categories', { headers: getHeaders(), cache: 'no-store' });
      return await handleResponse(res);
    } catch (e) {
      console.warn("API GetCategories Error:", e);
      return [];
    }
  },

  createCategory: async (name: string): Promise<Category> => {
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name }),
      cache: 'no-store'
    });
    return handleResponse(res);
  },

  updateCategory: async (id: number, name: string) => {
    const res = await fetch('/api/categories', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ id, name }),
      cache: 'no-store'
    });
    return handleResponse(res);
  },

  deleteCategory: async (id: number) => {
    const res = await fetch(`/api/categories?id=${id}`, {
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
      return await handleResponse(res);
    } catch (e: any) {
      return { success: false, error: e.message || 'Network error' };
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
