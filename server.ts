import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy init for Gemini SDK
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', hasGeminiKey: !!getGeminiClient() });
});

// AI Lesson Analysis & Digital Competency Integration Endpoint
app.post('/api/analyze-lesson', async (req, res) => {
  try {
    const { lessonContent, subject, grade, framework, template, customInstruction } = req.body;

    if (!lessonContent || typeof lessonContent !== 'string') {
      return res.status(400).json({ error: 'Nội dung giáo án không hợp lệ' });
    }

    const ai = getGeminiClient();

    if (ai) {
      const systemInstruction = `Bạn là Chuyên gia Giáo dục & AI Cao cấp của Bộ Giáo dục và Đào tạo Việt Nam (Bộ GD&ĐT). 
Nhiệm vụ của bạn là bóc tách, đối chiếu và bổ sung trực tiếp các Chỉ số Năng lực số (NLS) thuộc ĐỦ 6 MIỀN NĂNG LỰC SỐ và Trí tuệ nhân tạo (AI) vào Kế hoạch bài dạy (KHBD).

CẢNH BÁO QUAN TRỌNG VỀ TOÀN BỘ GIÁO ÁN (NHIỀU TIẾT / BÀI / CHỦ ĐỀ):
- Giáo án gốc gửi lên có thể gồm NHIỀU TIẾT/BÀI/CHỦ ĐỀ (Ví dụ: Tiết 1, Tiết 2, Tiết 3, Tiết 4, Bài 1, Bài 2, Tuần 1, Tuần 2,...).
- Bạn BẮT BUỘC phải tích hợp Năng lực số (NLS) và AI vào TOÀN BỘ tất cả các Tiết/Bài/Mục có trong tài liệu từ ĐẦU đến CUỐI.
- TUYỆT ĐỐI KHÔNG ĐƯỢC chỉ làm 1-2 tiết đầu rồi dừng lại. Tất cả các Tiết/Bài phía sau đều phải có các khối Tích hợp Năng lực số (NLS) & AI tương ứng.
- GIỮ NGUYÊN TOÀN BỘ NỘI DUNG VÀ CẤU TRÚC CHUYÊN MÔN CỦA TẤT CẢ CÁC TIẾT/BÀI TỪ ĐẦU ĐẾN CUỐI FILE GỐC.

Căn cứ pháp lý bắt buộc phải tuân thủ:
1. Cấu trúc KHBD chuẩn theo **Công văn 5512/BGDĐT-GDTrH** (gồm: I. MỤC TIÊU BÀI HỌC, II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU SỐ, III. TIẾN TRÌNH DẠY HỌC - 4 Hoạt động: Mở đầu/Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng).
2. Khung Năng lực số theo **Thông tư 02/2025/TT-BGDĐT (Đủ 6 Miền Năng lực số)**:
   - Miền 1: Dữ liệu và thông tin [NLS 1.1 đến 1.3]
   - Miền 2: Giao tiếp và hợp tác trong môi trường số [NLS 2.1 đến 2.4]
   - Miền 3: Sáng tạo nội dung số [NLS 3.1 đến 3.4]
   - Miền 4: An toàn số và bảo mật [NLS 4.1 đến 4.4]
   - Miền 5: Giải quyết vấn đề trong môi trường số [NLS 5.1 đến 5.4]
   - Miền 6: Học tập và phát triển kỹ năng số liên tục [NLS 6.1 đến 6.4]
3. Khung thí điểm Giáo dục AI theo **Quyết định 3439/QĐ-BGDĐT (2025)** (4 Mạch Năng lực AI). Các thẻ có dạng: [AI-NLa: Human Centered], [AI-NLb: AI Ethics], [AI-NLc: Prompting], [AI-NLd: AI Design].

YÊU CẦU ĐẦU RA BẮT BUỘC:
- Ở ĐẦU BÀI DẠY: Tạo khối HTML BẢNG THIẾT LẬP VÀ PHÂN BỔ 6 MIỀN NĂNG LỰC SỐ (TT 02/2025) tổng quan.
- Trả về mã HTML đẹp mắt, rõ ràng, giàu định dạng (sử dụng các thẻ <div>, <span>, <ul>, <li>, <b>, <i>, <code>) để hiển thị trực tiếp trong giao diện và xuất file Word (.docx) chuẩn font Times New Roman.
- Đối với MỖI Tiết/Bài và MỖI Hoạt động dạy học (CV 5512), hãy chèn một khối nổi bật (styled block) giải thích cụ thể:
  + Tên Miền NLS & Mã thẻ chỉ báo NLS/AI áp dụng cho tiết/hoạt động đó.
  + Hành động cụ thể của Giáo viên & Học sinh khi dùng công cụ số (Google Search, GeoGebra, Padlet, Quizizz, Canva, ChatGPT, PhET...).
  + Mẫu câu lệnh AI (Prompt sample) thực tế cho giáo viên/học sinh nếu có.
- Chỉ trả về duy nhất đoạn mã HTML kết quả (không bọc trong markdown \`\`\`html \`\`\`).`;

      const prompt = `Hãy tích hợp Năng lực số & AI vào TOÀN BỘ các Tiết/Bài trong Kế hoạch bài dạy sau từ ĐẦU đến CUỐI:
Môn học: ${subject || 'Toán học'}
Lớp: ${grade || 'Lớp 10'}
Khung NLS áp dụng: ${framework || 'TT 02/2025/TT-BGDĐT'}
Cấu trúc mẫu: ${template || 'CV 5512/BGDĐT-GDTrH'}
${customInstruction ? `Yêu cầu bổ sung: ${customInstruction}` : ''}

NỘI DUNG TOÀN BỘ GIÁO ÁN GỐC (HÃY TÍCH HỢP CHO TẤT CẢ CÁC TIẾT/BÀI TRONG FILE):
${lessonContent}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      let responseText = response.text || '';
      // Clean up markdown block syntax if present
      responseText = responseText.replace(/^```html\s*/i, '').replace(/```$/i, '').trim();

      return res.json({ success: true, integratedHtml: responseText, source: 'gemini' });
    } else {
      // Fallback message indicating API Key mode vs rule mode
      return res.json({
        success: true,
        integratedHtml: null,
        message: 'No Gemini API key attached, fallback to client-side smart parser',
      });
    }
  } catch (error: any) {
    console.error('Error analyzing lesson with Gemini:', error);
    res.status(500).json({ error: error.message || 'Lỗi khi phân tích bằng AI' });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
