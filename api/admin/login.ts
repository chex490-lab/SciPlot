import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { password } = req.body;
  
  if (password === process.env.ADMIN_PASSWORD) {
    // In a stateless JWT setup we'd return a token, 
    // but the requirement implies password-based headers for future requests.
    // We'll just confirm success here.
    return res.status(200).json({ success: true });
  }
  
  return res.status(401).json({ success: false, message: 'Incorrect password' });
}