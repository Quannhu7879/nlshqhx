export function parseAndInjectDigitalCompetencies(htmlInput: string, subject: string = 'Toán học', grade: string = 'Lớp 10'): string {
  if (!htmlInput) return '';

  const legalHeader = `
    <div class="bg-rose-50 border-l-4 border-rose-500 p-3 rounded-r-lg mb-4 text-sm shadow-sm">
        <span class="font-bold text-rose-900 block text-xs uppercase mb-1">
            <i class="fa-solid fa-gavel mr-1"></i> CĂN CỨ PHÁP LÝ TÍCH HỢP BẮT BUỘC
        </span>
        <p class="text-[11px] text-rose-800 leading-relaxed">
            • Cấu trúc Kế hoạch bài dạy tuân thủ <b>Công văn 5512/BGDĐT-GDTrH</b>.<br>
            • Khung Chỉ báo Năng lực số áp dụng <b>Thông tư 02/2025/TT-BGDĐT (Đủ 6 Miền Năng Lực Số - 24 Năng lực thành phần)</b>.<br>
            • Khung Mạch Năng lực AI áp dụng <b>Quyết định 3439/QĐ-BGDĐT (4 Mạch Năng lực AI Phổ thông)</b>.
        </p>
    </div>

    <!-- BẢNG THIẾT LẬP 6 MIỀN NĂNG LỰC SỐ CHO BÀI DẠY -->
    <div class="bg-slate-900 text-white p-4 rounded-xl mb-5 shadow-md border border-slate-800 text-xs">
        <div class="flex items-center justify-between border-b border-slate-700 pb-2 mb-3">
            <span class="font-bold text-amber-400 text-xs uppercase flex items-center">
                <i class="fa-solid fa-layer-group mr-2 text-indigo-400"></i>
                THIẾT LẬP PHÂN BỔ 6 MIỀN NĂNG LỰC SỐ (THÔNG TƯ 02/2025/TT-BGDĐT)
            </span>
            <span class="bg-emerald-500/20 text-emerald-300 font-mono text-[10px] px-2 py-0.5 rounded border border-emerald-500/30">
                ✓ 100% ĐÃ KÍCH HOẠT VÀO BÀI DẠY
            </span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-300">
            <div class="bg-slate-800/80 p-2 rounded border border-slate-700 flex items-start space-x-2">
                <span class="bg-indigo-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px] shrink-0 font-mono">MIỀN 1</span>
                <div>
                    <strong class="text-indigo-200 block">Dữ liệu & Thông tin:</strong>
                    <span class="text-slate-400 text-[10px]">Tra cứu, khai thác & đánh giá độ tin cậy dữ liệu bài học [NLS 1.1-a, 1.2-b]</span>
                </div>
            </div>
            <div class="bg-slate-800/80 p-2 rounded border border-slate-700 flex items-start space-x-2">
                <span class="bg-emerald-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px] shrink-0 font-mono">MIỀN 2</span>
                <div>
                    <strong class="text-emerald-200 block">Giao tiếp & Hợp tác số:</strong>
                    <span class="text-slate-400 text-[10px]">Tương tác nhóm trên Padlet/Docs, chia sẻ sản phẩm số [NLS 2.4-a]</span>
                </div>
            </div>
            <div class="bg-slate-800/80 p-2 rounded border border-slate-700 flex items-start space-x-2">
                <span class="bg-sky-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px] shrink-0 font-mono">MIỀN 3</span>
                <div>
                    <strong class="text-sky-200 block">Sáng tạo Nội dung số:</strong>
                    <span class="text-slate-400 text-[10px]">Thiết kế Canva, mô phỏng GeoGebra/PhET, sơ đồ tư duy [NLS 3.1-a]</span>
                </div>
            </div>
            <div class="bg-slate-800/80 p-2 rounded border border-slate-700 flex items-start space-x-2">
                <span class="bg-rose-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px] shrink-0 font-mono">MIỀN 4</span>
                <div>
                    <strong class="text-rose-200 block">An toàn số & Đạo đức AI:</strong>
                    <span class="text-slate-400 text-[10px]">Bảo mật thông tin cá nhân, trích dẫn bản quyền [NLS 4.1-a, AI-NLb]</span>
                </div>
            </div>
            <div class="bg-slate-800/80 p-2 rounded border border-slate-700 flex items-start space-x-2">
                <span class="bg-purple-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px] shrink-0 font-mono">MIỀN 5</span>
                <div>
                    <strong class="text-purple-200 block">Giải quyết Vấn đề số:</strong>
                    <span class="text-slate-400 text-[10px]">Vận dụng công cụ số xử lý tình huống thực tế [NLS 5.3-a]</span>
                </div>
            </div>
            <div class="bg-slate-800/80 p-2 rounded border border-slate-700 flex items-start space-x-2">
                <span class="bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded text-[9px] shrink-0 font-mono">MIỀN 6</span>
                <div>
                    <strong class="text-amber-200 block">Học tập & Kỹ năng số liên tục:</strong>
                    <span class="text-slate-400 text-[10px]">Tự học qua học liệu mở, viết Prompt hỗ trợ học tập [NLS 6.1-a, AI-NLc]</span>
                </div>
            </div>
        </div>
    </div>
  `;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlInput, 'text/html');

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
      const labelText = periodLabel ? ` [${periodLabel}]` : '';
      const topicText = periodLabel ? `<b>${periodLabel}</b>` : safeTopic;

      if (type === 'muc-tieu') {
        return `
          <div class="bg-indigo-50/80 border border-indigo-200 p-3 rounded-xl mt-3 mb-4 shadow-sm border-l-[4px] border-l-brand-600 nls-injection relative text-xs">
              <span class="font-bold text-brand-700 block text-[11px] uppercase mb-1.5"><i class="fa-solid fa-robot mr-1 text-amber-500"></i> BỔ SUNG MỤC TIÊU NĂNG LỰC SỐ & AI${labelText}</span>
              <ul class="list-none pl-1 text-slate-700 space-y-2 leading-relaxed">
                  <li>
                      <span class="bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px]">[NLS 1.1-a & 6.1-a]</span> 
                      <b>Khai thác & Tự học số:</b> Học sinh chủ động tra cứu, tìm kiếm và sử dụng học liệu số, tài nguyên trực tuyến bổ trợ cho ${topicText}.
                  </li>
                  <li>
                      <span class="bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px]">[AI-NLb: Đạo đức AI]</span> 
                      <b>Đạo đức AI & Trách nhiệm số:</b> Sử dụng công cụ AI minh bạch, tôn trọng bản quyền học liệu và có tư duy phản biện với thông tin số.
                  </li>
              </ul>
          </div>
        `;
      }
      if (type === 'hd1') {
        return `
          <div class="bg-amber-50/80 border border-amber-200 p-3 rounded-xl mt-3 mb-4 shadow-sm border-l-[4px] border-l-amber-500 nls-injection relative text-xs">
              <span class="font-bold text-amber-900 block text-[11px] uppercase mb-1.5"><i class="fa-solid fa-bolt mr-1 text-amber-500"></i> TÍCH HỢP HOẠT ĐỘNG KHỞI ĐỘNG (SỐ & AI)${labelText}</span>
              <ul class="list-none pl-1 text-slate-700 space-y-2 leading-relaxed">
                  <li>
                      <span class="bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px]">[NLS 1.1-a]</span> 
                      <b>Tương tác số khởi động:</b> Giáo viên tổ chức trò chơi tương tác trên Quizizz/Kahoot hoặc quét mã QR khởi động cho ${topicText}.
                      <div class="mt-1.5 pl-2 border-l-[2px] border-amber-300 text-amber-900 bg-amber-100/40 py-1.5 pr-2 rounded-r text-[11px]">
                          <i>💡 <b>Ví dụ:</b> Học sinh quét mã QR tham gia khảo sát nhanh 3 câu hỏi trắc nghiệm liên quan đến ${topicText}. Hệ thống hiển thị biểu đồ kết quả tức thì.</i>
                      </div>
                  </li>
              </ul>
          </div>
        `;
      }
      if (type === 'hd2') {
        return `
          <div class="bg-rose-50/80 border border-rose-200 p-3 rounded-xl mt-3 mb-4 shadow-sm border-l-[4px] border-l-rose-500 nls-injection relative text-xs">
              <span class="font-bold text-rose-900 block text-[11px] uppercase mb-1.5"><i class="fa-solid fa-layer-group mr-1 text-rose-500"></i> TÍCH HỢP HOẠT ĐỘNG HÌNH THÀNH KIẾN THỨC (ĐA MIỀN NLS)${labelText}</span>
              <ul class="list-none pl-1 text-slate-700 space-y-2 leading-relaxed">
                  <li>
                      <span class="bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px]">[NLS 1.2-b & 2.4-a]</span> 
                      <b>Khai thác & Hợp tác số:</b> Học sinh tra cứu tài liệu mở (Wikipedia Edu, Sách số), thảo luận nhóm trên Padlet/Google Docs để phân tích nội dung trọng tâm của ${topicText}.
                  </li>
                  <li>
                      <span class="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px]">[AI-NLc: Prompting]</span> 
                      <b>Kĩ thuật Kỹ năng Prompt AI:</b> Học sinh đóng vai trò người điều khiển, nhập câu lệnh Prompt mở cho Trợ lý AI giải thích các khái niệm phức tạp trong ${topicText}.
                  </li>
              </ul>
          </div>
        `;
      }
      if (type === 'hd3') {
        return `
          <div class="bg-sky-50/80 border border-sky-200 p-3 rounded-xl mt-3 mb-4 shadow-sm border-l-[4px] border-l-sky-500 nls-injection relative text-xs">
              <span class="font-bold text-sky-900 block text-[11px] uppercase mb-1.5"><i class="fa-solid fa-pen-ruler mr-1 text-sky-500"></i> TÍCH HỢP HOẠT ĐỘNG LUYỆN TẬP (SÁNG TẠO SỐ)${labelText}</span>
              <ul class="list-none pl-1 text-slate-700 space-y-2 leading-relaxed">
                  <li>
                      <span class="bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px]">[NLS 3.1-a & 5.3-a]</span> 
                      <b>Sáng tạo & Mô phỏng số:</b> Học sinh sử dụng phần mềm sơ đồ tư duy (Canva, XMind) hoặc phần mềm mô phỏng (GeoGebra, PhET) để tổng kết và luyện tập nội dung ${topicText}.
                  </li>
              </ul>
          </div>
        `;
      }
      if (type === 'hd4') {
        return `
          <div class="bg-purple-50/80 border border-purple-200 p-3 rounded-xl mt-3 mb-4 shadow-sm border-l-[4px] border-l-purple-500 nls-injection relative text-xs">
              <span class="font-bold text-purple-900 block text-[11px] uppercase mb-1.5"><i class="fa-solid fa-rocket mr-1 text-purple-500"></i> TÍCH HỢP HOẠT ĐỘNG VẬN DỤNG (GIẢI QUYẾT VẤN ĐỀ)${labelText}</span>
              <ul class="list-none pl-1 text-slate-700 space-y-2 leading-relaxed">
                  <li>
                      <span class="bg-indigo-100 text-indigo-800 font-bold px-1.5 py-0.5 rounded font-mono mr-1 text-[10px]">[NLS 4.1-a & 5.3-a]</span> 
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
    const allNodes = Array.from(bodyContent.querySelectorAll('p, h1, h2, h3, h4, h5, div, strong, b'));

    let currentPeriodLabel = '';

    allNodes.forEach((node) => {
      const txt = (node.textContent || '').trim();
      const txtLower = txt.toLowerCase();

      // Check if this node represents a Period/Lesson header (e.g. "TIẾT 1", "TIẾT 2", "BÀI 1", "BÀI 2", "CHỦ ĐỀ 1")
      if (/(tiết\s+\d+|bài\s+\d+|chủ đề\s+\d+|tuần\s+\d+)/i.test(txt) && txt.length < 100) {
        currentPeriodLabel = txt;
      }

      // Check if we should inject next to this node
      // Ensure we don't inject inside an existing nls-injection block
      if (node.closest('.nls-injection')) return;
      const nextElem = node.nextElementSibling;
      if (nextElem && nextElem.classList.contains('nls-injection')) return;

      if (txtLower.includes('mục tiêu') || txtLower.includes('yêu cầu cần đạt')) {
        const wrapper = doc.createElement('div');
        wrapper.innerHTML = getGeneratorForActivity('muc-tieu', currentPeriodLabel);
        node.parentNode?.insertBefore(wrapper, node.nextSibling);
        injectedCount++;
      } else if (txtLower.includes('mở đầu') || txtLower.includes('khởi động')) {
        const wrapper = doc.createElement('div');
        wrapper.innerHTML = getGeneratorForActivity('hd1', currentPeriodLabel);
        node.parentNode?.insertBefore(wrapper, node.nextSibling);
        injectedCount++;
      } else if (txtLower.includes('hình thành kiến thức') || txtLower.includes('tìm hiểu chi tiết')) {
        const wrapper = doc.createElement('div');
        wrapper.innerHTML = getGeneratorForActivity('hd2', currentPeriodLabel);
        node.parentNode?.insertBefore(wrapper, node.nextSibling);
        injectedCount++;
      } else if (txtLower.includes('luyện tập') || txtLower.includes('tổng kết')) {
        const wrapper = doc.createElement('div');
        wrapper.innerHTML = getGeneratorForActivity('hd3', currentPeriodLabel);
        node.parentNode?.insertBefore(wrapper, node.nextSibling);
        injectedCount++;
      } else if (txtLower.includes('vận dụng') || txtLower.includes('mở rộng')) {
        const wrapper = doc.createElement('div');
        wrapper.innerHTML = getGeneratorForActivity('hd4', currentPeriodLabel);
        node.parentNode?.insertBefore(wrapper, node.nextSibling);
        injectedCount++;
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

    return legalHeader + '<div class="docx-content space-y-3 leading-relaxed text-sm text-slate-800">' + bodyContent.innerHTML + '</div>';
  } catch (err) {
    console.error('Error parsing lesson HTML:', err);
    return legalHeader + htmlInput;
  }
}
