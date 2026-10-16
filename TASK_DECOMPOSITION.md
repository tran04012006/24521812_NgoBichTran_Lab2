ViewState Lifecycle
│
├── Requirement 1 — Finite State Machine
│ ├── Task 1 — Define ViewState
│ ├── Task 2 — Initialize State
│ ├── Task 3 — Define Transitions
│ └── Task 4 — Validate States
│
├── Requirement 2 — Safe Async Data Handling
│ ├── Task 5 — Define Async Data Source
│ ├── Task 6 — Implement Async loadData()
│ ├── Task 7 — Prevent Race Conditions
│ ├── Task 8 — Handle Request Lifecycle
│ └── Task 9 — Test Async State Transitions
│
├── Requirement 3 — Skeleton Screen
│ ├── Task 10 — Design Skeleton Layout
│ ├── Task 11 — Create Skeleton Component
│ ├── Task 12 — Implement CSS Animation
│ ├── Task 13 — Integrate Skeleton with State
│ └── Task 14 — Test Skeleton Behavior
│
└── Requirement 4 — Error Handling & Retry
│
├── Task 15 — Define Error Types
│ ├── 15.1 Xác định các lỗi có thể xảy ra
│ ├── 15.2 Phân biệt HTTP error và Network error
│ ├── 15.3 Phân biệt lỗi thật với request bị hủy
│ └── 15.4 Chuẩn hóa thông báo lỗi cho người dùng
│
├── Task 16 — Implement Error Handling
│ ├── 16.1 Kiểm tra response.ok trong fetchData()
│ ├── 16.2 Sử dụng throw khi API trả về lỗi HTTP
│ ├── 16.3 Bắt lỗi bằng try/catch trong loadData()
│ ├── 16.4 Chuyển state sang ERROR
│ └── 16.5 Lưu thông báo lỗi vào state.error
│
├── Task 17 — Build Error UI
│ ├── 17.1 Tạo ErrorMessage.jsx
│ ├── 17.2 Hiển thị thông báo lỗi dễ hiểu
│ ├── 17.3 Thêm nút Retry Connection
│ └── 17.4 Thêm thuộc tính hỗ trợ accessibility
│
├── Task 18 — Implement Retry Logic
│ ├── 18.1 Truyền loadData() vào ErrorMessage
│ ├── 18.2 Gắn onClick cho nút Retry
│ ├── 18.3 Chuyển ERROR → LOADING khi Retry
│ ├── 18.4 Gửi lại HTTP request mới
│ ├── 18.5 Chuyển sang SUCCESS nếu thành công
│ └── 18.6 Quay lại ERROR nếu tiếp tục thất bại
│
└── Task 19 — Test Error & Retry
├── 19.1 Test API thành công
├── 19.2 Test HTTP 404/500
├── 19.3 Test mất kết nối mạng
├── 19.4 Test nút Retry Connection
├── 19.5 Test Skeleton xuất hiện khi Retry
├── 19.6 Test request bị hủy không hiện lỗi
└── 19.7 Kiểm tra Console và Network
