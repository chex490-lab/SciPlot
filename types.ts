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
