import React, { useState } from 'react';
import { CompetencyDomain, ViewMode } from '../types';
import { competencyLibraryData } from '../data/competencyData';
import { Search, ArrowRight, Sparkles, Hand } from 'lucide-react';

interface LibraryViewProps {
  onSelectCompetency: (comp: CompetencyDomain) => void;
  onSwitchView: (view: ViewMode) => void;
}

export const LibraryView: React.FC<LibraryViewProps> = ({ onSelectCompetency }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCompetencies = competencyLibraryData.filter(
    c =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Thư Viện Năng Lực Số & AI Dành Cho Giáo Viên</h1>
        <p className="text-xs text-slate-500 mt-1">
          Tra cứu 6 miền năng lực theo Thông tư 02/2025/TT-BGDĐT và 4 mạch năng lực AI theo QĐ 3439/QĐ-BGDĐT.{' '}
          <span className="text-indigo-600 font-semibold inline-flex items-center">
            <Hand className="w-3.5 h-3.5 mr-1 ml-1 text-amber-500" /> Nhấp vào bất kỳ thẻ nào bên dưới để xem chi tiết & hướng dẫn tích hợp.
          </span>
        </p>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Tìm kiếm miền năng lực, công cụ AI, từ khóa..."
          className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
        />
      </div>

      {/* Competency Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompetencies.map(comp => (
          <div
            key={comp.id}
            onClick={() => onSelectCompetency(comp)}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-400 hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center text-xl transition-colors shadow-sm">
                  <i className={`fa-solid ${comp.icon}`}></i>
                </div>
                <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full group-hover:bg-indigo-100 transition flex items-center">
                  Chi tiết <ArrowRight className="w-3 h-3 ml-1" />
                </span>
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide block mb-1">
                {comp.code}
              </span>
              <h3 className="font-bold text-slate-800 text-base leading-snug mb-2 group-hover:text-indigo-600 transition">
                {comp.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{comp.description}</p>
            </div>

            <div className="border-t border-slate-100 pt-3 mt-2">
              <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                Công cụ AI & Số đề xuất:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {comp.tools.map(tool => (
                  <span
                    key={tool}
                    className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-medium group-hover:bg-slate-200 transition"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
