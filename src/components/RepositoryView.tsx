import React, { useState } from 'react';
import { LessonPlan, ViewMode } from '../types';
import { exportWordDocument } from '../utils/wordExporter';
import { Search, Eye, Trash2, Plus, Download, FolderOpen, Check } from 'lucide-react';

interface RepositoryViewProps {
  lessonPlans: LessonPlan[];
  onOpenPlan: (plan: LessonPlan) => void;
  onDeletePlan: (id: string) => void;
  onSwitchView: (view: ViewMode) => void;
  onShowToast: (msg: string) => void;
}

export const RepositoryView: React.FC<RepositoryViewProps> = ({
  lessonPlans,
  onOpenPlan,
  onDeletePlan,
  onSwitchView,
  onShowToast,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('Tất cả môn học');

  const filteredPlans = lessonPlans.filter(item => {
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
                          onSwitchView('studio');
                        }}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-xs transition inline-flex items-center"
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
    </div>
  );
};
