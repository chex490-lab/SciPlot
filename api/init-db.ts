import { initDatabase } from '../lib/db';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    // Simple protection for init
    if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
       return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    await initDatabase();
    return new Response(JSON.stringify({ success: true }));
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}