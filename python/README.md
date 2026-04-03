# LearnAI / Alchemy - Custom Python ML Backend

Thư mục này chứa toàn bộ mã nguồn Python để bạn có thể TỰ HUẤN LUYỆN (Train) và CHẠY (Serve) các mô hình AI riêng biệt cho ứng dụng LearnAI, thay thế cho việc gọi API của Google Gemini.

## 1. Hướng dẫn lấy thư mục này ra ngoài để dùng (Export)

Vì môi trường hiện tại là Node.js (Web), bạn không thể chạy Python trực tiếp ở đây. Bạn cần tải thư mục này về máy tính cá nhân (hoặc server riêng có GPU).

**Cách lấy ra:**
1. Mở Terminal (dấu `+` -> `New Terminal` ở dưới cùng màn hình).
2. Chạy lệnh nén thư mục này lại:
   ```bash
   zip -r python_backend.zip python/
   ```
3. Ở cây thư mục bên trái, tìm file `python_backend.zip`, click chuột phải và chọn **Download**.
4. Giải nén file zip này trên máy tính của bạn.

---

## 2. Cài đặt môi trường trên máy tính của bạn

Sau khi giải nén, mở Terminal/Command Prompt tại thư mục `python` và chạy các lệnh sau:

```bash
# 1. Tạo môi trường ảo (Virtual Environment) để không ảnh hưởng máy tính
python -m venv venv

# 2. Kích hoạt môi trường (Windows)
venv\Scripts\activate
# Hoặc trên Mac/Linux: source venv/bin/activate

# 3. Cài đặt các thư viện cần thiết
pip install -r requirements.txt
```

---

## 3. Hướng dẫn Tự Huấn Luyện (Train) Model

### A. Huấn luyện LLM (Tạo Flashcard, Quiz, Tóm tắt)
Chúng ta sẽ dùng phương pháp **QLoRA (Fine-tuning)** trên mô hình mã nguồn mở như `Llama-3-8B` hoặc `Mistral-7B`.

1. Chuẩn bị dữ liệu: Mở file `data/train_data.jsonl` và điền các ví dụ mẫu theo định dạng có sẵn.
2. Chạy script huấn luyện:
   ```bash
   python src/nlp/train_llm.py
   ```
3. Sau khi chạy xong (có thể mất vài giờ tùy GPU), model mới sẽ được lưu vào thư mục `models/alchemy_llm_finetuned/`.

### B. Các Model Khác (Không cần train, chỉ cần tải về dùng)
- **OCR (Quét ảnh):** Dùng thư viện `EasyOCR` hoặc `TrOCR`. Đã được tích hợp sẵn trong `src/ocr/`.
- **Speech-to-Text (Ghi âm):** Dùng `Whisper` của OpenAI. Đã tích hợp trong `src/speech/`.
- **Semantic Resonance (Tìm kiếm ngữ nghĩa):** Dùng `SentenceTransformers`. Đã tích hợp trong `src/embeddings/`.

---

## 4. Chạy Server AI (Serve)

Sau khi đã có model, bạn cần bật một Server Python (FastAPI) để ứng dụng React của bạn có thể gọi đến.

1. Chạy lệnh:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
2. Server AI của bạn sẽ chạy tại: `http://localhost:8000`
3. Bạn có thể xem tài liệu API tự động tại: `http://localhost:8000/docs`

---

## 5. Kết nối React App với Python Server

Trong code React của bạn (ví dụ file `services/geminiService.ts`), thay vì gọi `ai.models.generateContent`, bạn đổi thành gọi API của Python Server:

```typescript
// Ví dụ gọi API tạo Flashcard từ Python Server của bạn
export const generateFromMyPythonServer = async (text: string) => {
  const response = await fetch('http://localhost:8000/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: text, task: 'flashcard' })
  });
  const data = await response.json();
  return data.result;
};
```
