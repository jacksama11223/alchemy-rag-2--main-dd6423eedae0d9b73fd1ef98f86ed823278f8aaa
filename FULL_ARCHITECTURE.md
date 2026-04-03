# Phân tích Toàn bộ Kiến trúc Hệ thống (Full Architecture Analysis)

Dưới đây là phân tích chi tiết toàn bộ các file cốt lõi trong hệ thống (Models, Controllers, Services, Utils) theo định dạng yêu cầu.

## 1. Models (Cơ sở dữ liệu - MongoDB)

- 📄 **Tên file:** `backend/models/User.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý thông tin người dùng, xác thực (mật khẩu, email), phân quyền (role), và các thông số cá nhân hóa.
  - 🔗 **Mối liên kết:** Được gọi bởi `userController`, `adminController`, và các middleware xác thực.

- 📄 **Tên file:** `backend/models/VectorStore.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ các đoạn văn bản (text chunks) và vector nhúng (embeddings) tương ứng của chúng. Đây là "bộ não" cho tính năng tìm kiếm ngữ nghĩa (Semantic Search) và RAG.
  - 🔗 **Mối liên kết:** Nhận lệnh từ `BackgroundWorker`, `ragController`, `globalKnowledgeController`.

- 📄 **Tên file:** `backend/models/UserMemory.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ trí nhớ dài hạn của người dùng (sở thích, thông tin cá nhân, ngữ cảnh) được trích xuất tự động từ lịch sử trò chuyện.
  - 🔗 **Mối liên kết:** Nhận lệnh từ `BackgroundWorker` (trích xuất trí nhớ), `userMemoryController`, `chat.controller.js` (lấy ngữ cảnh).

- 📄 **Tên file:** `backend/models/Note.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ cấu trúc ghi chú dạng cây (folder, project, note) của người dùng.
  - 🔗 **Mối liên kết:** Nhận lệnh từ `noteController`. Đồng bộ nội dung sang `VectorStore`.

- 📄 **Tên file:** `backend/models/AlchemyStorageItem.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ các tài liệu thô được người dùng tải lên hoặc thu thập (ghi chú, OCR, giọng nói, web, v.v.) trước khi xử lý vector.
  - 🔗 **Mối liên kết:** Nhận lệnh từ `alchemyController`.

- 📄 **Tên file:** `backend/models/Message.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ lịch sử tin nhắn trò chuyện giữa người dùng và AI (hoặc giữa các người dùng).
  - 🔗 **Mối liên kết:** Nhận lệnh từ `chat.controller.js`, `chatController.js`.

- 📄 **Tên file:** `backend/models/SavedUrl.js` & `SavedYoutubeVideo.js` & `SavedRecording.js` & `PastedText.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ các nguồn dữ liệu bên ngoài mà người dùng thu thập (URL web, Video Youtube, File ghi âm, Văn bản dán).
  - 🔗 **Mối liên kết:** Nhận lệnh từ các controller tương ứng (`savedUrlController`, v.v.). Đồng bộ nội dung sang `VectorStore`.

- 📄 **Tên file:** `backend/models/FlashcardSet.js` & `FlashcardDeck.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ các bộ thẻ ghi nhớ (flashcards) để học tập.
  - 🔗 **Mối liên kết:** Nhận lệnh từ `flashcardSetController`.

- 📄 **Tên file:** `backend/models/Todo.js` & `Project.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý danh sách công việc (To-do list) và các dự án học tập/làm việc.
  - 🔗 **Mối liên kết:** Nhận lệnh từ `todoController`, `projectController`.

- 📄 **Tên file:** `backend/models/Drawing.js` & `Cluster.js` & `Node.js`
  - 🎯 **Nhiệm vụ chính:** Lưu trữ dữ liệu bảng vẽ (whiteboard) và sơ đồ tư duy (mindmap/clusters).
  - 🔗 **Mối liên kết:** Nhận lệnh từ `drawingController`, `clusterController`, `nodeController`.

- 📄 **Tên file:** `backend/models/Achievement.js` & `Quest.js` & `BehaviorLog.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý hệ thống Gamification (nhiệm vụ, thành tựu, điểm thưởng, nhật ký hành vi).
  - 🔗 **Mối liên kết:** Nhận lệnh từ `gamificationController`.

## 2. Controllers (Xử lý logic API)

- 📄 **Tên file:** `backend/controllers/chat.controller.js`
  - 🎯 **Nhiệm vụ chính:** Xử lý luồng chat chính của AI. Kết hợp lịch sử chat (Tier 1), trí nhớ người dùng (Tier 3) và gọi `AIOrchestrator` để sinh câu trả lời. Kích hoạt `BackgroundWorker` để trích xuất trí nhớ ngầm.
  - 🔗 **Mối liên kết:** Nhận lệnh từ API Route `/api/chat/ai`. Gọi đến `Message`, `UserMemory`, `AIOrchestrator`, `BackgroundWorker`.

- 📄 **Tên file:** `backend/controllers/ragController.js`
  - 🎯 **Nhiệm vụ chính:** Xử lý việc thêm tài liệu vào cơ sở dữ liệu RAG (chia nhỏ văn bản, tạo vector cục bộ) và tìm kiếm tài liệu dựa trên độ tương đồng vector (Vector Similarity Search).
  - 🔗 **Mối liên kết:** Nhận lệnh từ API Routes `/api/rag/*`. Gọi đến `VectorStore`, `@xenova/transformers`, `@langchain/textsplitters`.

