/**
 * Strips out the "CĂN CỨ PHÁP LÝ TÍCH HỢP BẮT BUỘC" box and
 * "THIẾT LẬP PHÂN BỔ 6 MIỀN NĂNG LỰC SỐ" grid block from the HTML.
 */
export function stripLegalHeaderAndDomainOverview(htmlInput: string): string {
  if (!htmlInput) return '';

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, 'text/html');

    const candidates = Array.from(doc.querySelectorAll('div, section, header, table, p'));
    candidates.forEach(node => {
      const text = (node.textContent || '').toUpperCase();
      const isTargetHeader =
        text.includes('CĂN CỨ PHÁP LÝ TÍCH HỢP') ||
        text.includes('THIẾT LẬP PHÂN BỔ 6 MIỀN') ||
        text.includes('THIẾT LẬP VÀ PHÂN BỔ 6 MIỀN') ||
        text.includes('THIẾT LẬP PHÂN BỔ 6 MIỀN NĂNG LỰC SỐ');

      if (isTargetHeader) {
        // Find top level block or container div to remove
        const topContainer =
          node.closest('.bg-rose-50') ||
          node.closest('.bg-slate-900') ||
          (node.parentElement && node.parentElement.tagName === 'BODY' ? node : node);

        if (topContainer && topContainer.parentNode) {
          topContainer.parentNode.removeChild(topContainer);
        }
      }
    });

    return doc.body.innerHTML;
  } catch (err) {
    console.error('Error stripping legal header:', err);
    return htmlInput;
  }
}

/**
 * Utility to move all digital competency & AI integration blocks to the LEFT column
 * (Cột 1: Hoạt động của Giáo viên và Học sinh) in 2-column CV 5512 lesson plan tables.
 */
export function ensureInjectionsInLeftColumn(htmlInput: string): string {
  if (!htmlInput) return '';

  try {
    // First strip unwanted legal & domain overview headers
    const cleanedHtml = stripLegalHeaderAndDomainOverview(htmlInput);

    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedHtml, 'text/html');

    // Find all injection candidates or blocks
    const candidates = Array.from(doc.querySelectorAll('div, section, td, p'));
    const injectionBlocks: Element[] = [];

    candidates.forEach(node => {
      const text = (node.textContent || '').toUpperCase();
      const isBlock =
        node.classList.contains('nls-injection') ||
        node.classList.contains('nls-wrapper') ||
        node.classList.contains('nls-box') ||
        text.includes('TÍCH HỢP HOẠT ĐỘNG') ||
        text.includes('BỔ SUNG MỤC TIÊU NĂNG LỰC SỐ') ||
        text.includes('TÍCH HỢP HOẠT ĐỘNG KHỞI ĐỘNG') ||
        text.includes('TÍCH HỢP HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC') ||
        text.includes('TÍCH HỢP HOẠT ĐỘNG LUYỆN TẬP') ||
        text.includes('TÍCH HỢP HOẠT ĐỘNG VẬN DỤNG');

      if (isBlock) {
        // Pick top-level wrapper block
        const topBlock = node.closest('.nls-wrapper') || node.closest('.nls-injection') || node.closest('.nls-box') || node;
        if (!injectionBlocks.includes(topBlock)) {
          injectionBlocks.push(topBlock);
        }
      }
    });

    // Relocate each block to the left column (row.cells[0])
    injectionBlocks.forEach(block => {
      const parentTd = block.closest('td');
      if (parentTd) {
        const row = parentTd.closest('tr');
        if (row && row.cells.length > 1) {
          const firstTd = row.cells[0]; // Cột 1: Hoạt động của GV & HS (Cột bên trái)
          if (parentTd !== firstTd && !firstTd.contains(block)) {
            firstTd.appendChild(block);
          }
        }
      }
    });

    return doc.body.innerHTML;
  } catch (err) {
    console.error('Error ensuring injections in left column:', err);
    return htmlInput;
  }
}

