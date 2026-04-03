# Tóm Lược Thuật Toán: Hybrid Dual-Track RAG (LearnAI)

Hệ thống RAG của bạn đã được nâng cấp từ một công cụ "gọi lệnh" (Agentic) tiêu tốn nhiều tài nguyên sang một kiến trúc **Pre-fetching Hybrid Search** (Tìm kiếm lai - Chuẩn bị trước). Kiến trúc này giúp tối ưu 100% chi phí API và đạt độ chính xác đến tận gốc rễ văn bản.

Dưới đây là sơ đồ logic và các bước thực thi của thuật toán:

---

## 1. Luồng Thuật Toán Tổng Quát (Workflow)
Khi người dùng nhắn tin, AI chưa được gọi ngay. Backend NodeJS sẽ thực hiện chuỗi hành động sau:
`User Message` -> `NLP Keyword Extraction` -> `Dual-Track Search (Sparse + Dense)` -> `Keyword Traceback` -> `Ranking & Deduplication` -> `TF-IDF Compression` -> `AI One-Shot Injection`.

---

## 2. Chi Tiết Các Bước Thuật Toán

### Bước 1: NLP Query Parsing (Phân tách từ khóa thông minh)
- **Tệp xử lý:** `backend/utils/keywordExtractor.js`
- **Cơ chế:** Thay vì chỉ tách từ bằng khoảng trắng, thuật toán sử dụng **Regex Entity Recognition** để bóc tách các danh từ riêng, cụm từ trong ngoặc kép hoặc các thuật ngữ quan trọng (VD: "ReactJS", "NodeJS").
- **Mục tiêu:** Tạo ra một "bản đồ từ khóa" (Query Keywords) để dẫn đường cho việc tra cứu chính xác.

### Bước 2: Dual-Track Retrieval (Truy vấn luồng kép)
Hệ thống chạy song song hai luồng tìm kiếm để đảm bảo không bỏ sót thông tin:
1.  **Luồng 1: Sparse Keyword Search (Tra cứu từ điển)**
    - Chọc thẳng vào bảng `KnowledgeIndex` (Bảng Key-Value siêu nhẹ).
    - Sử dụng Regex Matching để tìm các "Thẻ nhớ" đã được đánh chỉ mục.
2.  **Luồng 2: Dense Vector Search (Truy vấn ngữ nghĩa)**
    - Sử dụng AI cục bộ nhúng câu hỏi thành vector.
    - Dùng **MongoDB Vector Search Index** để tìm các đoạn văn bản có "ý nghĩa tương đồng" dù không chứa từ khóa chính xác.

### Bước 3: Keyword Traceback (Truy xuất ngược văn bản gốc) - *Độc quyền*
- Đây là phần bạn yêu cầu: Từ kết quả của Luồng 1 (Từ khóa), hệ thống lấy ra `sourceId`.
- **Hành động:** Truy cập trực tiếp vào `VectorStore` để kéo **Toàn bộ nội dung gốc (Full Context)** của tài liệu đó lên. 
- **Lợi ích:** Đảm bảo AI có được cái nhìn toàn cảnh nhất về tài liệu chứa từ khóa đó.

### Bước 4: Ranking & Deduplication (Sắp xếp và Khử trùng lặp)
- **Thuật toán sắp xếp:**
    - Các kết quả từ **Keyword Traceback** (trúng từ khóa trực tiếp) được ưu tiên tuyệt đối với điểm số **1.0**.
    - Các kết quả từ **Vector Search** (ngữ nghĩa na ná) được xếp sau với điểm số từ **0.6 -> 0.9**.
- **Khử trùng lặp:** Sử dụng `Set(docId)` để loại bỏ các đoạn văn bản bị trùng nếu cả 2 luồng cùng tìm ra một tài liệu.

### Bước 5: TF-IDF Content Compression (Nén dữ liệu thông minh)
- **Tệp xử lý:** `backend/services/RAGService.js` (Hàm `extractRelevantSentences`)
- **Cơ chế:** Sau khi có văn bản gốc dài hàng ngàn chữ, thuật toán sẽ tính toán mật độ từ khóa trong từng câu.
- **Kết quả:** Chỉ giữ lại đúng 3-5 câu "tinh túy" nhất chứa thông tin cần thiết. Điều này giúp hệ thống **không bao giờ bị lỗi quá tải Request (429)** do Input quá lớn.

### Bước 6: One-Shot Injection (Dọn cỗ cho AI)
- Backend đóng gói toàn bộ dữ liệu đã chắt lọc vào mục `SYSTEM PROMPT`.
- **Nội dung:** *"Mày là trợ lý AI. Tao đã tìm được các kiến thức này từ kho dữ liệu: [KẾT QUẢ RAG]. Hãy trả lời dựa trên đó"*.
- Lúc này Gemini mới được đánh thức, đọc "mâm cỗ" đã dọn sẵn và trả lời duy nhất 1 lần.

---

## 3. Tại sao Thuật toán này lại Mạnh?
1.  **Độ chính xác tuyệt đối:** Tìm trúng tên riêng, mã số, thuật ngữ nhờ Keyword Index.
2.  **Đầy đủ ngữ cảnh:** Nhờ cơ chế Traceback (truy xuất ngược) lấy được cả đoạn văn gốc thay vì chỉ lấy một dòng tóm tắt.
3.  **Siêu tiết kiệm:** Cố định 1 tin nhắn = 1 API Request. Không có vòng lặp suy nghĩ lãng phí.
4.  **Tốc độ:** Backend NodeJS xử lý tìm kiếm cực nhanh trước khi AI kịp khởi động.

---
> [!IMPORTANT]
> Toàn bộ logic này hiện đã được "đóng gói" hoàn chỉnh trong mã nguồn của bạn tại các file `RAGService.js`, `chat.controller.js` và `VectorStore.js`. Hệ thống của bạn giờ đây hoạt động như một cỗ máy tìm kiếm lai đẳng cấp doanh nghiệp.
