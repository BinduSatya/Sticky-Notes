# Sticky Notes Frontend

This is the React + Vite frontend for the Sticky Notes app.

## 📁 Structure

```
frontend/
  src/
    App.jsx
    App.css
    index.css
    main.jsx
    components/
      AddNoteForm.jsx
      NoteCard/
        NoteCard.jsx
        NoteCard.handlers.js
        NoteCard.styles.js
        NoteCard.utils.js
        NoteCard.css
        SpecialNoteCard.jsx
    icons/
      Trash.jsx
    pages/
      NotesPage.jsx
    utils/
      color.js
  public/
    sticky-note.png
  index.html
```

## 🖥️ Main Components

- **App.jsx**: Root component, loads `NotesPage`.
- **NotesPage.jsx**: Main workspace, sidebar, and note rendering.
- **AddNoteForm.jsx**: Form to create new notes.
- **NoteCard.jsx**: Displays a single note (edit, drag, resize, color, delete).
- **SpecialNoteCard.jsx**: A note that cannot be deleted.
- **Trash.jsx**: Trash icon SVG.

## 🎨 Styling

- All main styles are in `NoteCard.css` and `App.css`.
- Responsive design for mobile and desktop.

## 🛠️ Utilities

- **color.js**: Color palette and complementary color logic.
- **NoteCard.handlers.js**: Modular event handlers.
- **NoteCard.utils.js**: Helpers like textarea auto-grow.

## 🚀 Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

- Visit [http://localhost:5173](http://localhost:5173) in your browser.

## ⚡ Features

- Shift+Drag to move notes
- Ctrl+Click to cycle note color
- Resize notes from corners/sides
- Undo delete with a timer
- Mobile-friendly layout

## 🖼️ Favicon

- The favicon is set to `sticky-note.png` in `public/` via `<link rel="icon" ...>` in `index.html`.

## 📝 Notes

- All API requests use the deployed backend URL by default.
- Defensive checks for undefined properties and error handling are included.
