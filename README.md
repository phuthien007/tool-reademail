Hãy làm theo các bước sau để lấy REFRESH_TOKEN:

Truy cập vào OAuth 2.0 Playground: https://developers.google.com/oauthplayground

Trong OAuth 2.0 Playground, ở bên trên góc phải, nhấp vào biểu tượng bánh răng và chọn "Use your own OAuth credentials".

Nhập CLIENT_ID và CLIENT_SECRET của ứng dụng bạn đã tạo từ bước trước. Nếu bạn chưa tạo, hãy quay lại và tạo một ứng dụng mới.

Bên dưới, trong phần "Step 1: Select & authorize APIs", tìm và chọn "Gmail API". Sau đó, hãy nhấp vào nút "Authorize APIs" để tiến hành xác thực.

Bạn sẽ được chuyển hướng đến trang xác thực Google. Chọn tài khoản Gmail mà bạn muốn cấp quyền truy cập.

Tiếp theo, Google sẽ hiển thị thông báo xác thực. Bạn cần nhấp vào nút "Allow" để cho phép ứng dụng của bạn truy cập vào tài khoản Gmail của bạn.

Bạn sẽ được chuyển hướng trở lại OAuth 2.0 Playground. Lúc này, trong phần "Step 2: Exchange authorization code for tokens", bạn sẽ thấy REFRESH_TOKEN được hiển thị.

Sao chép REFRESH_TOKEN và sử dụng nó trong mã của bạn để truy cập Gmail API mà không cần xác thực lại.

Chú ý rằng REFRESH_TOKEN có hiệu lực vô thời hạn, vì vậy hãy lưu nó an toàn và không chia sẻ nó công khai.
