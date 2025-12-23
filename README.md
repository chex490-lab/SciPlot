# SciPlot Hub - 专业科研绘图代码库

SciPlot Hub 是一个一站式的科研绘图解决方案平台，旨在帮助科研人员通过精选模板和 AI 辅助，快速生成符合顶刊发表要求的专业图表。

## 1. 项目代码结构

**技术架构体系：**
本系统采用前沿的全栈架构开发，充分利用云原生技术栈实现极速响应与弹性扩展：
- **前端核心 (Frontend)**: 基于 **React 19**，利用 ESM 模块化加载技术提升构建效率；采用 **Tailwind CSS** 原子化样式引擎实现跨端的响应式布局与极简设计；集成 **Lucide React** 提供高精度的矢量图标支持。
- **后端引擎 (Backend)**: 利用 **Vercel Edge Functions** 构建分布式 Serverless API，基于边缘计算 (Edge Runtime) 消除传统服务器的地理延迟与冷启动问题；安全层采用 **jose** 库实现的 **JWT (JSON Web Tokens)** 动态令牌鉴权。
- **数据底座 (Database)**: 接入 **Vercel Postgres** 云原生关系型数据库，利用高性能连接池处理并发请求；后端集成参数化 SQL 注入防护及自动化的数据库初始化 (Init-DB) 自愈逻辑。
- **AI 赋能 (AI Logic)**: 深度集成 **Google Gemini 3 Pro** (Gemini API)，通过构建私有 Prompt 策略处理科研绘图代码的上下文理解与二次生成。

```text
.
├── App.tsx                      # 应用核心入口，负责路由调度、状态管理与全局布局
├── types.ts                     # 核心类型定义，包含模板、会员码、日志等模型
├── constants.ts                 # 系统初始数据，包含默认演示模板
├── index.tsx                    # 客户端挂载点，配置全局 Context 注入
├── index.html                   # HTML 基础模板及 Google Fonts 引入
├── metadata.json                # 项目元数据与平台权限配置
├── package.json                 # 依赖清单与构建脚本
├── vercel.json                  # Vercel 部署路由与函数配置
│
├── api/                         # Vercel Edge Functions (API 端点)
│   ├── templates.ts             # 模板数据交互中心（CRUD）
│   ├── categories.ts            # 绘图学科分类管理
│   ├── member-codes.ts          # 科研通行证（会员码）生成与维护
│   ├── verify-code.ts           # 通行证实时验证与日志上报
│   ├── login.ts                 # 管理员身份令牌发放（JWT）
│   └── init-db.ts               # 自动化数据库表结构同步与权限修复
│
├── components/                  # UI 交互组件库
│   ├── TemplateCard.tsx         # 响应式网格卡片，支持图表比例自适应
│   ├── TemplateModal.tsx        # 核心交互窗口：代码展示 + Gemini AI 助手集成
│   ├── AdminPanel.tsx           # 综合管理面板：包含模板、分类、码源、审计日志管理
│   ├── MemberCodeModal.tsx      # 资源解锁鉴权界面，支持格式化输入验证
│   ├── LoginModal.tsx           # 管理控制台访问入口
│   └── Button.tsx               # 原子级 UI 组件，支持多种交互状态
│
├── services/                    # 业务逻辑与第三方集成
│   ├── api.ts                   # 后端 Restful API 的统一前端封装
│   └── geminiService.ts         # Google Gemini AI 服务封装，处理代码生成逻辑
│
├── lib/                         # 跨平台/服务端底层工具
│   ├── db.ts                    # 基于 Postgres 的 SQL 定义、表映射及业务逻辑
│   └── auth.ts                  # 基于 JWT (jose) 的身份安全验证机制
│
└── contexts/                    # 状态管理上下文
    └── LanguageContext.tsx      # 多语言支持（i18n）与界面文案映射
```

---

## 2. 实现功能说明

### 核心功能 (User Facing)
- **精选模板库**: 提供生物、物理、数学等跨学科的高质量绘图脚本（Python/R/Matlab/Latex）。
- **完整视觉展示**: 采用 `object-contain` 算法优化的预览引擎，确保复杂架构图在任何设备上不被裁剪，100% 完整显示。
- **AI 绘图助手**: 
    - 集成 **Google Gemini 3 Pro**，具备代码上下文感知能力。
    - 用户可通过自然语言请求（如“把图表改为莫兰迪色系”、“添加线性拟合线”）实时修改现有模板代码。
- **资源保护机制**: 
    - **开放资源**: 公共模板一键复制。
    - **受限资源**: 核心/高级模板需使用“科研通行证”解锁，防止资源滥用。

### 管理功能 (Admin Dashboard)
- **模板全生命周期管理**: 支持模板的发布、编辑、隐藏以及预览图的 Base64 快速上传（支持剪贴板粘贴）。
- **科研通行证（会员码）系统**:
    - 支持生成 8 位格式化随机码（如 ABCD-1234）。
    - 具备使用次数（Max Uses）限制与有效期（Expiration）管理。
    - 区分“短期码”（用完即焚）与“长期码”（VIP 专属）。
- **学科分类体系**: 动态维护学科分类，支持前端实时过滤。
- **审计日志系统**: 详尽记录每一个通行证的使用 IP、目标资源、验证时间及结果，确保数据安全可溯。

### 系统特性
- **原子化初始化**: 提供一键修复数据库环境功能，自动完成表结构创建、序列号（Sequence）修复及权限分发。
- **高性能边缘响应**: API 部署于边缘网络，极速响应，无需担心传统冷启动问题。
- **安全加固**: 所有敏感管理接口均受 JWT 保护，数据库查询采用参数化防注入设计。

---
*SciPlot Hub - 让科研绘图更专业、更简单*