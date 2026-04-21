# Movie Service API Reference

## Overview
Movie Service provides APIs to list and create movies.

Implemented endpoints:
- `GET /health`
- `GET /movies`
- `POST /movies` (JWT required)

## Base URLs

Direct service:
- `http://localhost:8082`

Via API Gateway (current nginx mapping):
- `http://localhost:3000/api/movies` -> `http://localhost:8082/movies`

## Authentication

`POST /movies` requires header:
- `Authorization: Bearer <jwt_token>`

Token is validated with `JWT_SECRET`.

Common auth errors:
- `401` `{ "message": "Missing Bearer token" }`
- `401` `{ "message": "Invalid or expired token" }`
- `500` `{ "message": "JWT_SECRET is not configured" }`

## Data Model (Movie)

Fields:
- `title` (string, required)
- `description` (string, default `""`)
- `genre` (string, required)
- `durationMinutes` (number, required, min 1)
- `language` (string, default `"Vietnamese"`)
- `releaseDate` (date, required)
- `rating` (string, default `"P"`)
- `posterUrl` (string, default `""`)
- `availableSeats` (number, default `100`, min 0)
- `active` (boolean, default `true`)
- `createdAt` (date, auto)
- `updatedAt` (date, auto)

Unique index:
- `(title, releaseDate)` must be unique

Duplicate movie error:
- `409` `{ "message": "Movie with the same title and releaseDate already exists" }`

## Endpoints

### 1) Health Check

`GET /health`

Response `200`:

```json
{
  "status": "ok",
  "service": "movie-service"
}
```

Example:

```bash
curl http://localhost:8082/health
```

### 2) List Movies

`GET /movies`

Query params (optional):
- `active=true|false`
- `genre=<string>`
- `language=<string>`

Response `200`:

```json
{
  "count": 2,
  "data": [
    {
      "_id": "...",
      "title": "Interstellar",
      "description": "...",
      "genre": "Sci-Fi",
      "durationMinutes": 169,
      "language": "English",
      "releaseDate": "2014-11-07T00:00:00.000Z",
      "rating": "T13",
      "posterUrl": "https://example.com/posters/interstellar.jpg",
      "availableSeats": 80,
      "active": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

Examples:

```bash
curl "http://localhost:8082/movies"
curl "http://localhost:8082/movies?active=true&genre=Action"
```

Gateway examples:

```bash
curl "http://localhost:3000/api/movies"
curl "http://localhost:3000/api/movies?active=true&language=English"
```

### 3) Create Movie

`POST /movies`

Headers:
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

Request body:

```json
{
  "title": "Spider-Man: Across the Spider-Verse",
  "description": "Miles Morales returns for a multiverse adventure.",
  "genre": "Animation",
  "durationMinutes": 140,
  "language": "English",
  "releaseDate": "2023-06-02T00:00:00.000Z",
  "rating": "T13",
  "posterUrl": "https://example.com/posters/spider-verse.jpg",
  "availableSeats": 120,
  "active": true
}
```

Required body fields:
- `title`
- `genre`
- `durationMinutes`
- `releaseDate`

Validation error `400`:

```json
{
  "message": "title, genre, durationMinutes, and releaseDate are required"
}
```

Success `201`:
- returns created movie document

Example:

```bash
curl -X POST "http://localhost:8082/movies" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Demo Movie","genre":"Drama","durationMinutes":100,"releaseDate":"2026-01-01T00:00:00.000Z"}'
```

Gateway example:

```bash
curl -X POST "http://localhost:3000/api/movies" \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"title":"Demo Movie 2","genre":"Drama","durationMinutes":100,"releaseDate":"2026-01-02T00:00:00.000Z"}'
```

## Error Handling

Unhandled errors use this format:

```json
{
  "message": "Internal server error"
}
```

If an error has custom `statusCode` and `message`, those values are returned.

## Notes

- At startup, service seeds movie data only when database is empty.
- Current implementation does not include update/delete endpoints.
