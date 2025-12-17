import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import { AccessKey } from '../../../types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure we use the exact same logic as login.ts
  const envPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();
  const serverToken = crypto.createHash('sha256').update(envPassword).digest('hex');
  const authHeader = req.headers['x-admin-auth'];

  if (authHeader !== serverToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM access_keys ORDER BY created_at DESC`;
      const keys: AccessKey[] = rows.map(row => ({
        id: row.id,
        code: row.code,
        name: row.name,
        maxUses: row.max_uses,
        usedCount: row.used_count,
        expiresAt: row.expires_at ? Number(row.expires_at) : null,
        isActive: row.is_active,
        createdAt: Number(row.created_at)
      }));
      return res.status(200).json(keys);
    } 
    
    else if (req.method === 'POST') {
      const { code, name, maxUses, expiresAt } = req.body;
      const now = Date.now();
      
      const { rows } = await sql`
        INSERT INTO access_keys (code, name, max_uses, used_count, expires_at, is_active, created_at)
        VALUES (${code}, ${name}, ${maxUses || 999}, 0, ${expiresAt}, true, ${now})
        RETURNING *
      `;
      
      const newKey = rows[0];
      return res.status(200).json({
        id: newKey.id,
        code: newKey.code,
        maxUses: newKey.max_uses,
        createdAt: Number(newKey.created_at)
      });
    }

    else if (req.method === 'PATCH') {
      const { id, isActive } = req.body;
      await sql`UPDATE access_keys SET is_active = ${isActive} WHERE id = ${id}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}