export function parseAndInjectDigitalCompetencies(htmlInput: string, subject: string = 'Toán học', grade: string = 'Lớp 10'): string {
  if (!htmlInput) return '';

  try {
    const cleanedInput = stripLegalHeaderAndDomainOverview(htmlInput);
    const parser = new DOMParser();
    const doc = parser.parseFromString(cleanedInput, 'text/html');

    // Extract lesson topic or author if present
    let lessonTopic = subject + " " + grade;
    const headings = doc.querySelectorAll('h1, h2, h3, p, strong, b');
    headings.forEach(h => {
      const text = h.textContent || '';
      if (text.toLowerCase().includes('bài') && text.length < 80) {
        lessonTopic = text.trim();
      }
    });

    const getSafeTopic = (rawTopic: string) => {
      if (!rawTopic) return "bài học";
      let clean = rawTopic.replace(/^[0-9\-\s:]+/, '');
      clean = clean.replace(/(GIỚI THIỆU BÀI HỌC|TRI THỨC NGỮ VĂN|ĐỌC HIỂU VĂN BẢN|BÀI \d+)/gi, '').trim();
      if (clean.length < 3 || clean.length > 60) return "bài học";
      return `<b>${clean}</b>`;
    };

    const safeTopic = getSafeTopic(lessonTopic);

    const getGeneratorForActivity = (type: 'muc-tieu' | 'hd1' | 'hd2' | 'hd3' | 'hd4', periodLabel: string) => {
      const topicText = periodLabel ? `<b>${periodLabel}</b>` : safeTopic;
      const periodSubTitle = periodLabel ? `<div class="font-normal text-slate-600 text-[10px] normal-case mt-0.5 break-words" style="word-break:break-word; overflow-wrap:break-word;">[${periodLabel}]</div>` : '';

      if (type === 'muc-tieu') {
        return `
          <div class="border border-indigo-300 border-l-4 border-l-indigo-600 bg-transparent p-2.5 rounded-lg my-2 shadow-xs nls-injection relative text-xs w-full max-w-full box-border" style="width:100% !important; max-width:100% !important; box-sizing:border-box !important; word-break:break-word !important; overflow-wrap:break-word !important; background-color: transparent !important;">
              <div class="font-bold text-indigo-900 text-[11px] uppercase mb-1 leading-snug break-words" style="word-break:break-word; overflow-wrap:break-word;">
                <i class="fa-solid fa-robot mr-1 text-indigo-600"></i> BỔ SUNG MỤC TIÊU NĂNG LỰC SỐ & AI
                ${periodSubTitle}
              </div>
              <ul class="list-none pl-1 text-slate-700 space-y-1.5 leading-relaxed m-0" style="word-break:break-word; overflow-wrap:break-word;">
                  <li>
                      <span class="border border-indigo-300 text-indigo-900 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px] bg-transparent">[NLS 1.1-a & 6.1-a]</span> 
                      <b>Khai thác & Tự học số:</b> Học sinh chủ động tra cứu, tìm kiếm và sử dụng học liệu số, tài nguyên trực tuyến bổ trợ cho ${topicText}.
                  </li>
                  <li>
                      <span class="border border-amber-300 text-amber-900 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px] bg-transparent">[AI-NLb: Đạo đức AI]</span> 
                      <b>Đạo đức AI & Trách nhiệm số:</b> Sử dụng công cụ AI minh bạch, tôn trọng bản quyền học liệu và có tư duy phản biện với thông tin số.
                  </li>
              </ul>
          </div>
        `;
      }
      if (type === 'hd1') {
        return `
          <div class="border border-amber-300 border-l-4 border-l-amber-500 bg-transparent p-2.5 rounded-lg my-2 shadow-xs nls-injection relative text-xs w-full max-w-full box-border" style="width:100% !important; max-width:100% !important; box-sizing:border-box !important; word-break:break-word !important; overflow-wrap:break-word !important; background-color: transparent !important;">
              <div class="font-bold text-amber-900 text-[11px] uppercase mb-1 leading-snug break-words" style="word-break:break-word; overflow-wrap:break-word;">
                <i class="fa-solid fa-bolt mr-1 text-amber-500"></i> TÍCH HỢP HOẠT ĐỘNG KHỞI ĐỘNG (SỐ & AI)
                ${periodSubTitle}
              </div>
              <ul class="list-none pl-1 text-slate-700 space-y-1.5 leading-relaxed m-0" style="word-break:break-word; overflow-wrap:break-word;">
                  <li>
                      <span class="border border-indigo-300 text-indigo-900 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px] bg-transparent">[NLS 1.1-a]</span> 
                      <b>Tương tác số khởi động:</b> Giáo viên tổ chức trò chơi tương tác trên Quizizz/Kahoot hoặc quét mã QR khởi động cho ${topicText}.
                      <div class="mt-1.5 pl-2 border-l-2 border-amber-400 text-slate-800 bg-transparent py-1 pr-2 rounded-r text-[11px]" style="word-break:break-word;">
                          <i>💡 <b>Ví dụ:</b> Học sinh quét mã QR tham gia khảo sát nhanh 3 câu hỏi trắc nghiệm liên quan đến ${topicText}. Hệ thống hiển thị biểu đồ kết quả tức thì.</i>
                      </div>
                  </li>
              </ul>
          </div>
        `;
      }
      if (type === 'hd2') {
        return `
          <div class="border border-rose-300 border-l-4 border-l-rose-500 bg-transparent p-2.5 rounded-lg my-2 shadow-xs nls-injection relative text-xs w-full max-w-full box-border" style="width:100% !important; max-width:100% !important; box-sizing:border-box !important; word-break:break-word !important; overflow-wrap:break-word !important; background-color: transparent !important;">
              <div class="font-bold text-rose-900 text-[11px] uppercase mb-1 leading-snug break-words" style="word-break:break-word; overflow-wrap:break-word;">
                <i class="fa-solid fa-layer-group mr-1 text-rose-500"></i> TÍCH HỢP HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC (ĐA MIỀN NLS)
                ${periodSubTitle}
              </div>
              <ul class="list-none pl-1 text-slate-700 space-y-1.5 leading-relaxed m-0" style="word-break:break-word; overflow-wrap:break-word;">
                  <li>
                      <span class="border border-indigo-300 text-indigo-900 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px] bg-transparent">[NLS 1.2-b & 2.4-a]</span> 
                      <b>Khai thác & Hợp tác số:</b> Học sinh tra cứu tài liệu mở (Wikipedia Edu, Sách số), thảo luận nhóm trên Padlet/Google Docs để phân tích nội dung trọng tâm của ${topicText}.
                  </li>
                  <li>
                      <span class="border border-purple-300 text-purple-900 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px] bg-transparent">[AI-NLc: Prompting]</span> 
                      <b>Kĩ thuật Kỹ năng Prompt AI:</b> Học sinh đóng vai trò người điều khiển, nhập câu lệnh Prompt mở cho Trợ lý AI giải thích các khái niệm phức tạp trong ${topicText}.
                  </li>
              </ul>
          </div>
        `;
      }
      if (type === 'hd3') {
        return `
          <div class="border border-sky-300 border-l-4 border-l-sky-500 bg-transparent p-2.5 rounded-lg my-2 shadow-xs nls-injection relative text-xs w-full max-w-full box-border" style="width:100% !important; max-width:100% !important; box-sizing:border-box !important; word-break:break-word !important; overflow-wrap:break-word !important; background-color: transparent !important;">
              <div class="font-bold text-sky-900 text-[11px] uppercase mb-1 leading-snug break-words" style="word-break:break-word; overflow-wrap:break-word;">
                <i class="fa-solid fa-pen-ruler mr-1 text-sky-500"></i> TÍCH HỢP HOẠT ĐỘNG LUYỆN TẬP (SÁNG TẠO SỐ)
                ${periodSubTitle}
              </div>
              <ul class="list-none pl-1 text-slate-700 space-y-1.5 leading-relaxed m-0" style="word-break:break-word; overflow-wrap:break-word;">
                  <li>
                      <span class="border border-indigo-300 text-indigo-900 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px] bg-transparent">[NLS 3.1-a & 5.3-a]</span> 
                      <b>Sáng tạo & Mô phỏng số:</b> Học sinh sử dụng phần mềm sơ đồ tư duy (Canva, XMind) hoặc phần mềm mô phỏng (GeoGebra, PhET) để tổng kết và luyện tập nội dung ${topicText}.
                  </li>
              </ul>
          </div>
        `;
      }
      if (type === 'hd4') {
        return `
          <div class="border border-purple-300 border-l-4 border-l-purple-500 bg-transparent p-2.5 rounded-lg my-2 shadow-xs nls-injection relative text-xs w-full max-w-full box-border" style="width:100% !important; max-width:100% !important; box-sizing:border-box !important; word-break:break-word !important; overflow-wrap:break-word !important; background-color: transparent !important;">
              <div class="font-bold text-purple-900 text-[11px] uppercase mb-1 leading-snug break-words" style="word-break:break-word; overflow-wrap:break-word;">
                <i class="fa-solid fa-rocket mr-1 text-purple-500"></i> TÍCH HỢP HOẠT ĐỘNG VẬN DỤNG (GIẢI QUYẾT VẤN ĐỀ)
                ${periodSubTitle}
              </div>
              <ul class="list-none pl-1 text-slate-700 space-y-1.5 leading-relaxed m-0" style="word-break:break-word; overflow-wrap:break-word;">
                  <li>
                      <span class="border border-indigo-300 text-indigo-900 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px] bg-transparent">[NLS 4.1-a & 5.3-a]</span> 
                      <b>Sản phẩm số vận dụng:</b> Vận dụng kiến thức thiết kế Infographic, Video ngắn thuyết minh sản phẩm hoặc mô hình số liên hệ thực tiễn bài học.
                  </li>
              </ul>
          </div>
        `;
      }
      return '';
    };

    let injectedCount = 0;
    const bodyContent = doc.body;

    // Remove any previous duplicate legal headers or injection blocks before parsing
    const existingInjections = Array.from(bodyContent.querySelectorAll('.nls-injection'));
    existingInjections.forEach(el => el.remove());

    const allNodes = Array.from(bodyContent.querySelectorAll('h1, h2, h3, h4, h5, p, div, strong, b'));

    let currentPeriodLabel = '';
    const injectedKeys = new Set<string>();

    const insertWrapperForNode = (node: Element, type: 'muc-tieu' | 'hd1' | 'hd2' | 'hd3' | 'hd4') => {
      const key = `${currentPeriodLabel || 'GLOBAL'}_${type}`;
      if (injectedKeys.has(key)) return;

      injectedKeys.add(key);
      const wrapper = doc.createElement('div');
      wrapper.className = 'nls-wrapper';
      wrapper.innerHTML = getGeneratorForActivity(type, currentPeriodLabel);

      // If node is inside a table cell (<td>), ALWAYS insert into Column 1 (Left column)
      const parentTd = node.closest('td');
      if (parentTd) {
        const row = parentTd.closest('tr');
        if (row && row.cells.length > 0) {
          const firstTd = row.cells[0]; // Left column (Hoạt động GV & HS)
          firstTd.appendChild(wrapper);
          injectedCount++;
          return;
        }
      }

      node.parentNode?.insertBefore(wrapper, node.nextSibling);
      injectedCount++;
    };

    allNodes.forEach((node) => {
      const txt = (node.textContent || '').trim();
      const txtLower = txt.toLowerCase();

      // Check if this node represents a Period/Lesson header
      if (/(tiết\s+\d+|bài\s+\d+|chủ đề\s+\d+|tuần\s+\d+)/i.test(txt) && txt.length < 100) {
        currentPeriodLabel = txt;
      }

      if (node.closest('.nls-injection')) return;

      if ((txtLower.includes('mục tiêu') || txtLower.includes('yêu cầu cần đạt')) && txt.length < 200) {
        insertWrapperForNode(node, 'muc-tieu');
      } else if ((txtLower.includes('mở đầu') || txtLower.includes('khởi động')) && txt.length < 200) {
        insertWrapperForNode(node, 'hd1');
      } else if ((txtLower.includes('hình thành kiến thức') || txtLower.includes('tìm hiểu chi tiết')) && txt.length < 200) {
        insertWrapperForNode(node, 'hd2');
      } else if ((txtLower.includes('luyện tập') || txtLower.includes('tổng kết')) && txt.length < 200) {
        insertWrapperForNode(node, 'hd3');
      } else if ((txtLower.includes('vận dụng') || txtLower.includes('mở rộng')) && txt.length < 200) {
        insertWrapperForNode(node, 'hd4');
      }
    });

    if (injectedCount === 0) {
      // Fallback: append full injection block for overall lesson
      const fullWrapper = doc.createElement('div');
      fullWrapper.className = 'space-y-4 my-4';
      fullWrapper.innerHTML = `
        ${getGeneratorForActivity('muc-tieu', '')}
        ${getGeneratorForActivity('hd1', '')}
        ${getGeneratorForActivity('hd2', '')}
        ${getGeneratorForActivity('hd3', '')}
        ${getGeneratorForActivity('hd4', '')}
      `;
      bodyContent.appendChild(fullWrapper);
    }

    // Post-process: Relocate any remaining injection blocks from column 2 (Right) to column 1 (Left)
    const combinedHtml = '<div class="docx-content space-y-3 leading-relaxed text-sm text-slate-800">' + bodyContent.innerHTML + '</div>';
    return ensureInjectionsInLeftColumn(combinedHtml);
  } catch (err) {
    console.error('Error parsing lesson HTML:', err);
    return ensureInjectionsInLeftColumn(htmlInput);
  }
}

