import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { memberCode, templateId } = req.body;

  if (!memberCode || !templateId) {
    return res.status(400).json({ error: 'Missing memberCode or templateId' });
  }

  try {
    const now = Date.now();

    // 1. Verify Member Code
    const { rows: keyRows } = await sql`
      SELECT * FROM access_keys WHERE code = ${memberCode} LIMIT 1
    `;
    const key = keyRows[0];

    // Check validity
    if (!key) {
      return res.status(403).json({ error: 'Invalid member code' });
    }
    if (!key.is_active) {
      return res.status(403).json({ error: 'Member code is inactive' });
    }
    if (key.expires_at && now > Number(key.expires_at)) {
      return res.status(403).json({ error: 'Member code has expired' });
    }
    if (key.max_uses > 0 && key.used_count >= key.max_uses) {
      return res.status(403).json({ error: 'Member code usage limit reached' });
    }

    // 2. Increment Usage Count (Deduct 1 use)
    await sql`
      UPDATE access_keys 
      SET used_count = used_count + 1 
      WHERE id = ${key.id}
    `;

    // 3. Fetch Template Code Content
    const { rows: templateRows } = await sql`
      SELECT code, code_content, title FROM templates WHERE id = ${templateId} LIMIT 1
    `;

    if (templateRows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const template = templateRows[0];
    // Prefer code_content (full source), fallback to code (preview) if empty
    const finalCode = template.code_content || template.code;

    // Optional: Log successful unlock for audit
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
    // Fire and forget log
    sql`
      INSERT INTO usage_logs (key_id, key_code, template_title, success, ip_address, created_at)
      VALUES (
        ${key.id}, 
        ${memberCode}, 
        ${template.title + ' (Unlock Source)'}, 
        true, 
        ${ip}, 
        ${now}
      )
    `.catch(err => console.error('Logging error:', err));

    return res.status(200).json({ success: true, code: finalCode });

  } catch (error: any) {
    console.error('Get Code API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}