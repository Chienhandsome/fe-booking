# User Service API Reference

Tài liệu tham chiếu cho các endpoint người dùng (được triển khai trong `UserController`). Bao gồm mô tả, body mẫu, response mẫu, mã lỗi và yêu cầu xác thực.

Lưu ý: một vài trường/định dạng response được suy đoán dựa trên tên DTO trong mã nguồn (ví dụ `LoginResponse`, `ApiMessageResponse`, `UserProfileResponse`). Nếu cần chính xác hoàn toàn, mình có thể trích xuất trực tiếp từ DTO nếu bạn muốn.

---

Base URL (mặc định local dev):
- http://localhost:3000

Authentication:
- Hệ thống dùng JWT bearer tokens.
- Sau khi đăng nhập thành công, server trả về `accessToken` trong response; gửi header `Authorization: Bearer <token>` cho các endpoint cần xác thực (ví dụ `/api/users/me`).

---

1) Đăng ký tài khoản

- Endpoint: POST /api/users/register
- Mô tả: Tạo tài khoản người dùng mới.
- Yêu cầu: Content-Type: application/json

Request body (JSON) - các trường tham khảo:
- fullName: string (bắt buộc) — tên đầy đủ người dùng
- email: string (bắt buộc, định dạng email)
- password: string (bắt buộc, tuân theo chính sách mật khẩu của app)

Ví dụ request:
{
  "fullName": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "password": "P@ssw0rd123"
}

Success response (201 Created):
- Body (ApiMessageResponse) — (ví dụ dự đoán):
{
  "message": "User registered successfully"
}

Mã lỗi phổ biến:
- 400 Bad Request — dữ liệu không hợp lệ (ví dụ thiếu trường hoặc sai định dạng email)
- 409 Conflict — email đã được đăng ký (nếu service kiểm tra trùng email)

---

2) Đăng nhập

- Endpoint: POST /api/users/login
- Mô tả: Xác thực người dùng, trả về token.
- Yêu cầu: Content-Type: application/json

Request body (JSON):
- email: string (bắt buộc)
- password: string (bắt buộc)

Ví dụ request:
{
  "email": "nguyenvana@example.com",
  "password": "P@ssw0rd123"
}

Success response (200 OK):
- Body (LoginResponse) — ví dụ dự đoán:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 86400000
}

Mã lỗi phổ biến:
- 400 Bad Request — dữ liệu đầu vào không hợp lệ
- 401 Unauthorized — email/password không đúng

---

3) Lấy profile người dùng hiện tại

- Endpoint: GET /api/users/me
- Mô tả: Trả về thông tin profile của user đang xác thực.
- Yêu cầu: Header `Authorization: Bearer <token>`

Success response (200 OK):
- Body (UserProfileResponse) — ví dụ dự đoán:
{
  "id": "642c1f5e...",
  "fullName": "Nguyen Van A",
  "email": "nguyenvana@example.com",
  "roles": ["ROLE_USER"],
  "status": "ACTIVE"
}

Mã lỗi phổ biến:
- 401 Unauthorized — thiếu hoặc token không hợp lệ
- 404 Not Found — user không tồn tại (ít gặp nếu token hợp lệ)

---

Curl examples

- Đăng ký:

curl -X POST "http://localhost:3000/api/users/register" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Nguyen Van A","email":"nguyenvana@example.com","password":"P@ssw0rd123"}'

- Đăng nhập:

curl -X POST "http://localhost:3000/api/users/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"nguyenvana@example.com","password":"P@ssw0rd123"}'

- Lấy profile (sau khi có token):

curl -X GET "http://localhost:3000/api/users/me" \
  -H "Authorization: Bearer <accessToken>"

---

Validation rules & notes (tổng quát):
- Các request bodies sử dụng `@Valid` trong controller → các trường DTO có constraint annotation (ví dụ `@NotBlank`, `@Email`, `@Size`) — client nên tuân thủ.
- Response bodies mô tả ở trên là dự đoán theo tên DTO; nếu bạn muốn mình trích xuất chính xác các trường từ DTO thực tế, mình có thể lấy nội dung file DTO và cập nhật tài liệu.

Next steps (nếu muốn chính xác tuyệt đối):
- Xác nhận/cho phép mình đọc các DTO (`RegisterRequest`, `LoginRequest`, `LoginResponse`, `ApiMessageResponse`, `UserProfileResponse`) để cập nhật tài liệu với sơ đồ trường chính xác.

---

Liên hệ nhanh:
Nếu bạn muốn mình cập nhật tài liệu sang định dạng OpenAPI/Swagger (YAML/JSON), mình có thể tạo file OpenAPI tương ứng từ cùng thông tin.

