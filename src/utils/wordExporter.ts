import { ensureInjectionsInLeftColumn } from './aiParser';

/**
 * Formats and sanitizes HTML content specifically for Microsoft Word A4 layout,
 * enforcing fixed table layouts, 50/50 column widths for 2-column tables,
 * converting CSS grids to Word tables, and setting strict word-wrapping.
 */
function formatHtmlForWord(htmlInput: string): string {
  if (!htmlInput) return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, 'text/html');

    // 1. Convert CSS Grid layouts (e.g. .grid) to Word-compatible 2-column tables
    const gridElements = Array.from(doc.querySelectorAll('.grid, [class*="grid-cols"]'));
    gridElements.forEach(grid => {
      const children = Array.from(grid.children);
      if (children.length > 1) {
        const table = doc.createElement('table');
        table.setAttribute('width', '100%');
        table.setAttribute('style', 'width: 100% !important; table-layout: fixed !important; border-collapse: collapse; margin-top: 6pt; margin-bottom: 6pt;');

        for (let i = 0; i < children.length; i += 2) {
          const tr = doc.createElement('tr');

          const td1 = doc.createElement('td');
          td1.setAttribute('width', '50%');
          td1.setAttribute('style', 'width: 50% !important; padding: 4pt 6pt; vertical-align: top; border: 1px solid #cbd5e1; word-wrap: break-word; word-break: break-word;');
          td1.appendChild(children[i].cloneNode(true));
          tr.appendChild(td1);

          const td2 = doc.createElement('td');
          td2.setAttribute('width', '50%');
          td2.setAttribute('style', 'width: 50% !important; padding: 4pt 6pt; vertical-align: top; border: 1px solid #cbd5e1; word-wrap: break-word; word-break: break-word;');
          if (i + 1 < children.length) {
            td2.appendChild(children[i + 1].cloneNode(true));
          } else {
            td2.innerHTML = '&nbsp;';
          }
          tr.appendChild(td2);

          table.appendChild(tr);
        }
        grid.parentNode?.replaceChild(table, grid);
      }
    });

    // 2. Format all tables (especially 2-column CV 5512 tables)
    const tables = Array.from(doc.querySelectorAll('table'));
    tables.forEach(table => {
      table.setAttribute('width', '100%');
      table.setAttribute('style', 'width: 100% !important; max-width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; margin-top: 8pt; margin-bottom: 12pt; word-wrap: break-word; word-break: break-word;');

      const rows = Array.from(table.querySelectorAll('tr'));
      rows.forEach(row => {
        row.setAttribute('style', 'page-break-inside: avoid;');
        const cells = Array.from(row.querySelectorAll('td, th'));
        const cellCount = cells.length;

        cells.forEach((cell) => {
          const isHeader = cell.tagName.toLowerCase() === 'th';
          let widthPercent = cellCount > 0 ? Math.floor(100 / cellCount) + '%' : '100%';

          // Ensure 2-column tables (standard CV 5512 lesson plan) split 50/50 strictly within A4 width
          if (cellCount === 2) {
            widthPercent = '50%';
          }

          cell.setAttribute('width', widthPercent);
          cell.setAttribute('style', `
            width: ${widthPercent} !important;
            max-width: ${widthPercent} !important;
            padding: 6pt 8pt !important;
            border: 1px solid #000000 !important;
            vertical-align: top !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
            overflow-wrap: break-word !important;
            box-sizing: border-box !important;
            ${isHeader ? 'background-color: #f3f4f6; font-weight: bold; text-align: center;' : ''}
          `.replace(/\s+/g, ' ').trim());
        });
      });
    });

    // 3. Format NLS injection blocks specifically for Word
    const nlsElements = Array.from(doc.querySelectorAll('.nls-injection, .nls-box, .nls-wrapper, [class*="bg-"]'));
    nlsElements.forEach(el => {
      if (el.classList.contains('nls-injection') || el.classList.contains('nls-box') || el.classList.contains('nls-wrapper') || (el.textContent || '').includes('TÍCH HỢP')) {
        el.setAttribute('style', `
          width: 100% !important;
          max-width: 100% !important;
          box-sizing: border-box !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          border: 1px solid #2563eb !important;
          background-color: #f0f7ff !important;
          padding: 5pt 6pt !important;
          margin-top: 4pt !important;
          margin-bottom: 6pt !important;
          font-size: 11pt !important;
          line-height: 1.35 !important;
          page-break-inside: avoid !important;
        `.replace(/\s+/g, ' ').trim());
      }
    });

    // 4. Format images, blocks, and containers to fit strictly within 100% cell width
    const allElements = Array.from(doc.querySelectorAll('div, p, img, pre, code, blockquote, section, iframe, a, span, ul, li'));
    allElements.forEach(el => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'img') {
        el.setAttribute('style', 'max-width: 100% !important; height: auto !important;');
      } else {
        const currentStyle = el.getAttribute('style') || '';
        const cleanedStyle = currentStyle
          .replace(/min-width\s*:[^;]+;?/gi, '')
          .replace(/width\s*:\s*\d+px;?/gi, '')
          .replace(/max-width\s*:[^;]+;?/gi, '');

        el.setAttribute('style', `${cleanedStyle}; max-width: 100% !important; box-sizing: border-box !important; word-wrap: break-word !important; word-break: break-word !important; overflow-wrap: break-word !important;`.replace(/;+/g, ';').trim());
      }
    });

    return doc.body.innerHTML;
  } catch (err) {
    console.error('Error formatting HTML for Word:', err);
    return htmlInput;
  }
}

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
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
      <style>
        @page Section1 {
          size: 210mm 297mm; /* Standard A4 size */
          margin: 20mm 15mm 20mm 20mm; /* top right bottom left */
          mso-header-margin: 36pt;
          mso-footer-margin: 36pt;
          mso-paper-source: 0;
        }
        div.Section1 {
          page: Section1;
        }
        body {
          font-family: 'Times New Roman', Times, serif;
          font-size: 13pt;
          line-height: 1.4;
          color: #000000;
          margin: 0;
          padding: 0;
        }
        .header-section {
          text-align: center;
          margin-bottom: 15pt;
        }
        .school-header {
          font-weight: bold;
          font-size: 12pt;
          text-transform: uppercase;
        }
        .main-title {
          text-align: center;
          font-size: 15pt;
          font-weight: bold;
          margin-top: 10pt;
          margin-bottom: 5pt;
          text-transform: uppercase;
          color: #1e1b4b;
        }
        .sub-title {
          text-align: center;
          font-size: 12pt;
          font-style: italic;
          margin-bottom: 10pt;
        }
        table {
          width: 100% !important;
          max-width: 100% !important;
          table-layout: fixed !important;
          border-collapse: collapse !important;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
          margin-top: 8pt;
          margin-bottom: 12pt;
        }
        tr {
          page-break-inside: avoid;
        }
        td, th {
          border: 1px solid #000000 !important;
          padding: 6pt 8pt !important;
          vertical-align: top !important;
          word-wrap: break-word !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          box-sizing: border-box !important;
        }
        table tr td:first-child, table tr td:nth-child(1) {
          width: 50% !important;
          max-width: 50% !important;
        }
        table tr td:nth-child(2) {
          width: 50% !important;
          max-width: 50% !important;
        }
        th {
          background-color: #f3f4f6 !important;
          font-weight: bold;
          text-align: center;
        }
        .nls-box, .nls-wrapper, .nls-injection {
          border: 1px solid #3b82f6 !important;
          background-color: #f0f7ff !important;
          padding: 8pt !important;
          margin-top: 6pt !important;
          margin-bottom: 8pt !important;
          font-size: 12pt !important;
          border-radius: 4pt;
          word-wrap: break-word !important;
          word-break: break-word !important;
        }
        .nls-tag {
          font-weight: bold;
          color: #1e3a8a;
          background-color: #dbeafe;
          padding: 2pt 4pt;
          border-radius: 2pt;
        }
        ul, ol {
          margin-top: 4pt;
          margin-bottom: 4pt;
          padding-left: 20pt;
        }
        p, div {
          word-wrap: break-word !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
      </style>
    </head>
    <body>
      <div class="Section1">
        <div class="header-section">
          <div class="school-header">BỘ GIÁO DỤC VÀ ĐÀO TẠO — KHUNG KẾ HOẠCH BÀI DẠY (CV 5512)</div>
          <div class="main-title">KẾ HOẠCH BÀI DẠY TÍCH HỢP NĂNG LỰC SỐ & AI</div>
          <div class="sub-title"><b>Môn:</b> ${subject} — <b>Khối/Lớp:</b> ${grade}</div>
          <div class="sub-title"><b>Bài dạy:</b> ${title}</div>
        </div>
        <hr style="border: 0.5pt solid #000; margin-bottom: 20px;" />
  `;

  // Clean HTML, ensure injections are in left column, and format tables/grids for Word A4 boundaries
  let cleanHtml = ensureInjectionsInLeftColumn(contentHtml);
  cleanHtml = cleanHtml.replace(/<i class="fa-.*?"><\/i>/g, ''); // Remove fontawesome icons
  cleanHtml = cleanHtml.replace(/<button.*?>.*?<\/button>/gi, ''); // Remove interactive buttons

  const formattedContent = formatHtmlForWord(cleanHtml);

  const footer = `
        <br/>
        <div style="text-align: right; margin-top: 30px; font-style: italic;">
          Ngày ...... tháng ...... năm 202...<br/>
          <b>Giáo viên biên soạn</b><br/>
          <i>(Ký và ghi rõ họ tên)</i>
        </div>
      </div>
    </body>
    </html>
  `;

  const sourceHTML = wordHeader + formattedContent + footer;

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

