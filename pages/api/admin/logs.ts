import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import { UsageLog } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const envPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();
  const serverToken = crypto.createHash('sha256').update(envPassword).digest('hex');
  const authHeader = req.headers['x-admin-auth'];

  if (authHeader !== serverToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rows } = await sql`SELECT * FROM usage_logs ORDER BY created_at DESC LIMIT 100`;
    
    const logs: UsageLog[] = rows.map(row => ({
      id: row.id,
      keyId: row.key_id,
      keyCode: row.key_code,
      templateTitle: row.template_title,
      success: row.success,
      ipAddress: row.ip_address,
      createdAt: Number(row.created_at)
    }));

    return res.status(200).json(logs);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}