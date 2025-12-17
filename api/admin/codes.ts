import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllCodes, createMemberCode } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const adminPass = req.headers['x-admin-password'];
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (req.method === 'GET') {
    try {
      const codes = await getAllCodes();
      res.status(200).json({ success: true, data: codes });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    try {
      let { code, name, maxUses, expiresInDays } = req.body;
      
      // Auto-generate code if missing
      if (!code) {
        const random = Math.random().toString(36).substring(2, 10).toUpperCase();
        code = `VIP${random}`;
      }

      const newCode = await createMemberCode({ code, name, maxUses, expiresInDays });
      res.status(201).json({ success: true, data: newCode });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}