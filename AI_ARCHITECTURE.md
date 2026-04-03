# Phân tích Kiến trúc AI (AI Architecture Analysis)

Dưới đây là phân tích chi tiết các file cốt lõi liên quan đến tính năng AI trong hệ thống, bao gồm Models, Controllers và Services.

## 1. Models (Cơ sở dữ liệu)

- 📄 **Tên file:** `backend/models/VectorStore.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ các đoạn văn bản (text chunks) và vector nhúng (embeddings) tương ứng của chúng. Đây là "bộ não" cho tính năng tìm kiếm ngữ nghĩa (Semantic Search) và RAG (Retrieval-Augmented Generation).
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: `BackgroundWorker`, `ragController`, `globalKnowledgeController`.
    - Gọi đến: MongoDB (sử dụng collection `vectorstores` với Atlas Vector Search Index).

- 📄 **Tên file:** `backend/models/UserMemory.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ trí nhớ dài hạn của người dùng (sở thích, thông tin cá nhân, ngữ cảnh) được trích xuất tự động từ lịch sử trò chuyện.
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: `BackgroundWorker` (khi trích xuất trí nhớ), `userMemoryController`, `chat.controller.js` (để lấy ngữ cảnh cho prompt).

- 📄 **Tên file:** `backend/models/AlchemyStorageItem.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ các tài liệu thô được người dùng tải lên hoặc thu thập (ghi chú, OCR, giọng nói, web, v.v.) trước khi chúng được xử lý và đưa vào VectorStore.
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: `alchemyController`.

- 📄 **Tên file:** `backend/models/Note.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ cấu trúc ghi chú dạng cây (folder, project, note) của người dùng. Nội dung ghi chú cũng sẽ được đồng bộ sang VectorStore để AI có thể tìm kiếm.
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: `noteController`.

## 2. Controllers (Xử lý logic API)

- 📄 **Tên file:** `backend/controllers/chat.controller.js`
  - 🎯 **Nhiệm vụ chính:** Xử lý luồng chat chính của AI. Kết hợp lịch sử chat (Tier 1), trí nhớ người dùng (Tier 3) và gọi `AIOrchestrator` để sinh câu trả lời. Kích hoạt `BackgroundWorker` để trích xuất trí nhớ ngầm.
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: API Route `/api/chat/ai`.
    - Gọi đến: `Message` model, `UserMemory` model, `AIOrchestrator` service, `BackgroundWorker` service.

- 📄 **Tên file:** `backend/controllers/ragController.js`
  - 🎯 **Nhiệm vụ chính:** Xử lý việc thêm tài liệu vào cơ sở dữ liệu RAG (chia nhỏ văn bản, tạo vector cục bộ) và tìm kiếm tài liệu dựa trên độ tương đồng vector (Vector Similarity Search).
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: API Routes `/api/rag/*`.
    - Gọi đến: `VectorStore` model, `@xenova/transformers` (để tạo local embedding), `@langchain/textsplitters` (để chia nhỏ văn bản), MongoDB Atlas Vector Search.

- 📄 **Tên file:** `backend/controllers/userMemoryController.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý (thêm, sửa, xóa, tìm kiếm) các mảng ký ức của người dùng. Sử dụng AI cục bộ để tạo vector cho các truy vấn tìm kiếm ký ức.
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: API Routes `/api/user-memory/*`.
    - Gọi đến: `UserMemory` model, `@xenova/transformers` (local embedding).

- 📄 **Tên file:** `backend/controllers/noteController.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý CRUD cho ghi chú. Khi ghi chú được lưu hoặc cập nhật, nó sẽ gọi `BackgroundWorker` để đồng bộ nội dung vào `VectorStore`.
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: API Routes `/api/notes/*`.
    - Gọi đến: `Note` model, `BackgroundWorker` service.

- 📄 **Tên file:** `backend/controllers/alchemyController.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý các mục lưu trữ Alchemy. Tương tự Note, khi tạo hoặc cập nhật, nó gọi `BackgroundWorker` để tạo vector và lưu vào `VectorStore`.
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: API Routes `/api/alchemy/*`.
    - Gọi đến: `AlchemyStorageItem` model, `BackgroundWorker` service.

- 📄 **Tên file:** `backend/controllers/globalKnowledgeController.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý và tìm kiếm tri thức toàn cục (Global Knowledge) trong `VectorStore`. Hỗ trợ tìm kiếm bằng Vector Search hoặc Cosine Similarity (fallback).
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: API Routes `/api/global-knowledge/*`.
    - Gọi đến: `VectorStore` model, `@xenova/transformers` (local embedding).

## 3. Services (Xử lý tác vụ nền và điều phối AI)

- 📄 **Tên file:** `backend/services/backgroundWorker.js`
  - 🎯 **Nhiệm vụ chính:** Xử lý các tác vụ nặng chạy ngầm: 1) Trích xuất trí nhớ người dùng từ lịch sử chat (dùng Gemini API). 2) Chia nhỏ văn bản và tạo vector nhúng cục bộ (dùng `@xenova/transformers`) để lưu vào `VectorStore`.
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: Các controllers (`chat.controller`, `noteController`, `alchemyController`, v.v.).
    - Gọi đến: `UserMemory` model, `VectorStore` model, `@google/genai` (Gemini API), `@xenova/transformers`, `@langchain/textsplitters`.

- 📄 **Tên file:** `backend/services/aiOrchestrator.js`
  - 🎯 **Nhiệm vụ chính:** Đóng vai trò là "nhạc trưởng" điều phối AI. Giao tiếp với Gemini API, cung cấp các công cụ (tools) như `search_vector_store` để AI có thể tự động tìm kiếm kiến thức khi cần thiết. Hỗ trợ chế độ "Thinking Mode" (suy nghĩ sâu) sử dụng model `gemini-3.1-pro-preview` với `ThinkingLevel.HIGH`.
  - 🔗 **Mối liên kết:** 
    - Nhận lệnh từ: `chat.controller.js`.
    - Gọi đến: `@google/genai` (Gemini API), `VectorStore` model, `@xenova/transformers` (local embedding cho tool search).
