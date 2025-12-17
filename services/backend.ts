import { Template, AccessKey, UsageLog } from '../types';
import { INITIAL_TEMPLATES } from '../constants';

let currentAuthToken: string | null = null;

export const backend = {
  
  // --- TEMPLATES ---
  async getTemplates(): Promise<Template[]> {
    try {
      const res = await fetch('/api/templates');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      
      // Fallback: If DB is empty or API returns non-array (error), use initial mock data
      // This ensures the preview works even if the DB isn't connected yet.
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
      return INITIAL_TEMPLATES;
    } catch (error) {
      console.warn("API unavailable, using mock data.");
      return INITIAL_TEMPLATES;
    }
  },

  async addTemplate(template: Template): Promise<Template> {
    if (!currentAuthToken) throw new Error("Unauthorized");
    
    const res = await fetch('/api/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-auth': currentAuthToken
      },
      body: JSON.stringify(template)
    });
    
    if (!res.ok) throw new Error("Failed to add template");
    return await res.json();
  },

  async deleteTemplate(id: string): Promise<void> {
    if (!currentAuthToken) throw new Error("Unauthorized");
    await fetch(`/api/templates?id=${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-auth': currentAuthToken }
    });
  },

  // --- AUTH ---
  async login(password: string): Promise<boolean> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      if (res.ok) {
        const data = await res.json();
        currentAuthToken = data.token;
        return true;
      }
      return false;
    } catch (e) {
      console.error("Login error", e);
      return false;
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
  }
};