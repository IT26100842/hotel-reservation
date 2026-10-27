# 🏨 Hotel Room Reservation System — Frontend

A modern, fast, and responsive frontend interface for the Hotel Room Reservation System.

---

## ⚡ Quick Start

### 1. Prerequisites (Node.js)
Make sure you have Node.js installed:
```bash
node -v
npm -v
```
If not installed, download the LTS version from [nodejs.org](https://nodejs.org/).

---

### 2. Run Locally for Development

Navigate to the frontend folder and start the dev server:

```bash
# 1. Go to frontend directory
cd frontend

# 2. Install dependencies (first time only)
npm install

# 3. Start development server
npm run dev
```
Open the local URL displayed in the terminal (e.g., `http://localhost:3000`) to view and edit live changes.

---

### 3. Production Build (Auto-sync to Backend)

When you are ready to prepare the frontend for production, run:

```bash
npm run build
```

> **Note:** Running `npm run build` will automatically compile and transfer the production HTML and static assets directly into the backend resources directory (`src/main/resources/static/`). Once built, running the Spring Boot backend will serve the frontend automatically.