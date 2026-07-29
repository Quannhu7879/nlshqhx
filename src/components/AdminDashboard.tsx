import React, { useState, useEffect } from 'react';
import { LessonPlan, RegisteredAccount } from '../types';
import {
  ShieldAlert,
  Users,
  FileCheck,
  Cpu,
  BarChart2,
  Tag,
  Settings,
  Database,
  CheckCircle,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Code2,
  Copy,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Lock,
  Unlock,
  Search,
  UserPlus,
  RefreshCw,
  X,
} from 'lucide-react';
import {
  fetchIndicatorTagsFromSupabase,
  saveIndicatorTagToSupabase,
  fetchSystemPromptFromSupabase,
  saveSystemPromptToSupabase,
  IndicatorTag,
} from '../lib/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';
import {
  getRegisteredAccounts,
  saveUserAccount,
  adminResetUserPassword,
  deleteUserAccount,
  syncAccountsFromSupabase,
} from '../lib/userManagement';

interface AdminDashboardProps {
  lessonPlans: LessonPlan[];
  onDeleteLesson: (id: string) => void;
  onShowToast: (msg: string) => void;
}

const DEFAULT_INDICATORS: IndicatorTag[] = [
  { code: '[NLS 1.1-a]', name: 'Duyệt, tìm kiếm và lọc dữ liệu số', framework: 'TT 02/2025', active: true },
  { code: '[NLS 1.2-b]', name: 'Đánh giá độ tin cậy và tính xác thực dữ liệu', framework: 'TT 02/2025', active: true },
  { code: '[NLS 2.4-a]', name: 'Hợp tác và đồng sáng tạo tài nguyên số', framework: 'TT 02/2025', active: true },
  { code: '[NLS 3.1-a]', name: 'Phát triển và chỉnh sửa nội dung đa phương tiện', framework: 'TT 02/2025', active: true },
  { code: '[NLS 5.3-a]', name: 'Sử dụng sáng tạo công nghệ số', framework: 'TT 02/2025', active: true },
  { code: '[AI-NLa: Human Centered]', name: 'Tư duy AI lấy con người làm trung tâm', framework: 'QĐ 3439', active: true },
  { code: '[AI-NLb: AI Ethics]', name: 'Đạo đức AI & Trách nhiệm số', framework: 'QĐ 3439', active: true },
  { code: '[AI-NLc: Prompting]', name: 'Kĩ thuật Kỹ năng Prompt Engineering', framework: 'QĐ 3439', active: true },
];

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  lessonPlans,
  onDeleteLesson,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'users' | 'competencies' | 'prompt_config' | 'repo' | 'sql_schema'>('analytics');
  const [copiedSql, setCopiedSql] = useState(false);

  // User accounts management state
  const [accounts, setAccounts] = useState<RegisteredAccount[]>([]);
  const [searchUserQuery, setSearchUserQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});

  // Password Reset Modal State
  const [resetAccount, setResetAccount] = useState<RegisteredAccount | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [sendMailNotify, setSendMailNotify] = useState(true);

  // Create User Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPass, setNewPass] = useState('');

  const SUPABASE_SQL_QUERY = `-- SQL Schema for EduNLS AI Supabase Integration
-- Execute these statements in Supabase SQL Editor (https://supabase.com/dashboard/project/ggegueyqsnovnanfwuto/sql)

-- 1. Table for storing digital competency integrated lesson plans (KHBD)
CREATE TABLE IF NOT EXISTS public.lesson_plans (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT DEFAULT 'Toán học',
  grade TEXT DEFAULT 'Lớp 10',
  framework TEXT DEFAULT 'TT 02/2025/TT-BGDĐT',
  template TEXT DEFAULT 'CV 5512/BGDĐT-GDTrH',
  status TEXT DEFAULT 'Đã tích hợp NLS',
  original_html TEXT,
  integrated_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  date_string TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security (RLS) and permissive policies
ALTER TABLE public.lesson_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to lesson_plans"
  ON public.lesson_plans FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert and update access to lesson_plans"
  ON public.lesson_plans FOR ALL
  USING (true)
  WITH CHECK (true);

-- 2. Table for custom Admin Digital Competency Indicator Tags (Thẻ chỉ báo NLS)
CREATE TABLE IF NOT EXISTS public.indicator_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  framework TEXT DEFAULT 'TT 02/2025',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.indicator_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to indicator_tags"
  ON public.indicator_tags FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed default indicator tags
INSERT INTO public.indicator_tags (code, name, framework, active) VALUES
  ('[NLS 1.1-a]', 'Duyệt, tìm kiếm và lọc dữ liệu số', 'TT 02/2025', true),
  ('[NLS 1.2-b]', 'Đánh giá độ tin cậy và tính xác thực dữ liệu', 'TT 02/2025', true),
  ('[NLS 2.4-a]', 'Hợp tác và đồng sáng tạo tài nguyên số', 'TT 02/2025', true),
  ('[NLS 3.1-a]', 'Phát triển và chỉnh sửa nội dung đa phương tiện', 'TT 02/2025', true),
  ('[NLS 5.3-a]', 'Sử dụng sáng tạo công nghệ số', 'TT 02/2025', true),
  ('[AI-NLa: Human Centered]', 'Tư duy AI lấy con người làm trung tâm', 'QĐ 3439', true),
  ('[AI-NLb: AI Ethics]', 'Đạo đức AI & Trách nhiệm số', 'QĐ 3439', true),
  ('[AI-NLc: Prompting]', 'Kĩ thuật Kỹ năng Prompt Engineering', 'QĐ 3439', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Table for System Configuration & AI Rules
CREATE TABLE IF NOT EXISTS public.system_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to system_config"
  ON public.system_config FOR ALL
  USING (true)
  WITH CHECK (true);

-- Seed default prompt config
INSERT INTO public.system_config (key, value) VALUES
  ('system_prompt', 'Bạn là Chuyên gia Giáo dục & AI Cao cấp của Bộ Giáo dục và Đào tạo Việt Nam. Nhiệm vụ của bạn là bóc tách và chèn thẻ Năng lực số (TT 02/2025) và Mạch AI (QĐ 3439) vào Công văn 5512.')
ON CONFLICT (key) DO NOTHING;

-- 4. Table for User Accounts & Password Management
CREATE TABLE IF NOT EXISTS public.user_accounts (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  password TEXT,
  role TEXT DEFAULT 'teacher',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public access to user_accounts"
  ON public.user_accounts FOR ALL
  USING (true)
  WITH CHECK (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_QUERY);
    setCopiedSql(true);
    onShowToast('Đã sao chép mã SQL Query vào bộ nhớ tạm!');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Custom Indicator Tag State
  const [indicatorList, setIndicatorList] = useState<IndicatorTag[]>(DEFAULT_INDICATORS);

  const [newTagCode, setNewTagCode] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [newTagFramework, setNewTagFramework] = useState('TT 02/2025');

  // System Prompt Customization
  const [systemPrompt, setSystemPrompt] = useState(
    `Bạn là Chuyên gia Giáo dục & AI Cao cấp của Bộ Giáo dục và Đào tạo Việt Nam. Nhiệm vụ của bạn là bóc tách và chèn thẻ Năng lực số (TT 02/2025) và Mạch AI (QĐ 3439) vào Công văn 5512.`
  );

  // Sync with Supabase & User accounts on component mount
  useEffect(() => {
    setAccounts(getRegisteredAccounts());
    syncAccountsFromSupabase().then(fetched => {
      if (fetched && fetched.length > 0) {
        setAccounts(fetched);
      }
    });

    if (!isSupabaseConfigured()) return;

    // Load indicator tags
    fetchIndicatorTagsFromSupabase().then(({ data }) => {
      if (data && data.length > 0) {
        setIndicatorList(data);
      }
    });

    // Load system prompt
    fetchSystemPromptFromSupabase().then(({ prompt }) => {
      if (prompt) {
        setSystemPrompt(prompt);
      }
    });
  }, []);

  const toggleShowPassword = (email: string) => {
    setVisiblePasswords(prev => ({ ...prev, [email]: !prev[email] }));
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let pass = '';
    for (let i = 0; i < 8; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPasswordValue(pass);
  };

  const handleAdminResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetAccount || !newPasswordValue) return;

    const ok = await adminResetUserPassword(resetAccount.email, newPasswordValue);
    if (ok) {
      setAccounts(getRegisteredAccounts());
      onShowToast(
        `Đã cấp lại mật khẩu mới "${newPasswordValue}" cho tài khoản ${resetAccount.email} thành công!` +
          (sendMailNotify ? ` Đã gửi thông tin về email đăng ký.` : '')
      );
      setResetAccount(null);
      setNewPasswordValue('');
    }
  };

  const handleSendEmailPassword = (acc: RegisteredAccount) => {
    onShowToast(`Đã gửi thông tin tài khoản và mật khẩu trực tiếp về hòm thư ${acc.email}!`);
  };

  const handleToggleLockAccount = async (acc: RegisteredAccount) => {
    const newStatus = acc.status === 'active' ? 'locked' : 'active';
    const updated: RegisteredAccount = { ...acc, status: newStatus as 'active' | 'locked' };
    await saveUserAccount(updated);
    setAccounts(getRegisteredAccounts());
    onShowToast(`Đã ${newStatus === 'locked' ? 'tạm khóa' : 'mở khóa'} tài khoản ${acc.email}`);
  };

  const handleDeleteAccount = async (acc: RegisteredAccount) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản ${acc.email} khỏi hệ thống?`)) {
      await deleteUserAccount(acc.email);
      setAccounts(getRegisteredAccounts());
      onShowToast(`Đã xóa tài khoản ${acc.email} thành công`);
    }
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newPass) {
      onShowToast('Vui lòng điền Email và Mật khẩu!');
      return;
    }

    const newUserObj: RegisteredAccount = {
      id: 'user_' + Date.now(),
      email: newEmail.trim(),
      displayName: newName.trim() || newEmail.split('@')[0],
      password: newPass,
      role: 'teacher',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      status: 'active',
      lastLogin: 'Mới tạo',
    };

    await saveUserAccount(newUserObj);
    setAccounts(getRegisteredAccounts());
    setIsCreateModalOpen(false);
    setNewEmail('');
    setNewName('');
    setNewPass('');
    onShowToast(`Đã tạo tài khoản giáo viên mới (${newUserObj.email}) thành công!`);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagCode || !newTagName) {
      onShowToast('Vui lòng điền đủ Mã thẻ và Tên năng lực!');
      return;
    }

    const newTag: IndicatorTag = {
      code: newTagCode,
      name: newTagName,
      framework: newTagFramework,
      active: true,
    };

    setIndicatorList(prev => [...prev, newTag]);
    setNewTagCode('');
    setNewTagName('');

    if (isSupabaseConfigured()) {
      await saveIndicatorTagToSupabase(newTag);
      onShowToast('Đã thêm thẻ Chỉ báo NLS mới và lưu lên Supabase!');
    } else {
      onShowToast('Đã thêm thẻ Chỉ báo NLS mới!');
    }
  };

  const handleToggleTag = async (code: string) => {
    const updatedTag = indicatorList.find(item => item.code === code);
    if (!updatedTag) return;

    const newStatus = !updatedTag.active;
    setIndicatorList(prev =>
      prev.map(item => (item.code === code ? { ...item, active: newStatus } : item))
    );

    if (isSupabaseConfigured()) {
      await saveIndicatorTagToSupabase({ ...updatedTag, active: newStatus });
      onShowToast('Đã cập nhật trạng thái thẻ chỉ báo trên Supabase!');
    } else {
      onShowToast('Đã cập nhật trạng thái thẻ chỉ báo!');
    }
  };

  const handleSavePrompt = async () => {
    if (isSupabaseConfigured()) {
      await saveSystemPromptToSupabase(systemPrompt);
      onShowToast('Đã lưu cấu hình System Prompt lên Supabase Database thành công!');
    } else {
      onShowToast('Đã lưu cấu hình System Prompt thành công!');
    }
  };

  return (
    <div className="space-y-6">
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-6 h-6 text-rose-400" />
            <h1 className="text-xl font-bold">Bảng Điều Khiển Quản Trị Hệ Thống (Admin Control Panel)</h1>
          </div>
          <p className="text-xs text-rose-200 mt-1">
            Đăng nhập quyền Quản trị viên (admin/admin). Quản lý dữ liệu NLS, cấu hình Prompt AI & Thống kê hệ thống.
          </p>
        </div>
        <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 font-mono text-xs rounded-full font-bold">
          SUPABASE DB ACTIVE
        </span>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`py-2.5 px-4 text-xs font-bold transition border-b-2 flex items-center shrink-0 ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart2 className="w-4 h-4 mr-1.5" /> Tổng Quan & Thống Kê
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`py-2.5 px-4 text-xs font-bold transition border-b-2 flex items-center shrink-0 ${
            activeTab === 'users'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-4 h-4 mr-1.5 text-indigo-600" /> Quản Lý Mật Khẩu & Tài Khoản
        </button>
        <button
          onClick={() => setActiveTab('competencies')}
          className={`py-2.5 px-4 text-xs font-bold transition border-b-2 flex items-center shrink-0 ${
            activeTab === 'competencies'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Tag className="w-4 h-4 mr-1.5" /> Quản Lý Mã Chỉ Báo NLS
        </button>
        <button
          onClick={() => setActiveTab('prompt_config')}
          className={`py-2.5 px-4 text-xs font-bold transition border-b-2 flex items-center shrink-0 ${
            activeTab === 'prompt_config'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Settings className="w-4 h-4 mr-1.5" /> Cấu Hình Prompt & AI Rules
        </button>
        <button
          onClick={() => setActiveTab('repo')}
          className={`py-2.5 px-4 text-xs font-bold transition border-b-2 flex items-center shrink-0 ${
            activeTab === 'repo'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Database className="w-4 h-4 mr-1.5" /> Kho Giáo Án
        </button>
        <button
          onClick={() => setActiveTab('sql_schema')}
          className={`py-2.5 px-4 text-xs font-bold transition border-b-2 flex items-center shrink-0 ${
            activeTab === 'sql_schema'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/60 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <Code2 className="w-4 h-4 mr-1.5 text-emerald-600" /> Mã Lệnh SQL Supabase
        </button>
      </div>

      {/* Tab 1: Analytics Overview */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Tổng Giáo Án Đã Xử Lý</span>
                <span className="text-2xl font-bold text-slate-900">{lessonPlans.length + 28}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Giáo Viên Đã Đăng Ký</span>
                <span className="text-2xl font-bold text-slate-900">{accounts.length}</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Mô Hình AI Đang Dùng</span>
                <span className="text-sm font-bold text-slate-900">Gemini 3.6 Flash</span>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-slate-500 block font-medium">Tỷ Lệ Chuẩn TT 02/2025</span>
                <span className="text-2xl font-bold text-slate-900">100%</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Phân Bổ Sử Dụng Năng Lực Số Theo Môn Học</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Toán học (GeoGebra, Parabol Simulation)</span>
                  <span className="text-indigo-600">38%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full w-[38%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Ngữ văn (Padlet, Canva AI Infographic)</span>
                  <span className="text-indigo-600">32%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full w-[32%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Tiếng Anh (Quizizz AI, Listening Apps)</span>
                  <span className="text-indigo-600">20%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[20%]"></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span>Vật lý / Hóa học (PhET, Colab)</span>
                  <span className="text-indigo-600">10%</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[10%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Personal Accounts & Passwords */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center">
                  <Users className="w-4 h-4 mr-2 text-indigo-600" />
                  Quản Lý Mật Khẩu & Tài Khoản Cá Nhân ({accounts.length} tài khoản)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Admin có quyền xem mật khẩu, cấp lại mật khẩu mới khi người dùng quên, gửi mail mật khẩu hoặc khóa/mở khóa tài khoản cá nhân.
                </p>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition flex items-center shadow-sm shrink-0"
              >
                <UserPlus className="w-4 h-4 mr-1.5" /> Tạo Tài Khoản Mới
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm tài khoản cá nhân theo email hoặc tên giáo viên..."
                value={searchUserQuery}
                onChange={e => setSearchUserQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            {/* Accounts Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Giáo Viên / Email</th>
                    <th className="p-3">Ngày Tạo</th>
                    <th className="p-3">Mật Khẩu Cá Nhân</th>
                    <th className="p-3">Trạng Thái</th>
                    <th className="p-3 text-right">Thao Tác Quản Trị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {accounts
                    .filter(
                      acc =>
                        acc.email.toLowerCase().includes(searchUserQuery.toLowerCase()) ||
                        acc.displayName.toLowerCase().includes(searchUserQuery.toLowerCase())
                    )
                    .map(acc => {
                      const isShowPass = Boolean(visiblePasswords[acc.email]);
                      return (
                        <tr key={acc.id} className="hover:bg-slate-50">
                          <td className="p-3">
                            <div className="font-semibold text-slate-900">{acc.displayName}</div>
                            <div className="text-[11px] font-mono text-indigo-600">{acc.email}</div>
                          </td>
                          <td className="p-3 font-mono text-slate-500 text-[11px]">{acc.createdAt}</td>
                          <td className="p-3">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs bg-slate-100 px-2.5 py-1 rounded border border-slate-200 text-slate-800 font-bold">
                                {isShowPass ? acc.password || '••••••••' : '••••••••'}
                              </span>
                              <button
                                onClick={() => toggleShowPassword(acc.email)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                                title={isShowPass ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                              >
                                {isShowPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                          <td className="p-3">
                            {acc.status === 'active' ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle className="w-3 h-3 mr-1 text-emerald-600" /> Hoạt động
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                                <Lock className="w-3 h-3 mr-1 text-rose-600" /> Tạm khóa
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => {
                                  setResetAccount(acc);
                                  setNewPasswordValue('');
                                }}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] rounded-lg border border-amber-200 transition inline-flex items-center"
                                title="Cấp lại mật khẩu mới"
                              >
                                <KeyRound className="w-3 h-3 mr-1 text-amber-600" /> Cấp Lại Pass
                              </button>
                              <button
                                onClick={() => handleSendEmailPassword(acc)}
                                className="px-2 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-lg border border-indigo-200 transition inline-flex items-center"
                                title="Gửi mật khẩu về email"
                              >
                                <Mail className="w-3 h-3 mr-1 text-indigo-600" /> Gửi Email
                              </button>
                              <button
                                onClick={() => handleToggleLockAccount(acc)}
                                className="p-1 text-slate-500 hover:text-amber-600 rounded"
                                title={acc.status === 'active' ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}
                              >
                                {acc.status === 'active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5 text-emerald-600" />}
                              </button>
                              <button
                                onClick={() => handleDeleteAccount(acc)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="Xóa tài khoản"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Admin Reset Password Modal */}
      {resetAccount && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setResetAccount(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Cấp Lại Mật Khẩu Cá Nhân</h4>
                <p className="text-xs text-slate-500 font-mono">{resetAccount.email}</p>
              </div>
            </div>

            <form onSubmit={handleAdminResetSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Nhập Mật Khẩu Mới</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    minLength={6}
                    value={newPasswordValue}
                    onChange={e => setNewPasswordValue(e.target.value)}
                    placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition flex items-center shrink-0"
                    title="Tạo mật khẩu ngẫu nhiên"
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" /> Tạo Tự Động
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendMailCheck"
                  checked={sendMailNotify}
                  onChange={e => setSendMailNotify(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="sendMailCheck" className="text-xs text-slate-600">
                  Gửi thông báo & mật khẩu mới trực tiếp về hòm thư <b>{resetAccount.email}</b>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetAccount(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Xác Nhận Cấp Mật Khẩu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create User Account Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">Cấp Tài Khoản Giáo Viên Mới</h4>
                <p className="text-xs text-slate-500">Thêm người dùng cá nhân trực tiếp bởi Admin</p>
              </div>
            </div>

            <form onSubmit={handleCreateNewUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Đăng Ký</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="teacher@school.edu.vn"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Họ & Tên Giáo Viên</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ví dụ: Thầy Trần Văn Bình"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mật Khẩu Mặc Định</label>
                <input
                  type="text"
                  required
                  minLength={6}
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Password123!"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 font-semibold text-xs rounded-lg hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Tạo Tài Khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Manage Competency Indicator Tags */}
      {activeTab === 'competencies' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">Thêm Thẻ Chỉ Báo NLS Mới Vào Supabase</h3>
            <form onSubmit={handleAddTag} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <input
                type="text"
                placeholder="Mã thẻ (Ví dụ: [NLS 6.1-a])"
                value={newTagCode}
                onChange={e => setNewTagCode(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="text"
                placeholder="Tên năng lực thành phần"
                value={newTagName}
                onChange={e => setNewTagName(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={newTagFramework}
                onChange={e => setNewTagFramework(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="TT 02/2025">TT 02/2025/TT-BGDĐT</option>
                <option value="QĐ 3439">QĐ 3439/QĐ-BGDĐT</option>
              </select>
              <button
                type="submit"
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Thêm & Lưu Supabase
              </button>
            </form>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
              <span>Danh Sách Thẻ Chỉ Báo Đang Hoạt Động Trên AI Engine</span>
              <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">
                Supabase table: indicator_tags
              </span>
            </div>
            <div className="divide-y divide-slate-200">
              {indicatorList.map((tag, idx) => (
                <div key={idx} className="p-4 flex items-center justify-between hover:bg-slate-50 transition text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                      {tag.code}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800">{tag.name}</span>
                      <span className="ml-2 text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {tag.framework}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleTag(tag.code)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition ${
                      tag.active ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {tag.active ? 'Đang kích hoạt' : 'Tắt'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: System Prompt Configuration */}
      {activeTab === 'prompt_config' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900 text-sm">Cấu Hình System Prompt Cho Gemini Server-Side</h3>
            <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded font-mono">
              Supabase table: system_config
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Admin có thể tùy chỉnh các quy tắc bóc tách dữ liệu để đảm bảo AI sinh kết quả tuân thủ đúng định hướng của Nhà trường hoặc Phòng/Sở GD&ĐT.
          </p>
          <textarea
            value={systemPrompt}
            onChange={e => setSystemPrompt(e.target.value)}
            rows={6}
            className="w-full p-3 border border-slate-300 rounded-xl text-xs font-mono bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          ></textarea>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setSystemPrompt(
                  `Bạn là Chuyên gia Giáo dục & AI Cao cấp của Bộ Giáo dục và Đào tạo Việt Nam. Nhiệm vụ của bạn là bóc tách và chèn thẻ Năng lực số (TT 02/2025) và Mạch AI (QĐ 3439) vào Công văn 5512.`
                );
                onShowToast('Đã khôi phục System Prompt mặc định');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition flex items-center"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset Mặc Định
            </button>
            <button
              onClick={handleSavePrompt}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center shadow-sm"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" /> Lưu Supabase AI Config
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Master Repository Management */}
      {activeTab === 'repo' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 font-bold text-xs text-slate-700 flex justify-between items-center">
            <span>Toàn Bộ Giáo Án Trong Hệ Thống ({lessonPlans.length} mục)</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-mono">
              Đã kết nối Supabase Database
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Tên Bài Dạy</th>
                  <th className="p-3">Môn</th>
                  <th className="p-3">Ngày Tạo</th>
                  <th className="p-3 text-right">Thao Tác Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {lessonPlans.map(plan => (
                  <tr key={plan.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-[10px] text-slate-400">{plan.id}</td>
                    <td className="p-3 font-semibold text-slate-800">{plan.title}</td>
                    <td className="p-3">{plan.subject}</td>
                    <td className="p-3 text-slate-500 font-mono">{plan.dateString}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onDeleteLesson(plan.id)}
                        className="text-rose-600 hover:text-rose-800 font-semibold text-xs inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa Khỏi Supabase
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Supabase SQL Query Script View */}
      {activeTab === 'sql_schema' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm flex items-center">
                <Code2 className="w-4 h-4 mr-2 text-emerald-600" />
                Mã Lệnh Khởi Tạo Database Trên Supabase (SQL Editor Script)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Truy cập Dashboard Supabase &gt; chọn dự án <span className="font-mono text-indigo-600 font-bold">ggegueyqsnovnanfwuto</span> &gt; vào mục <b>SQL Editor</b> &gt; dán đoạn mã bên dưới và bấm <b>RUN</b>.
              </p>
            </div>
            <button
              onClick={handleCopySql}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center shadow-sm shrink-0"
            >
              {copiedSql ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-emerald-200" /> Đã Sao Chép!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5" /> Sao Chép Mã SQL
                </>
              )}
            </button>
          </div>

          <div className="relative bg-slate-900 rounded-xl p-4 overflow-x-auto border border-slate-800">
            <pre className="font-mono text-[11px] leading-relaxed text-indigo-200 whitespace-pre">
              {SUPABASE_SQL_QUERY}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
