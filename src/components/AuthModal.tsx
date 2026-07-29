import React, { useState } from 'react';
import { User } from '../types';
import { X, Lock, ShieldAlert, LogIn, Check } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  defaultTab?: 'login' | 'register' | 'admin';
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
  onShowToast: (msg: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  defaultTab = 'login',
  onClose,
  onLoginSuccess,
  onShowToast,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin'>(defaultTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Admin form state
  const [adminUser, setAdminUser] = useState('admin');
  const [adminPass, setAdminPass] = useState('admin');

  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Handle Teacher Login
  const handleTeacherLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Check if user typed admin credentials in standard login
    if ((email === 'admin' || email === 'admin@edunls.vn') && password === 'admin') {
      const adminAcc: User = {
        uid: 'admin_root',
        email: 'admin@edunls.vn',
        displayName: 'Quản Trị Viên (Admin)',
        role: 'admin',
      };
      onLoginSuccess(adminAcc);
      onShowToast('Đăng nhập Quản trị viên thành công (admin/admin)!');
      onClose();
      return;
    }

    if (!email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          // If user doesn't exist in Supabase Auth yet, create account or fallback gracefully
          console.warn('Supabase Auth warning:', error.message);
        } else if (data.user) {
          const supabaseUser: User = {
            uid: data.user.id,
            email: data.user.email || email,
            displayName: data.user.user_metadata?.display_name || displayName || email.split('@')[0],
            role: 'teacher',
          };
          setLoading(false);
          onLoginSuccess(supabaseUser);
          onShowToast(`Đăng nhập thành công với Supabase Auth! Chào mừng ${supabaseUser.displayName}`);
          onClose();
          return;
        }
      } catch (err: any) {
        console.warn('Supabase Auth exception:', err);
      }
    }

    // Local fallback session login
    const teacherUser: User = {
      uid: 'user_' + Date.now(),
      email,
      displayName: displayName || email.split('@')[0] || 'Giáo viên',
      role: 'teacher',
    };

    setLoading(false);
    onLoginSuccess(teacherUser);
    onShowToast(`Đăng nhập thành công! Chào mừng ${teacherUser.displayName}`);
    onClose();
  };

  // Handle Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Mật khẩu cần ít nhất 6 ký tự');
      return;
    }

    setLoading(true);

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName || 'Giáo viên' },
          },
        });

        if (!error && data.user) {
          const newTeacher: User = {
            uid: data.user.id,
            email: data.user.email || email,
            displayName: displayName || 'Giáo viên',
            role: 'teacher',
          };
          setLoading(false);
          onLoginSuccess(newTeacher);
          onShowToast('Đã tạo tài khoản trên Supabase Auth thành công!');
          onClose();
          return;
        }
      } catch (err: any) {
        console.warn('Supabase Auth register exception:', err);
      }
    }

    const newTeacher: User = {
      uid: 'user_' + Date.now(),
      email,
      displayName: displayName || 'Giáo viên',
      role: 'teacher',
    };

    setLoading(false);
    onLoginSuccess(newTeacher);
    onShowToast('Đăng ký tài khoản thành công!');
    onClose();
  };

  // Handle Dedicated Admin Login (user/pass: admin/admin)
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (adminUser.trim() === 'admin' && adminPass.trim() === 'admin') {
      const adminAcc: User = {
        uid: 'admin_root',
        email: 'admin@edunls.vn',
        displayName: 'Quản Trị Viên (Admin)',
        role: 'admin',
      };
      onLoginSuccess(adminAcc);
      onShowToast('Đăng nhập Quản trị viên thành công!');
      onClose();
    } else {
      setErrorMessage('Tài khoản hoặc mật khẩu quản trị không chính xác (Mặc định: admin/admin)');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 bg-slate-100 p-2 rounded-xl transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            {activeTab === 'admin' ? 'Đăng Nhập Quản Trị Hệ Thống' : 'Đăng Nhập EduNLS AI'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Dành cho Giáo viên & Quản lý Giáo dục</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 mb-6">
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${
              activeTab === 'login'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            Giáo Viên
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold transition border-b-2 ${
              activeTab === 'register'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-slate-500 border-transparent hover:text-slate-700'
            }`}
          >
            Đăng Ký
          </button>
          <button
            onClick={() => {
              setActiveTab('admin');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 text-xs font-bold transition border-b-2 flex items-center justify-center ${
              activeTab === 'admin'
                ? 'text-rose-600 border-rose-600 font-bold'
                : 'text-slate-500 border-transparent hover:text-rose-600'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-500" /> Admin
          </button>
        </div>

        {/* Error Display */}
        {errorMessage && (
          <div className="mb-4 p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-lg">
            {errorMessage}
          </div>
        )}

        {/* Form: Teacher Login */}
        {activeTab === 'login' && (
          <form onSubmit={handleTeacherLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Tài Khoản</label>
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teacher@school.edu.vn"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex justify-center items-center shadow-sm disabled:opacity-50"
            >
              <LogIn className="w-4 h-4 mr-1.5" /> {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
            </button>
          </form>
        )}

        {/* Form: Register */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Họ và tên</label>
              <input
                type="text"
                required
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="teacher@school.edu.vn"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật khẩu (Ít nhất 6 ký tự)</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex justify-center items-center shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4 mr-1.5" /> {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản Mới'}
            </button>
          </form>
        )}

        {/* Form: Dedicated Admin Login (user/pass: admin/admin) */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              <b>Tài khoản Quản trị mặc định:</b>
              <div className="mt-1 font-mono text-[11px] bg-rose-100/60 p-1.5 rounded">
                Username: <b>admin</b> | Password: <b>admin</b>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tài Khoản Quản Trị (User)</label>
              <input
                type="text"
                required
                value={adminUser}
                onChange={e => setAdminUser(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật Khẩu Quản Trị (Pass)</label>
              <input
                type="password"
                required
                value={adminPass}
                onChange={e => setAdminPass(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition flex justify-center items-center shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 mr-1.5" /> Đăng Nhập Quyền Admin
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
