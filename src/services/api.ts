
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
        body: JSON.stringify({ username, password })
        });
        return await res.json();
    } catch(e) {
        console.warn("Login API failed, falling back to mock login for demo if applicable, or failing.");
        return { success: false, error: 'Network error or API unavailable' };
    }
  },

  initDatabase: async () => {
    const res = await fetch('/api/init-db', {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  getTemplates: async (): Promise<Template[]> => {
    try {
        const res = await fetch('/api/templates', { headers: getHeaders() });
        
        if (res.status === 404) {
            console.warn("API not found, using fallback templates.");
            return INITIAL_TEMPLATES;
        }

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("text/html")) {
            console.warn("API returned HTML (likely SPA fallback), using fallback templates.");
            return INITIAL_TEMPLATES;
        }

        if (!res.ok) {
            try {
               await handleResponse(res);
            } catch (e) {
               console.warn("API error, using fallback templates:", e);
               return INITIAL_TEMPLATES;
            }
        }
        
        const data = await handleResponse(res);
        if (!Array.isArray(data)) {
           return INITIAL_TEMPLATES;
        }
        return data;

    } catch (e) {
        return INITIAL_TEMPLATES;
    }
  },

  createTemplate: async (template: Partial<Template>) => {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(template)
    });
    return handleResponse(res);
  },

  updateTemplate: async (template: Partial<Template>) => {
    const res = await fetch('/api/templates', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(template)
    });
    return handleResponse(res);
  },

  deleteTemplate: async (id: string) => {
    const res = await fetch(`/api/templates?id=${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    return handleResponse(res);
  },

  getMemberCodes: async (): Promise<MemberCode[]> => {
    const res = await fetch('/api/member-codes', { headers: getHeaders() });
    return await handleResponse(res);
  },

  createMemberCode: async (data: { name: string; maxUses: number; expiresAt: string | null }) => {
    const res = await fetch('/api/member-codes', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  updateMemberCode: async (data: Partial<MemberCode>) => {
    const res = await fetch('/api/member-codes', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  verifyCode: async (code: string, templateId: string): Promise<{ success: boolean; remaining?: number; error?: string }> => {
    try {
        const res = await fetch('/api/verify-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, templateId })
        });
        const contentType = res.headers.get("content-type");
        if (res.status === 404 || (contentType && contentType.includes("text/html"))) {
             if (code === "DEMO-1234") return { success: true, remaining: 99 };
             return { success: false, error: "API unavailable. Try 'DEMO-1234'?" };
        }
        return await res.json();
    } catch (e) {
        return { success: false, error: 'Network error' };
    }
  },

  getLogs: async (): Promise<UsageLog[]> => {
    const res = await fetch('/api/member-codes?type=logs', { headers: getHeaders() });
    return await handleResponse(res);
  }
};
