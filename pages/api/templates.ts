import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Auth Logic (Same as admin/keys.ts)
  const envPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();
  const serverToken = crypto.createHash('sha256').update(envPassword).digest('hex');
  const authHeader = req.headers['x-admin-auth'];

  const isAuthenticated = authHeader === serverToken;

  try {
    // --- GET: Public access (Fetch all templates) ---
    if (req.method === 'GET') {
      const { rows } = await sql`SELECT * FROM templates ORDER BY created_at DESC`;
      
      const templates = rows.map(row => ({
        id: row.id,
        title: row.title,
        description: row.description,
        imageUrl: row.image_url,
        code: row.code,
        codeContent: row.code_content || row.code, // Fallback to 'code' if code_content is empty
        downloadUrl: row.download_url,
        language: row.language,
        category: row.language, // Map language to category for frontend consistency
        tags: row.tags,
        createdAt: Number(row.created_at)
      }));
      
      return res.status(200).json(templates);
    }

    // --- PROTECTED ROUTES (POST, PUT, DELETE) ---
    if (!isAuthenticated) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // --- POST: Create New Template ---
    if (req.method === 'POST') {
      const { title, description, imageUrl, code, codeContent, downloadUrl, language, tags, createdAt } = req.body;
      
      if (!title || !code) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      // Use codeContent if provided, otherwise fallback to code
      const finalCodeContent = codeContent || code;

      const { rows } = await sql`
        INSERT INTO templates (title, description, image_url, code, code_content, download_url, language, tags, created_at)
        VALUES (
          ${title}, 
          ${description}, 
          ${imageUrl}, 
          ${code}, 
          ${finalCodeContent}, 
          ${downloadUrl || ''}, 
          ${language}, 
          ${tags as any}, 
          ${createdAt || Date.now()}
        )
        RETURNING id
      `;
      
      return res.status(200).json({ ...req.body, id: rows[0].id });
    }

    // --- PUT: Update Existing Template ---
    if (req.method === 'PUT') {
      const { id, title, description, imageUrl, code, codeContent, downloadUrl, language, tags } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'Missing Template ID' });
      }

      const finalCodeContent = codeContent || code;

      await sql`
        UPDATE templates 
        SET 
          title = ${title},
          description = ${description},
          image_url = ${imageUrl},
          code = ${code},
          code_content = ${finalCodeContent},
          download_url = ${downloadUrl || ''},
          language = ${language},
          tags = ${tags as any}
        WHERE id = ${id}
      `;

      return res.status(200).json({ success: true, id });
    }

    // --- DELETE: Remove Template ---
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