import { useState } from "react";
import axios from "axios";

// Utility to adjust brightness
function adjustBrightness(hex, percent) {
  let num = parseInt(hex.replace("#", ""), 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;
  r = Math.max(Math.min(255, r), 0);
  g = Math.max(Math.min(255, g), 0);
  b = Math.max(Math.min(255, b), 0);
  return "#" + (b | (g << 8) | (r << 16)).toString(16).padStart(6, "0");
}

// New utility to get complementary color
function getComplementaryColor(hex) {
  let num = parseInt(hex.replace("#", ""), 16);
  let r = 255 - (num >> 16);
  let g = 255 - ((num >> 8) & 0x00ff);
  let b = 255 - (num & 0x0000ff);
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

const DEFAULT_COLORS = [
  "#b0b6c1", // muted gray-blue
  "#f9d423", // muted yellow
  "#f38181", // muted coral
  "#95e1d3", // muted teal
  "#a8d8ea", // muted light blue
];

const NOTE_WIDTH = 210;
const NOTE_HEIGHT = 110;
const PADDING = 24;

const AddNoteForm = ({ onNoteAdded, notes = [] }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);

  // Find a random non-overlapping position
  function getRandomPosition() {
    const workarea = document.querySelector(".workarea-bg");
    const sidebar = document.querySelector('[style*="position: fixed"]');
    const sidebarWidth = sidebar ? sidebar.offsetWidth : 300;
    const areaWidth =
      (workarea?.offsetWidth || window.innerWidth) - NOTE_WIDTH - PADDING;
    const areaHeight =
      (workarea?.offsetHeight || window.innerHeight) - NOTE_HEIGHT - PADDING;

    // Try up to 20 times to find a non-overlapping position
    for (let attempt = 0; attempt < 20; attempt++) {
      const x = Math.floor(Math.random() * areaWidth) + PADDING;
      const y = Math.floor(Math.random() * areaHeight) + PADDING;

      // Check for overlap with existing notes
      const overlap = notes.some((n) => {
        const nx = n.position?.x ?? 0;
        const ny = n.position?.y ?? 0;
        const nw = n.width || NOTE_WIDTH;
        const nh = n.height || NOTE_HEIGHT;
        return (
          x < nx + nw + 8 &&
          x + NOTE_WIDTH + 8 > nx &&
          y < ny + nh + 8 &&
          y + NOTE_HEIGHT + 8 > ny
        );
      });

      if (!overlap) return { x, y };
    }
    // Fallback: just stack
    return {
      x: PADDING + ((notes.length * 32) % (areaWidth - NOTE_WIDTH)),
      y: PADDING + ((notes.length * 32) % (areaHeight - NOTE_HEIGHT)),
    };
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const position = getRandomPosition();
    const complementary = getComplementaryColor(color);
    const colors = {
      colorHeader: color,
      colorText: adjustBrightness(color, 60),
      colorBody: complementary,
    };
    const newNote = {
      title,
      body,
      colors,
      position,
      width: NOTE_WIDTH,
      height: NOTE_HEIGHT,
    };
    try {
      const res = await axios.post("http://localhost:5000/api/notes", newNote);
      onNoteAdded(res.data);
      setTitle("");
      setBody("");
      setColor(DEFAULT_COLORS[0]);
    } catch (err) {
      alert("Error adding note");
    }
  };

  // Unified style for inputs and textarea
  const inputStyle = {
    width: "100%",
    padding: "12px 16px",
    borderRadius: 10,
    border: "1.5px solid #353a4a",
    background: "rgba(35,40,59,0.95)",
    color: "#e0e6f7",
    fontSize: "1em",
    marginBottom: 12,
    outline: "none",
    boxShadow: "0 2px 8px 0 rgba(20,20,40,0.10)",
    transition: "border 0.2s, box-shadow 0.2s",
  };

  const labelStyle = {
    color: "#bfc7e0",
    fontWeight: 500,
    fontSize: 14,
    marginBottom: 4,
    display: "block",
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginBottom: 24,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        background: "rgba(35,40,59,0.96)",
        borderRadius: 18,
        boxShadow: "0 4px 32px 0 rgba(20,20,40,0.18)",
        padding: 24,// Prevent text selection in the sidebar
      }}
    >
      <label style={labelStyle}>Title</label>
      <input
        type="text"
        placeholder="Note Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={inputStyle}
      />
      <label style={labelStyle}>Details</label>
      <textarea
        placeholder="Note Details"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        style={{
          ...inputStyle,
          minHeight: 60,
          resize: "none",
          fontFamily: "inherit",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <label style={{ ...labelStyle, marginBottom: 0 }}>Color</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {DEFAULT_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border:
                  color === c ? "2px solid #5a6cff" : "1.5px solid #353a4a",
                background: c,
                cursor: "pointer",
                outline: color === c ? "2px solid #5a6cff" : "none",
                boxShadow: color === c ? "0 0 0 2px #bfc7e0" : "none",
                transition: "border 0.2s, outline 0.2s",
                marginBottom: 4,
              }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>
      <button
        type="submit"
        style={{
          marginTop: 8,
          padding: "12px 0",
          borderRadius: 10,
          border: "none",
          background: "linear-gradient(90deg, #5a6cff 60%, #1117f7 100%)",
          color: "#fff",
          fontWeight: 700,
          fontSize: "1.1em",
          boxShadow: "0 2px 8px 0 rgba(60,60,120,0.18)",
          cursor: "pointer",
          transition: "background 0.2s",
          letterSpacing: 1,
        }}
      >
        Add Note
      </button>
    </form>
  );
};

export default AddNoteForm;
