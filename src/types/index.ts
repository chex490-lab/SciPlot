export interface Template {
  id: number;
  template_id: string;
  title: string;
  description: string;
  category: string;
  code: string;
  image_url?: string;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberCode {
  id: number;
  code: string;
  name?: string;
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface UsageLog {
  id: number;
  code_id: number;
  template_id: string;
  template_title: string;
  user_ip?: string;
  success: boolean;
  error_msg?: string;
  created_at: string;
}

export interface Stats {
  totalTemplates: number;
  totalCodes: number;
  totalUsagesToday: number;
  activeCodesCount: number;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}