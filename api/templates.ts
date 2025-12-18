
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
      const dbTemplates = await getAllTemplates(!isAdmin);
      
      // Transform DB fields (snake_case) to frontend format (camelCase)
      const formattedDb = dbTemplates.map((t: any) => ({
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

      // If we are not admin, and we have DB templates, merge them with INITIAL_TEMPLATES
      // so the site doesn't look empty, but user creations come first.
      const finalTemplates = [...formattedDb];
      
      // Only add initial templates if DB is relatively empty or to supplement
      if (formattedDb.length === 0) {
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
      
      // CRITICAL: Map frontend camelCase to DB snake_case
      const dbData = {
        title: body.title,
        description: body.description,
        image_url: body.imageUrl, // Map here
        code: body.code,
        language: body.language || 'python',
        tags: body.tags || [],
        is_active: true // Force active on creation
      };

      const result = await createTemplate(dbData as any);
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
      if (body.hasOwnProperty('isActive')) {
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
