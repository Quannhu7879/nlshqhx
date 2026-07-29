import { CompetencyDomain, LegalDocument } from '../types';

export const competencyLibraryData: CompetencyDomain[] = [
  {
    id: "domain-1",
    code: "MIỀN 1 - TT 02/2025",
    title: "Khai thác dữ liệu và thông tin",
    icon: "fa-magnifying-glass",
    description: "Xác định nhu cầu thông tin; tìm kiếm, lọc, phân tích và đánh giá độ tin cậy của dữ liệu và nội dung số.",
    fullDescription: "Tập trung vào khả năng xác định rõ nhu cầu thông tin; truy cập, lọc và khai thác kết quả tìm kiếm trong môi trường số. Phân tích, so sánh và đánh giá độ tin cậy, tính xác thực của nguồn dữ liệu và nội dung số để hỗ trợ ra quyết định hoặc giải quyết vấn đề.",
    components: [
      { code: "1.1", title: "Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số", tag: "[NLS 1.1-a]" },
      { code: "1.2", title: "Đánh giá dữ liệu, thông tin và nội dung số (Độ tin cậy & Tính xác thực)", tag: "[NLS 1.2-b]" },
      { code: "1.3", title: "Quản lý, tổ chức và lưu trữ dữ liệu, thông tin và nội dung số", tag: "[NLS 1.3-a]" }
    ],
    lessonGuide: "Tích hợp mạnh ở **Hoạt động 1 (Khởi động)** và **Hoạt động 2 (Hình thành kiến thức mới)**: Giao nhiệm vụ cho học sinh tự tìm kiếm dữ liệu, phân tích biểu đồ, tra cứu tài nguyên số trên Internet hoặc các kho học liệu mở.",
    tools: ["Google Search", "Perplexity AI", "ChatGPT", "Google Scholar", "Wikipedia Edu"]
  },
  {
    id: "domain-2",
    code: "MIỀN 2 - TT 02/2025",
    title: "Giao tiếp và hợp tác trong môi trường số",
    icon: "fa-comments",
    description: "Tương tác, chia sẻ thông tin, hợp tác đồng sáng tạo nội dung số và quản lý danh tính số an toàn.",
    fullDescription: "Sử dụng công nghệ số để giao tiếp hiệu quả, chia sẻ tài nguyên, đồng sáng tạo kiến thức nhóm. Nhận thức đúng quy tắc ứng xử trên mạng (Digital Etiquette), đa dạng văn hóa và bảo vệ danh tiếng/danh tính số cá nhân.",
    components: [
      { code: "2.1", title: "Tương tác thông qua các phương tiện giao tiếp số", tag: "[NLS 2.1-a]" },
      { code: "2.2", title: "Chia sẻ thông tin và thực hành trích dẫn ghi nguồn", tag: "[NLS 2.2-b]" },
      { code: "2.3", title: "Sử dụng dịch vụ số thực hiện trách nhiệm công dân", tag: "[NLS 2.3-a]" },
      { code: "2.4", title: "Hợp tác và đồng sáng tạo dữ liệu/tài nguyên số", tag: "[NLS 2.4-a]" },
      { code: "2.5", title: "Quy tắc ứng xử trên mạng (Nghi thức số)", tag: "[NLS 2.5-c]" },
      { code: "2.6", title: "Quản lý và bảo vệ danh tính số cá nhân", tag: "[NLS 2.6-a]" }
    ],
    lessonGuide: "Tích hợp ở **Hoạt động 2 & 3 (Hình thành kiến thức & Luyện tập)**: Tổ chức thảo luận nhóm trực tuyến trên Padlet, Google Docs/Slides, MS Teams, yêu cầu ghi rõ nguồn tư liệu trích dẫn.",
    tools: ["Padlet", "Google Docs", "MS Teams", "Canva Team", "Slack Edu"]
  },
  {
    id: "domain-3",
    code: "MIỀN 3 - TT 02/2025",
    title: "Sáng tạo nội dung số",
    icon: "fa-pen-ruler",
    description: "Tạo lập, chỉnh sửa nội dung số ở nhiều định dạng, áp dụng bản quyền số và lập trình cơ bản.",
    fullDescription: "Phát triển, tinh chỉnh và tích hợp nội dung số ở các định dạng văn bản, hình ảnh, âm thanh, video hoặc mô hình tương tác. Hiểu và thực thi quy định bản quyền, giấy phép mở (Creative Commons) và phát triển câu lệnh/thuật toán lập trình.",
    components: [
      { code: "3.1", title: "Phát triển và chỉnh sửa nội dung số đa phương tiện", tag: "[NLS 3.1-a]" },
      { code: "3.2", title: "Tích hợp, tái cấu trúc và tạo lập lại nội dung số mới", tag: "[NLS 3.2-a]" },
      { code: "3.3", title: "Thực thi bản quyền, giấy phép sở hữu trí tuệ số", tag: "[NLS 3.3-b]" },
      { code: "3.4", title: "Lập trình & tư duy phát triển chuỗi lệnh cho máy tính", tag: "[NLS 3.4-a]" }
    ],
    lessonGuide: "Tích hợp ở **Hoạt động 3 (Luyện tập)** & **Hoạt động 4 (Vận dụng)**: Học sinh thiết kế Infographic, làm Video ngắn trên CapCut, trình bày báo cáo bằng Canva AI hoặc lập trình mô phỏng Scratch.",
    tools: ["Canva AI", "Scratch AI", "CapCut", "Gamma App", "GeoGebra"]
  },
  {
    id: "domain-4",
    code: "MIỀN 4 - TT 02/2025",
    title: "An toàn và An sinh số",
    icon: "fa-shield-halved",
    description: "Bảo vệ thiết bị, dữ liệu cá nhân, quyền riêng tư, sức khỏe thể chất/tinh thần và môi trường số.",
    fullDescription: "Trang bị kỹ năng bảo vệ thiết bị trước phần mềm độc hại; quản lý và bảo vệ quyền riêng tư cá nhân; phòng tránh nguy cơ bắt nạt trên mạng (Cyberbullying); duy trì sự cân bằng giữa cuộc sống thực và môi trường số.",
    components: [
      { code: "4.1", title: "Bảo vệ thiết bị số và phòng tránh rủi ro an ninh mạng", tag: "[NLS 4.1-a]" },
      { code: "4.2", title: "Bảo vệ dữ liệu cá nhân và quyền riêng tư trong không gian số", tag: "[NLS 4.2-c]" },
      { code: "4.3", title: "Bảo vệ sức khỏe thể chất, tinh thần & an sinh số", tag: "[NLS 4.3-a]" },
      { code: "4.4", title: "Nhận thức tác động của công nghệ số đến môi trường", tag: "[NLS 4.4-b]" }
    ],
    lessonGuide: "Tích hợp trong **Mục tiêu Phẩm chất (Trách nhiệm & Trung thực)** và **Lưu ý Giáo viên**: Hướng dẫn học sinh đặt mật khẩu an toàn, bảo mật thông tin cá nhân khi đăng ký ứng dụng học tập.",
    tools: ["Xác thực 2 lớp (2FA)", "Cấu hình Quyền riêng tư", "Nghi thức An toàn mạng"]
  },
  {
    id: "domain-5",
    code: "MIỀN 5 - TT 02/2025",
    title: "Giải quyết vấn đề kỹ thuật & Công nghệ",
    icon: "fa-wrench",
    description: "Xác định sự cố kỹ thuật, đánh giá nhu cầu và lựa chọn giải pháp công nghệ sáng tạo.",
    fullDescription: "Tự chẩn đoán và khắc phục các sự cố phần cứng/phần mềm thông thường. Đánh giá nhu cầu thực tế để lựa chọn công cụ kỹ thuật số tối ưu; ứng dụng công nghệ để đổi mới quy trình học tập và cập nhật năng lực số cá nhân.",
    components: [
      { code: "5.1", title: "Xác định và xử lý các sự cố kỹ thuật thông thường", tag: "[NLS 5.1-a]" },
      { code: "5.2", title: "Xác định nhu cầu và lựa chọn giải pháp công nghệ phù hợp", tag: "[NLS 5.2-a]" },
      { code: "5.3", title: "Sử dụng sáng tạo công nghệ số để đổi mới sản phẩm", tag: "[NLS 5.3-a]" },
      { code: "5.4", title: "Đánh giá khoảng trống năng lực số và tự nâng cấp bản thân", tag: "[NLS 5.4-b]" }
    ],
    lessonGuide: "Tích hợp ở **Hoạt động 2 & 3**: Khuyến khích học sinh chủ động thử nghiệm giải pháp công nghệ thay thế khi ứng dụng gặp lỗi, hoặc đề xuất phần mềm mô phỏng phù hợp bài học.",
    tools: ["PhET Simulations", "GeoGebra Dynamic", "Google Colab", "Mô phỏng 3D"]
  },
  {
    id: "domain-6",
    code: "MIỀN 6 - TT 02/2025 & QĐ 3439",
    title: "Ứng dụng Trí tuệ Nhân tạo (AI)",
    icon: "fa-robot",
    description: "Hiểu biết nguyên lý AI, sử dụng AI có đạo đức/trách nhiệm và đánh giá chất lượng kết quả AI.",
    fullDescription: "Nắm vững nguyên lý hoạt động của AI/GenAI (Dữ liệu -> Mô hình -> Dự đoán). Sử dụng kỹ thuật Prompt Engineering để giao tiếp với AI; kiểm chứng thông tin và đánh giá rủi ro đạo đức, thiên vị thuật toán (QĐ 3439/QĐ-BGDĐT).",
    components: [
      { code: "6.1", title: "Tư duy lấy con người làm trung tâm (NLa - QĐ 3439)", tag: "[AI-NLa: Human Centered]" },
      { code: "6.2", title: "Đạo đức AI & Sử dụng có trách nhiệm (NLb - QĐ 3439)", tag: "[AI-NLb: AI Ethics]" },
      { code: "6.3", title: "Kĩ thuật Kỹ năng Prompt & Ứng dụng AI (NLc - QĐ 3439)", tag: "[AI-NLc: Prompting]" },
      { code: "6.4", title: "Thiết kế & Đánh giá hệ thống AI (NLd - QĐ 3439)", tag: "[AI-NLd: AI Design]" }
    ],
    lessonGuide: "Tích hợp xuyên suốt **4 Hoạt động chuẩn CV 5512**: Dùng Quizizz AI khởi động, ChatGPT/Gemini tạo gợi ý thảo luận, Teachable Machine thực hành nhận diện và kiểm chứng sản phẩm AI tạo sinh.",
    tools: ["ChatGPT / Gemini", "Teachable Machine", "Quizizz AI", "Claude AI", "QuickDraw AI"]
  }
];

