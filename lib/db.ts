import { sql } from '@vercel/postgres';

export interface Template {
  id: number;
  template_id: string;
  title: string;
  description: string;
  category: string;
  code: string;
  image_url?: string;
  used_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MemberCode {
  id: number;
  code: string;
  name?: string;
  max_uses?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

export interface UsageLog {
  id: number;
  code_id: number;
  template_id: string;
  template_title: string;
  user_ip?: string;
  success: boolean;
  error_msg?: string;
  created_at: string;
}

// 1. Initialize Database
export async function initDatabase(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS templates (
      id SERIAL PRIMARY KEY,
      template_id VARCHAR(50) UNIQUE NOT NULL,
      title VARCHAR(200) NOT NULL,
      description TEXT NOT NULL,
      category VARCHAR(50) NOT NULL,
      code TEXT NOT NULL,
      image_url TEXT,
      used_count INTEGER DEFAULT 0,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS member_codes (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200),
      max_uses INTEGER,
      used_count INTEGER DEFAULT 0,
      expires_at TIMESTAMP,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_used_at TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS usage_logs (
      id SERIAL PRIMARY KEY,
      code_id INTEGER REFERENCES member_codes(id) ON DELETE CASCADE,
      template_id VARCHAR(50) NOT NULL,
      template_title VARCHAR(200),
      user_ip VARCHAR(50),
      success BOOLEAN DEFAULT true,
      error_msg TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
}

// 2. Templates
export async function getAllTemplates(category?: string): Promise<Template[]> {
  if (category) {
    const { rows } = await sql<Template>`SELECT * FROM templates WHERE is_active = true AND category = ${category} ORDER BY created_at DESC`;
    return rows as any; // Cast for simplified TS types with pg
  }
  const { rows } = await sql<Template>`SELECT * FROM templates WHERE is_active = true ORDER BY created_at DESC`;
  return rows as any;
}

export async function getTemplateById(templateId: string): Promise<Template | null> {
  const { rows } = await sql<Template>`SELECT * FROM templates WHERE template_id = ${templateId} LIMIT 1`;
  return (rows[0] as any) || null;
}

export async function createTemplate(data: Omit<Template, 'id' | 'created_at' | 'updated_at' | 'used_count' | 'is_active'>): Promise<Template> {
  const { rows } = await sql<Template>`
    INSERT INTO templates (template_id, title, description, category, code, image_url)
    VALUES (${data.template_id}, ${data.title}, ${data.description}, ${data.category}, ${data.code}, ${data.image_url || null})
    RETURNING *
  `;
  return rows[0] as any;
}

export async function updateTemplate(templateId: string, data: Partial<Template>): Promise<Template | null> {
  // Simplified update logic for key fields
  const { rows } = await sql<Template>`
    UPDATE templates 
    SET title = COALESCE(${data.title}, title),
        description = COALESCE(${data.description}, description),
        category = COALESCE(${data.category}, category),
        code = COALESCE(${data.code}, code),
        image_url = COALESCE(${data.image_url}, image_url),
        updated_at = CURRENT_TIMESTAMP
    WHERE template_id = ${templateId}
    RETURNING *
  `;
  return (rows[0] as any) || null;
}

export async function deleteTemplate(templateId: string): Promise<boolean> {
  const result = await sql`DELETE FROM templates WHERE template_id = ${templateId}`;
  return result.rowCount ? result.rowCount > 0 : false;
}

export async function incrementTemplateUsage(templateId: string): Promise<void> {
  await sql`UPDATE templates SET used_count = used_count + 1 WHERE template_id = ${templateId}`;
}

// 3. Member Codes
export async function verifyMemberCode(code: string): Promise<{
  valid: boolean;
  message: string;
  memberCode?: MemberCode;
}> {
  const { rows } = await sql<MemberCode>`SELECT * FROM member_codes WHERE code = ${code} LIMIT 1`;
  const memberCode = rows[0] as any;

  if (!memberCode) {
    return { valid: false, message: '会员码无效' };
  }
  if (!memberCode.is_active) {
    return { valid: false, message: '会员码已禁用' };
  }
  if (memberCode.expires_at && new Date(memberCode.expires_at) < new Date()) {
    return { valid: false, message: '会员码已过期' };
  }
  if (memberCode.max_uses !== null && memberCode.used_count >= memberCode.max_uses) {
    return { valid: false, message: '会员码使用次数已达上限' };
  }

  return { valid: true, message: '验证成功', memberCode };
}

export async function incrementCodeUsage(codeId: number): Promise<void> {
  await sql`
    UPDATE member_codes 
    SET used_count = used_count + 1, last_used_at = CURRENT_TIMESTAMP 
    WHERE id = ${codeId}
  `;
}

export async function createMemberCode(data: {
  code: string;
  name?: string;
  maxUses?: number;
  expiresInDays?: number;
}): Promise<MemberCode> {
  let expiresAt = null;
  if (data.expiresInDays) {
    const d = new Date();
    d.setDate(d.getDate() + data.expiresInDays);
    expiresAt = d.toISOString();
  }

  const { rows } = await sql<MemberCode>`
    INSERT INTO member_codes (code, name, max_uses, expires_at)
    VALUES (${data.code}, ${data.name || ''}, ${data.maxUses || null}, ${expiresAt})
    RETURNING *
  `;
  return rows[0] as any;
}

export async function getAllCodes(): Promise<MemberCode[]> {
  const { rows } = await sql<MemberCode>`SELECT * FROM member_codes ORDER BY created_at DESC`;
  return rows as any;
}

export async function updateMemberCode(codeId: number, data: Partial<MemberCode>): Promise<MemberCode | null> {
  const { rows } = await sql<MemberCode>`
    UPDATE member_codes 
    SET name = COALESCE(${data.name}, name),
        max_uses = COALESCE(${data.max_uses}, max_uses),
        expires_at = COALESCE(${data.expires_at}, expires_at),
        is_active = COALESCE(${data.is_active}, is_active)
    WHERE id = ${codeId}
    RETURNING *
  `;
  return (rows[0] as any) || null;
}

export async function deleteMemberCode(codeId: number): Promise<boolean> {
  const result = await sql`DELETE FROM member_codes WHERE id = ${codeId}`;
  return result.rowCount ? result.rowCount > 0 : false;
}

// 4. Logs
export async function logUsage(data: {
  codeId: number;
  templateId: string;
  templateTitle: string;
  userIp?: string;
  success: boolean;
  errorMsg?: string;
}): Promise<void> {
  await sql`
    INSERT INTO usage_logs (code_id, template_id, template_title, user_ip, success, error_msg)
    VALUES (${data.codeId}, ${data.templateId}, ${data.templateTitle}, ${data.userIp || null}, ${data.success}, ${data.errorMsg || null})
  `;
}

export async function getCodeLogs(codeId: number): Promise<UsageLog[]> {
  const { rows } = await sql<UsageLog>`SELECT * FROM usage_logs WHERE code_id = ${codeId} ORDER BY created_at DESC`;
  return rows as any;
}

export async function getRecentLogs(limit: number = 50): Promise<UsageLog[]> {
  const { rows } = await sql<UsageLog>`SELECT * FROM usage_logs ORDER BY created_at DESC LIMIT ${limit}`;
  return rows as any;
}

// 5. Stats
export async function getStats(): Promise<{
  totalTemplates: number;
  totalCodes: number;
  totalUsagesToday: number;
  activeCodesCount: number;
}> {
  const templateCount = await sql`SELECT COUNT(*) FROM templates`;
  const codeCount = await sql`SELECT COUNT(*) FROM member_codes`;
  const activeCodeCount = await sql`SELECT COUNT(*) FROM member_codes WHERE is_active = true`;
  const usageToday = await sql`SELECT COUNT(*) FROM usage_logs WHERE created_at >= CURRENT_DATE`;

  return {
    totalTemplates: Number(templateCount.rows[0].count),
    totalCodes: Number(codeCount.rows[0].count),
    totalUsagesToday: Number(usageToday.rows[0].count),
    activeCodesCount: Number(activeCodeCount.rows[0].count)
  };
}