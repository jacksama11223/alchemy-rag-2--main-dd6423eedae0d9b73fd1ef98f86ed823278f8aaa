# Giải thích vai trò của Req và Res trong luồng tương tác Web

Trong kiến trúc web hiện đại (Node.js, Express, v.v.), `req` (Request) và `res` (Response) là hai đối tượng quan trọng nhất để duy trì giao tiếp giữa Client và Server.

---

## 1. Bản chất của Req và Res

- **req (Request - Yêu cầu):** Chứa tất cả thông tin mà trình duyệt (Frontend) gửi lên Server. Bạn có thể coi nó là một "bản ghi yêu cầu" từ khách hàng.
- **res (Response - Phản hồi):** Là công cụ để Server trả lời lại trình duyệt. Bạn có thể coi nó là "phiếu kết quả" trả lại cho khách hàng.

---

## 2. Vai trò của Req và Res qua từng lớp

### 🟢 Frontend (Khởi đầu)
- **req:** Được tạo ra khi người dùng thực hiện hành động (nhấn nút, tải trang). Frontend sẽ đính kèm thông tin như:
    - **Header:** Token bảo mật, kiểu dữ liệu.
    - **Body:** Dữ liệu người dùng nhập (email, password).
    - **Params/Query:** Ví dụ `/users/123` thì `123` nằm trong req.
- **res:** Đang ở trạng thái chờ (Pending).

### 🔵 Router (Điều hướng)
- **req:** Router đọc URL và Method (GET, POST, PUT, DELETE) từ `req` để biết phải dẫn yêu cầu này đến Controller nào.
- **res:** Router chỉ đóng vai trò "người vận chuyển", nó chuyển tiếp đối tượng `res` đi cùng `req` đến Controller.

### 🟡 Controller (Xử lý chính)
Đây là nơi `req` và `res` được tận dụng nhiều nhất:
- **Xử lý req:** Controller lấy dữ liệu từ `req.body` hoặc `req.params`. Nó kiểm tra xem dữ liệu đó có hợp lệ hay không.
- **Chuẩn bị res:** Sau khi có kết quả từ Model/DB, Controller sẽ dùng các hàm của `res` để gửi về Frontend:
    - `res.status(200)`: Thông báo thành công.
    - `res.json(data)`: Gửi dữ liệu định dạng JSON.
    - `res.render()`: Gửi về một giao diện HTML.

### 🟠 Model (Logic dữ liệu)
- **req:** Thông thường, Model **không tiếp xúc trực tiếp** với đối tượng `req`. Controller sẽ trích xuất dữ liệu từ `req` rồi mới truyền các biến cụ thể vào Model. Điều này giúp code sạch và dễ kiểm tra (unit test) hơn.
- **kết quả:** Model trả về dữ liệu thuần cho Controller.

### 🔴 Database - DB (Điểm cuối)
- Dữ liệu từ `req` (sau khi qua Controller và Model) sẽ được lưu xuống DB. Kết quả từ DB sẽ quay ngược lại Model -> Controller để nạp vào `res`.

---

## 3. Tóm tắt luồng giá trị

| Thành phần | Tác dụng với `req` | Tác dụng với `res` |
| :--- | :--- | :--- |
| **Frontend** | Khởi tạo và đóng gói dữ liệu. | Đón nhận và hiển thị kết quả. |
| **Router** | Phân loại dựa trên URL/Method. | Chuyển tiếp. |
| **Controller** | Khai thác dữ liệu (lấy đầu vào). | Quyết định kết quả trả về (đầu ra). |
| **Model** | Nhận dữ liệu đã lọc từ Controller. | Cung cấp dữ liệu để nạp vào res. |
| **DB** | Lưu trữ dữ liệu cuối cùng. | Trả về trạng thái lưu/truy vấn. |

---

## 💡 Ví dụ thực tế
Tưởng tượng bạn đi ăn nhà hàng:
1. **req** là **Menu/Order**: Bạn (Frontend) chọn món và ghi vào giấy.
2. **Router** là **Phục vụ**: Nhìn vào Order để biết phải mang xuống bếp (Controller) nào (Bếp Á hay Bếp Âu).
3. **Controller** là **Đầu bếp**: Đọc Order (`req`), lấy nguyên liệu từ tủ lạnh (**Model/DB**). Sau khi nấu xong, đầu bếp bày món ăn lên đĩa (**res**).
4. **res** là **Món ăn**: Được mang ra bàn cho bạn. Nếu hết món, đầu bếp sẽ gửi lại thông báo lỗi qua phục vụ (Status 404).
