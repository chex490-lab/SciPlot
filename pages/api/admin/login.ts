import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure we are handling a POST request
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    let password = '';

    // Robust body parsing
    if (req.body) {
       if (typeof req.body === 'object') {
         password = req.body.password;
       } else if (typeof req.body === 'string') {
         try {
           const parsed = JSON.parse(req.body);
           password = parsed.password;
         } catch {
           return res.status(400).json({ error: "Invalid JSON in request body" });
         }
       }
    }

    // Default password 'admin' if env var not set
    const envPassword = (process.env.ADMIN_PASSWORD || 'admin').trim();
    const inputPassword = (password || '').trim();

    if (inputPassword === envPassword) {
      // Create a simple token based on the password hash
      const token = crypto.createHash('sha256').update(envPassword).digest('hex');
      return res.status(200).json({ success: true, token });
    }

    // Invalid password
    return res.status(401).json({ 
      success: false, 
      message: 'Incorrect password.' 
    });

  } catch (error: any) {
    console.error('Login API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}