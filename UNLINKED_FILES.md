# Phân tích Các File Chưa Có Liên Kết (Orphaned/Unlinked Files)

Dựa trên quá trình phân tích toàn bộ codebase, dưới đây là danh sách các file hiện tại **không có liên kết** (không được gọi đến, hoặc không gọi đến Model/Controller nào) trong hệ thống. Việc dọn dẹp hoặc tái sử dụng các file này sẽ giúp tối ưu hóa codebase.

## 1. Models không được sử dụng
- 📄 **Tên file:** `backend/models/SemanticCache.js`
  - 🎯 **Nhiệm vụ chính:** (Dự kiến) Lưu trữ cache cho các truy vấn ngữ nghĩa (Semantic Queries) để tăng tốc độ phản hồi và giảm chi phí gọi API.
  - 🔗 **Mối liên kết:** **KHÔNG CÓ**. File này hiện tại chỉ định nghĩa Schema nhưng chưa được bất kỳ Controller hay Service nào `require` và sử dụng để lưu/đọc dữ liệu.

## 2. Controllers không liên kết với Model
- 📄 **Tên file:** `backend/controllers/toolController.js`
  - 🎯 **Nhiệm vụ chính:** Cung cấp API `/api/tools/scrape` để cào (scrape) nội dung HTML từ một URL bất kỳ sử dụng `fetch`.
  - 🔗 **Mối liên kết:** **KHÔNG GỌI MODEL NÀO**. Controller này chỉ thực hiện HTTP Request ra bên ngoài và trả về kết quả trực tiếp cho client, không tương tác với cơ sở dữ liệu (MongoDB). Nó nhận lệnh từ `backend/routes/toolRoutes.js`.

## 3. Utils/Services không được sử dụng (Orphaned)
- 📄 **Tên file:** `backend/utils/semanticRouter.js`
  - 🎯 **Nhiệm vụ chính:** (Dự kiến) Phân loại ý định của người dùng (ví dụ: đang muốn "chitchat" hay "rag_search") dựa trên độ tương đồng ngữ nghĩa (Semantic Similarity) sử dụng AI cục bộ (`@xenova/transformers`).
  - 🔗 **Mối liên kết:** **KHÔNG CÓ**. File này đã được viết logic hoàn chỉnh nhưng hiện tại không được import hay gọi bởi bất kỳ Controller hay Service nào (kể cả `aiOrchestrator.js` hay `chat.controller.js`).

## 4. Routes không được đăng ký (Orphaned)
- 📄 **Tên file:** `backend/routes/aiChatRoutes.js`
  - 🎯 **Nhiệm vụ chính:** (Dự kiến) Định nghĩa route cho API chat AI (`/`).
  - 🔗 **Mối liên kết:** **KHÔNG CÓ**. File này gọi đến `handleAIChat` trong `chat.controller.js`, tuy nhiên bản thân file route này lại **không được đăng ký** trong `backend/server.js`. Lý do là vì route `/api/chat/ai` đã được đăng ký và xử lý trực tiếp bên trong `backend/routes/chatRoutes.js`. Do đó, `aiChatRoutes.js` là một file thừa.

---
**💡 Đề xuất tối ưu:**
- Xóa bỏ `backend/routes/aiChatRoutes.js` để tránh nhầm lẫn.
- Tích hợp `backend/utils/semanticRouter.js` vào `aiOrchestrator.js` nếu muốn sử dụng tính năng phân loại ý định cục bộ.
- Xóa bỏ hoặc triển khai logic cho `backend/models/SemanticCache.js` nếu thực sự cần cache kết quả RAG/Chat.
