
import React, { createContext, useContext, useState } from 'react';

export type Language = 'en' | 'zh';

const translations = {
  zh: {
    appTitle: "SciPlot Hub 科研绘图库",
    searchPlaceholder: "搜索模板、标签或语言...",
    uploadTemplate: "上传模板",
    upload: "上传",
    availableTemplates: "所有绘图模板",
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
    editTemplateTitle: "编辑模板",
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
    fileLimit: "图片最大支持 2MB",
    sourceCode: "源代码",
    codePlaceholder: "在此粘贴您的绘图代码...",
    requiredFields: "请填写所有必填字段（标题、代码、图片）",
    deleteConfirm: "确定要删除此模板吗？",
    // New Admin Keys
    templatesTab: "模板管理",
    codesTab: "会员码管理",
    logsTab: "使用日志",
    mgmtTitle: "模板管理",
    newTemplate: "新建模板",
    status: "状态",
    actions: "操作",
    generateCode: "生成会员码",
    nameNote: "名称 / 备注",
    maxUses: "最大使用次数",
    time: "时间",
    logResult: "操作结果",
    usage: "使用情况",
    save: "保存保存",
    name: "名称",
    code: "代码",
    ip: "IP地址",
    template: "所属模板",
    unlimited: "无限制",
    active: "已启用",
    inactive: "已禁用",
    success: "成功",
    failed: "失败",
    // Modal
    copyCode: "复制代码",
    copied: "已复制!",
    copyClipboard: "想要同款",
    copiedClipboard: "已复制到剪贴板",
    remove: "移除",
    codeHidden: "源代码已隐藏",
    codeHiddenDesc: "请输入有效的会员码以获取完整绘图代码",
    enlargePreview: "查看大图",
    edit: "编辑",
    dashboard: "管理后台",
    verifyTitle: "会员身份验证",
    verifyDesc: "请输入有效的会员码以访问此模板的源代码。",
    verifyBtn: "立即验证",
    verifyPlaceholder: "输入 8 位会员码",
    initDb: "初始化数据库",
    dbError: "数据库未连接或表不存在",
    expiration: "到期时间",
    permanent: "永久有效",
    expired: "已过期",
    // Contact feature
    contactAdmin: "有问题及时联系管理员",
    emailCopied: "邮箱已复制，请及时联系管理员"
  }
};

type Translations = typeof translations.zh;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always default to Chinese (zh)
  const [language] = useState<Language>('zh'); 
  
  const value = {
    language,
    setLanguage: () => {}, // Disable language switching
    t: translations.zh
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
