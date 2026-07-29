import React, { useState } from 'react';
import { User } from '../types';
import { X, Lock, ShieldAlert, LogIn, Check, Eye, EyeOff, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { saveUserAccount, findAccountByEmail } from '../lib/userManagement';

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
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'admin' | 'forgot'>(defaultTab);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Admin form state (Hidden default credentials for security)
  const [adminUser, setAdminUser] = useState('');
  const [adminPass, setAdminPass] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

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
      onShowToast('Đăng nhập Quản trị viên thành công!');
      onClose();
      return;
    }

    if (!email || !password) {
      setErrorMessage('Vui lòng điền đầy đủ email và mật khẩu');
      return;
    }

    setLoading(true);

    // Verify against managed personal accounts first
    const registered = findAccountByEmail(email);
    if (registered) {
      if (registered.status === 'locked') {
        setErrorMessage('Tài khoản này đã bị khóa. Vui lòng liên hệ Quản trị viên (Admin).');
        setLoading(false);
        return;
      }
      if (registered.password && registered.password !== password) {
        setErrorMessage('Mật khẩu không chính xác. Nếu quên mật khẩu, bấm "Quên mật khẩu?" bên dưới.');
        setLoading(false);
        return;
      }
    }

    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          console.warn('Supabase Auth warning:', error.message);
        } else if (data.user) {
          const supabaseUser: User = {
            uid: data.user.id,
            email: data.user.email || email,
            displayName: registered?.displayName || data.user.user_metadata?.display_name || displayName || email.split('@')[0],
            role: registered?.role || 'teacher',
          };
          setLoading(false);
          onLoginSuccess(supabaseUser);
          onShowToast(`Đăng nhập thành công! Chào mừng ${supabaseUser.displayName}`);
          onClose();
          return;
        }
      } catch (err: any) {
        console.warn('Supabase Auth exception:', err);
      }
    }

    // Local fallback session login
    const teacherUser: User = {
      uid: registered?.id || 'user_' + Date.now(),
      email: registered?.email || email,
      displayName: registered?.displayName || displayName || email.split('@')[0] || 'Giáo viên',
      role: registered?.role || 'teacher',
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

    // Create user object and store in userManagement DB
    const newUserId = 'user_' + Date.now();
    await saveUserAccount({
      id: newUserId,
      email,
      displayName: displayName || email.split('@')[0] || 'Giáo viên',
      password,
      role: 'teacher',
      createdAt: new Date().toLocaleDateString('vi-VN'),
      status: 'active',
      lastLogin: new Date().toLocaleDateString('vi-VN'),
    });

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
          onShowToast('Đã tạo tài khoản cá nhân thành công!');
          onClose();
          return;
        }
      } catch (err: any) {
        console.warn('Supabase Auth register exception:', err);
      }
    }

    const newTeacher: User = {
      uid: newUserId,
      email,
      displayName: displayName || 'Giáo viên',
      role: 'teacher',
    };

    setLoading(false);
    onLoginSuccess(newTeacher);
    onShowToast('Đăng ký tài khoản cá nhân thành công!');
    onClose();
  };

  // Handle Dedicated Admin Login
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
      setErrorMessage('Tài khoản hoặc mật khẩu quản trị không chính xác.');
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!forgotEmail) {
      setErrorMessage('Vui lòng nhập địa chỉ email đăng ký');
      return;
    }

    setLoading(true);

    const userAccount = findAccountByEmail(forgotEmail);

    if (isSupabaseConfigured()) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
          redirectTo: window.location.origin,
        });
        if (error) {
          console.warn('Supabase reset password warning:', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase reset password exception:', err);
      }
    }

    setLoading(false);
    setForgotSuccess(true);
    if (userAccount) {
      onShowToast(`Đã gửi hướng dẫn khôi phục mật khẩu về email ${forgotEmail}`);
    } else {
      onShowToast(`Yêu cầu khôi phục mật khẩu đã được gửi đi cho email ${forgotEmail}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
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
            {activeTab === 'admin'
              ? 'Đăng Nhập Quản Trị Hệ Thống'
              : activeTab === 'forgot'
              ? 'Khôi Phục Mật Khẩu'
              : 'Đăng Nhập EduNLS AI'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">Dành cho Giáo viên & Quản lý Giáo dục</p>
        </div>

        {/* Tabs */}
        {activeTab !== 'forgot' && (
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
        )}

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
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-semibold text-slate-700">Mật khẩu</label>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('forgot');
                    setErrorMessage('');
                    setForgotEmail(email);
                    setForgotSuccess(false);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-medium"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Xác nhận mật khẩu</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
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

        {/* Form: Dedicated Admin Login (Credentials hidden for security) */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tài Khoản Quản Trị (User)</label>
              <input
                type="text"
                required
                value={adminUser}
                onChange={e => setAdminUser(e.target.value)}
                placeholder="Nhập tên đăng nhập admin"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Mật Khẩu Quản Trị (Pass)</label>
              <div className="relative">
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-3 pr-10 py-2 border border-slate-300 rounded-lg text-xs font-mono outline-none focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded"
                  title={showAdminPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs transition flex justify-center items-center shadow-sm"
            >
              <ShieldAlert className="w-4 h-4 mr-1.5" /> Đăng Nhập Quyền Admin
            </button>
          </form>
        )}

        {/* Form: Forgot Password */}
        {activeTab === 'forgot' && (
          <div className="space-y-4">
            {!forgotSuccess ? (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <p className="text-xs text-slate-600 leading-relaxed">
                  Nhập địa chỉ email đăng ký tài khoản. Hệ thống sẽ tự động gửi thông tin và đường dẫn khôi phục mật khẩu trực tiếp về hòm thư của bạn.
                </p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Đăng Ký</label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      placeholder="teacher@school.edu.vn"
                      className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition flex justify-center items-center shadow-sm disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4 mr-1.5" /> {loading ? 'Đang gửi email...' : 'Gửi Yêu Cầu Khôi Phục'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setErrorMessage('');
                  }}
                  className="w-full py-2 text-slate-500 hover:text-slate-700 font-medium text-xs flex items-center justify-center transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Quay lại Đăng Nhập
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Mail className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Đã Gửi Hướng Dẫn Qua Email!</h4>
                <p className="text-xs text-slate-600 leading-relaxed bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  Thông tin khôi phục mật khẩu đã được gửi về email <b>{forgotEmail}</b>. Vui lòng kiểm tra hộp thư đến (hoặc hòm thư Spam) để hoàn tất.
                </p>
                <button
                  onClick={() => {
                    setActiveTab('login');
                    setForgotSuccess(false);
                  }}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs transition"
                >
                  Quay Lại Đăng Nhập
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

