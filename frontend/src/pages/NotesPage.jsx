import { useEffect, useState, useRef } from "react";
import axios from "axios";
import NoteCard from "../components/NoteCard.jsx";
import AddNoteForm from "../components/AddNoteForm.jsx";

const MIN_SIDEBAR_WIDTH = 250;
const MAX_SIDEBAR_WIDTH = 500;

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const resizing = useRef(false);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/notes")
      .then((res) => setNotes(res.data))
      .catch((err) => console.error("Error fetching notes:", err));
  }, []);

  const handleNoteAdded = (note) => setNotes((prev) => [...prev, note]);
  const handleNoteDeleted = (id) =>
    setNotes((prev) => prev.filter((note) => note._id !== id));

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
        overflow: "hidden", // Prevent horizontal scroll
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
        }}
      >
        <h2
          style={{
            marginTop: 0,
            marginBottom: 16,
            fontWeight: 700,
            letterSpacing: 1,
            color: "#e0e6f7",
          }}
        >
          Create Note
        </h2>
        <AddNoteForm onNoteAdded={handleNoteAdded} />
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
      </div>
      {/* Work Area */}
      <div
        className="workarea-bg"
        style={{
          flex: 1,
          marginLeft: sidebarWidth,
          position: "relative",
          height: "100vh",
          overflowY: "auto",
          overflowX: "hidden",
          background:
            "repeating-linear-gradient(0deg, #23283b, #23283b 39px, #181c24 40px, #23283b 41px)",
        }}
      >
        <div
          style={{
            minHeight: "200vh",
            width: "100%",
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
