import { Template, MemberCode, UsageLog, Stats } from '../types';

const MOCK_TEMPLATES: Template[] = [
  {
    id: 1,
    template_id: 't1',
    title: 'Mock Bar Chart',
    description: 'A simple bar chart example.',
    category: 'bar',
    code: 'import matplotlib.pyplot as plt\nplt.bar([1,2,3], [10,20,15])',
    used_count: 5,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// Helper to handle API requests and fallback to mock if API is down (404/500)
async function fetchWithMock<T>(url: string, options?: RequestInit, mockData?: T): Promise<T> {
  try {
    const res = await fetch(url, options);
    const isJson = res.headers.get('content-type')?.includes('application/json');
    if (!res.ok) {
       // If 404/500, fallback
       if (mockData) {
         console.warn(`API ${url} failed, using mock data.`);
         return mockData;
       }
       const err = isJson ? await res.json() : { error: res.statusText };
       throw new Error(err.error || err.message || 'Request failed');
    }
    return await res.json().then(data => data.data || data);
  } catch (e) {
    if (mockData) {
      console.warn(`API ${url} network error, using mock data.`);
      return mockData;
    }
    throw e;
  }
}

// 模板相关
export async function fetchTemplates(category?: string): Promise<Template[]> {
  const url = category ? `/api/templates?category=${category}` : '/api/templates';
  return fetchWithMock<Template[]>(url, undefined, MOCK_TEMPLATES);
}

export async function fetchTemplateById(id: string): Promise<Template> {
  return fetchWithMock<Template>(`/api/templates/${id}`, undefined, MOCK_TEMPLATES[0]);
}

export async function createTemplate(data: any, adminPassword: string): Promise<Template> {
  return fetchWithMock(`/api/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
    body: JSON.stringify(data)
  });
}

export async function updateTemplate(id: string, data: any, adminPassword: string): Promise<Template> {
  return fetchWithMock(`/api/templates/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
    body: JSON.stringify(data)
  });
}

export async function deleteTemplate(id: string, adminPassword: string): Promise<void> {
  await fetch(`/api/templates/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-password': adminPassword }
  });
}

// 会员码验证
export async function verifyCode(code: string, templateId: string, templateTitle: string): Promise<{
  success: boolean;
  message: string;
  remaining?: number;
}> {
  return fetchWithMock(`/api/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, templateId, templateTitle })
  }, { success: true, message: 'Mock Verification Success' });
}

// 会员码管理
export async function fetchCodes(adminPassword: string): Promise<MemberCode[]> {
  return fetchWithMock(`/api/admin/codes`, {
    headers: { 'x-admin-password': adminPassword }
  }, []);
}

export async function createCode(data: any, adminPassword: string): Promise<MemberCode> {
  return fetchWithMock(`/api/admin/codes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
    body: JSON.stringify(data)
  });
}

export async function updateCode(id: number, data: any, adminPassword: string): Promise<MemberCode> {
  return fetchWithMock(`/api/admin/codes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
    body: JSON.stringify(data)
  });
}

export async function deleteCode(id: number, adminPassword: string): Promise<void> {
  await fetch(`/api/admin/codes/${id}`, {
    method: 'DELETE',
    headers: { 'x-admin-password': adminPassword }
  });
}

// 使用记录和统计
export async function fetchLogs(adminPassword: string, codeId?: number): Promise<UsageLog[]> {
  return fetchWithMock(`/api/admin/logs`, {
    headers: { 'x-admin-password': adminPassword }
  }, []);
}

export async function fetchStats(adminPassword: string): Promise<Stats> {
  return fetchWithMock(`/api/admin/stats`, {
    headers: { 'x-admin-password': adminPassword }
  }, { totalTemplates: 1, totalCodes: 0, totalUsagesToday: 0, activeCodesCount: 0 });
}