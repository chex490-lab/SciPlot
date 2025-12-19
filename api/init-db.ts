
import { initDatabase } from '../lib/db';
import { isAuthenticated } from '../lib/auth';

export const config = {
  runtime: 'edge',
};

const JSON_HEADER = { 'Content-Type': 'application/json' };

export default async function handler(req: Request) {
  try {
    const isAuth = await isAuthenticated(req);
    const authHeader = req.headers.get('Authorization');
    
    if (!isAuth && authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
       return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: JSON_HEADER });
    }
    
    await initDatabase();
    return new Response(JSON.stringify({ success: true }), { headers: JSON_HEADER });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: JSON_HEADER });
  }
}
