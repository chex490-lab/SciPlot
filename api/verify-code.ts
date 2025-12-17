import { verifyMemberCode, incrementCodeUsage, logUsage } from '../lib/db';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const { code, templateId } = await req.json();
  const ip = req.headers.get('x-forwarded-for') || 'unknown';

  try {
    const memberCode = await verifyMemberCode(code);
    
    // Log success
    await incrementCodeUsage(memberCode.id);
    await logUsage(memberCode.id, templateId, ip, true);

    const remaining = memberCode.max_uses > 0 ? memberCode.max_uses - (memberCode.used_count + 1) : -1;

    return new Response(JSON.stringify({ 
      success: true, 
      remaining, 
      expiresAt: memberCode.expires_at 
    }), { headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    // Log failure (try to find code id if possible, otherwise null)
    // For simplicity, we skip specific ID logging on failure here or handle it generically
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400 });
  }
}