export interface Template {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  code: string;
  language: 'python' | 'r' | 'matlab' | 'latex';
  tags: string[];
  createdAt: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export interface AccessKey {
  id: string;
  code: string;
  name?: string;
  maxUses: number;
  usedCount: number;
  expiresAt: number | null; // null means never expires
  isActive: boolean;
  createdAt: number;
}

export interface UsageLog {
  id: string;
  keyId: string | null;
  keyCode: string;
  templateTitle: string;
  success: boolean;
  ipAddress?: string;
  createdAt: number;
}