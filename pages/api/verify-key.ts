import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, templateTitle } = req.body;
  const now = Date.now();
  // Safe IP extraction
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

  if (!code) {
    return res.status(400).json({ valid: false, message: 'Missing code' });
  }

  try {
    // 1. Fetch Key details from DB
    const { rows } = await sql`
      SELECT * FROM access_keys WHERE code = ${code} LIMIT 1
    `;

    const key = rows[0];
    let isValid = true;
    let failReason = '';

    // 2. Validation Logic
    if (!key) {
      isValid = false;
      failReason = 'Key not found';
    } else {
      // Check if manually deactivated
      if (!key.is_active) {
        isValid = false;
        failReason = 'Key is inactive';
      } 
      // Check Expiration (if set)
      else if (key.expires_at && now > Number(key.expires_at)) {
        isValid = false;
        failReason = 'Key expired';
      } 
      // Check Max Uses (if limit exists, i.e., > 0)
      else if (key.max_uses > 0 && key.used_count >= key.max_uses) {
        isValid = false;
        failReason = 'Usage limit reached';
      }
    }

    // 3. Log the usage attempt (Auditing)
    // We log both success and failure attempts for security monitoring
    await sql`
      INSERT INTO usage_logs (key_id, key_code, template_title, success, ip_address, created_at)
      VALUES (
        ${key ? key.id : null}, 
        ${code}, 
        ${templateTitle || 'Unknown Template'}, 
        ${isValid}, 
        ${ip}, 
        ${now}
      )
    `;

    // 4. If Valid: Increment the Usage Count
    if (isValid) {
      await sql`
        UPDATE access_keys 
        SET used_count = used_count + 1 
        WHERE id = ${key.id}
      `;
      
      return res.status(200).json({ valid: true });
    } else {
      return res.status(200).json({ valid: false, message: failReason });
    }

  } catch (error: any) {
    console.error('Verify Key Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}