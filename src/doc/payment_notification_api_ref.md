# Payment Notification API Reference

## 1. Scope
Tai lieu nay mo ta API contract cho module payment-notification, gom:
- HTTP health check endpoint
- RabbitMQ message contract cho payment processing
- Socket.IO event contract gui ket qua thanh toan theo thoi gian thuc
- Payment persistence schema

## 2. Service Endpoint
Base service: `http://localhost:8084`

### 2.1 Health Check
- Method: GET
- Path: `/`
- Success response (200):

```json
{
  "status": "UP",
  "service": "Service 5 Layered"
}
```

## 3. Gateway Mapping (Nginx)
Neu di qua API gateway:
- `/api/payment/` -> forward ve service `8084`
- `/api/payment` -> forward ve `8084/api/payment`
- `/api/notification/` -> forward ve service `8084`
- `/api/notification` -> forward ve `8084/api/notification`

Note:
- Code hien tai chua expose REST endpoints cho `/api/payment` va `/api/notification`.
- Chi co endpoint `/` cho health check.

## 4. RabbitMQ Contract

### 4.1 Infrastructure
- Exchange: `booking_exchange`
- Routing key consume: `BOOKING_CREATED`
- Queues:
  - `BOOKING_CREATED` (input)
  - `PAYMENT_COMPLETED` (output khi thanh cong)
  - `BOOKING_FAILED` (output khi that bai)

### 4.2 Input Message
Queue: `BOOKING_CREATED`

Service chap nhan 2 dinh dang:
1. Payload truc tiep
2. Payload co wrapper `data`

Example A:
```json
{
  "bookingId": "BK-1001",
  "userId": "U-01",
  "movieId": "MOV_001",
  "seats": ["A1", "A2"]
}
```

Example B:
```json
{
  "data": {
    "bookingId": "BK-1001",
    "userId": "U-01",
    "movieId": "MOV_001",
    "seats": ["A1", "A2"]
  }
}
```

### 4.3 Payment Processing Logic
- Payment result la random:
  - SUCCESS voi xac suat 70% (`Math.random() > 0.3`)
  - FAILED voi xac suat 30%
- Neu SUCCESS:
  - `transactionId = TXN-<timestamp>`
  - `message = "Thanh toan thanh cong"`
- Neu FAILED:
  - `transactionId = null`
  - `message = "Loi giao dich"`
- Co delay gia lap xu ly: 2 giay truoc khi publish ket qua.

### 4.4 Output Message - Success
Queue: `PAYMENT_COMPLETED`

```json
{
  "bookingId": "BK-1001",
  "userId": "U-01",
  "movieId": "MOV_001",
  "seats": ["A1", "A2"],
  "status": "SUCCESS",
  "transactionId": "TXN-1710000000000",
  "message": "Thanh toan thanh cong",
  "completedAt": "2026-04-21T10:00:00.000Z"
}
```

### 4.5 Output Message - Failed
Queue: `BOOKING_FAILED`

```json
{
  "bookingId": "BK-1001",
  "userId": "U-01",
  "movieId": "MOV_001",
  "seats": ["A1", "A2"],
  "status": "FAILED",
  "transactionId": null,
  "message": "Loi giao dich",
  "completedAt": "2026-04-21T10:00:00.000Z"
}
```

### 4.6 Ack Behavior
Consumer se `ack` message ke ca khi parse/xu ly loi, de tranh requeue vo han.

## 5. Socket.IO Realtime Contract

### 5.1 Connection
- Socket server chay cung HTTP server (port 8084)
- CORS:
  - origin: `*`
  - methods: `GET`, `POST`

### 5.2 Event Emitted
Event name: `PAYMENT_RESULT`

Success payload:
```json
{
  "bookingId": "BK-1001",
  "status": "SUCCESS",
  "message": "Booking #BK-1001 thanh cong!",
  "transactionId": "TXN-1710000000000"
}
```

Failure payload:
```json
{
  "bookingId": "BK-1001",
  "status": "FAILED",
  "message": "Loi giao dich"
}
```

## 6. Database Schema (MongoDB)
Collection model: `Payment`

Fields:
- `bookingId`: String, required
- `userId`: String, required
- `amount`: Number, default `50000`
- `status`: String, required, enum `SUCCESS | FAILED`
- `transactionId`: String, optional
- `message`: String, optional
- `createdAt`: Date, default now

## 7. Quick Test
1. Start service:
   - `npm start`
2. Push mock booking event:
   - `node test-booking.js`
3. Verify:
   - Service logs cho payment + notification
   - Message trong queue `PAYMENT_COMPLETED` hoac `BOOKING_FAILED`
   - Socket client nhan event `PAYMENT_RESULT`
