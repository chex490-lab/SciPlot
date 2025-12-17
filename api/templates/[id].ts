import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getTemplateById, updateTemplate, deleteTemplate } from '../../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  const templateId = Array.isArray(id) ? id[0] : id;

  if (req.method === 'GET') {
    try {
      const template = await getTemplateById(templateId);
      if (!template) return res.status(404).json({ success: false, error: 'Template not found' });
      res.status(200).json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
    return;
  }

  // Admin Check for PUT/DELETE
  const adminPass = req.headers['x-admin-password'];
  if (adminPass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  if (req.method === 'PUT') {
    try {
      const template = await updateTemplate(templateId, req.body);
      res.status(200).json({ success: true, data: template });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else if (req.method === 'DELETE') {
    try {
      const success = await deleteTemplate(templateId);
      res.status(200).json({ success });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}