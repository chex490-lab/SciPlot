import { Template, AccessKey, UsageLog } from '../types';
import { INITIAL_TEMPLATES } from '../constants';

let currentAuthToken: string | null = null;

export const backend = {
  
  // --- TEMPLATES (LEGACY WRAPPERS) ---
  async getTemplates(): Promise<Template[]> {
    try {
      const res = await fetch('/api/templates');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return INITIAL_TEMPLATES;
    } catch (error) {
      console.warn("API unavailable, using mock data.");
      return INITIAL_TEMPLATES;
    }
  },

  // Legacy wrapper
  async addTemplate(template: Template): Promise<Template> {
    if (!currentAuthToken) throw new Error("Unauthorized");
    return this.createTemplate(template, currentAuthToken);
  },

  // Legacy wrapper
  async deleteTemplate(id: string): Promise<void> {
    if (!currentAuthToken) throw new Error("Unauthorized");
    return this.deleteTemplateById(id, currentAuthToken);
  },

  // --- REQUESTED NEW METHODS ---

  async verifyMemberCode(code: string): Promise<{valid: boolean, message?: string}> {
    // Calls verifyKey with a generic title since this might be a general check
    return this.verifyKey(code, 'General Verification');
  },

  async createTemplate(data: Template, token: string): Promise<Template> {
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-auth': token
      },
      body: JSON.stringify(data)
    });
    
    if (!res.ok) throw new Error("Failed to create template");
    return await res.json();
  },

  async updateTemplate(data: Template, token: string): Promise<Template> {
    const res = await fetch('/api/templates', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-auth': token
      },
      body: JSON.stringify(data)
    });

    if (!res.ok) throw new Error("Failed to update template");
    return await res.json();
  },

  async deleteTemplateById(id: string, token: string): Promise<void> {
    await fetch(`/api/templates?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-auth': token }
    });
  },

  // --- AUTH ---
  async login(password: string): Promise<{ success: boolean; message?: string }> {
    try {
      // Correct path as requested by user
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      // Handle non-JSON responses (like 404/500 HTML pages) to avoid "Unexpected token" errors
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // If 404, it means the API route is not found
        if (res.status === 404) {
             return { success: false, message: `Error 404: API endpoint '/api/admin/login' not found.` };
        }
        const text = await res.text();
        console.error("Login failed. Server returned non-JSON:", text);
        return { success: false, message: `Server Error (${res.status}): Please check server logs.` };
      }

      const data = await res.json();

      if (res.ok && data.success) {
        currentAuthToken = data.token;
        return { success: true };
      }
      return { success: false, message: data.message || data.error || 'Login failed' };
    } catch (e: any) {
      console.error("Login network error:", e);
      return { success: false, message: e.message || "Network error" };
    }
  },

  // --- KEYS (ADMIN) ---
  async getAccessKeys(): Promise<AccessKey[]> {
    if (!currentAuthToken) return [];
    try {
      const res = await fetch('/api/admin/keys', {
        headers: { 'x-admin-auth': currentAuthToken }
      });
      if (res.ok) return await res.json();
    } catch (e) { console.warn(e); }
    return [];
  },

  async generateAccessKey(name: string, maxUses: number, expiryDays?: number): Promise<AccessKey> {
    if (!currentAuthToken) throw new Error("Unauthorized");

    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().substring(10);
    const code = `VIP-${randomPart}${timestamp}`;

    const expiresAt = expiryDays ? Date.now() + (expiryDays * 24 * 60 * 60 * 1000) : null;

    const res = await fetch('/api/admin/keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-auth': currentAuthToken
      },
      body: JSON.stringify({ code, name, maxUses, expiresAt })
    });

    if (res.ok) return await res.json();
    throw new Error("Failed to generate key");
  },

  async toggleKeyStatus(id: string, isActive: boolean): Promise<void> {
    if (!currentAuthToken) throw new Error("Unauthorized");
    await fetch('/api/admin/keys', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-admin-auth': currentAuthToken },
      body: JSON.stringify({ id, isActive })
    });
  },

  // --- LOGS (ADMIN) ---
  async getUsageLogs(): Promise<UsageLog[]> {
    if (!currentAuthToken) return [];
    try {
      const res = await fetch('/api/admin/logs', {
        headers: { 'x-admin-auth': currentAuthToken }
      });
      if (res.ok) return await res.json();
    } catch (e) { console.warn(e); }
    return [];
  },

  // --- SYSTEM ---
  async initializeDatabase(): Promise<{success: boolean, message: string}> {
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      if (res.ok) return { success: true, message: data.message };
      return { success: false, message: data.error || 'Failed' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Network error' };
    }
  },

  // --- VERIFICATION (PUBLIC) ---
  async verifyKey(code: string, templateTitle: string): Promise<{valid: boolean, message?: string}> {
    try {
      const res = await fetch('/api/verify-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), templateTitle })
      });
      
      if (res.ok) {
        return await res.json();
      }
      return { valid: false, message: 'Server error' };
    } catch {
      return { valid: false, message: 'Network error' };
    }
  },

  async getCode(memberCode: string, templateId: string): Promise<{success: boolean, code?: string, error?: string}> {
    try {
      const res = await fetch('/api/get-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberCode: memberCode.trim(), templateId })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        return { success: true, code: data.code };
      }
      return { success: false, error: data.error || 'Failed to retrieve code' };
    } catch (e) {
      return { success: false, error: 'Network error' };
    }
  }
};