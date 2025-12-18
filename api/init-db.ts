
import { initDatabase } from '../lib/db';
import { isAuthenticated } from '../lib/auth';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  try {
    // 允许通过管理员登录后的 Token 进行初始化
    const isAuth = await isAuthenticated(req);
    const authHeader = req.headers.get('Authorization');
    
    // 兼容两种方式：管理员 Token 或 环境变量中的原始密码
    if (!isAuth && authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
       return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
    
    await initDatabase();
    return new Response(JSON.stringify({ success: true }));
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
