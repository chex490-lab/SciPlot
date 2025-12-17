import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Safe body parsing
  let password = '';
  if (req.body && typeof req.body === 'object') {
    password = req.body.password;
  } else if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      password = parsed.password;
    } catch(e) {
      // ignore
    }
  }

  // Use environment variable, trim whitespace to avoid copy-paste errors
  const envPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();

  // Normalize input
  const inputPassword = (password || '').trim();

  // Debug log (viewable in Vercel Function logs)
  console.log(`Login Attempt. Env Var Set: ${!!process.env.ADMIN_PASSWORD}. Expected Length: ${envPassword.length}. Input Length: ${inputPassword.length}`);

  if (inputPassword === envPassword) {
    // Generate token matching the one expected by other API routes
    const token = crypto.createHash('sha256').update(envPassword).digest('hex');
    return res.status(200).json({ success: true, token });
  }
  
  // Return detailed failure message for debugging
  // NOTE: In a high-security prod app we wouldn't return expected length, 
  // but this is to help the user debug their environment variable issue.
  return res.status(401).json({ 
    success: false, 
    message: `Invalid password. Server expects password of length ${envPassword.length}.` 
  });
}