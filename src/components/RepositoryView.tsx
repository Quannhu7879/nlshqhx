import React, { useState, useMemo } from 'react';
import { LessonPlan, User, ViewMode } from '../types';
import { exportWordDocument } from '../utils/wordExporter';
import { Search, Eye, Trash2, Plus, Download, FolderOpen, Check, X, FileText, Sparkles, ExternalLink, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';

interface RepositoryViewProps {
  currentUser?: User | null;
  lessonPlans: LessonPlan[];
  onOpenPlan: (plan: LessonPlan) => void;
  onDeletePlan: (id: string) => void;
  onSwitchView: (view: ViewMode) => void;
  onShowToast: (msg: string) => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  currentUser,
  lessonPlans,
  onOpenPlan,
  onDeletePlan,
  onSwitchView,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('Tất cả môn học');
  const [previewPlan, setPreviewPlan] = useState<LessonPlan | null>(null);
  const [previewTab, setPreviewTab] = useState<'integrated' | 'original'>('integrated');

  // Filter lesson plans based on user ownership/privacy permissions
  const userPlans = useMemo(() => {
    if (!currentUser) {
      // Unauthenticated / Guest: show demo plans or items without specific owner
      return lessonPlans.filter(item => !item.userId && !item.authorEmail);
    }

    if (currentUser.role === 'admin') {
      // Admin account: can view all lesson plans across the system
      return lessonPlans;
    }

    // Teacher / Personal account: strictly ONLY view their own created/uploaded lesson plans!
    return lessonPlans.filter(item => {
      const isOwnerById = Boolean(item.userId && item.userId === currentUser.uid);
      const isOwnerByEmail = Boolean(item.authorEmail && item.authorEmail.toLowerCase() === currentUser.email.toLowerCase());
      // Also match if user created item during current session without id tag yet
      const isUnclaimedLocal = !item.userId && !item.authorEmail;
      return isOwnerById || isOwnerByEmail || isUnclaimedLocal;
    });
  }, [lessonPlans, currentUser]);

  const filteredPlans = userPlans.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubjectFilter === 'Tất cả môn học' || item.subject.includes(selectedSubjectFilter);
    return matchesSearch && matchesSubject;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Kho Giáo Án Của Tôi</h1>
          <p className="text-xs text-slate-500 mt-1">Danh sách kế hoạch bài dạy đã tích hợp NLS & AI trong hệ thống</p>
        </div>
        <button
          onClick={() => onSwitchView('studio')}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-lg hover:bg-indigo-700 transition flex items-center shadow-sm"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Tạo Mới
        </button>
      </div>

      {/* Account Privacy Permission Status Banner */}
      {currentUser ? (
        currentUser.role === 'admin' ? (
          <div className="p-3.5 bg-indigo-50/80 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <ShieldAlert className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span>
                <b>Chế độ Quản trị viên (Admin):</b> Đang hiển thị toàn bộ kho giáo án của mọi tài khoản trong hệ thống ({userPlans.length} kế hoạch bài dạy).
              </span>
            </div>
            <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border border-indigo-200">
              Quyền Admin
            </span>
          </div>
        ) : (
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>
                <b>Kho giáo án cá nhân riêng biệt:</b> Tài khoản <b>{currentUser.email}</b> ({currentUser.displayName}) chỉ có quyền xem & quản lý các giáo án do chính mình tạo ra ({filteredPlans.length} bài).
              </span>
            </div>
            <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold border border-emerald-200">
              Bảo mật cá nhân
            </span>
          </div>
        )
      ) : (
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 text-amber-900 rounded-xl text-xs font-medium flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2.5">
            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Bạn chưa đăng nhập. Hãy <b>Đăng ký / Đăng nhập tài khoản cá nhân</b> để sở hữu kho giáo án riêng biệt và không bị người khác nhìn thấy.
            </span>
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row justify-between gap-3">
          <div className="relative flex-grow max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm giáo án theo tên bài, môn học..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedSubjectFilter}
              onChange={e => setSelectedSubjectFilter(e.target.value)}
              className="text-xs border border-slate-300 bg-white rounded-lg px-3 py-2 outline-none font-medium"
            >
              <option>Tất cả môn học</option>
              <option>Toán học</option>
              <option>Ngữ văn</option>
              <option>Tiếng Anh</option>
              <option>Vật lý</option>
              <option>Hóa học</option>
              <option>Tin học</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-4">Tên Bài Dạy / Giáo Án</th>
                <th className="p-4">Môn / Cấp</th>
                <th className="p-4">Khung NLS</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4">Ngày Tạo</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredPlans.length > 0 ? (
                filteredPlans.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition border-b border-slate-100 last:border-0">
                    <td className="p-4 font-semibold text-slate-800 max-w-[280px] truncate" title={item.title}>
                      {item.title}
                    </td>
                    <td className="p-4 text-slate-600">{item.subject} - {item.grade}</td>
                    <td className="p-4">
                      <span className="text-[11px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-1 rounded font-medium">
                        {item.framework}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center">
                        <Check className="w-3 h-3 mr-1" /> {item.status}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500 font-mono">{item.dateString}</td>
                    <td className="p-4 text-right space-x-3 whitespace-nowrap">
                      <button
                        onClick={() => {
                          onOpenPlan(item);
                          setPreviewPlan(item);
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs transition inline-flex items-center bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200 hover:bg-indigo-100"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> Xem lại
                      </button>
                      <button
                        onClick={() => {
                          exportWordDocument(item.integratedHtml, item.title, item.subject, item.grade);
                          onShowToast('Đã tải xuống file Word!');
                        }}
                        className="text-emerald-600 hover:text-emerald-800 font-semibold text-xs transition inline-flex items-center"
                      >
                        <Download className="w-3.5 h-3.5 mr-1" /> Tải Word
                      </button>
                      <button
                        onClick={() => onDeletePlan(item.id)}
                        className="text-rose-500 hover:text-rose-700 font-semibold text-xs transition inline-flex items-center"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 italic">
                    <FolderOpen className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    Chưa có giáo án nào phù hợp trong kho của bạn.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal ("Xem lại") */}
      {previewPlan && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center">
                  <Eye className="w-5 h-5 text-indigo-600 mr-2" /> Xem Lại Giáo Án: {previewPlan.title}
                </h2>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
                  <span>{previewPlan.subject} - {previewPlan.grade}</span>
                  <span>•</span>
                  <span className="font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                    {previewPlan.framework}
                  </span>
                  <span>•</span>
                  <span>Ngày tạo: {previewPlan.dateString}</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewPlan(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="px-4 pt-3 bg-white border-b border-slate-200 flex justify-between items-center">
              <div className="flex space-x-2">
                <button
                  onClick={() => setPreviewTab('integrated')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center border-b-2 ${
                    previewTab === 'integrated'
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                  Đã Tích Hợp NLS & AI
                </button>
                <button
                  onClick={() => setPreviewTab('original')}
                  className={`px-4 py-2 text-xs font-bold rounded-t-lg transition flex items-center border-b-2 ${
                    previewTab === 'original'
                      ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                  Giáo Án Gốc
                </button>
              </div>

              <button
                onClick={() => {
                  onOpenPlan(previewPlan);
                  onSwitchView('studio');
                  setPreviewPlan(null);
                }}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center hover:underline mb-2"
              >
                Mở trong Studio Workstation <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] text-slate-800 text-xs leading-relaxed space-y-4 font-sans">
              {previewTab === 'integrated' ? (
                <div
                  className="prose prose-sm max-w-none space-y-3"
                  dangerouslySetInnerHTML={{ __html: previewPlan.integratedHtml || '<p className="text-slate-400 italic">Chưa có nội dung tích hợp.</p>' }}
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none space-y-3"
                  dangerouslySetInnerHTML={{ __html: previewPlan.originalHtml || '<p className="text-slate-400 italic">Chưa có nội dung gốc.</p>' }}
                />
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-between items-center">
              <span className="text-xs text-slate-500">
                Tự động định dạng font Times New Roman chuẩn Công văn 5512/BGDĐT
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    exportWordDocument(
                      previewPlan.integratedHtml,
                      previewPlan.title,
                      previewPlan.subject,
                      previewPlan.grade
                    );
                    onShowToast('Đã tải xuống file Word!');
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition flex items-center shadow-sm"
                >
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Tải File Word (.docx)
                </button>
                <button
                  onClick={() => setPreviewPlan(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg hover:bg-slate-300 transition"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

