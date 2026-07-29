import React from 'react';
import { ViewMode, User } from '../types';
import { Sparkles, Brain, FolderOpen, BookOpen, Scale, User as UserIcon, LogOut, ShieldAlert, Zap, Home } from 'lucide-react';

interface HeaderProps {
  currentView: ViewMode;
  onSwitchView: (view: ViewMode) => void;
  currentUser: User | null;
  onOpenAuth: (defaultTab?: 'login' | 'register' | 'admin') => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onSwitchView,
  currentUser,
  onOpenAuth,
  onLogout,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div
            className="flex items-center space-x-3 cursor-pointer select-none"
            onClick={() => onSwitchView('landing')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-bold text-xl shadow-md">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                EduNLS AI
              </span>
              <span className="block text-xs text-slate-500 font-medium">
                Tích Hợp Năng Lực Số & AI
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onSwitchView('landing')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center ${
                currentView === 'landing'
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <Home className="w-4 h-4 mr-1.5" />
              Trang chủ
            </button>
            <button
              onClick={() => onSwitchView('studio')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center ${
                currentView === 'studio'
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500 mr-1.5" />
              AI Studio Workstation
            </button>
            <button
              onClick={() => onSwitchView('repository')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center ${
                currentView === 'repository'
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <FolderOpen className="w-4 h-4 text-indigo-500 mr-1.5" />
              Kho Giáo Án
            </button>
            <button
              onClick={() => onSwitchView('library')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center ${
                currentView === 'library'
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-500 mr-1.5" />
              Thư Viện NLS & AI
            </button>
            <button
              onClick={() => onSwitchView('legal')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center ${
                currentView === 'legal'
                  ? 'text-indigo-600 bg-indigo-50 font-semibold'
                  : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4 text-rose-500 mr-1.5" />
              Cơ Sở Pháp Lý
            </button>

            {/* Admin View Option if logged in as Admin */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onSwitchView('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-bold transition flex items-center ${
                  currentView === 'admin'
                    ? 'text-rose-700 bg-rose-100 font-bold border border-rose-300'
                    : 'text-rose-600 hover:bg-rose-50'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-rose-600 mr-1.5" />
                Quản Trị Admin
              </button>
            )}
          </nav>

          {/* User Profile & Auth Actions */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline-flex text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg items-center">
                  <UserIcon className="w-3.5 h-3.5 mr-1.5 text-indigo-600" />
                  {currentUser.displayName}
                  {currentUser.role === 'admin' && (
                    <span className="ml-1.5 px-1.5 py-0.5 bg-rose-600 text-white text-[10px] rounded font-bold uppercase">
                      Admin
                    </span>
                  )}
                </span>
                <button
                  onClick={onLogout}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5 sm:mr-1" />
                  <span className="hidden sm:inline">Thoát</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  <UserIcon className="w-3.5 h-3.5 mr-1.5" />
                  Đăng Nhập
                </button>
                <button
                  onClick={() => onOpenAuth('admin')}
                  className="hidden sm:inline-flex items-center px-2.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
                  title="Đăng nhập quản trị"
                >
                  <ShieldAlert className="w-3.5 h-3.5 mr-1 text-rose-600" />
                  Admin
                </button>
              </div>
            )}

            <button
              onClick={() => onSwitchView('studio')}
              className="inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-lg shadow-sm hover:shadow transition"
            >
              <Zap className="w-4 h-4 mr-1.5 text-amber-300" />
              Tải Giáo Án Ngay
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
