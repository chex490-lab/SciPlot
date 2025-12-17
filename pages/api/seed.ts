import type { NextApiRequest, NextApiResponse } from 'next';
import { sql } from '@vercel/postgres';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. Templates Table
    await sql`
      CREATE TABLE IF NOT EXISTS templates (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        title TEXT NOT NULL,
        description TEXT,
        image_url TEXT,
        code TEXT NOT NULL,
        language VARCHAR(50),
        tags TEXT[],
        created_at BIGINT
      );
    `;

    // 2. Access Keys Table (Advanced)
    await sql`
      CREATE TABLE IF NOT EXISTS access_keys (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        code TEXT UNIQUE NOT NULL,
        name TEXT,
        max_uses INTEGER DEFAULT 1,
        used_count INTEGER DEFAULT 0,
        expires_at BIGINT,
        is_active BOOLEAN DEFAULT TRUE,
        created_at BIGINT
      );
    `;

    // 3. Usage Logs Table
    await sql`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        key_id UUID,
        key_code TEXT,
        template_title TEXT,
        success BOOLEAN,
        ip_address TEXT,
        created_at BIGINT
      );
    `;

    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

    return res.status(200).json({ message: 'Database tables initialized successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}