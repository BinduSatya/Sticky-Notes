# Sticky Notes Backend

This is the Express + MongoDB backend for the Sticky Notes app.

## 📁 Structure

```
backend/
  .env
  package.json
  server.js
  models/
    Note.js
```

## 🛠️ Setup

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**

   - Create a `.env` file with:
     ```
     MONGODB_URI=your_mongodb_connection_string
     PORT=5000
     ```

3. **Start the server:**
   ```bash
   node server.js
   ```
   - The server will run on `http://localhost:5000` by default.

## 📚 API Endpoints

- `GET /api/notes`  
  Fetch all notes.

- `POST /api/notes`  
  Create a new note.  
  Body: `{ title, body, colors, position, width, height }`

- `PATCH /api/notes/:id`  
  Update a note (title, body, colors, position, size).

- `DELETE /api/notes/:id`  
  Delete a note.

## 🗃️ Data Model

- **Note:**
  ```
  {
    _id,
    title,
    body,
    colors: { colorHeader, colorBody },
    position: { x, y },
    width,
    height
  }
  ```

## 🛡️ CORS

- CORS is enabled for frontend development and deployment.

## 📝 Notes

- All note properties are persisted in MongoDB.
- Error handling is implemented for all endpoints.
