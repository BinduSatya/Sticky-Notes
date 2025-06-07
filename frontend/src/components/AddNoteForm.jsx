import { useState } from "react";
import axios from "axios";

// Helper to generate random color in hex
const randomColor = () =>
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

const defaultPosition = { x: 500, y: 600 };

const AddNoteForm = ({ onNoteAdded }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [position, setPosition] = useState(defaultPosition);

  // Generate random colors for each new note
  const generateColors = () => ({
    colorHeader: randomColor(),
    colorBody: randomColor(),
    colorText: randomColor(),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const colors = generateColors();
    const newNote = {
      title,
      body,
      colors,
      position,
    };
    try {
      const res = await axios.post("http://localhost:5000/api/notes", newNote);
      onNoteAdded(res.data);
      setTitle("");
      setBody("");
      setPosition(defaultPosition);
    } catch (err) {
      alert("Error adding note");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: 24 }}>
      <input
        type="text"
        placeholder="Todo Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        style={{ width: 200, display: "block", marginBottom: 8 }}
      />
      <textarea
        placeholder="Todo Details"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        style={{ width: 200, height: 60, display: "block", marginBottom: 8 }}
      />
      <label>
        X:
        <input
          type="number"
          value={position.x}
          onChange={(e) =>
            setPosition({ ...position, x: Number(e.target.value) })
          }
          style={{ width: 60 }}
        />
      </label>
      <label>
        Y:
        <input
          type="number"
          value={position.y}
          onChange={(e) =>
            setPosition({ ...position, y: Number(e.target.value) })
          }
          style={{ width: 60 }}
        />
      </label>
      <button type="submit" style={{ marginLeft: 12 }}>
        Add Todo
      </button>
    </form>
  );
};

export default AddNoteForm;
