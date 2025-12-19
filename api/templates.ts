
import { getAllTemplates, createTemplate, updateTemplate, deleteTemplate } from '../lib/db';
import { isAuthenticated } from '../lib/auth';
import { INITIAL_TEMPLATES } from '../constants';
import { Template } from '../types';

export const config = {
  runtime: 'edge',
};

const JSON_HEADER = { 'Content-Type': 'application/json' };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  // GET Public Templates
  if (req.method === 'GET') {
    try {
      const isAdmin = !!(await isAuthenticated(req));
      const dbTemplates = await getAllTemplates(!isAdmin);
      
      const formattedDb: Template[] = dbTemplates.map((t: any) => ({
        id: t.id,
        title: t.title || 'Untitled',
        description: t.description || '',
        imageUrl: t.image_url || 'https://picsum.photos/seed/plot/800/600',
        code: t.code || '',
        language: (t.language as any) || 'python',
        tags: Array.isArray(t.tags) ? t.tags : [],
        // Robust boolean parsing for Postgres (handles 't', 'f', true, false, null, 'true', 'false')
        isActive: t.is_active === true || 
                  t.is_active === 't' || 
                  t.is_active === 'true' || 
                  t.is_active === null || 
                  t.is_active === undefined,
        category_id: t.category_id,
        category_name: t.category_name,
        createdAt: t.created_at ? new Date(t.created_at).getTime() : Date.now()
      }));

      return new Response(JSON.stringify(formattedDb), { 
        headers: { 
          ...JSON_HEADER,
          'Cache-Control': 'no-store, max-age=0'
        } 
      });
    } catch (e: any) {
      if (e.message?.includes('relation "templates" does not exist')) {
        return new Response(JSON.stringify(INITIAL_TEMPLATES), { headers: JSON_HEADER });
      }
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: JSON_HEADER });
    }
  }

  // Admin Only Operations
  try {
    if (!(await isAuthenticated(req))) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: JSON_HEADER });
    }

    if (req.method === 'POST') {
      const body = await req.json();
      if (!body.title || !body.code) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: JSON_HEADER });
      }

      const dbData = {
        title: body.title,
        description: body.description || '',
        image_url: body.imageUrl || '',
        code: body.code,
        language: body.language || 'python',
        tags: Array.isArray(body.tags) ? body.tags : [],
        category_id: body.category_id || null,
        is_active: true
      };

      const result = await createTemplate(dbData);
      return new Response(JSON.stringify({ success: true, data: result }), { headers: JSON_HEADER });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      if (!body.id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400, headers: JSON_HEADER });
      
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
      return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADER });
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ error: 'Missing ID' }), { status: 400, headers: JSON_HEADER });
      await deleteTemplate(id);
      return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADER });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Internal Server Error' }), { status: 500, headers: JSON_HEADER });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
