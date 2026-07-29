import React, { useState, useEffect } from 'react';
import mammoth from 'mammoth';
import { LessonPlan, User } from '../types';
import { sampleLessons } from '../data/sampleLessons';
import { competencyLibraryData } from '../data/competencyData';
import {
  parseAndInjectDigitalCompetencies,
  ensureInjectionsInLeftColumn,
  injectDigitalToolLink,
  injectManualCompetencies,
  ManualCompetencyItem
} from '../utils/aiParser';
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
  AlertCircle,
  Link2,
  Folder,
  FileSpreadsheet,
  ClipboardList,
  X,
  Globe,
  ExternalLink,
  CheckSquare,
  ListChecks,
  Search,
  Check,
  PlusCircle,
  Layers,
  BookmarkPlus
} from 'lucide-react';

interface StudioViewProps {
  currentUser?: User | null;
  activePlan?: LessonPlan | null;
  onSaveLesson: (lesson: LessonPlan) => void;
  onShowToast: (msg: string) => void;
}

export const StudioView: React.FC<StudioViewProps> = ({ currentUser, activePlan, onSaveLesson, onShowToast }) => {
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

  // Digital Tool Link Attachment Modal State
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkToolType, setLinkToolType] = useState<'padlet' | 'drive' | 'sheets' | 'forms' | 'other'>('padlet');
  const [linkTitle, setLinkTitle] = useState('Bảng thảo luận Padlet - Nhóm 1-4');
  const [linkUrl, setLinkUrl] = useState('https://padlet.com');
  const [linkDescription, setLinkDescription] = useState('Học sinh truy cập liên kết để đăng sản phẩm thảo luận nhóm.');
  const [linkTargetActivity, setLinkTargetActivity] = useState('hd1');

  // Manual NLS Selection Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedDomainFilter, setSelectedDomainFilter] = useState<string>('all');
  const [selectedComponentCodes, setSelectedComponentCodes] = useState<string[]>([]);
  const [manualTargetActivity, setManualTargetActivity] = useState<string>('hd1');
  const [manualCustomNote, setManualCustomNote] = useState<string>('');
  const [manualSearchQuery, setManualSearchQuery] = useState<string>('');

  const toggleComponentCode = (code: string) => {
    setSelectedComponentCodes(prev =>
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  const selectAllInDomain = (domainId: string) => {
    const domain = competencyLibraryData.find(d => d.id === domainId);
    if (!domain) return;
    const codes = domain.components.map(c => c.code);
    setSelectedComponentCodes(prev => Array.from(new Set([...prev, ...codes])));
  };

  const deselectAllInDomain = (domainId: string) => {
    const domain = competencyLibraryData.find(d => d.id === domainId);
    if (!domain) return;
    const codes = domain.components.map(c => c.code);
    setSelectedComponentCodes(prev => prev.filter(c => !codes.includes(c)));
  };

  const handleApplyManualNLS = () => {
    if (selectedComponentCodes.length === 0) {
      onShowToast('Vui lòng tích chọn ít nhất 1 chỉ báo Năng lực số!');
      return;
    }

    if (!originalHtml && !integratedHtml) {
      onShowToast('Vui lòng tải lên giáo án hoặc nạp bài dạy mẫu trước!');
      return;
    }

    const items: ManualCompetencyItem[] = [];
    competencyLibraryData.forEach(domain => {
      domain.components.forEach(comp => {
        if (selectedComponentCodes.includes(comp.code)) {
          items.push({
            domainCode: domain.code,
            domainTitle: domain.title,
            componentCode: comp.code,
            componentTitle: comp.title,
            tag: comp.tag,
            customNote: manualCustomNote.trim() || undefined,
          });
        }
      });
    });

    let baseHtml = integratedHtml;
    if (!baseHtml) {
      baseHtml = parseAndInjectDigitalCompetencies(originalHtml, subject, grade);
    }

    const updatedHtml = injectManualCompetencies(
      baseHtml,
      items,
      manualTargetActivity,
      'TÍCH HỢP NĂNG LỰC SỐ THỦ CÔNG'
    );

    setIntegratedHtml(updatedHtml);

    // Auto-save
    const newPlan: LessonPlan = {
      id: activePlan?.id || 'plan_' + Date.now(),
      title: lessonTitle,
      subject,
      grade,
      framework,
      template,
      status: 'Đã tích hợp NLS',
      originalHtml,
      integratedHtml: updatedHtml,
      createdAt: Date.now(),
      dateString: new Date().toLocaleDateString('vi-VN'),
      userId: currentUser?.uid,
      authorEmail: currentUser?.email,
    };
    onSaveLesson(newPlan);

    setShowManualModal(false);
    onShowToast(`Đã gán ${items.length} chỉ báo NLS chọn thủ công vào giáo án (Cột 1)!`);
  };

  const applyPreset = (type: 'padlet' | 'drive' | 'sheets' | 'forms') => {
    setLinkToolType(type);
    if (type === 'padlet') {
      setLinkTitle('Bảng thảo luận Padlet - Nhóm 1-4');
      setLinkUrl('https://padlet.com/sample-board');
      setLinkDescription('Học sinh nộp sơ đồ tư duy sản phẩm nhóm và thả tim nhận xét bài làm của các nhóm bạn.');
      setLinkTargetActivity('hd3');
    } else if (type === 'drive') {
      setLinkTitle('Kho học liệu & Video bài giảng Google Drive');
      setLinkUrl('https://drive.google.com/drive/folders/sample');
      setLinkDescription('Thư mục chứa video mô phỏng, phiếu bài tập và tư liệu tham khảo mở rộng.');
      setLinkTargetActivity('hd2');
    } else if (type === 'sheets') {
      setLinkTitle('Bảng theo dõi & Thống kê kết quả Google Trang tính');
      setLinkUrl('https://docs.google.com/spreadsheets/d/sample');
      setLinkDescription('Học sinh điền số liệu thực nghiệm và quan sát bảng tổng hợp tự động.');
      setLinkTargetActivity('hd3');
    } else if (type === 'forms') {
      setLinkTitle('Phiếu khảo sát & Trắc nghiệm Google Forms');
      setLinkUrl('https://docs.google.com/forms/d/sample');
      setLinkDescription('Bài kiểm tra đánh giá nhanh 10 câu trắc nghiệm khách quan đầu/cuối giờ.');
      setLinkTargetActivity('hd1');
    }
  };

  const handleInsertLink = () => {
    if (!originalHtml && !integratedHtml) {
      onShowToast('Vui lòng tải lên giáo án hoặc nạp bài dạy mẫu trước khi gán link!');
      return;
    }

    let baseHtml = integratedHtml;
    if (!baseHtml) {
      baseHtml = parseAndInjectDigitalCompetencies(originalHtml, subject, grade);
    }

    const updatedHtml = injectDigitalToolLink(
      baseHtml,
      linkToolType,
      linkTitle,
      linkUrl,
      linkDescription,
      linkTargetActivity
    );

    setIntegratedHtml(updatedHtml);

    // Auto-save to repository
    const newPlan: LessonPlan = {
      id: activePlan?.id || 'plan_' + Date.now(),
      title: lessonTitle,
      subject,
      grade,
      framework,
      template,
      status: 'Đã tích hợp NLS',
      originalHtml,
      integratedHtml: updatedHtml,
      createdAt: Date.now(),
      dateString: new Date().toLocaleDateString('vi-VN'),
      userId: currentUser?.uid,
      authorEmail: currentUser?.email,
    };
    onSaveLesson(newPlan);

    setShowLinkModal(false);
    onShowToast(`Đã gán link ${linkToolType.toUpperCase()} vào Cột 1 (Hoạt động GV & HS)!`);
  };

  // Load activePlan if passed from Repository ("Xem lại")
  useEffect(() => {
    if (activePlan) {
      setSubject(activePlan.subject || 'Toán học');
      setGrade(activePlan.grade || 'Lớp 10');
      setFramework(activePlan.framework || 'TT 02/2025/TT-BGDĐT');
      setTemplate(activePlan.template || 'CV 5512/BGDĐT-GDTrH');
      setLessonTitle(activePlan.title || 'Bài dạy');
      setOriginalHtml(activePlan.originalHtml || '');
      setIntegratedHtml(ensureInjectionsInLeftColumn(activePlan.integratedHtml || ''));
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
        resultHtml = ensureInjectionsInLeftColumn(data.integratedHtml);
        onShowToast('Đã tích hợp NLS & AI thành công bằng Gemini 3.6 Flash!');
      } else {
        // Fallback to client smart parser
        resultHtml = ensureInjectionsInLeftColumn(parseAndInjectDigitalCompetencies(originalHtml, subject, grade));
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
        userId: currentUser?.uid,
        authorEmail: currentUser?.email,
      };

      onSaveLesson(newPlan);
    } catch (err) {
      console.error(err);
      clearInterval(timer);
      setProgress(100);

      // Client smart parser fallback
      const fallbackHtml = ensureInjectionsInLeftColumn(parseAndInjectDigitalCompetencies(originalHtml, subject, grade));
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
        userId: currentUser?.uid,
        authorEmail: currentUser?.email,
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

          <button
            onClick={() => setShowManualModal(true)}
            className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200 transition flex items-center shadow-xs"
          >
            <CheckSquare className="w-4 h-4 mr-1.5 text-purple-600" />
            Tích Chọn Miền NLS Thủ Công
          </button>

          <button
            onClick={() => setShowLinkModal(true)}
            className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition flex items-center shadow-xs"
          >
            <Link2 className="w-4 h-4 mr-1.5 text-indigo-600" />
            Gán Link Công Cụ Số
          </button>

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
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setShowManualModal(true)}
                className="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs rounded-lg transition border border-purple-200 flex items-center shadow-xs"
              >
                <CheckSquare className="w-4 h-4 mr-1.5 text-purple-600" />
                Tích Chọn Miền NLS Thủ Công
              </button>

              <button
                onClick={() => setShowLinkModal(true)}
                className="px-3.5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition border border-indigo-200 flex items-center shadow-xs"
              >
                <Link2 className="w-4 h-4 mr-1.5 text-indigo-600" />
                Gán Link Padlet / Google
              </button>

              <button
                onClick={handleRunAI}
                disabled={isProcessing}
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs rounded-lg shadow-md hover:shadow-lg transition flex items-center disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 mr-2 text-amber-300" />
                Phân Tích & Tích Hợp NLS Bằng AI
              </button>
            </div>
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
                  <div className="docx-content w-full" dangerouslySetInnerHTML={{ __html: integratedHtml }} />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center py-12">
                    <Wand2 className="w-10 h-10 mb-3 text-slate-300" />
                    <p className="font-medium text-slate-600 text-sm">Chưa kích hoạt phân tích AI</p>
                    <p className="text-xs max-w-xs text-slate-400 mt-1">
                      Bấm nút "Phân Tích & Tích Hợp NLS Bằng AI" hoặc "Gán Link Padlet / Google" để chèn nội dung vào giáo án.
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
                className="p-5 overflow-y-auto custom-scrollbar flex-grow space-y-3 text-slate-800 text-xs leading-relaxed docx-content w-full"
                dangerouslySetInnerHTML={{ __html: originalHtml }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Digital Tool Link Attachment Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/30 flex items-center justify-center border border-indigo-400/30">
                  <Link2 className="w-5 h-5 text-indigo-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Gán Link Công Cụ Số & Học Liệu</h3>
                  <p className="text-[11px] text-indigo-200">
                    Chèn link Padlet, Google Drive, Trang tính, Forms vào Cột 1 (Hoạt động GV & HS)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Presets Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  1. Chọn Nhanh Mẫu Công Cụ Phổ Biến
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPreset('padlet')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      linkToolType === 'padlet'
                        ? 'border-pink-500 bg-pink-50/80 text-pink-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-pink-600 flex items-center">
                      📌 Padlet
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">Thảo luận nhóm</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('drive')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      linkToolType === 'drive'
                        ? 'border-amber-500 bg-amber-50/80 text-amber-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-amber-600 flex items-center">
                      📁 Google Drive
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">Kho học liệu/video</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('sheets')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      linkToolType === 'sheets'
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-emerald-600 flex items-center">
                      📊 Trang tính
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">Bảng tính & số liệu</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPreset('forms')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      linkToolType === 'forms'
                        ? 'border-purple-500 bg-purple-50/80 text-purple-900 font-bold shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-purple-600 flex items-center">
                      📝 Google Forms
                    </span>
                    <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">Khảo sát & bài tập</span>
                  </button>
                </div>
              </div>

              {/* Form Inputs */}
              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Tiêu Đề Hiển Thị Trên Giáo Án
                  </label>
                  <input
                    type="text"
                    value={linkTitle}
                    onChange={e => setLinkTitle(e.target.value)}
                    placeholder="VD: Bảng Padlet nộp bài thảo luận nhóm 1-4"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Đường Dẫn Liên Kết (URL)
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      placeholder="https://padlet.com/..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <Globe className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    4. Hướng Dẫn Nhiệm Vụ Cho Học Sinh
                  </label>
                  <textarea
                    rows={2}
                    value={linkDescription}
                    onChange={e => setLinkDescription(e.target.value)}
                    placeholder="VD: Học sinh truy cập link Padlet, tải ảnh sản phẩm nhóm và bình luận bài làm..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    5. Vị Trí Hoạt Động Cần Gán (Cột 1: GV & HS)
                  </label>
                  <select
                    value={linkTargetActivity}
                    onChange={e => setLinkTargetActivity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="hd1">Hoạt động 1: Mở đầu / Khởi động</option>
                    <option value="hd2">Hoạt động 2: Hình thành kiến thức mới</option>
                    <option value="hd3">Hoạt động 3: Luyện tập / Tổng kết</option>
                    <option value="hd4">Hoạt động 4: Vận dụng / Mở rộng</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleInsertLink}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center"
                >
                  <Link2 className="w-4 h-4 mr-1.5" />
                  Chèn Link Vào Giáo Án (Cột 1)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual NLS Competency Picker Modal */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden my-auto flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex justify-between items-center shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center border border-purple-400/30 shrink-0">
                  <CheckSquare className="w-5 h-5 text-purple-300" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base flex items-center gap-2">
                    Tích Chọn Miền Năng Lực Số & AI Thủ Công
                  </h3>
                  <p className="text-[11px] text-purple-200 mt-0.5">
                    Chọn các chỉ báo thuộc 6 Miền TT 02/2025 & QĐ 3439 để gán vào vị trí cụ thể trong giáo án gốc
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-slate-300 hover:text-white p-1.5 bg-white/10 hover:bg-white/20 rounded-xl transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
              {/* Domain Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto custom-scrollbar pb-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedDomainFilter('all')}
                  className={`px-3 py-1.5 rounded-lg font-bold transition shrink-0 ${
                    selectedDomainFilter === 'all'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  Tất cả 6 Miền
                </button>
                {competencyLibraryData.map(d => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDomainFilter(d.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition shrink-0 flex items-center gap-1.5 ${
                      selectedDomainFilter === d.id
                        ? 'bg-purple-600 text-white shadow-xs font-bold'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{d.code.split('-')[0]}</span>
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo mã (1.1, 2.4, 6.3), từ khóa (tìm kiếm, AI, bản quyền, Padlet)..."
                  value={manualSearchQuery}
                  onChange={e => setManualSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none shadow-xs"
                />
                {manualSearchQuery && (
                  <button
                    onClick={() => setManualSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Component Selection List */}
            <div className="p-4 overflow-y-auto custom-scrollbar flex-grow space-y-4">
              {competencyLibraryData
                .filter(d => selectedDomainFilter === 'all' || d.id === selectedDomainFilter)
                .map(domain => {
                  const filteredComponents = domain.components.filter(c => {
                    if (!manualSearchQuery.trim()) return true;
                    const q = manualSearchQuery.toLowerCase();
                    return (
                      c.code.toLowerCase().includes(q) ||
                      c.title.toLowerCase().includes(q) ||
                      c.tag.toLowerCase().includes(q) ||
                      domain.title.toLowerCase().includes(q)
                    );
                  });

                  if (filteredComponents.length === 0) return null;

                  const allSelectedInDomain = domain.components.every(c =>
                    selectedComponentCodes.includes(c.code)
                  );

                  return (
                    <div
                      key={domain.id}
                      className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs space-y-2.5"
                    >
                      {/* Domain Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs">
                            <i className={`fa-solid ${domain.icon}`}></i>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider block">
                              {domain.code}
                            </span>
                            <h4 className="font-bold text-xs text-slate-900">{domain.title}</h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              allSelectedInDomain
                                ? deselectAllInDomain(domain.id)
                                : selectAllInDomain(domain.id)
                            }
                            className="text-[11px] font-semibold text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition"
                          >
                            {allSelectedInDomain ? 'Bỏ chọn tất cả' : 'Chọn tất cả miền này'}
                          </button>
                        </div>
                      </div>

                      {/* Sub-competencies Checkboxes Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {filteredComponents.map(comp => {
                          const isChecked = selectedComponentCodes.includes(comp.code);
                          return (
                            <label
                              key={comp.code}
                              onClick={() => toggleComponentCode(comp.code)}
                              className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2.5 cursor-pointer ${
                                isChecked
                                  ? 'border-purple-500 bg-purple-50/80 shadow-xs'
                                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/80'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {}}
                                className="mt-0.5 w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500 shrink-0 cursor-pointer"
                              />
                              <div className="flex-grow min-w-0">
                                <div className="flex items-center justify-between gap-1 mb-0.5">
                                  <span className="font-bold text-xs text-slate-900 font-mono">
                                    {comp.code}
                                  </span>
                                  <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold px-1.5 py-0.5 rounded border border-indigo-100 shrink-0">
                                    {comp.tag}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-700 leading-snug line-clamp-2">
                                  {comp.title}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Placement & Custom Instructions Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center">
                    <BookmarkPlus className="w-3.5 h-3.5 text-purple-600 mr-1.5" />
                    Vị Trí Gán Trong Giáo Án Gốc (Cột 1)
                  </label>
                  <select
                    value={manualTargetActivity}
                    onChange={e => setManualTargetActivity(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none shadow-xs"
                  >
                    <option value="muc_tieu">I. Tích hợp Năng lực số & AI (Mục tiêu)</option>
                    <option value="hd1">II. Hoạt động 1: Mở đầu / Khởi động</option>
                    <option value="hd2">II. Hoạt động 2: Hình thành kiến thức mới</option>
                    <option value="hd3">II. Hoạt động 3: Luyện tập / Tổng kết</option>
                    <option value="hd4">II. Hoạt động 4: Vận dụng / Mở rộng</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 mr-1.5" />
                    Hướng Dẫn / Nhiệm Vụ GV Cụ Thể (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="VD: GV hướng dẫn HS dùng ChatGPT tra cứu & nộp Padlet..."
                    value={manualCustomNote}
                    onChange={e => setManualCustomNote(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-1">
                <div className="text-xs font-bold text-purple-700 bg-purple-100/80 px-3 py-1.5 rounded-lg border border-purple-200 flex items-center shrink-0">
                  <CheckSquare className="w-4 h-4 mr-1.5 text-purple-600" />
                  Đã chọn: <span className="text-purple-900 font-mono text-sm ml-1 mr-1">{selectedComponentCodes.length}</span> chỉ báo NLS
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => setShowManualModal(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyManualNLS}
                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition flex items-center"
                  >
                    <PlusCircle className="w-4 h-4 mr-1.5" />
                    Gán NLS Đã Chọn Vào Giáo Án (Cột 1)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
