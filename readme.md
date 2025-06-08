# Sticky Notes - Full Stack MERN App

A modern sticky notes application built with the MERN stack (MongoDB, Express, React, Node.js).

## 📁 Project Structure

```
Sticky-Notes/
  backend/      # Express + MongoDB API
  frontend/     # React + Vite client
  readme.md     # This file (overall project)
```

## 🚀 Quick Start

1. **Start the backend:**  
   See [backend/readme.md](./backend/readme.md)

2. **Start the frontend:**  
   See [frontend/readme.md](./frontend/readme.md)

## ✨ Features

- Create, edit, move, resize, and delete sticky notes
- Color cycling and drag/resize with keyboard modifiers
- Undo delete with a timer
- Responsive and mobile-friendly UI
- Special notes that cannot be deleted

## 📚 Documentation

- [Frontend README](./frontend/readme.md)
- [Backend README](./backend/readme.md)

---

## 🛠️ Notable Design Decisions

- All handlers, styles, and utilities are modularized for maintainability.
- Defensive coding for undefined/null properties.
- All API URLs are centralized and consistent.
- Undo delete is implemented with a queue and timer.

---

## 📦 Tech Stack

- **Frontend:** React, Vite, CSS
- **Backend:** Express, MongoDB (Mongoose)
