
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../lib/db';
import { isAuthenticated } from '../lib/auth';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (req.method === 'GET') {
    try {
      const categories = await getAllCategories();
      return new Response(JSON.stringify(categories), {
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
    }
  }

  // Admin Only
  if (!(await isAuthenticated(req))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    if (req.method === 'POST') {
      const { name } = await req.json();
      if (!name) return new Response(JSON.stringify({ error: 'Name is required' }), { status: 400 });
      const result = await createCategory(name);
      return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const { id, name } = await req.json();
      if (!id || !name) return new Response(JSON.stringify({ error: 'ID and Name are required' }), { status: 400 });
      await updateCategory(id, name);
      return new Response(JSON.stringify({ success: true }));
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ error: 'ID is required' }), { status: 400 });
      await deleteCategory(parseInt(id));
      return new Response(JSON.stringify({ success: true }));
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }

  return new Response('Method Not Allowed', { status: 405 });
}
