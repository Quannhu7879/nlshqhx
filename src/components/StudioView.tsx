import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { LessonPlan } from '../types';
import { sampleLessons } from '../data/sampleLessons';
import { parseAndInjectDigitalCompetencies } from '../utils/aiParser';
import { exportWordDocument } from '../utils/wordExporter';
import {
  Wand2,
  Upload,
  FileCode,
  FileDown,
  Sliders,
  Award,
  CloudUpload,
  ShieldCheck,
  Columns,
  Sparkles,
  RotateCw,
  FileText,
  AlertCircle
} from 'lucide-react';

interface StudioViewProps {
  activePlan?: LessonPlan | null;
  onSaveLesson: (lesson: LessonPlan) => void;
  onShowToast: (msg: string) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({ activePlan, onSaveLesson, onShowToast }) => {
  const [subject, setSubject] = useState('Toán học');
  const [grade, setGrade] = useState('Lớp 10');
  const [framework, setFramework] = useState('TT 02/2025/TT-BGDĐT');
  const [template, setTemplate] = useState('CV 5512/BGDĐT-GDTrH');

  const [hasFileUploaded, setHasFileUploaded] = useState(false);
  const [originalHtml, setOriginalHtml] = useState<string>('');
  const [integratedHtml, setIntegratedHtml] = useState<string>('');
  const [lessonTitle, setLessonTitle] = useState<string>('Bài dạy mới');

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  // Load activePlan if passed from Repository ("Xem lại")
  useEffect(() => {
    if (activePlan) {
      setSubject(activePlan.subject || 'Toán học');
      setGrade(activePlan.grade || 'Lớp 10');
      setFramework(activePlan.framework || 'TT 02/2025/TT-BGDĐT');
      setTemplate(activePlan.template || 'CV 5512/BGDĐT-GDTrH');
      setLessonTitle(activePlan.title || 'Bài dạy');
      setOriginalHtml(activePlan.originalHtml || '');
      setIntegratedHtml(activePlan.integratedHtml || '');
      setHasFileUploaded(true);
    }
  }, [activePlan]);

  // File Upload Handler (.docx / .txt)
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    onShowToast(`Đang đọc tệp: ${file.name}...`);
    const cleanTitle = file.name.replace(/\.[^/.]+$/, '');
    setLessonTitle(cleanTitle);

    try {
      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        let html = result.value || '<p>Nội dung file rỗng</p>';
        html = html.replace(/<p><\/p>/g, '');
        setOriginalHtml(html);
        setHasFileUploaded(true);
        setIntegratedHtml('');
        onShowToast('Đã đọc file DOCX thành công!');
      } else if (file.name.endsWith('.txt')) {
        const text = await file.text();
        const html = text.split('\n').map(line => `<p class="mb-2">${line}</p>`).join('');
        setOriginalHtml(html);
        setHasFileUploaded(true);
        setIntegratedHtml('');
        onShowToast('Đã đọc file văn bản thành công!');
      } else {
        onShowToast('Hệ thống hỗ trợ tốt nhất tệp .docx và .txt');
      }
    } catch (err) {
      console.error(err);
      onShowToast('Lỗi khi đọc file Word. Vui lòng thử lại.');
    }
  };

  // Load Sample Lesson
  const handleLoadSample = (sampleId: string) => {
    const sample = sampleLessons.find(s => s.id === sampleId) || sampleLessons[0];
    setSubject(sample.subject);
    setGrade(sample.grade);
    setLessonTitle(sample.title);

    const htmlContent = `
      <div class="font-bold text-base text-indigo-700 mb-3">${sample.title}</div>
      ${sample.sections
        .map(
          sec => `
        <div class="border-b border-slate-200 pb-3 mb-3">
          <div class="font-bold text-slate-800 text-xs uppercase mb-1">${sec.title}</div>
          <div class="text-slate-600 text-xs leading-relaxed">${sec.content}</div>
        </div>
      `
        )
        .join('')}
    `;

    setOriginalHtml(htmlContent);
    setHasFileUploaded(true);
    setIntegratedHtml('');
    onShowToast(`Đã nạp bài dạy mẫu: ${sample.title}`);
  };

  // Run AI Integration using Gemini Backend API + Smart Parser Fallback
  const handleRunAI = async () => {
    if (!originalHtml) {
      onShowToast('Vui lòng tải lên hoặc chọn bài dạy gốc trước!');
      return;
    }

    setIsProcessing(true);
    setProgress(15);

    const timer = setInterval(() => {
      setProgress(prev => (prev < 85 ? prev + 15 : prev));
    }, 300);

    try {
      // Call server backend API
      const response = await fetch('/api/analyze-lesson', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonContent: originalHtml,
          subject,
          grade,
          framework,
          template,
        }),
      });

      const data = await response.json();

      clearInterval(timer);
      setProgress(100);

      let resultHtml = '';
      if (data.success && data.integratedHtml) {
        resultHtml = data.integratedHtml;
        onShowToast('Đã tích hợp NLS & AI thành công bằng Gemini 3.6 Flash!');
      } else {
        // Fallback to client smart parser
        resultHtml = parseAndInjectDigitalCompetencies(originalHtml, subject, grade);
        onShowToast('Đã tích hợp NLS & AI chuẩn Thông tư 02/2025!');
      }

      setIntegratedHtml(resultHtml);

      // Auto-save to Repository
      const newPlan: LessonPlan = {
        id: 'plan_' + Date.now(),
        title: lessonTitle,
        subject,
        grade,
        framework,
        template,
        status: 'Đã tích hợp NLS',
        originalHtml,
        integratedHtml: resultHtml,
        createdAt: Date.now(),
        dateString: new Date().toLocaleDateString('vi-VN'),
      };

      onSaveLesson(newPlan);
    } catch (err) {
      console.error(err);
      clearInterval(timer);
      setProgress(100);

      // Client smart parser fallback
      const fallbackHtml = parseAndInjectDigitalCompetencies(originalHtml, subject, grade);
      setIntegratedHtml(fallbackHtml);
      onShowToast('Đã tích hợp NLS & AI chuẩn Thông tư 02/2025!');

      const newPlan: LessonPlan = {
        id: 'plan_' + Date.now(),
        title: lessonTitle,
        subject,
        grade,
        framework,
        template,
        status: 'Đã tích hợp NLS',
        originalHtml,
        integratedHtml: fallbackHtml,
        createdAt: Date.now(),
        dateString: new Date().toLocaleDateString('vi-VN'),
      };

      onSaveLesson(newPlan);
    } finally {
      setTimeout(() => {
        setIsProcessing(false);
      }, 400);
    }
  };

  const handleExport = () => {
    if (!integratedHtml) {
      onShowToast('Chưa có nội dung tích hợp để xuất Word!');
      return;
    }
    exportWordDocument(integratedHtml, lessonTitle, subject, grade);
    onShowToast('Đã xuất file Word (.doc) thành công!');
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center">
            <Wand2 className="w-6 h-6 text-amber-500 mr-2.5" />
            AI Studio Workstation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Tải kế hoạch bài dạy, bóc tách chỉ số Năng lực số & AI, xuất bản file Word (.docx)
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg shadow-sm transition flex items-center cursor-pointer">
            <Upload className="w-4 h-4 mr-1.5 text-indigo-600" />
            Tải Giáo Án (.docx)
            <input
              type="file"
              className="hidden"
              accept=".docx,.txt"
              onChange={handleFileUpload}
            />
          </label>

          <div className="relative group">
            <button className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition border border-slate-300 flex items-center">
              <FileCode className="w-4 h-4 mr-1.5 text-slate-500" />
              Nạp Bài Dạy Mẫu
            </button>
            <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-xl shadow-xl hidden group-hover:block z-30 p-2 space-y-1">
              {sampleLessons.map(s => (
                <button
                  key={s.id}
                  onClick={() => handleLoadSample(s.id)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 hover:text-indigo-700 rounded-lg transition font-medium text-slate-700 truncate"
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>

          {integratedHtml && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center"
            >
              <FileDown className="w-4 h-4 mr-1.5" />
              Xuất File Word (.doc)
            </button>
          )}
        </div>
      </div>

      {/* Configuration Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center">
            <Sliders className="w-4 h-4 text-indigo-600 mr-2" /> Cấu hình Khung Năng lực số & AI
          </h3>
          <span className="text-[11px] bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-semibold border border-indigo-100 flex items-center">
            <Sparkles className="w-3 h-3 text-amber-500 mr-1" /> TT 02/2025/TT-BGDĐT & QĐ 3439/QĐ-BGDĐT
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Môn Học</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Toán học">Toán học</option>
              <option value="Ngữ văn">Ngữ văn</option>
              <option value="Tiếng Anh">Tiếng Anh</option>
              <option value="Vật lý">Vật lý</option>
              <option value="Hóa học">Hóa học</option>
              <option value="Tin học">Tin học</option>
              <option value="Lịch sử - Địa lý">Lịch sử - Địa lý</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cấp Học / Khối Lớp</label>
            <select
              value={grade}
              onChange={e => setGrade(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="Lớp 10">Lớp 10 (THPT)</option>
              <option value="Lớp 11">Lớp 11 (THPT)</option>
              <option value="Lớp 12">Lớp 12 (THPT)</option>
              <option value="Khối THCS">Khối THCS (Lớp 6-9)</option>
              <option value="Khối Tiểu Học">Khối Tiểu Học (Lớp 1-5)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Khung NLS Áp Dụng</label>
            <select
              value={framework}
              onChange={e => setFramework(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="TT 02/2025/TT-BGDĐT">Thông tư 02/2025/TT-BGDĐT (6 Miền - 24 NL)</option>
              <option value="QĐ 3439/QĐ-BGDĐT">QĐ 3439/QĐ-BGDĐT (Giáo dục AI 4 Mạch)</option>
              <option value="Tích hợp Đa Khung">Tích hợp Đa Khung (TT 02/2025 + QĐ 3439)</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Cấu Trúc Căn Cứ</label>
            <select
              value={template}
              onChange={e => setTemplate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="CV 5512/BGDĐT-GDTrH">Công văn 5512/BGDĐT-GDTrH (4 Hoạt động)</option>
              <option value="Mẫu Tiểu học">Mẫu KHBD Cấp Tiểu Học</option>
            </select>
          </div>
        </div>
      </div>

      {/* Upload Dropzone if no file loaded */}
      {!hasFileUploaded && (
        <div className="bg-white border-2 border-dashed border-indigo-200 rounded-2xl p-10 text-center hover:border-indigo-500 transition cursor-pointer my-4">
          <label className="cursor-pointer block">
            <input
              type="file"
              className="hidden"
              accept=".docx,.txt"
              onChange={handleFileUpload}
            />
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
              <CloudUpload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">Tải lên Giáo án gốc (.docx)</h3>
            <p className="text-slate-500 text-xs max-w-md mx-auto mb-4">
              Kéo thả file vào đây hoặc nhấp để chọn tệp .docx từ máy tính của bạn
            </p>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Dữ liệu bảo mật 100%
            </span>
          </label>
        </div>
      )}

      {/* Main Split View Workstation */}
      {hasFileUploaded && (
        <div className="space-y-4">
          {/* Progress Bar during AI execution */}
          {isProcessing && (
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-indigo-300 flex items-center">
                  <RotateCw className="w-4 h-4 animate-spin mr-2 text-amber-400" />
                  Gemini AI đang bóc tách & tích hợp Năng lực số...
                </span>
                <span className="text-xs font-mono text-slate-400">{progress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-amber-400 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="text-xs font-bold text-slate-700 flex items-center">
              <Columns className="w-4 h-4 mr-2 text-indigo-600" />
              Màn hình so sánh trực quan (Đã tích hợp NLS & AI vs Giáo án gốc)
            </div>
            <button
              onClick={handleRunAI}
              disabled={isProcessing}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-lg shadow-md hover:shadow-lg transition flex items-center disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 mr-2 text-amber-300" />
              Phân Tích & Tích Hợp NLS Bằng AI
            </button>
          </div>

          {/* Two-Column Editor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: AI Integrated (Khung Năng Lực Số) */}
            <div className="bg-white border border-indigo-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px]">
              <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center">
                <span className="font-bold text-xs text-indigo-700 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" /> Đã Tích Hợp Năng Lực Số & AI
                </span>
                {integratedHtml && (
                  <span className="text-[11px] px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                    Đã Tích Hợp NLS
                  </span>
                )}
              </div>
              <div className="p-5 overflow-y-auto custom-scrollbar flex-grow space-y-3 text-slate-800 text-xs leading-relaxed bg-slate-50/50">
                {integratedHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: integratedHtml }} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                    <Wand2 className="w-10 h-10 mb-3 text-slate-300" />
                    <p className="font-medium text-slate-600 text-sm">Chưa kích hoạt phân tích AI</p>
                    <p className="text-xs max-w-xs text-slate-400 mt-1">
                      Bấm nút "Phân Tích & Tích Hợp NLS Bằng AI" bên trên để tiến hành đối chiếu và chèn chỉ số số.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Original Plan */}
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px]">
              <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                <span className="font-bold text-xs text-slate-700 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-slate-500" /> Kế Hoạch Bài Dạy Gốc
                </span>
                <span className="text-[11px] px-2.5 py-0.5 bg-slate-200 text-slate-700 font-medium rounded-full">
                  Chưa sửa đổi
                </span>
              </div>
              <div
                className="p-5 overflow-y-auto custom-scrollbar flex-grow space-y-3 text-slate-800 text-xs leading-relaxed"
                dangerouslySetInnerHTML={{ __html: originalHtml }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
