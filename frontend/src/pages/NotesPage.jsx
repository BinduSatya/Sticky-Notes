import { useEffect, useState, useRef } from "react";
import axios from "axios";
import NoteCard from "../components/NoteCard.jsx";
import AddNoteForm from "../components/AddNoteForm.jsx";

const MIN_SIDEBAR_WIDTH = 350;
const MAX_SIDEBAR_WIDTH = 600;
const UNDO_DURATION = 4000; // 4 seconds

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(MIN_SIDEBAR_WIDTH);
  const [deletedQueue, setDeletedQueue] = useState([]); // Array of {note, timeoutId, deletedAt}
  const [undoTimeLeft, setUndoTimeLeft] = useState(0);
  const resizing = useRef(false);

  useEffect(() => {
    axios
      .get("https://stickynotes-7etc.onrender.com/api/notes")
      .then((res) => setNotes(res.data))
      .catch((err) => console.error("Error fetching notes:", err));
  }, []);

  // Timer for showing time left for the first deleted note
  useEffect(() => {
    if (deletedQueue.length === 0) {
      setUndoTimeLeft(0);
      return;
    }
    const first = deletedQueue[0];
    const update = () => {
      const elapsed = Date.now() - first.deletedAt;
      const left = Math.max(0, UNDO_DURATION - elapsed);
      setUndoTimeLeft(left);
    };
    update();
    const interval = setInterval(update, 100);
    return () => clearInterval(interval);
  }, [deletedQueue]);

  const handleNoteAdded = (note) => setNotes((prev) => [...prev, note]);

  const handleNoteDeleted = (id) => {
    const noteToDelete = notes.find((n) => n._id === id);
    // Hide the note immediately (but don't delete from backend yet)
    setNotes((prev) => prev.filter((note) => note._id !== id));
    const deletedAt = Date.now();
    // Set up a timeout for this note to delete from backend after 4 seconds
    const timeoutId = setTimeout(async () => {
      setDeletedQueue((queue) => {
        const idx = queue.findIndex((item) => item.note._id === id);
        if (idx !== -1) {
          axios
            .delete(`https://stickynotes-7etc.onrender.com/api/notes/${id}`)
            .catch(() => {});
          const newQueue = [...queue];
          newQueue.splice(idx, 1);
          return newQueue;
        }
        return queue;
      });
    }, UNDO_DURATION);

    setDeletedQueue((queue) => [
      ...queue,
      { note: noteToDelete, timeoutId, deletedAt },
    ]);
  };

  const handleUndo = async () => {
    setDeletedQueue((queue) => {
      if (queue.length === 0) return queue;
      const last = queue[queue.length - 1];
      clearTimeout(last.timeoutId);
      // Restore the note in the UI (no backend call needed)
      setNotes((prev) => [...prev, last.note]);
      // Remove from queue immediately so it can't be undone again
      return queue.slice(0, -1);
    });
  };

  // Mouse events for resizing
  const handleMouseDown = () => {
    resizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!resizing.current) return;
    const newWidth = Math.min(
      Math.max(e.clientX, MIN_SIDEBAR_WIDTH),
      MAX_SIDEBAR_WIDTH
    );
    setSidebarWidth(newWidth);
  };

  const handleMouseUp = () => {
    resizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        fontFamily: "Inter, Arial, sans-serif",
        background: "#181c24",
        overflow: "hidden",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarWidth,
          background: "linear-gradient(135deg, #23283b 80%, #181c24 100%)",
          borderRight: "1px solid #23283b",
          padding: 24,
          boxSizing: "border-box",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 2,
          transition: "width 0.1s",
          display: "flex",
          flexDirection: "column",
          borderRadius: "0 18px 18px 0",
          boxShadow: "2px 0 24px 0 rgba(20,20,40,0.25)",
          userSelect: "none",
        }}
      >
        <h2
          style={{
            marginTop: -10,
            marginBottom: -5,
            fontWeight: 700,
            color: "#e0e6f7",
          }}
        >
          Create Note
        </h2>
        <AddNoteForm onNoteAdded={handleNoteAdded} notes={notes} />
        {/* Drag handle */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 6,
            height: "100%",
            cursor: "ew-resize",
            zIndex: 10,
            background: "rgba(255,255,255,0.04)",
            borderRadius: "0 8px 8px 0",
          }}
          onMouseDown={handleMouseDown}
        />
        {/* Undo Snackbar inside sidebar */}
        {deletedQueue.length > 0 && (
          <div
            style={{
              position: "absolute",
              left: 16,
              right: 16,
              bottom: 16,
              background: "#23283b",
              color: "#fff",
              padding: "10px 14px",
              borderRadius: 8,
              boxShadow: "0 2px 8px 0 rgba(20,20,40,0.18)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 14,
              justifyContent: "space-between",
              minWidth: 0,
              maxWidth: "100%",
              flexWrap: "wrap",
              wordBreak: "break-word",
            }}
          >
            <span
              style={{
                fontSize: 14,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {deletedQueue.length === 1
                ? "Note deleted"
                : `${deletedQueue.length} notes deleted`}
              {" · "}
              Undo in {Math.ceil(undoTimeLeft / 1000)}s
            </span>
            <button
              onClick={handleUndo}
              style={{
                background: "#5a6cff",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 14px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 14,
                marginLeft: 6,
                minWidth: 0,
                whiteSpace: "nowrap",
              }}
            >
              Undo ({deletedQueue.length})
            </button>
          </div>
        )}
      </div>
      {/* Work Area */}
      <div
        className="workarea-bg"
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          position: "relative",
          height: "100vh",
          overflow: "hidden",
          background:
            "repeating-linear-gradient(0deg, #23283b, #23283b 39px, #181c24 40px, #23283b 41px)",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            position: "relative",
          }}
        >
          {notes.map((note) => (
            <NoteCard key={note._id} note={note} onDelete={handleNoteDeleted} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
