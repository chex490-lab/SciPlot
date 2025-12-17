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

  getTemplates: async (): Promise<Template[]> => {
    try {
        const res = await fetch('/api/templates', { headers: getHeaders() });
        
        // If the API endpoint returns 404 (e.g. running in Vite without backend), use fallback
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
            // Try to parse error, otherwise fallback
            try {
               await handleResponse(res);
            } catch (e) {
               console.warn("API error, using fallback templates:", e);
               return INITIAL_TEMPLATES;
            }
        }
        
        const data = await handleResponse(res);
        // Validate array
        if (!Array.isArray(data)) {
           console.warn("API returned non-array, using fallback.");
           return INITIAL_TEMPLATES;
        }
        return data;

    } catch (e) {
        console.error("Failed to fetch templates, using fallback data:", e);
        return INITIAL_TEMPLATES;
    }
  },

  createTemplate: async (template: Partial<Template>) => {
    try {
        const res = await fetch('/api/templates', {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify(template)
        });
        return handleResponse(res);
    } catch (e) {
        throw e;
    }
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
    try {
        const res = await fetch('/api/member-codes', { headers: getHeaders() });
        return await handleResponse(res);
    } catch (e) {
        console.warn("Failed to fetch codes:", e);
        return [];
    }
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
        
        // Handle 404 or HTML response
        const contentType = res.headers.get("content-type");
        if (res.status === 404 || (contentType && contentType.includes("text/html"))) {
             // Mock verification for demo if API is missing
             console.warn("Verify API missing, using mock verification.");
             if (code === "DEMO-1234") return { success: true, remaining: 99 };
             return { success: false, error: "API unavailable. Try 'DEMO-1234'?" };
        }

        return await res.json();
    } catch (e) {
        return { success: false, error: 'Network error' };
    }
  },

  getLogs: async (): Promise<UsageLog[]> => {
    try {
        const res = await fetch('/api/member-codes?type=logs', { headers: getHeaders() });
        return await handleResponse(res);
    } catch (e) {
        return [];
    }
  }
};