import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initDatabase } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await initDatabase();
    res.status(200).json({ success: true, message: '数据库初始化成功' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
}