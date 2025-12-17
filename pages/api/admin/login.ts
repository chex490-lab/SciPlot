import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { password } = req.body;
  // Use environment variable, trim whitespace to avoid copy-paste errors
  const envPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();

  // Debug log (viewable in Vercel Function logs) to verify if Env Var is loaded
  // Do not log the actual password for security
  console.log(`Login Attempt. Env Var Loaded: ${!!process.env.ADMIN_PASSWORD}. Expected Length: ${envPassword.length}`);

  if (password && password.trim() === envPassword) {
    // Generate token matching the one expected by other API routes
    const token = crypto.createHash('sha256').update(envPassword).digest('hex');
    return res.status(200).json({ success: true, token });
  }
  
  return res.status(401).json({ error: 'Invalid password' });
}