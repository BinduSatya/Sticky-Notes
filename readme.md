# Sticky Notes - Documentation

A full-stack MERN sticky notes app with a modern React frontend and Express/MongoDB backend.  
This README documents the **project structure**, **components**, **utility functions**, and **key design/feature decisions**.

---

## 📁 Folder Structure

```
Sticky-Notes/
  backend/
    .env
    .gitignore
    package.json
    server.js
  frontend/
    .eslintrc.cjs
    .gitignore
    index.html
    package.json
    vite.config.js
    README.md
    public/
    src/
      App.jsx
      index.css
      main.jsx
      assets/
        fakeData.js
      components/
        AddNoteForm.jsx
        NoteCard/
          NoteCard.jsx
          NoteCard.handlers.js
          NoteCard.styles.js
          NoteCard.utils.js
          NoteCard.css
          SpecialNoteCard.jsx
          index.js
      icons/
        Trash.jsx
      pages/
        NotesPage.jsx
      utils/
        color.js
```

---

## 🗂️ Backend

### `server.js`

- Express server with MongoDB (via Mongoose).
- **Endpoints:**
  - `GET /api/notes` - fetch all notes.
  - `POST /api/notes` - create a note.
  - `DELETE /api/notes/:id` - delete a note.
  - `PATCH /api/notes/:id` - update a note (title, body, colors, position, size).
- **Note Schema:**  
  `{ title, body, colors, position, width, height }`

---

## 🖥️ Frontend

### `src/App.jsx`

- Root component, renders the main layout and `NotesPage`.

### `src/pages/NotesPage.jsx`

- **Sidebar:**
  - Contains the note creation form (`AddNoteForm`).
  - Undo snackbar for recently deleted notes.
  - Sidebar is resizable.
- **Work Area:**
  - Renders all notes as `NoteCard` components.
  - (Optionally) renders a `SpecialNoteCard` that cannot be deleted.
- **Undo Delete:**
  - Notes are "soft deleted" for 4 seconds, can be undone.
  - After timeout, note is deleted from backend.

---

### `src/components/AddNoteForm.jsx`

- Form to add a new note.
- Lets user pick a color, enter title and body.
- Finds a random non-overlapping position for the new note.
- Uses utility functions for color and brightness.
- Posts new note to backend and resets form on success.

---

### `src/components/NoteCard/NoteCard.jsx`

- **Displays a single note.**
- **Features:**
  - Editable title and body.
  - Drag to move (only with Shift key held).
  - Resize from corners/sides.
  - Hover: note grows 2% and becomes slightly transparent.
  - Ctrl+Click: cycles note color through 5 preset colors.
  - Delete: Trash icon in header (not present in `SpecialNoteCard`).
- **Styling:**
  - Most styles in `NoteCard.css`, dynamic styles inline.
- **Handlers:**
  - All event handlers (delete, change, drag, resize, color toggle) are modularized in `NoteCard.handlers.js`, `NoteCard.utils.js`, and `NoteCard.styles.js`.

---

### `src/components/NoteCard/SpecialNoteCard.jsx`

- A special note card that **cannot be deleted**.
- No Trash icon.
- Uses a fixed color.
- Title/body are read-only by default.

---

### `src/components/NoteCard/NoteCard.handlers.js`

- Contains modular handler functions for:
  - Deleting a note.
  - Handling input changes.

---

### `src/components/NoteCard/NoteCard.utils.js`

- Utility: `autoGrow` for textarea auto-resizing.

---

### `src/components/NoteCard/NoteCard.styles.js`

- Utility: `resizeHandleStyle` for consistent resize handle styling.

---

### `src/components/NoteCard/NoteCard.css`

- All main styles for `.note-card`, textarea, and footer.

---

### `src/icons/Trash.jsx`

- SVG Trash icon component, used for note deletion.

---

### `src/utils/color.js`

- `DEFAULT_COLORS`: Array of 5 pastel/muted colors.
- `getComplementaryColor(hex)`: Returns a contrasting color for text/background.

---

## 📝 Key Features & Design Decisions

- **Component Organization:**

  - All note logic is modularized: handlers, styles, and utilities are in their own files.
  - Icons are in a dedicated folder.
  - Utility functions (like color logic) are shared via `src/utils/`.

- **Note Interactions:**

  - **Drag:** Only possible while holding the Shift key.
  - **Resize:** Handles on all sides/corners.
  - **Color:** Ctrl+Click on a note cycles its color.
  - **Delete:** Trash icon in header; not present in `SpecialNoteCard`.
  - **Undo Delete:** Notes can be undone for 4 seconds after deletion.

- **Special Note Card:**

  - `SpecialNoteCard` cannot be deleted and is visually distinct.

- **Styling:**

  - All static styles are in CSS files; only dynamic (color, position, size) styles are inline.
  - Responsive and visually clean.

- **Error Handling:**

  - Defensive checks for undefined properties (e.g., color, \_id).
  - Error boundaries are suggested for production.

- **Backend:**
  - Uses Mongoose for schema enforcement.
  - All note properties are persisted.

---

## 🛠️ Notable Changes & Refactors

- **Moved all handlers out of components** for clarity and maintainability.
- **All styles moved to CSS files** except dynamic inline styles.
- **All color logic centralized** in `utils/color.js`.
- **SpecialNoteCard** added as a non-deletable note.
- **Robust error handling** for undefined/null properties.
- **Improved import paths** and folder structure for scalability.

---

## 🚀 How to Run

1. **Backend:**

   - Set up your MongoDB URI in `backend/.env`.
   - Run:
     ```
     cd backend
     npm install
     node server.js
     ```

2. **Frontend:**
   - Run:
     ```
     cd frontend
     npm install
     npm run dev
     ```

---

## 📚 Further Improvements

- Add authentication for personal notes.
- Add markdown support for note body.
- Add tags or categories.
- Add multi-user collaboration.

---

**This documentation is up to date with all recent code and structure changes.**
