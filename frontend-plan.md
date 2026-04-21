# 🎬 Frontend UI Plan (ReactJS) – Movie Ticket System

## 🎯 GOAL
Build a complete frontend UI for Movie Ticket System.

Frontend must:
- Call ONLY API Gateway (http://localhost:8080/api)
- Provide full user flow:
  - Register / Login
  - View movies
  - Book tickets
- Be modular, scalable, and clean

---

# 🏗️ ARCHITECTURE

Frontend → API Gateway → Backend Services

👉 DO NOT call services directly  
👉 ONLY call API Gateway

---

# 📦 TECH STACK

- React (Vite or CRA)
- Axios
- React Router DOM
- (Optional) TailwindCSS / Material UI

---

# 📁 REQUIRED PROJECT STRUCTURE

src/
 ├── pages/
 │    ├── Login.jsx
 │    ├── Register.jsx
 │    ├── Movies.jsx
 │    ├── Booking.jsx
 ├── components/
 │    ├── MovieCard.jsx
 │    ├── Navbar.jsx
 │    ├── Loading.jsx
 ├── services/
 │    └── api.js
 ├── hooks/
 │    └── useAuth.js
 ├── App.jsx
 ├── main.jsx

👉 Use component-based structure (best practice in React)  

---

# ⚙️ IMPLEMENTATION TASKS

## 1. INIT PROJECT

Create project:

npm create vite@latest frontend
cd frontend
npm install

Install dependencies:

npm install axios react-router-dom

---

## 2. CONFIG API SERVICE

File: src/services/api.js

Requirements:
- Base URL: http://localhost:8080/api
- Export axios instance

---

## 3. ROUTING SETUP

Use React Router

Routes:

/login  
/register  
/movies  
/booking  

---

## 4. AUTH PAGES

## 4.1 Register Page

File: pages/Register.jsx

UI:
- Input: username
- Input: password
- Button: Register

API:
POST /api/users/register

---

## 4.2 Login Page

File: pages/Login.jsx

UI:
- Input: username
- Input: password
- Button: Login

API:
POST /api/users/login

Store:
- user info (state or localStorage)

---

## 5. MOVIE LIST PAGE

File: pages/Movies.jsx

Requirements:

- Call API:
  GET /api/movies

- Display list of movies

Each movie must show:
- Title
- Button "Book"

---

## 6. MOVIE COMPONENT

File: components/MovieCard.jsx

Props:
- movie

Display:
- movie title
- booking button

---

## 7. BOOKING PAGE

File: pages/Booking.jsx

Requirements:

- Input:
  - movieId
  - number of seats

API:
POST /api/bookings

---

## 8. BOOKING UX

After booking:
- Show message:
  "Processing payment..."

👉 Payment is async (event-driven backend)

---

## 9. GLOBAL COMPONENTS

## Navbar
- Navigate:
  - Login
  - Movies

## Loading
- Show spinner when API loading

---

# 🔄 USER FLOW (MANDATORY)

1. Register
2. Login
3. View Movies
4. Click "Book"
5. Submit booking
6. Show "Processing..."

👉 Good UX is critical for booking flow (clarity + speed) :contentReference[oaicite:1]{index=1}

---

# 🧪 TEST CASES

## 1. Register
POST /api/users/register

Expected:
- Success response

---

## 2. Login
POST /api/users/login

Expected:
- User logged in

---

## 3. Get Movies
GET /api/movies

Expected:
- List displayed

---

## 4. Create Booking
POST /api/bookings

Expected:
- Booking created
- Show "Processing..."

---

# ⚠️ HARD CONSTRAINTS

## ❌ DO NOT:
- Call service directly (8081, 8082, 8083)
- Hardcode data
- Mix business logic in UI

## ✅ MUST:
- Use API Gateway
- Separate components
- Keep code modular

---

# ✅ FINAL ACCEPTANCE CRITERIA

- [ ] UI runs successfully
- [ ] Routing works
- [ ] API calls work via Gateway
- [ ] Movie list displayed
- [ ] Booking flow works
- [ ] Clean structure

---

# 🎯 CODE GENERATION REQUIREMENTS (FOR CODEX)

Codex MUST generate:

- Full React project
- Pages (4 files)
- Components
- API service
- Routing setup

---

# 🚀 RUN INSTRUCTION

npm install  
npm run dev  

---

# 💡 EXPECTED RESULT

- UI running at:
  http://localhost:5173

- Example flow:

User → Login → View Movies → Book Ticket

---

# 🔥 BONUS (IF IMPLEMENTED)

- Toast notification
- Loading spinner
- Form validation
- Better UI (Tailwind / MUI)
