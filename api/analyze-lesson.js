import { GoogleGenAI } from '@google/genai';

export default async function handler(req, res) {
  // CORS Headers for Vercel
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { lessonContent, subject, grade, framework, template, customInstruction } = req.body || {};

    if (!lessonContent || typeof lessonContent !== 'string') {
      return res.status(400).json({ error: 'Nội dung giáo án không hợp lệ' });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
      const ai = new GoogleGenAI({ apiKey });

      const systemInstruction = `Bạn là Chuyên gia Giáo dục & AI Cao cấp của Bộ Giáo dục và Đào tạo Việt Nam (Bộ GD&ĐT). 
Nhiệm vụ của bạn là bóc tách, đối chiếu và bổ sung trực tiếp các Chỉ số Năng lực số (NLS) và Trí tuệ nhân tạo (AI) vào Kế hoạch bài dạy (KHBD).

Căn cứ pháp lý bắt buộc phải tuân thủ:
1. Cấu trúc KHBD chuẩn theo **Công văn 5512/BGDĐT-GDTrH**.
2. Khung Năng lực số theo **Thông tư 02/2025/TT-BGDĐT** (6 Miền - 24 Năng lực thành phần). Các thẻ chỉ báo có dạng: [NLS 1.1-a], [NLS 2.4-a], [NLS 3.1-a], [NLS 4.2-c], [NLS 5.3-a].
3. Khung thí điểm Giáo dục AI theo **Quyết định 3439/QĐ-BGDĐT (2025)**. Các thẻ có dạng: [AI-NLa: Human Centered], [AI-NLb: AI Ethics], [AI-NLc: Prompting], [AI-NLd: AI Design].

YÊU CẦU ĐẦU RA:
- Trả về mã HTML đẹp mắt, rõ ràng, giàu định dạng.
- GIỮ NGUYÊN hoặc làm phong phú thêm toàn bộ nội dung chuyên môn của bài học gốc.
- Với mỗi Hoạt động dạy học (CV 5512), chèn một khối nổi bật (styled block) giải thích cụ thể mã thẻ NLS/AI, hoạt động GV/HS và gợi ý Prompt AI.
- Chỉ trả về duy nhất đoạn mã HTML kết quả.`;

      const prompt = `Hãy tích hợp Năng lực số & AI vào Kế hoạch bài dạy sau:
Môn học: ${subject || 'Toán học'}
Lớp: ${grade || 'Lớp 10'}
Khung NLS áp dụng: ${framework || 'TT 02/2025/TT-BGDĐT'}
Cấu trúc mẫu: ${template || 'CV 5512/BGDĐT-GDTrH'}
${customInstruction ? `Yêu cầu bổ sung: ${customInstruction}` : ''}

NỘI DUNG GIÁO ÁN GỐC:
${lessonContent.substring(0, 8000)}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });

      let responseText = response.text || '';
      responseText = responseText.replace(/^```html\s*/i, '').replace(/```$/i, '').trim();

      return res.status(200).json({ success: true, integratedHtml: responseText, source: 'gemini' });
    } else {
      return res.status(200).json({
        success: true,
        integratedHtml: null,
        message: 'No Gemini API key configured on Vercel',
      });
    }
  } catch (error) {
    console.error('Vercel API error:', error);
    return res.status(500).json({ error: error.message || 'Lỗi khi xử lý bài dạy' });
  }
}
