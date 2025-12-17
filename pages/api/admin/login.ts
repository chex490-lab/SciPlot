import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { password } = req.body;
  // Use environment variable for password, fallback to 'admin' for dev/preview
  const envPassword = process.env.ADMIN_PASSWORD || 'admin';

  if (password === envPassword) {
    // Generate a simple token (hash of the password) that other API routes can verify
    // In a production app, this should be a signed JWT
    const token = crypto.createHash('sha256').update(envPassword).digest('hex');
    return res.status(200).json({ success: true, token });
  }
  
  return res.status(401).json({ error: 'Invalid password' });
}