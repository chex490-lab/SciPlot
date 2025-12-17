import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyMemberCode, incrementCodeUsage, incrementTemplateUsage, logUsage } from '../lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { code, templateId, templateTitle } = req.body;

  try {
    const verification = await verifyMemberCode(code);

    // Log the attempt (even failures if possible, but focusing on success flow first)
    // Note: We need code_id for logging, which we only have if verification returned the code object.
    
    if (!verification.valid || !verification.memberCode) {
       return res.status(400).json({ success: false, message: verification.message });
    }

    const memberCode = verification.memberCode;

    // Execute updates
    await incrementCodeUsage(memberCode.id);
    await incrementTemplateUsage(templateId);
    await logUsage({
      codeId: memberCode.id,
      templateId,
      templateTitle,
      success: true,
      userIp: (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress
    });

    const remaining = memberCode.max_uses !== null 
      ? memberCode.max_uses - (memberCode.used_count + 1) 
      : null;

    res.status(200).json({ 
      success: true, 
      message: '验证成功',
      remaining
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}