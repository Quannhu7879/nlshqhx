import { useState, useEffect } from 'react';
import { ViewMode, User, LessonPlan, CompetencyDomain } from './types';
import { Header } from './components/Header';
import { LandingView } from './components/LandingView';
import { StudioView } from './components/StudioView';
import { RepositoryView } from './components/RepositoryView';
import { LibraryView } from './components/LibraryView';
import { LegalView } from './components/LegalView';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { CompetencyModal } from './components/CompetencyModal';
import { Toast } from './components/Toast';
import {
  fetchLessonPlansFromSupabase,
  saveLessonPlanToSupabase,
  deleteLessonPlanFromSupabase,
} from './lib/supabaseService';
import { isSupabaseConfigured } from './lib/supabase';
import { Database, CheckCircle2 } from 'lucide-react';

const INITIAL_DEMO_PLANS: LessonPlan[] = [
  {
    id: 'plan_demo_1',
    title: 'Sự biến thiên và Đồ thị Hàm số Bậc hai (Toán 10)',
    subject: 'Toán học',
    grade: 'Lớp 10',
    framework: 'TT 02/2025 + QĐ 3439',
    template: 'CV 5512/BGDĐT-GDTrH',
    status: 'Đã tích hợp NLS',
    originalHtml: '<p><b>Hoạt động 1:</b> Khởi động bài toán Parabol</p>',
    integratedHtml: '<p><b>Hoạt động 1:</b> Quét mã QR khảo sát Quizizz AI <span class="bg-indigo-100 text-indigo-800 font-mono font-bold">[NLS 1.1-a]</span></p>',
    createdAt: Date.now() - 86400000,
    dateString: new Date(Date.now() - 86400000).toLocaleDateString('vi-VN'),
  },
  {
    id: 'plan_demo_2',
    title: 'Văn bản Bình Ngô Đại Cáo - Phân tích tác phẩm (Ngữ văn 10)',
    subject: 'Ngữ văn',
    grade: 'Lớp 10',
    framework: 'TT 02/2025/TT-BGDĐT',
    template: 'CV 5512/BGDĐT-GDTrH',
    status: 'Đã tích hợp NLS',
    originalHtml: '<p><b>Hoạt động 2:</b> Tìm hiểu tư tưởng nhân nghĩa</p>',
    integratedHtml: '<p><b>Hoạt động 2:</b> Thảo luận nhóm trên Padlet <span class="bg-indigo-100 text-indigo-800 font-mono font-bold">[NLS 2.4-a]</span></p>',
    createdAt: Date.now() - 172800000,
    dateString: new Date(Date.now() - 172800000).toLocaleDateString('vi-VN'),
  },
];

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Auth Modal State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authDefaultTab, setAuthDefaultTab] = useState<'login' | 'register' | 'admin'>('login');

  // Competency Detail Modal State
  const [selectedCompetency, setSelectedCompetency] = useState<CompetencyDomain | null>(null);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Supabase status
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);
  const [isLoadingSupabase, setIsLoadingSupabase] = useState<boolean>(true);

  // Lesson Plans Repository State
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>(() => {
    try {
      const saved = localStorage.getItem('edunls_lesson_plans');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_DEMO_PLANS;
  });

  // Load data from Supabase on mount
  useEffect(() => {
    let isMounted = true;
    async function loadFromSupabase() {
      if (!isSupabaseConfigured()) {
        setIsLoadingSupabase(false);
        return;
      }

      setIsLoadingSupabase(true);
      const { data, error } = await fetchLessonPlansFromSupabase();

      if (!isMounted) return;

      if (!error && data !== null) {
        setSupabaseConnected(true);
        setLessonPlans(data);
      } else {
        console.warn('Supabase initial fetch fallback to local:', error);
        setSupabaseConnected(false);
      }
      setIsLoadingSupabase(false);
    }

    loadFromSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save to localStorage whenever lessonPlans state changes
  useEffect(() => {
    try {
      localStorage.setItem('edunls_lesson_plans', JSON.stringify(lessonPlans));
    } catch (e) {
      console.error(e);
    }
  }, [lessonPlans]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleSaveLessonPlan = async (newPlan: LessonPlan) => {
    setLessonPlans(prev => [newPlan, ...prev.filter(p => p.id !== newPlan.id)]);

    if (isSupabaseConfigured()) {
      const { success, error } = await saveLessonPlanToSupabase(newPlan);
      if (success) {
        showToast('Đã lưu & đồng bộ bài dạy trực tiếp lên Supabase Database!');
      } else {
        showToast(`Đã lưu nội bộ (${error || 'không thể ghi Supabase'})`);
      }
    } else {
      showToast('Đã tự động lưu bài dạy vào Kho Giáo Án!');
    }
  };

  const handleDeleteLessonPlan = async (id: string) => {
    setLessonPlans(prev => prev.filter(p => p.id !== id));

    if (isSupabaseConfigured()) {
      await deleteLessonPlanFromSupabase(id);
      showToast('Đã xóa giáo án khỏi Supabase Database & hệ thống!');
    } else {
      showToast('Đã xóa giáo án khỏi hệ thống.');
    }
  };

  const handleOpenAuth = (defaultTab: 'login' | 'register' | 'admin' = 'login') => {
    setAuthDefaultTab(defaultTab);
    setIsAuthOpen(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    showToast('Đã đăng xuất.');
    if (currentView === 'admin') {
      setCurrentView('landing');
    }
  };

  const handleApplyCompetencyToStudio = (comp: CompetencyDomain) => {
    setSelectedCompetency(null);
    setCurrentView('studio');
    showToast(`Đã chọn miền "${comp.title}" cho AI Studio!`);
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-800 antialiased min-h-screen flex flex-col">
      {/* Supabase Integration Banner Status Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-[11px] py-1.5 px-4 flex justify-between items-center border-b border-indigo-900/50">
        <div className="flex items-center space-x-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center space-x-2">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-200">Supabase Database:</span>
            {isLoadingSupabase ? (
              <span className="text-amber-300 flex items-center">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-1.5"></span>
                Đang kết nối Supabase...
              </span>
            ) : supabaseConnected ? (
              <span className="text-emerald-300 font-bold flex items-center bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-400" />
                Đã kết nối (ggegueyqsnovnanfwuto.supabase.co)
              </span>
            ) : (
              <span className="text-slate-400">
                Lưu trữ Local Storage (Cần chạy schema.sql trên Supabase)
              </span>
            )}
          </div>
          <div className="hidden md:flex items-center space-x-3 text-slate-300">
            <span>Sẵn sàng Deploy Vercel</span>
            <span>•</span>
            <span className="font-mono text-indigo-300">VITE_SUPABASE_URL</span>
          </div>
        </div>
      </div>

      {/* Header Bar */}
      <Header
        currentView={currentView}
        onSwitchView={setCurrentView}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main View Container */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'landing' && <LandingView onSwitchView={setCurrentView} />}

        {currentView === 'studio' && (
          <StudioView onSaveLesson={handleSaveLessonPlan} onShowToast={showToast} />
        )}

        {currentView === 'repository' && (
          <RepositoryView
            lessonPlans={lessonPlans}
            onOpenPlan={() => setCurrentView('studio')}
            onDeletePlan={handleDeleteLessonPlan}
            onSwitchView={setCurrentView}
            onShowToast={showToast}
          />
        )}

        {currentView === 'library' && (
          <LibraryView
            onSelectCompetency={setSelectedCompetency}
            onSwitchView={setCurrentView}
          />
        )}

        {currentView === 'legal' && <LegalView />}

        {currentView === 'admin' && (
          <AdminDashboard
            lessonPlans={lessonPlans}
            onDeleteLesson={handleDeleteLessonPlan}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>© 2026 EduNLS AI — Tích Hợp Năng Lực Số & AI Vào Kế Hoạch Bài Dạy.</span>
          <span className="font-semibold text-slate-600">
            Supabase DB: ggegueyqsnovnanfwuto.supabase.co • Deploy Vercel Ready
          </span>
        </div>
      </footer>

      {/* Modals & Toasts */}
      <AuthModal
        isOpen={isAuthOpen}
        defaultTab={authDefaultTab}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={user => {
          setCurrentUser(user);
          if (user.role === 'admin') {
            setCurrentView('admin');
          }
        }}
        onShowToast={showToast}
      />

      <CompetencyModal
        competency={selectedCompetency}
        onClose={() => setSelectedCompetency(null)}
        onApplyToStudio={handleApplyCompetencyToStudio}
      />

      <Toast message={toastMessage} />
    </div>
  );
}
