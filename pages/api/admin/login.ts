import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  // Safe body parsing
  let password = '';
  try {
    if (req.body && typeof req.body === 'object') {
      password = req.body.password;
    } else if (typeof req.body === 'string') {
      const parsed = JSON.parse(req.body);
      password = parsed.password;
    }
  } catch(e) {
    console.error("Error parsing login body:", e);
    return res.status(400).json({ error: "Invalid JSON body" });
  }

  // Use environment variable, trim whitespace to avoid copy-paste errors
  const envPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();

  // Normalize input
  const inputPassword = (password || '').trim();

  if (inputPassword === envPassword) {
    // Generate token matching the one expected by other API routes
    const token = crypto.createHash('sha256').update(envPassword).digest('hex');
    return res.status(200).json({ success: true, token });
  }
  
  return res.status(401).json({ 
    success: false, 
    message: 'Invalid password.' 
  });
}