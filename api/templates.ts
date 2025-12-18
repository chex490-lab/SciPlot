
import { getAllTemplates, createTemplate, updateTemplate, deleteTemplate } from '../lib/db';
import { isAuthenticated } from '../lib/auth';
import { INITIAL_TEMPLATES } from '../constants';

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
      const templates = await getAllTemplates(!isAdmin);
      
      // If DB is empty, return initial templates for display
      if (!templates || templates.length === 0) {
        return new Response(JSON.stringify(INITIAL_TEMPLATES), { 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      // Transform DB fields to frontend format
      const formatted = templates.map((t: any) => ({
        id: t.id,
        title: t.title || 'Untitled',
        description: t.description || '',
        imageUrl: t.image_url || 'https://picsum.photos/seed/plot/800/600',
        code: t.code || '',
        language: t.language || 'python',
        tags: Array.isArray(t.tags) ? t.tags : [],
        isActive: t.is_active,
        createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now()
      }));
      
      return new Response(JSON.stringify(formatted), { 
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
      const result = await createTemplate(body);
      return new Response(JSON.stringify({ success: true, data: result }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      if (!body.id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      await updateTemplate(body.id, body);
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      await deleteTemplate(id);
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
