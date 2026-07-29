import React from 'react';
import { legalDocsData } from '../data/competencyData';
import { ArrowRight, FileText, Bot, Pencil, ListChecks } from 'lucide-react';

export const LegalView: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center space-x-3 mb-2">
          <span className="px-3 py-1 bg-rose-100 text-rose-800 font-bold text-xs rounded-full">
            Cơ Sở Pháp Lý Cốt Lõi
          </span>
          <span className="text-xs text-slate-500">Bộ Giáo Dục Và Đào Tạo Ban Hành</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Văn Bản Quy Phạm Pháp Luật & Khung Chuẩn Tích Hợp</h1>
        <p className="text-xs text-slate-500 mt-1">
          Căn cứ pháp lý bắt buộc và hướng dẫn kỹ thuật khi đưa Năng lực số & AI vào Kế hoạch bài dạy (KHBD)
        </p>
      </div>

      {/* Legal Documents Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {legalDocsData.map(doc => (
          <div
            key={doc.id}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl font-bold mb-4">
                <i className={`fa-solid ${doc.icon}`}></i>
              </div>
              <span className="text-xs font-bold text-indigo-600 uppercase">{doc.code}</span>
              <h3 className="font-bold text-slate-800 text-sm mt-1 mb-2">{doc.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{doc.summary}</p>
            </div>
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{doc.authority} — {doc.date}</span>
              <span className="text-xs text-indigo-600 font-bold inline-flex items-center">
                Xem chi tiết <ArrowRight className="w-3 h-3 ml-1" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Cross Reference Mapping Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
          <ListChecks className="w-4 h-4 text-indigo-600 mr-2" /> Bảng Mã Chỉ Báo Tích Hợp Năng Lực Số & AI Trực Tiếp Vào Giáo Án
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <th className="p-3 border-r border-slate-200">Miền / Mạch Năng Lực</th>
                <th className="p-3 border-r border-slate-200">Căn Cứ Pháp Lý</th>
                <th className="p-3 border-r border-slate-200">Mã Chỉ Báo / Tag Tích Hợp</th>
                <th className="p-3">Gợi Ý Vị Trí Chèn Trong KHBD (CV 5512)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-3 font-medium text-slate-800 border-r border-slate-200">
                  1. Khai thác dữ liệu và thông tin
                </td>
                <td className="p-3 border-r border-slate-200">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">TT 02/2025</span>
                </td>
                <td className="p-3 border-r border-slate-200 font-mono text-indigo-700 font-bold">
                  [NLS 1.1-a], [NLS 1.2-b]
                </td>
                <td className="p-3">Hoạt động 1 (Khởi động) & Hoạt động 2 (Hình thành kiến thức)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800 border-r border-slate-200">
                  2. Giao tiếp và hợp tác số
                </td>
                <td className="p-3 border-r border-slate-200">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">TT 02/2025</span>
                </td>
                <td className="p-3 border-r border-slate-200 font-mono text-indigo-700 font-bold">
                  [NLS 2.1-b], [NLS 2.4-a]
                </td>
                <td className="p-3">Hoạt động 2 & 3 (Thảo luận nhóm trên Padlet, Google Docs)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800 border-r border-slate-200">
                  3. Sáng tạo nội dung số
                </td>
                <td className="p-3 border-r border-slate-200">
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-semibold">TT 02/2025</span>
                </td>
                <td className="p-3 border-r border-slate-200 font-mono text-indigo-700 font-bold">
                  [NLS 3.1-a], [NLS 3.3-a]
                </td>
                <td className="p-3">Hoạt động 3 (Luyện tập) & Hoạt động 4 (Tạo Video/Infographic)</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800 border-r border-slate-200">
                  4. Đạo đức AI & An toàn số
                </td>
                <td className="p-3 border-r border-slate-200">
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold">QĐ 3439 - NLb</span>
                </td>
                <td className="p-3 border-r border-slate-200 font-mono text-amber-700 font-bold">
                  [AI-NLb: Đạo đức AI], [NLS 4.2-c]
                </td>
                <td className="p-3">Mục tiêu Phẩm chất & Hoạt động thực hành với công cụ AI Generative</td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-slate-800 border-r border-slate-200">
                  5. Kĩ thuật & Ứng dụng AI
                </td>
                <td className="p-3 border-r border-slate-200">
                  <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded font-semibold">QĐ 3439 - NLc</span>
                </td>
                <td className="p-3 border-r border-slate-200 font-mono text-amber-700 font-bold">
                  [AI-NLc: Prompting], [AI-NLc: Model]
                </td>
                <td className="p-3">Hoạt động 2 & 3 (Dùng ChatGPT/GeoGebra/Quizizz hỗ trợ giải toán, viết)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