export const legalDocsData: LegalDocument[] = [
  {
    id: "doc-tt02",
    code: "Thông tư 02/2025/TT-BGDĐT",
    title: "Khung Năng Lực Số Cho Người Học Trong Hệ Thống Giáo Dục Quốc Dân",
    date: "24/01/2025",
    authority: "Bộ Giáo dục và Đào tạo",
    summary: "Quy định 6 miền năng lực và 24 năng lực thành phần từ Bậc 1 đến Bậc 8, làm căn cứ đối chiếu chỉ số cho học sinh.",
    highlights: ["6 Miền Năng lực số", "24 Năng lực thành phần", "Chuẩn đánh giá đa bậc học"],
    icon: "fa-file-contract",
    color: "brand"
  },
  {
    id: "doc-qd3439",
    code: "Quyết định 3439/QĐ-BGDĐT",
    title: "Khung Thí Điểm Giáo Dục AI Cho Học Sinh Phổ Thông",
    date: "15/12/2025",
    authority: "Bộ Giáo dục và Đào tạo",
    summary: "Cấu trúc xoay quanh 4 mạch kiến thức & năng lực AI cốt lõi: Tư duy lấy con người làm trung tâm, Đạo đức AI, Kĩ thuật & Ứng dụng AI, Thiết kế hệ thống AI.",
    highlights: ["4 Mạch Năng lực AI", "Đạo đức & Trách nhiệm AI", "Prompt Engineering trong trường học"],
    icon: "fa-robot",
    color: "amber"
  },
  {
    id: "doc-cv5512",
    code: "Công văn 5512/BGDĐT-GDTrH",
    title: "Xây Dựng Và Tổ Chức Thực Hiện Kế Hoạch Giáo Dục Của Nhà Trường",
    date: "18/12/2020",
    authority: "Bộ Giáo dục và Đào tạo",
    summary: "Quy định cấu trúc Kế hoạch bài dạy chuẩn gồm: I. Mục tiêu; II. Thiết bị dạy học & Học liệu; III. Tiến trình dạy học với 4 Hoạt động chuẩn.",
    highlights: ["Chuẩn 4 Hoạt động dạy học", "Mục tiêu 3 thành tố", "Khung tổ chức thực hiện"],
    icon: "fa-pen-ruler",
    color: "emerald"
  }
];
