
export interface Category {
  id: number;
  name: string;
  created_at: string;
}

export interface Template {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  code: string;
  language: 'python' | 'r' | 'matlab' | 'latex';
  tags: string[];
  category_id?: number | null;
  category_name?: string | null;
  createdAt: number;
  isActive?: boolean;
  isHidden?: boolean;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface MemberCode {
  id: number;
  code: string;
  name: string;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  is_long_term: boolean;
  created_at: string;
}

export interface UsageLog {
  id: number;
  code: string;
  template_title: string;
  user_ip: string;
  success: boolean;
  created_at: string;
}
