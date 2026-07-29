import React from 'react';
import { ViewMode } from '../types';
import { Sparkles, Upload, BookOpen, Wand2, Download, FileCheck, Layers } from 'lucide-react';

interface LandingViewProps {
  onSwitchView: (view: ViewMode) => void;
}

export const LandingView: React.FC<LandingViewProps> = ({ onSwitchView }) => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8 rounded-3xl shadow-xl my-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent"></div>
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-6">
            <Sparkles className="w-3.5 h-3.5 mr-2 text-amber-400" />
            Chuẩn Khung Năng Lực Số & AI Bộ GD&ĐT
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight uppercase">
            Tích Hợp{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-pink-400 to-amber-300">
              Năng Lực Số
            </span>{' '}
            Trong Dạy Học
          </h1>
        </div>
      </div>

      {/* Workflow Step Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Quy Trình Tích Hợp Tự Động</h2>
          <p className="text-slate-600 mt-2 text-sm">Dựa trên Khung Tiêu chuẩn Giáo dục Kỹ thuật số & AI Việt Nam</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold mb-4">
              1
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Tải File Giáo Án Gốc</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Hỗ trợ định dạng .docx hoặc .txt. Hệ thống tự động phân tích Mục tiêu & Các hoạt động dạy học.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center text-xl font-bold mb-4">
              2
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Cấu Hình Khung NLS</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Chọn môn học, khối lớp và chuẩn NLS (Khung TT 02/2025/TT-BGDĐT hoặc QĐ 3439/QĐ-BGDĐT).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-xl font-bold mb-4">
              3
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">AI Bóc Tách & Tích Hợp</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Gợi ý thiết bị số, ứng dụng AI (Canva, Quizizz, GeoGebra) & thẻ mã chỉ báo năng lực cụ thể.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl font-bold mb-4">
              4
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">Duyệt & Tải File Word</h3>
            <p className="text-slate-600 text-xs leading-relaxed">
              Xem bản so sánh 2 cột trực quan và xuất file Word (.doc/.docx) hoàn thiện về máy tính.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Chuẩn Công văn 5512</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Giữ đúng cấu trúc 4 Hoạt động chuẩn (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng).
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl shrink-0">
              <Wand2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Xử Lý AI Server-Side Gemini</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mô hình Gemini 3.6 Flash sinh nội dung sắc nét, chuẩn thuật ngữ sư phạm hiện đại.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">Xuất Word Trực Tiếp</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tệp xuất ra giữ nguyên định dạng Times New Roman 14pt, bảng biểu và viền màu đúng quy định.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
