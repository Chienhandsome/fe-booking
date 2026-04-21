# Booking Service API Reference

## Tong quan
- Service name: booking-service
- Default host: `http://localhost:3000`
- Global prefix: `/api`
- Base path cho booking: `/api/bookings`

## Authentication
- Endpoint `POST /api/bookings` va `GET /api/bookings` yeu cau JWT Bearer token.
- Truyen token qua header:

```http
Authorization: Bearer <your_jwt_token>
```

- Guard chap nhan user id tu payload theo thu tu uu tien:
  - `userId`
  - `sub`

## Booking Status
Gia tri co the co:
- `pending`
- `confirmed`
- `cancelled`

## Endpoint 1: Health Check
### Request
- Method: `GET`
- URL: `/api/bookings/test`
- Auth: khong can

### Success Response
- Status: `200 OK`
- Body:

```json
"Booking service is up and running!"
```

## Endpoint 2: Tao booking
### Request
- Method: `POST`
- URL: `/api/bookings`
- Auth: bat buoc (Bearer token)
- Body (`application/json`):

```json
{
  "movieId": "68061b6dc626af2ea7303f8b",
  "ticketQuantity": 2
}
```

### Body Validation
- `movieId`
  - bat buoc
  - phai la Mongo ObjectId hop le
- `ticketQuantity`
  - bat buoc
  - phai la so nguyen
  - gia tri toi thieu: `1`
- He thong su dung whitelist + forbidNonWhitelisted, nen field la khong hop le se bi tu choi.

### Success Response
- Status: `201 Created`
- Body (mau):

```json
{
  "_id": "68062aa0f7f43a8e6f2b5084",
  "userId": "68061ab2c626af2ea7303f10",
  "movieId": "68061b6dc626af2ea7303f8b",
  "ticketQuantity": 2,
  "userInfo": {
    "_id": "68061ab2c626af2ea7303f10",
    "email": "user@example.com",
    "name": "Nguyen Van A"
  },
  "movieInfo": {
    "_id": "68061b6dc626af2ea7303f8b",
    "title": "Inception",
    "duration": 148
  },
  "status": "pending",
  "createdAt": "2026-04-21T09:00:00.000Z",
  "updatedAt": "2026-04-21T09:00:00.000Z",
  "__v": 0
}
```

### Side Effect
Sau khi tao booking thanh cong, service publish RabbitMQ event voi routing key:
- `booking.created`

Payload event:

```json
{
  "event": "BOOKING_CREATED",
  "data": {
    "bookingId": "68062aa0f7f43a8e6f2b5084",
    "userId": "68061ab2c626af2ea7303f10",
    "movieId": "68061b6dc626af2ea7303f8b",
    "ticketQuantity": 2,
    "userInfo": {"...": "..."},
    "movieInfo": {"...": "..."},
    "status": "pending",
    "createdAt": "2026-04-21T09:00:00.000Z"
  }
}
```

## Endpoint 3: Lay danh sach booking cua user
### Request
- Method: `GET`
- URL: `/api/bookings`
- Auth: bat buoc (Bearer token)

### Success Response
- Status: `200 OK`
- Body: mang booking cua user dang dang nhap, sap xep `createdAt` giam dan (moi nhat truoc)

```json
[
  {
    "_id": "68062aa0f7f43a8e6f2b5084",
    "userId": "68061ab2c626af2ea7303f10",
    "movieId": "68061b6dc626af2ea7303f8b",
    "ticketQuantity": 2,
    "userInfo": {"...": "..."},
    "movieInfo": {"...": "..."},
    "status": "pending",
    "createdAt": "2026-04-21T09:00:00.000Z",
    "updatedAt": "2026-04-21T09:00:00.000Z"
  }
]
```

## Error Responses
### 400 Bad Request (validation)
Vi du:
- `movieId` khong phai ObjectId
- `ticketQuantity` < 1
- co them field khong duoc cho phep

Mau response:

```json
{
  "statusCode": 400,
  "message": [
    "movieId must be a mongodb id",
    "ticketQuantity must not be less than 1"
  ],
  "error": "Bad Request"
}
```

### 401 Unauthorized
Vi du:
- Khong co Bearer token
- Token het han
- Token sai signature

Mau response:

```json
{
  "statusCode": 401,
  "message": "Invalid or expired token",
  "error": "Unauthorized"
}
```

### 404 Not Found
Vi du:
- User trong token khong ton tai trong DB
- Movie khong ton tai

Mau response:

```json
{
  "statusCode": 404,
  "message": "Movie <id> not found",
  "error": "Not Found"
}
```

## Quick cURL
### Tao booking
```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"movieId":"68061b6dc626af2ea7303f8b","ticketQuantity":2}'
```

### Lay danh sach booking
```bash
curl -X GET "http://localhost:3000/api/bookings" \
  -H "Authorization: Bearer <your_jwt_token>"
```
