import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'zh';

const translations = {
  en: {
    appTitle: "SciPlot Hub",
    searchPlaceholder: "Search templates, tags, or languages...",
    uploadTemplate: "Upload Template",
    upload: "Upload",
    availableTemplates: "Available Templates",
    results: "results",
    result: "result",
    noTemplates: "No templates found",
    noTemplatesDesc: "Try adjusting your search terms or browse all templates.",
    clearSearch: "Clear Search",
    footer: "© {year} SciPlot Hub. Empowering research visualization.",
    // Admin Panel
    adminLogin: "Admin Login",
    password: "Password",
    login: "Login",
    logout: "Logout",
    wrongPassword: "Incorrect password",
    uploadNewTitle: "Upload New Template",
    uploadNewDesc: "Share your scientific plotting code with the community.",
    cancel: "Cancel",
    templateTitle: "Template Title",
    description: "Description",
    descriptionPlaceholder: "Explain what this plot is good for and what libraries it uses...",
    language: "Language",
    tags: "Tags",
    previewImage: "Preview Image",
    uploadFile: "Upload a file",
    dragDrop: "or drag and drop",
    fileLimit: "PNG, JPG, GIF up to 5MB",
    sourceCode: "Source Code",
    codePlaceholder: "Paste your plotting code here...",
    requiredFields: "Please fill in all required fields (Title, Code, Image)",
    deleteConfirm: "Are you sure you want to delete this template?",
    // Membership Keys
    adminDashboard: "Admin Dashboard",
    tabUpload: "Upload Template",
    tabKeys: "Membership Keys",
    tabSystem: "System",
    generateKey: "Generate Key",
    keyGenerated: "New key generated",
    noKeys: "No active membership keys.",
    keyColumnCode: "Code",
    keyColumnDate: "Created At",
    keyColumnStatus: "Status",
    // System
    initDb: "Initialize Database",
    initDbDesc: "Creates necessary tables (Templates, Access Keys, Logs) if they don't exist.",
    initDbSuccess: "Database initialized successfully.",
    initDbFail: "Initialization failed",
    // Modal & Locking
    copyCode: "Copy Code",
    copied: "Copied!",
    copyClipboard: "I want this style",
    copiedClipboard: "Copied to Clipboard",
    codeCopiedToast: "Code copied! Go paste it now.",
    remove: "Remove",
    codeHidden: "Source code is locked.",
    codeHiddenDesc: "Please enter a valid membership code to unlock.",
    enlargePreview: "Enlarge Preview",
    enterMemberCode: "Enter Member Code",
    unlock: "Unlock",
    unlockSuccess: "Unlocked successfully!",
    unlockFail: "Invalid code",
    verify: "Verify",
    lockedContent: "Content Locked",
    lockedContentDesc: "This high-quality template requires a membership code to view the source.",
    fullSourceCode: "Full Source Code (Hidden)",
    fullSourceCodeDesc: "Paste the full runnable source code here. If empty, the preview code will be used."
  },
  zh: {
    appTitle: "SciPlot Hub",
    searchPlaceholder: "搜索模板、标签或语言...",
    uploadTemplate: "上传模板",
    upload: "上传",
    availableTemplates: "可用模板",
    results: "个结果",
    result: "个结果",
    noTemplates: "未找到模板",
    noTemplatesDesc: "尝试调整搜索词或浏览所有模板。",
    clearSearch: "清除搜索",
    footer: "© {year} SciPlot Hub. 赋能科研可视化。",
    // Admin Panel
    adminLogin: "管理员登录",
    password: "密码",
    login: "登录",
    logout: "退出登录",
    wrongPassword: "密码错误",
    uploadNewTitle: "上传新模板",
    uploadNewDesc: "与社区分享您的科研绘图代码。",
    cancel: "取消",
    templateTitle: "模板标题",
    description: "描述",
    descriptionPlaceholder: "解释此图表的用途以及使用的库...",
    language: "语言",
    tags: "标签",
    previewImage: "预览图片",
    uploadFile: "上传文件",
    dragDrop: "或拖拽上传",
    fileLimit: "PNG, JPG, GIF 最大 5MB",
    sourceCode: "源代码",
    codePlaceholder: "在此粘贴您的绘图代码...",
    requiredFields: "请填写所有必填字段（标题、代码、图片）",
    deleteConfirm: "确定要删除此模板吗？",
    // Membership Keys
    adminDashboard: "管理后台",
    tabUpload: "上传模板",
    tabKeys: "会员码管理",
    tabSystem: "系统设置",
    generateKey: "生成会员码",
    keyGenerated: "新会员码已生成",
    noKeys: "暂无有效会员码。",
    keyColumnCode: "卡密",
    keyColumnDate: "创建时间",
    keyColumnStatus: "状态",
    // System
    initDb: "初始化数据库",
    initDbDesc: "如果表不存在，则创建必要的表（模板、会员码、日志）。",
    initDbSuccess: "数据库初始化成功。",
    initDbFail: "初始化失败",
    // Modal & Locking
    copyCode: "复制代码",
    copied: "已复制!",
    copyClipboard: "想要同款",
    copiedClipboard: "已复制到剪贴板",
    codeCopiedToast: "代码已复制，快去粘贴使用吧！",
    remove: "移除",
    codeHidden: "源代码已锁定。",
    codeHiddenDesc: "请输入有效的会员码以解锁。",
    enlargePreview: "放大预览",
    enterMemberCode: "输入会员码",
    unlock: "解锁",
    unlockSuccess: "解锁成功！",
    unlockFail: "无效的会员码",
    verify: "验证",
    lockedContent: "内容已锁定",
    lockedContentDesc: "查看此优质模板源码需要会员码验证。",
    fullSourceCode: "完整源代码（隐藏）",
    fullSourceCodeDesc: "在此粘贴完整的可运行源代码。如留空，将使用预览代码。"
  }
};

type Translations = typeof translations.en;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('zh'); 
  
  const value = {
    language,
    setLanguage,
    t: translations[language]
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
};