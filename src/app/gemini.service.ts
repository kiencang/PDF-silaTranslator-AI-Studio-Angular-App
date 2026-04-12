import { Injectable } from '@angular/core';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;
  private readonly MODEL_NAME_PRO = 'gemini-3.1-pro-preview';
  private readonly MODEL_NAME_FLASH = 'gemini-flash-latest';

  constructor() {
    // GEMINI_API_KEY is injected via angular.json define
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async countTokens(fileData: string, mimeType: string): Promise<number> {
    const response = await this.ai.models.countTokens({
      model: this.MODEL_NAME_FLASH,
      contents: [
        mimeType === 'text/html' ? fileData : {
          inlineData: {
            data: fileData,
            mimeType: mimeType
          }
        }
      ]
    });
    return response.totalTokens || 0;
  }

  async translate(
    fileData: string,
    mimeType: string,
    prompt: string,
    systemInstruction: string,
    temperature: number
  ): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.MODEL_NAME_PRO,
      contents: [
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType
          }
        },
        prompt
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: temperature,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    return response.text || '';
  }

  async translateHtml(
    htmlContent: string,
    prompt: string,
    systemInstruction: string,
    temperature: number
  ): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: this.MODEL_NAME_PRO,
      contents: [
        htmlContent,
        prompt
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: temperature,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    return response.text || '';
  }

  async translateSearchQuery(query: string): Promise<string> {
    const systemInstruction = `Bạn là một AI chuyên dịch truy vấn tìm kiếm (search queries) từ tiếng Việt sang tiếng Anh. Nhiệm vụ DUY NHẤT của bạn là trả về MỘT (1) truy vấn tìm kiếm tiếng Anh hiệu quả nhất, dựa trên đánh giá của bạn về ý định (search intent) và cách tìm kiếm phổ biến nhất trong tiếng Anh.

QUY TẮC BẮT BUỘC TUÂN THỦ:
1.  **CHỈ MỘT KẾT QUẢ:** Luôn luôn và chỉ luôn trả về DUY NHẤT MỘT chuỗi văn bản là bản dịch truy vấn tốt nhất. KHÔNG được đưa ra nhiều lựa chọn.
2.  **CHỈ VĂN BẢN THUẦN TÚY:** Kết quả trả về CHỈ BAO GỒM văn bản tiếng Anh đã dịch. TUYỆT ĐỐI KHÔNG thêm bất kỳ lời chào, lời giải thích, ghi chú, dấu ngoặc kép bao quanh, định dạng markdown, hoặc bất kỳ ký tự/từ ngữ nào khác ngoài chính truy vấn đã dịch.
3.  **ƯU TIÊN HIỆU QUẢ TÌM KIẾM HỌC THUẬT:** Mục tiêu là tạo ra truy vấn mà các nhà nghiên cứu, sinh viên thực sự sẽ gõ vào máy tìm kiếm tài liệu khoa học (như Google Scholar). Ưu tiên thuật ngữ chuyên ngành (academic terminology), danh từ cốt lõi, và các từ khóa nghiên cứu phổ biến (ví dụ: impact of, efficacy, meta-analysis, case study, literature review, characteristics, v.v.). Tránh các từ giao tiếp thông thường.
4.  **ĐỘ CHÍNH XÁC VỀ Ý ĐỊNH:** Nắm bắt chính xác nhất ý định đằng sau truy vấn gốc tiếng Việt. Nếu mơ hồ, hãy chọn cách diễn giải phổ biến hoặc khả năng cao nhất.
5.  **ĐỊNH DẠNG ĐẦU RA:** Đảm bảo đầu ra là một chuỗi văn bản thuần túy (plain text string) duy nhất, sẵn sàng để sao chép và dán trực tiếp vào thanh tìm kiếm.`;

    const prompt = `Provide the single best English search query translation for the following Vietnamese query. Output ONLY the raw English text, nothing else: ${query}`;

    const response = await this.ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [prompt],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.1 // Low temperature for more deterministic output
      }
    });

    return (response.text || '').trim();
  }
}
