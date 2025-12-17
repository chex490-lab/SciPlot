import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const envPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();
  const serverToken = crypto.createHash('sha256').update(envPassword).digest('hex');
  const authHeader = req.headers['x-admin-auth'];

  try {
    // GET: Public access
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM templates ORDER BY created_at DESC`;
      
      const templates = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.image_url,
        code: row.code,
        language: row.language,
        tags: row.tags,
        createdAt: Number(row.created_at)
      }));
      
      return res.status(200).json(templates);
    }

    // Protected Routes Check
    if (authHeader !== serverToken) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // POST: Add new template
    if (req.method === 'POST') {
      const { title, description, imageUrl, code, language, tags, createdAt } = req.body;
      
      // Basic validation
      if (!title || !code) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const { rows } = await sql`
        INSERT INTO templates (title, description, image_url, code, language, tags, created_at)
        VALUES (${title}, ${description}, ${imageUrl}, ${code}, ${language}, ${tags as any}, ${createdAt})
        RETURNING id
      `;
      
      return res.status(200).json({ ...req.body, id: rows[0].id });
    }

    // DELETE: Remove template
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing ID' });
      
      await sql`DELETE FROM templates WHERE id = ${id as string}`;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    console.error('Template API Error:', error);
    return res.status(500).json({ error: error.message });
  }
}