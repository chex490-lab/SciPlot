
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
    editTemplateTitle: "Edit Template",
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
    // New Admin Keys
    templatesTab: "Templates",
    codesTab: "Member Codes",
    logsTab: "Logs",
    mgmtTitle: "Template Management",
    newTemplate: "New Template",
    status: "Status",
    actions: "Actions",
    generateCode: "Generate Code",
    nameNote: "Name / Note",
    maxUses: "Max Uses",
    time: "Time",
    // Fix duplicate key 'result' by renaming the admin log version to 'logResult'
    logResult: "Result",
    usage: "Usage",
    save: "Save",
    name: "Name",
    code: "Code",
    ip: "IP",
    template: "Template",
    unlimited: "Unlimited",
    active: "Active",
    inactive: "Inactive",
    success: "Success",
    failed: "Failed",
    // Modal
    copyCode: "Copy Code",
    copied: "Copied!",
    copyClipboard: "I want this style",
    copiedClipboard: "Copied to Clipboard",
    remove: "Remove",
    codeHidden: "Source code is hidden.",
    codeHiddenDesc: "Use the 'I want this style' button to get the code.",
    enlargePreview: "Enlarge Preview",
    edit: "Edit"
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
    fileLimit: "PNG, JPG, GIF 最大 5MB",
    sourceCode: "源代码",
    codePlaceholder: "在此粘贴您的绘图代码...",
    requiredFields: "请填写所有必填字段（标题、代码、图片）",
    deleteConfirm: "确定要删除此模板吗？",
    // New Admin Keys
    templatesTab: "模板",
    codesTab: "会员码",
    logsTab: "日志",
    mgmtTitle: "模板管理",
    newTemplate: "新建模板",
    status: "状态",
    actions: "操作",
    generateCode: "生成会员码",
    nameNote: "名称 / 备注",
    maxUses: "最大使用次数",
    time: "时间",
    // Fix duplicate key 'result' by renaming the admin log version to 'logResult'
    logResult: "结果",
    usage: "使用情况",
    save: "保存",
    name: "名称",
    code: "代码",
    ip: "IP",
    template: "模板",
    unlimited: "无限制",
    active: "启用",
    inactive: "禁用",
    success: "成功",
    failed: "失败",
    // Modal
    copyCode: "复制代码",
    copied: "已复制!",
    copyClipboard: "想要同款",
    copiedClipboard: "已复制到剪贴板",
    remove: "移除",
    codeHidden: "源代码已隐藏。",
    codeHiddenDesc: "点击“想要同款”按钮获取代码。",
    enlargePreview: "放大预览",
    edit: "编辑"
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
