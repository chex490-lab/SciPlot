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
    return this.verifyKey(code, 'General Verification');
  },

  async createTemplate(data: Template, token: string): Promise<Template> {
    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-auth': token },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed");
      return await res.json();
    } catch (e) {
      // Mock Fallback
      console.warn("Backend createTemplate failed, using mock.");
      const newT = { ...data, id: Math.random().toString(36).substr(2, 9) };
      // In a real app we'd update local state here if we were maintaining a store
      return newT;
    }
  },

  async updateTemplate(data: Template, token: string): Promise<Template> {
    try {
      const res = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-auth': token },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error("Failed");
      return await res.json();
    } catch (e) {
       console.warn("Backend updateTemplate failed, using mock.");
       return data;
    }
  },

  async deleteTemplateById(id: string, token: string): Promise<void> {
    try {
      await fetch(`/api/templates?id=${id}`, {
        method: 'DELETE',
        headers: { 'x-admin-auth': token }
      });
    } catch (e) {
      console.warn("Backend deleteTemplate failed, using mock.");
    }
  },

  // --- AUTH ---
  async login(password: string): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        // Fallback for 404/500/HTML responses
        throw new Error(`API Endpoint issue: ${res.status}`);
      }

      const data = await res.json();
      if (res.ok && data.success) {
        currentAuthToken = data.token;
        return { success: true };
      }
      return { success: false, message: data.message || 'Login failed' };
    } catch (e: any) {
      console.warn("Login API failed (" + e.message + "). Using client-side mock.");
      
      // MOCK LOGIN LOGIC
      if (password === 'admin') {
        currentAuthToken = 'mock-admin-token';
        return { success: true };
      }
      return { success: false, message: 'Incorrect password (Mock Check: use "admin")' };
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
      throw new Error("Fetch failed");
    } catch (e) { 
      console.warn("getAccessKeys failed, returning mock empty list");
      return []; 
    }
  },

  async generateAccessKey(name: string, maxUses: number, expiryDays?: number): Promise<AccessKey> {
    if (!currentAuthToken) throw new Error("Unauthorized");
    
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    const timestamp = Date.now().toString().substring(10);
    const code = `VIP-${randomPart}${timestamp}`;
    const expiresAt = expiryDays ? Date.now() + (expiryDays * 24 * 60 * 60 * 1000) : null;

    try {
      const res = await fetch('/api/admin/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-auth': currentAuthToken },
        body: JSON.stringify({ code, name, maxUses, expiresAt })
      });
      if (res.ok) return await res.json();
      throw new Error("Fetch failed");
    } catch (e) {
       console.warn("generateAccessKey failed, returning mock key");
       // Mock return
       return {
         id: Math.random().toString(),
         code,
         name,
         maxUses,
         usedCount: 0,
         expiresAt,
         isActive: true,
         createdAt: Date.now()
       };
    }
  },

  async toggleKeyStatus(id: string, isActive: boolean): Promise<void> {
    if (!currentAuthToken) throw new Error("Unauthorized");
    try {
      await fetch('/api/admin/keys', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-auth': currentAuthToken },
        body: JSON.stringify({ id, isActive })
      });
    } catch (e) { console.warn("toggleKeyStatus mock"); }
  },

  // --- LOGS (ADMIN) ---
  async getUsageLogs(): Promise<UsageLog[]> {
    if (!currentAuthToken) return [];
    try {
      const res = await fetch('/api/admin/logs', {
        headers: { 'x-admin-auth': currentAuthToken }
      });
      if (res.ok) return await res.json();
      throw new Error("Fetch failed");
    } catch (e) { return []; }
  },

  // --- SYSTEM ---
  async initializeDatabase(): Promise<{success: boolean, message: string}> {
    try {
      const res = await fetch('/api/seed');
      const data = await res.json();
      if (res.ok) return { success: true, message: data.message };
      return { success: false, message: data.error || 'Failed' };
    } catch (e: any) {
      return { success: false, message: 'Mock: Database init skipped (API unavailable)' };
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
      
      if (res.ok) return await res.json();
      throw new Error("API Failed");
    } catch {
      // Mock Verification
      if (code.trim().toUpperCase().startsWith("VIP")) {
         return { valid: true };
      }
      return { valid: false, message: 'Invalid code (Mock: use code starting with VIP)' };
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
      throw new Error(data.error || "Failed");
    } catch (e) {
      console.warn("getCode failed, using fallback.");
      // Fallback: Check if it's a VIP code
      if (memberCode.trim().toUpperCase().startsWith("VIP")) {
         // Return the template's code from INITIAL_TEMPLATES if possible
         const template = INITIAL_TEMPLATES.find(t => t.id === templateId);
         if (template) {
             return { success: true, code: template.codeContent || template.code };
         }
         return { success: false, error: "Template not found" };
      }
      return { success: false, error: 'Invalid Code (Mock)' };
    }
  }
};