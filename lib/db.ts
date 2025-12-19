
import { sql } from '@vercel/postgres';
import { Template } from '../types';
import { INITIAL_TEMPLATES } from '../constants';

export interface DBTemplate extends Template {
  is_active: boolean;
  updated_at: string;
}

export interface MemberCode {
  id: number;
  code: string;
  name: string;
  max_uses: number;
  used_count: number;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
}

// Simple UUID validation regex
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function initDatabase() {
  // 1. Repair Environment & Permissions
  // This ensures that even after a CASCADE drop or manual import, the app can see the tables.
  try {
    await sql`GRANT USAGE ON SCHEMA public TO public;`;
    await sql`GRANT ALL ON ALL TABLES IN SCHEMA public TO public;`;
    await sql`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;`;
    // Attempt to fix search_path at the database level if permissions allow
    // Otherwise, it will just proceed with the table creation.
  } catch (e) {
    console.warn("Permission repair warning:", e);
  }

  // 2. Create Categories Table
  await sql`
    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 3. Create Templates Tables
  await sql`
    CREATE TABLE IF NOT EXISTS templates (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      image_url TEXT,
      code TEXT,
      language VARCHAR(50),
      tags TEXT[],
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // Migration: Add category_id to templates if it doesn't exist (safety)
  try {
    await sql`ALTER TABLE templates ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL`;
  } catch (e) {
    console.log("Migration skip: category_id likely exists");
  }

  await sql`
    CREATE TABLE IF NOT EXISTS member_codes (
      id SERIAL PRIMARY KEY,
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100),
      max_uses INTEGER DEFAULT 0,
      used_count INTEGER DEFAULT 0,
      expires_at TIMESTAMP WITH TIME ZONE,
      is_active BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS usage_logs (
      id SERIAL PRIMARY KEY,
      code_id INTEGER REFERENCES member_codes(id) ON DELETE CASCADE,
      template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
      user_ip VARCHAR(50),
      action_type VARCHAR(50),
      success BOOLEAN,
      error_msg TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  // 4. Seed Initial Templates if table is empty
  const { rowCount } = await sql`SELECT id FROM templates LIMIT 1`;
  if (rowCount === 0) {
    for (const t of INITIAL_TEMPLATES) {
      await sql`
        INSERT INTO templates (title, description, image_url, code, language, tags, is_active)
        VALUES (${t.title}, ${t.description}, ${t.imageUrl}, ${t.code}, ${t.language}, ${t.tags as any}, true)
      `;
    }
  }

  // 5. Final Permission Sync
  await sql`GRANT ALL ON ALL TABLES IN SCHEMA public TO public;`;
  await sql`GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO public;`;
}

// Categories
export async function getAllCategories() {
  const { rows } = await sql`SELECT * FROM categories ORDER BY name ASC`;
  return rows;
}

export async function createCategory(name: string) {
  const { rows } = await sql`INSERT INTO categories (name) VALUES (${name}) RETURNING *`;
  return rows[0];
}

export async function updateCategory(id: number, name: string) {
  await sql`UPDATE categories SET name = ${name} WHERE id = ${id}`;
}

export async function deleteCategory(id: number) {
  await sql`DELETE FROM categories WHERE id = ${id}`;
}

// Templates
export async function getAllTemplates(activeOnly = true) {
  const query = activeOnly 
    ? sql`
        SELECT t.*, c.name as category_name 
        FROM templates t 
        LEFT JOIN categories c ON t.category_id = c.id
        WHERE t.is_active IS NOT FALSE 
        ORDER BY t.created_at DESC`
    : sql`
        SELECT t.*, c.name as category_name 
        FROM templates t 
        LEFT JOIN categories c ON t.category_id = c.id
        ORDER BY t.created_at DESC`;
        
  const { rows } = await query;
  return rows;
}

export async function createTemplate(t: any) {
  const { rows } = await sql`
    INSERT INTO templates (title, description, image_url, code, language, tags, category_id, is_active)
    VALUES (${t.title}, ${t.description}, ${t.image_url}, ${t.code}, ${t.language}, ${t.tags as any}, ${t.category_id || null}, ${t.is_active})
    RETURNING *
  `;
  return rows[0];
}

export async function updateTemplate(id: string, t: any) {
  if (!UUID_REGEX.test(id)) return;

  await sql`
    UPDATE templates 
    SET title = COALESCE(${t.title}, title),
        description = COALESCE(${t.description}, description),
        image_url = COALESCE(${t.image_url}, image_url),
        code = COALESCE(${t.code}, code),
        language = COALESCE(${t.language}, language),
        tags = COALESCE(${t.tags as any}, tags),
        category_id = ${t.category_id === undefined ? null : t.category_id},
        is_active = COALESCE(${t.is_active}, is_active),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
  `;
}

export async function deleteTemplate(id: string) {
  if (!UUID_REGEX.test(id)) return;
  await sql`DELETE FROM usage_logs WHERE template_id = ${id}`;
  await sql`DELETE FROM templates WHERE id = ${id}`;
}

// Member Codes (remains unchanged but included for completeness)
export async function getAllMemberCodes() {
  const { rows } = await sql`SELECT * FROM member_codes ORDER BY created_at DESC`;
  return rows;
}

export async function createMemberCode(name: string, maxUses: number, expiresAt: string | null) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for(let i=0; i<4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
  code += '-';
  for(let i=0; i<4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));

  const { rows } = await sql`
    INSERT INTO member_codes (code, name, max_uses, expires_at)
    VALUES (${code}, ${name}, ${maxUses}, ${expiresAt})
    RETURNING *
  `;
  return rows[0];
}

export async function updateMemberCode(id: number, data: Partial<MemberCode>) {
  await sql`
    UPDATE member_codes
    SET name = COALESCE(${data.name}, name),
        max_uses = COALESCE(${data.max_uses}, max_uses),
        expires_at = COALESCE(${data.expires_at}, expires_at),
        is_active = COALESCE(${data.is_active}, is_active)
    WHERE id = ${id}
  `;
}

export async function verifyMemberCode(code: string) {
  const { rows } = await sql`SELECT * FROM member_codes WHERE code = ${code}`;
  const memberCode = rows[0];

  if (!memberCode) throw new Error("Invalid code/请联系管理员chex490@gmail.com");
  if (!memberCode.is_active) throw new Error("Code is inactive");
  if (memberCode.expires_at && new Date(memberCode.expires_at) < new Date()) throw new Error("Code expired");
  if (memberCode.max_uses > 0 && memberCode.used_count >= memberCode.max_uses) throw new Error("Max uses reached");

  return memberCode;
}

export async function incrementCodeUsage(id: number) {
  await sql`UPDATE member_codes SET used_count = used_count + 1 WHERE id = ${id}`;
}

export async function logUsage(codeId: number, templateId: string, ip: string, success: boolean, msg?: string) {
  if (!UUID_REGEX.test(templateId)) return;
  
  await sql`
    INSERT INTO usage_logs (code_id, template_id, user_ip, success, error_msg, action_type)
    VALUES (${codeId}, ${templateId}, ${ip}, ${success}, ${msg}, 'verify')
  `;
}

export async function getLogs() {
  const { rows } = await sql`
    SELECT l.*, c.code, t.title as template_title 
    FROM usage_logs l
    LEFT JOIN member_codes c ON l.code_id = c.id
    LEFT JOIN templates t ON l.template_id = t.id
    ORDER BY l.created_at DESC LIMIT 100
  `;
  return rows;
}
