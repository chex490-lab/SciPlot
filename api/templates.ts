
import { getAllTemplates, createTemplate, updateTemplate, deleteTemplate } from '../lib/db';
import { isAuthenticated } from '../lib/auth';
import { INITIAL_TEMPLATES } from '../constants';
import { Template } from '../types';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  // GET Public Templates
  if (req.method === 'GET') {
    try {
      const isAdmin = await isAuthenticated(req);
      // If admin, show all (including inactive), else show only active
      const dbTemplates = await getAllTemplates(!isAdmin);
      
      // Transform DB fields (snake_case) to frontend format (camelCase)
      const formattedDb: Template[] = dbTemplates.map((t: any) => ({
        id: t.id,
        title: t.title || 'Untitled',
        description: t.description || '',
        imageUrl: t.image_url || 'https://picsum.photos/seed/plot/800/600',
        code: t.code || '',
        language: (t.language as any) || 'python',
        tags: Array.isArray(t.tags) ? t.tags : [],
        isActive: t.is_active,
        createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now()
      }));

      // Merge results: user creations first, then initial templates
      const finalTemplates = [...formattedDb];
      
      // Always include initial templates for non-admins to ensure content,
      // or only if DB is thin.
      if (formattedDb.length < 10) {
        finalTemplates.push(...INITIAL_TEMPLATES);
      }
      
      return new Response(JSON.stringify(finalTemplates), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    } catch (e) {
      console.error("Database error, returning mock templates:", e);
      return new Response(JSON.stringify(INITIAL_TEMPLATES), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
  }

  // Admin Only Operations
  try {
    if (!(await isAuthenticated(req))) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      
      // Map frontend camelCase to DB snake_case for saving
      const dbData = {
        title: body.title,
        description: body.description,
        image_url: body.imageUrl,
        code: body.code,
        language: body.language || 'python',
        tags: Array.isArray(body.tags) ? body.tags : [],
        is_active: true // Force active on creation so users can see it
      };

      const result = await createTemplate(dbData);
      return new Response(JSON.stringify({ success: true, data: result }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      if (!body.id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      
      // Map update fields correctly
      const updateData: any = { ...body };
      if (body.imageUrl) {
        updateData.image_url = body.imageUrl;
        delete updateData.imageUrl;
      }
      if (Object.prototype.hasOwnProperty.call(body, 'isActive')) {
        updateData.is_active = body.isActive;
        delete updateData.isActive;
      }

      await updateTemplate(body.id, updateData);
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      await deleteTemplate(id);
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }
  } catch (e: any) {
    console.error("Admin API Error:", e);
    return new Response(JSON.stringify({ error: e.message || 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
