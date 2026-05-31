# 🖊 Inkwell — Full-Stack Blog Platform

A literary-themed blogging platform with user authentication, post management, comments, and AI-powered editorial tools.

---

## Tech Stack

| Layer    | Technology                                |
|----------|-------------------------------------------|
| Frontend | React 18, React Router v6, Vite, Axios   |
| Backend  | Node.js, Express 4, JWT auth, bcryptjs   |
| Database | SQLite via better-sqlite3                 |
| AI       | Anthropic Claude API (optional)           |

---

## Project Structure

```
inkwell/
├── backend/
│   ├── server.js          # Express app entry point
│   ├── db.js              # SQLite init & schema
│   ├── middleware/
│   │   └── auth.js        # JWT middleware
│   ├── routes/
│   │   ├── auth.js        # /api/auth/*
│   │   ├── posts.js       # /api/posts/*
│   │   └── comments.js    # /api/posts/:id/comments/*
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api.js             # Axios client
│       ├── index.css          # Global styles
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── hooks/
│       │   └── useToast.js
│       ├── components/
│       │   ├── Navbar.jsx
│       │   └── Toast.jsx
│       └── pages/
│           ├── FeedPage.jsx
│           ├── AuthPage.jsx
│           ├── ArticlePage.jsx
│           ├── ComposePage.jsx
│           └── EditPage.jsx
│
└── README.md
```

---

## Quick Start

### 1. Backend

```bash
cd backend

# Copy env file and configure
cp .env.example .env
# Edit .env — set JWT_SECRET to a long random string

# Install dependencies
npm install

# Start server (port 4000)
npm run dev
```

The API will be available at `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend

# Copy env file
cp .env.example .env
# Optionally add your Anthropic API key for AI features

# Install dependencies
npm install

# Start dev server (port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## REST API Reference

### Auth
| Method | Endpoint              | Auth | Description        |
|--------|-----------------------|------|--------------------|
| POST   | /api/auth/register    | —    | Register new user  |
| POST   | /api/auth/login       | —    | Login, get JWT     |
| GET    | /api/auth/me          | ✅   | Get current user   |

### Posts
| Method | Endpoint        | Auth | Description                  |
|--------|-----------------|------|------------------------------|
| GET    | /api/posts      | —    | List posts (?q=&tag=&author=)|
| GET    | /api/posts/:id  | —    | Get single post              |
| POST   | /api/posts      | ✅   | Create post                  |
| PUT    | /api/posts/:id  | ✅   | Update own post              |
| DELETE | /api/posts/:id  | ✅   | Delete own post              |

### Comments
| Method | Endpoint                          | Auth | Description          |
|--------|-----------------------------------|------|----------------------|
| GET    | /api/posts/:postId/comments       | —    | List comments        |
| POST   | /api/posts/:postId/comments       | ✅   | Add comment          |
| DELETE | /api/posts/:postId/comments/:id   | ✅   | Delete comment       |

---

## Features

- **Authentication** — Register/login with hashed passwords (bcrypt) and JWT sessions (7-day expiry)
- **Posts** — Create, read, update, delete with title, body, and optional tag/category
- **Comments** — Add/remove comments; post owners can moderate all comments
- **Search** — Full-text search across post titles and content
- **AI Editorial Review** — Claude analyses your draft and gives editorial suggestions (requires API key)
- **AI Summary** — One-click "Editor's Note" summary of any article
- **Persistent DB** — SQLite database stored as `inkwell.db`, survives restarts

---

## Environment Variables

### Backend `.env`
```
PORT=4000
JWT_SECRET=your-long-random-secret
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:4000
VITE_ANTHROPIC_API_KEY=sk-ant-...   # optional, for AI features
```

---

## Database

SQLite file is created automatically at `backend/inkwell.db` on first run. Schema:

- **users** — id, username, email, password (hashed), bio, created_at
- **posts** — id, title, content, tag, author_id (FK), created_at, updated_at
- **comments** — id, body, post_id (FK), author_id (FK), created_at

Foreign keys cascade on delete — removing a user removes their posts and comments.
