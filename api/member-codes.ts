import { getAllMemberCodes, createMemberCode, updateMemberCode, getLogs } from '../lib/db';
import { isAuthenticated } from '../lib/auth';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    if (!(await isAuthenticated(req))) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type'); // 'logs' or 'codes'

    if (type === 'logs') {
      const logs = await getLogs();
      return new Response(JSON.stringify(logs), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'GET') {
      const codes = await getAllMemberCodes();
      return new Response(JSON.stringify(codes), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'POST') {
      const { name, maxUses, expiresAt } = await req.json();
      const result = await createMemberCode(name, maxUses, expiresAt);
      return new Response(JSON.stringify({ success: true, data: result }), { headers: { 'Content-Type': 'application/json' } });
    }

    if (req.method === 'PUT') {
      const body = await req.json();
      await updateMemberCode(body.id, body);
      return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
    }

    return new Response('Method Not Allowed', { status: 405 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message || 'Internal Server Error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}