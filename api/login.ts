
import { signToken } from '../lib/auth';

export const config = {
  runtime: 'edge',
};

const JSON_HEADER = { 'Content-Type': 'application/json' };

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });
  
  try {
    const { username, password } = await req.json();
    
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'admin';

    if (username === adminUser && password === adminPass) {
      const token = await signToken({ role: 'admin' });
      return new Response(JSON.stringify({ success: true, token }), {
        headers: JSON_HEADER
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid credentials' }), { 
      status: 401,
      headers: JSON_HEADER
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { 
      status: 500,
      headers: JSON_HEADER
    });
  }
}
