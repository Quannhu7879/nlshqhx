import { ensureInjectionsInLeftColumn } from './aiParser';

export function exportWordDocument(
  contentHtml: string,
  title: string = 'Kế hoạch bài dạy',
  subject: string = 'Toán học',
  grade: string = 'Lớp 10'
) {
  const wordHeader = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm 20mm 20mm 25mm;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 14pt;
          line-height: 1.5;
          color: #000000;
        }
        .header-section {
          text-align: center;
          margin-bottom: 20px;
        }
        .school-header {
          font-weight: bold;
          font-size: 13pt;
          text-transform: uppercase;
        }
        .main-title {
          text-align: center;
          font-size: 16pt;
          font-weight: bold;
          margin-top: 15px;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        .sub-title {
          text-align: center;
          font-size: 13pt;
          font-style: italic;
          margin-bottom: 15px;
        }
        .nls-box {
          border: 1px solid #3b82f6;
          background-color: #f0f7ff;
          padding: 10px;
          margin-top: 10px;
          margin-bottom: 15px;
          font-size: 13pt;
        }
        .nls-tag {
          font-weight: bold;
          color: #1e3a8a;
          background-color: #dbeafe;
          padding: 2px 5px;
          border-radius: 3px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          margin-bottom: 15px;
        }
        th, td {
          border: 1px solid #000000;
          padding: 8px;
          vertical-align: top;
        }
        th {
          background-color: #f3f4f6;
          font-weight: bold;
          text-align: center;
        }
        ul, ol {
          margin-top: 5px;
          margin-bottom: 5px;
        }
      </style>
    </head>
    <body>
      <div class="header-section">
        <div class="school-header">BỘ GIÁO DỤC VÀ ĐÀO TẠO — KHUNG KẾ HOẠCH BÀI DẠY (CV 5512)</div>
        <div class="main-title">KẾ HOẠCH BÀI DẠY TÍCH HỢP NĂNG LỰC SỐ & AI</div>
        <div class="sub-title"><b>Môn:</b> ${subject} — <b>Khối/Lớp:</b> ${grade}</div>
        <div class="sub-title"><b>Bài dạy:</b> ${title}</div>
      </div>
      <hr style="border: 0.5pt solid #000; margin-bottom: 20px;" />
  `;

  // Clean HTML for Word and ensure injections are in the left column
  let cleanHtml = ensureInjectionsInLeftColumn(contentHtml);
  cleanHtml = cleanHtml.replace(/<i class="fa-.*?"><\/i>/g, ''); // Remove fontawesome icons
  cleanHtml = cleanHtml.replace(/<button.*?>.*?<\/button>/gi, ''); // Remove interactive buttons

  const footer = `
      <br/>
      <div style="text-align: right; margin-top: 30px; font-style: italic;">
        Ngày ...... tháng ...... năm 202...<br/>
        <b>Giáo viên biên soạn</b><br/>
        <i>(Ký và ghi rõ họ tên)</i>
      </div>
    </body>
    </html>
  `;

  const sourceHTML = wordHeader + cleanHtml + footer;

  const blob = new Blob(['\ufeff' + sourceHTML], {
    type: 'application/msword;charset=utf-8',
  });

  const fileName = `EduNLS_GiaoAn_${subject.replace(/\s+/g, '_')}_${grade.replace(/\s+/g, '_')}.doc`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
