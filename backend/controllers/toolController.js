const cheerio = require('cheerio');


// @desc    Scrape content from a URL
// @route   POST /api/tools/scrape
const scrapeUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Deep clean extraction using Cheerio
    const $ = cheerio.load(html);
    
    // Remove unwanted stylistic, functional, and navigational elements
    $('script, style, noscript, iframe, svg, nav, footer, header, aside').remove();
    
    // Extract raw text and normalize whitespace
    let textContent = $('body').text() || $.text();
    textContent = textContent.replace(/\s+/g, ' ').trim();
    
    res.json({ content: html, textContent: textContent });

  } catch (error) {
    console.error('Scrape Error:', error);
    res.status(500).json({ message: `Could not scrape URL: ${error.message}` });
  }
};

// @desc    Intelligently OCR an image using Vision LLM
// @route   POST /api/tools/vision-ocr
const visionOcr = async (req, res) => {
  const { base64Image, mimeType } = req.body;
  const apiKey = req.headers['x-gemini-api-key'] || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(401).json({ message: 'Vui lòng cấu hình API Key (Gemini) trong mục Cài đặt trước khi sử dụng tính năng này.' });
  }

  if (!base64Image) {
    return res.status(400).json({ message: 'base64Image is required' });
  }

  try {
    const { GoogleGenAI } = require('@google/genai');
    const ai = new GoogleGenAI({ apiKey });
    
    // Extract mimetype from data uri if present
    let actualMimeType = mimeType || 'image/jpeg';
    const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
    if (mimeMatch) {
        actualMimeType = mimeMatch[1];
    }

    // Clean up base64 string if it contains the data uri prefix
    const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

    const systemPrompt = `Bạn là một chuyên gia nhận diện hình ảnh và cấu trúc văn bản.
Nhiệm vụ của bạn là lấy toàn bộ văn bản có trong bức ảnh này và chuyển đổi nó thành định dạng Markdown chuẩn xác nhất.
- BẮT BUỘC: Nếu phát hiện văn bản in đậm, hãy dùng **in đậm**.
- BẮT BUỘC: Nếu phát hiện cỡ chữ lớn đóng vai trò là tiêu đề (Heading), hãy bọc bằng thẻ #, ##, hoặc ###.
- BẮT BUỘC: Nếu phát hiện dữ liệu được sắp xếp theo dạng bảng (Table), hãy căn hàng và định dạng bằng cấu trúc Markdown Table (| Cột 1 | Cột 2 |).
- BẮT BUỘC: Nếu là danh sách, hãy dùng gạch đầu dòng (-).
TUYỆT ĐỐI GHI NHỚ: Không được thêm bất kỳ câu giao tiếp, lời chào hỏi, hay giải thích nào. Bạn chỉ là một cái máy dịch. CHỈ trả về đúng đoạn văn bản Markdown thuần túy.`;

    const modelsList = ['gemini-3-flash-preview', 'gemini-2.0-flash-exp', 'gemini-1.5-flash-latest'];
    let responseText = null;
    let lastError = null;

    for (const modelName of modelsList) {
      try {
        console.log(`[VisionOCR] Attempting with model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                { text: systemPrompt },
                {
                  inlineData: {
                    data: base64Data,
                    mimeType: actualMimeType
                  }
                }
              ]
            }
          ]
        });
        
        responseText = response.text;
        break; // Sucessful
      } catch (err) {
        lastError = err;
        console.warn(`[VisionOCR] Model ${modelName} failed:`, err.message);
        // Fallback to next model if it's a 503 or 429
        if (err.status !== 503 && err.status !== 429 && !err.message.includes('503')) {
           throw err; // Re-throw if it's an auth error or something else we can't recover from
        }
      }
    }

    if (!responseText) {
      throw lastError || new Error("All configured models failed.");
    }

    res.json({ content: responseText });
  } catch (error) {
    console.error('Vision OCR Error:', error);
    res.status(500).json({ message: `Could not process image: ${error.message}` });
  }
};

module.exports = { scrapeUrl, visionOcr };