/**
 * Inserts a Padlet / Google Drive / Google Sheets / Google Forms link card into the lesson HTML.
 */
export function injectDigitalToolLink(
  htmlInput: string,
  toolType: 'padlet' | 'drive' | 'sheets' | 'forms' | 'other',
  title: string,
  url: string,
  description: string = '',
  targetActivity: string = 'hd1'
): string {
  if (!htmlInput) return '';

  let badgeText = '📌 Padlet';
  let badgeStyle = 'bg-pink-100 text-pink-800 border border-pink-200';

  if (toolType === 'drive') {
    badgeText = '📁 Google Drive';
    badgeStyle = 'bg-amber-100 text-amber-900 border border-amber-200';
  } else if (toolType === 'sheets') {
    badgeText = '📊 Google Trang tính';
    badgeStyle = 'bg-emerald-100 text-emerald-900 border border-emerald-200';
  } else if (toolType === 'forms') {
    badgeText = '📝 Google Forms';
    badgeStyle = 'bg-purple-100 text-purple-900 border border-purple-200';
  } else if (toolType === 'other') {
    badgeText = '⚡ Công cụ số';
    badgeStyle = 'bg-sky-100 text-sky-900 border border-sky-200';
  }

  const safeUrl = url.trim() || 'https://google.com';
  const safeTitle = title.trim() || 'Liên kết học liệu số';

  const cardHtml = `
    <div class="nls-link-card my-3 p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 transition text-xs font-sans">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div class="flex items-start gap-2.5">
          <span class="inline-flex items-center px-2.5 py-1 rounded-md font-bold text-[11px] ${badgeStyle} shrink-0">
            ${badgeText}
          </span>
          <div>
            <div class="font-bold text-slate-800 text-xs">${safeTitle}</div>
            ${description ? `<div class="text-[11px] text-slate-500 mt-0.5">${description}</div>` : ''}
            <div class="text-[10px] text-indigo-600 font-mono mt-0.5 truncate max-w-xs">${safeUrl}</div>
          </div>
        </div>
        <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] rounded-lg transition shadow-xs shrink-0 no-underline">
          <span>Truy cập Liên kết</span>
          <svg class="w-3.5 h-3.5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
        </a>
      </div>
    </div>
  `;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, 'text/html');

    // Find nodes matching target activity
    const activityKeywords: Record<string, string[]> = {
      hd1: ['khởi động', 'mở đầu'],
      hd2: ['hình thành kiến thức', 'nội dung mới'],
      hd3: ['luyện tập', 'tổng kết'],
      hd4: ['vận dụng', 'mở rộng'],
      muc_tieu: ['mục tiêu', 'yêu cầu cần đạt']
    };

    const targetKw = activityKeywords[targetActivity] || ['khởi động', 'hoạt động'];
    const allNodes = Array.from(doc.querySelectorAll('p, div, h1, h2, h3, h4, td'));
    let inserted = false;

    for (const node of allNodes) {
      const text = (node.textContent || '').toLowerCase();
      if (targetKw.some(kw => text.includes(kw)) && text.length < 200) {
        const parentTd = node.closest('td');
        if (parentTd) {
          const row = parentTd.closest('tr');
          if (row && row.cells.length > 0) {
            // Append to Cột 1 (Left column)
            const firstTd = row.cells[0];
            const div = doc.createElement('div');
            div.innerHTML = cardHtml;
            firstTd.appendChild(div);
            inserted = true;
            break;
          }
        } else {
          const div = doc.createElement('div');
          div.innerHTML = cardHtml;
          node.parentNode?.insertBefore(div, node.nextSibling);
          inserted = true;
          break;
        }
      }
    }

    if (!inserted) {
      const div = doc.createElement('div');
      div.innerHTML = cardHtml;
      doc.body.appendChild(div);
    }

    return ensureInjectionsInLeftColumn(doc.body.innerHTML);
  } catch (err) {
    console.error('Error inserting digital tool link:', err);
    return htmlInput + cardHtml;
  }
}


