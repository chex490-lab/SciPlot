import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAllTemplates, createTemplate } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const category = Array.isArray(req.query.category) ? req.query.category[0] : req.query.category;
      const templates = await getAllTemplates(category);
      res.status(200).json({ success: true, data: templates });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'POST') {
    const adminAuth = req.headers['x-admin-auth']; // User simplified this in prev prompts, sticking to requested logic
    // The requirement specified x-admin-password, let's support that
    const adminPass = req.headers['x-admin-password'];
    
    if (adminPass !== process.env.ADMIN_PASSWORD && adminAuth !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    try {
      const template = await createTemplate(req.body);
      res.status(201).json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}