- 📄 **Tên file:** `backend/controllers/userMemoryController.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý (thêm, sửa, xóa, tìm kiếm) các mảng ký ức của người dùng.
  - 🔗 **Mối liên kết:** Nhận lệnh từ API Routes `/api/user-memory/*`. Gọi đến `UserMemory`, `@xenova/transformers`.

- 📄 **Tên file:** `backend/controllers/noteController.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý CRUD cho ghi chú. Tự động gọi `BackgroundWorker` để đồng bộ nội dung vào `VectorStore`.
  - 🔗 **Mối liên kết:** Nhận lệnh từ API Routes `/api/notes/*`. Gọi đến `Note`, `BackgroundWorker`.

- 📄 **Tên file:** `backend/controllers/alchemyController.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý các mục lưu trữ Alchemy (kho lưu trữ đa phương tiện). Tự động gọi `BackgroundWorker` để tạo vector và lưu vào `VectorStore`.
  - 🔗 **Mối liên kết:** Nhận lệnh từ API Routes `/api/alchemy/*`. Gọi đến `AlchemyStorageItem`, `BackgroundWorker`.

- 📄 **Tên file:** `backend/controllers/globalKnowledgeController.js`
  - 🎯 **Nhiệm vụ chính:** Quản lý và tìm kiếm tri thức toàn cục (Global Knowledge) trong `VectorStore`.
  - 🔗 **Mối liên kết:** Nhận lệnh từ API Routes `/api/global-knowledge/*`. Gọi đến `VectorStore`, `@xenova/transformers`.

- 📄 **Tên file:** `backend/controllers/savedUrlController.js` & `savedYoutubeVideoController.js` & `savedRecordingController.js` & `pastedTextController.js`
  - 🎯 **Nhiệm vụ chính:** Xử lý lưu trữ các nguồn dữ liệu thu thập (Web, Youtube, Voice, Text). Tự động gọi `BackgroundWorker` để nhúng (embed) dữ liệu vào `VectorStore`.
  - 🔗 **Mối liên kết:** Nhận lệnh từ các API Routes tương ứng. Gọi đến các Models tương ứng và `BackgroundWorker`.

- 📄 **Tên file:** `backend/controllers/userController.js`
  - 🎯 **Nhiệm vụ chính:** Xử lý đăng ký, đăng nhập, xác thực OTP, quên mật khẩu, và cập nhật thông tin người dùng.
  - 🔗 **Mối liên kết:** Nhận lệnh từ API Routes `/api/users/*`. Gọi đến `User`, thư viện `bcryptjs`, `jsonwebtoken`.

- 📄 **Tên file:** `backend/controllers/gamificationController.js`
  - 🎯 **Nhiệm vụ chính:** Xử lý logic cộng điểm, hoàn thành nhiệm vụ, và mở khóa thành tựu cho người dùng.
  - 🔗 **Mối liên kết:** Nhận lệnh từ API Routes `/api/gamification/*`. Gọi đến `Quest`, `Achievement`, `BehaviorLog`, `User`.

## 3. Services (Xử lý tác vụ nền và điều phối AI)

- 📄 **Tên file:** `backend/services/backgroundWorker.js`
  - 🎯 **Nhiệm vụ chính:** Xử lý các tác vụ nặng chạy ngầm: 1) Trích xuất trí nhớ người dùng từ lịch sử chat (dùng Gemini API). 2) Chia nhỏ văn bản và tạo vector nhúng cục bộ (dùng `@xenova/transformers`) để lưu vào `VectorStore`.
  - 🔗 **Mối liên kết:** Nhận lệnh từ các controllers (`chat.controller`, `noteController`, `alchemyController`, v.v.). Gọi đến `UserMemory`, `VectorStore`, `@google/genai`, `@xenova/transformers`, `@langchain/textsplitters`.

- 📄 **Tên file:** `backend/services/aiOrchestrator.js`
  - 🎯 **Nhiệm vụ chính:** Đóng vai trò là "nhạc trưởng" điều phối AI. Giao tiếp với Gemini API, cung cấp các công cụ (tools) như `search_vector_store` để AI có thể tự động tìm kiếm kiến thức khi cần thiết. **Hỗ trợ chế độ "Thinking Mode" (suy nghĩ sâu) sử dụng model `gemini-3.1-pro-preview` với `ThinkingLevel.HIGH`.**
  - 🔗 **Mối liên kết:** Nhận lệnh từ `chat.controller.js`. Gọi đến `@google/genai`, `VectorStore`, `@xenova/transformers`.

## 4. Utils (Tiện ích hỗ trợ)

- 📄 **Tên file:** `backend/utils/semanticRouter.js`
  - 🎯 **Nhiệm vụ chính:** Phân loại ý định của người dùng (ví dụ: đang muốn "chitchat" hay "rag_search") dựa trên độ tương đồng ngữ nghĩa (Semantic Similarity) sử dụng AI cục bộ.
  - 🔗 **Mối liên kết:** Gọi đến `@xenova/transformers` để tạo vector và tính toán Cosine Similarity.

- 📄 **Tên file:** `backend/utils/sendEmail.js`
  - 🎯 **Nhiệm vụ chính:** Gửi email thông báo (ví dụ: mã OTP, reset mật khẩu) cho người dùng.
  - 🔗 **Mối liên kết:** Gọi đến thư viện `nodemailer`.
