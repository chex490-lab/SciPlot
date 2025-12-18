
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
      // Check if user is admin via token
      const isAdmin = !!(await isAuthenticated(req));
      
      // If admin, show everything. If not, show only active ones.
      const dbTemplates = await getAllTemplates(!isAdmin);
      
      // Map DB snake_case fields back to frontend camelCase
      const formattedDb: Template[] = dbTemplates.map((t: any) => ({
        id: t.id,
        title: t.title || 'Untitled',
        description: t.description || '',
        imageUrl: t.image_url || 'https://picsum.photos/seed/plot/800/600',
        code: t.code || '',
        language: (t.language as any) || 'python',
        tags: Array.isArray(t.tags) ? t.tags : [],
        isActive: t.is_active === true || t.is_active === 't',
        createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now()
      }));

      // Combine DB templates (newest first) with default initial templates
      // We always return DB templates first.
      let finalTemplates = [...formattedDb];
      
      // If DB doesn't have many items, supplement with INITIAL_TEMPLATES
      // We filter out any potential ID collisions although DB uses UUIDs
      if (finalTemplates.length < 20) {
        const initialToAdd = INITIAL_TEMPLATES.filter(
          init => !finalTemplates.some(db => db.title === init.title)
        );
        finalTemplates = [...finalTemplates, ...initialToAdd];
      }
      
      return new Response(JSON.stringify(finalTemplates), { 
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0'
        } 
      });
    } catch (e) {
      console.error("Database fetch error, falling back to initials:", e);
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
      if (!body.title || !body.code) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
      }

      const dbData = {
        title: body.title,
        description: body.description || '',
        image_url: body.imageUrl || '',
        code: body.code,
        language: body.language || 'python',
        tags: Array.isArray(body.tags) ? body.tags : [],
        is_active: true // Always active by default for new creations
      };

      const result = await createTemplate(dbData);
      return new Response(JSON.stringify({ success: true, data: result }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      if (!body.id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });
      
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
      if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400 });
      await deleteTemplate(id);
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }
  } catch (e: any) {
    console.error("Admin API Error:", e);
    return new Response(JSON.stringify({ error: e.message || 'Internal Server Error' }), { status: 500 });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
