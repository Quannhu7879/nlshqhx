import React from 'react';
import { CompetencyDomain } from '../types';
import { X, Info, ListChecks, Lightbulb, Wrench, Wand2, ShieldCheck } from 'lucide-react';

interface CompetencyModalProps {
  competency: CompetencyDomain | null;
  onClose: () => void;
  onApplyToStudio: (comp: CompetencyDomain) => void;
}

export const CompetencyModal: React.FC<CompetencyModalProps> = ({
  competency,
  onClose,
  onApplyToStudio,
}) => {
  if (!competency) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl font-bold shadow-sm">
              <i className={`fa-solid ${competency.icon}`}></i>
            </div>
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block">
                {competency.code}
              </span>
              <h2 className="text-xl font-bold text-slate-900 leading-snug">{competency.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 p-2 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto custom-scrollbar flex-grow space-y-5 text-xs text-slate-700 pr-1">
          {/* Overview */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h4 className="font-bold text-xs uppercase text-slate-500 mb-1.5 flex items-center">
              <Info className="w-4 h-4 text-indigo-600 mr-1.5" /> Mô Tả Chi Tiết Chuẩn Bộ GD&ĐT
            </h4>
            <p className="text-slate-700 text-xs leading-relaxed">{competency.fullDescription}</p>
          </div>

          {/* Sub-competencies List */}
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-500 mb-2.5 flex items-center">
              <ListChecks className="w-4 h-4 text-indigo-600 mr-1.5" /> Các Năng Lực Thành Phần & Mã Chỉ Báo
            </h4>
            <div className="space-y-2">
              {competency.components.map(item => (
                <div
                  key={item.code}
                  className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between gap-2 shadow-xs"
                >
                  <span className="font-bold text-slate-800 text-xs">
                    {item.code}. {item.title}
                  </span>
                  <span className="bg-indigo-50 text-indigo-700 font-mono text-[11px] font-bold px-2 py-0.5 rounded border border-indigo-100 shrink-0">
                    {item.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Lesson Guide */}
          <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4">
            <h4 className="font-bold text-xs uppercase text-amber-900 mb-1.5 flex items-center">
              <Lightbulb className="w-4 h-4 text-amber-500 mr-1.5" /> Gợi Ý Vị Trí Tích Hợp Vào KHBD (Công văn 5512)
            </h4>
            <p className="text-xs text-amber-900 leading-relaxed">{competency.lessonGuide}</p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-bold text-xs uppercase text-slate-500 mb-2 flex items-center">
              <Wrench className="w-4 h-4 text-emerald-600 mr-1.5" /> Công Cụ AI & Học Liệu Số Đề Xuất
            </h4>
            <div className="flex flex-wrap gap-2">
              {competency.tools.map(tool => (
                <span
                  key={tool}
                  className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-xs px-3 py-1 rounded-lg font-semibold flex items-center"
                >
                  <i className="fa-solid fa-sparkles text-amber-500 mr-1.5"></i> {tool}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 pt-4 mt-4 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 mr-1" /> Chuẩn Thông tư 02/2025 & QĐ 3439
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition"
            >
              Đóng
            </button>
            <button
              onClick={() => onApplyToStudio(competency)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition flex items-center"
            >
              <Wand2 className="w-3.5 h-3.5 mr-1.5 text-amber-300" /> Áp Dụng Vào AI Studio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
