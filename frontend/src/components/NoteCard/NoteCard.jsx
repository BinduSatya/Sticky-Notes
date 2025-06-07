import { useRef, useEffect, useState } from "react";
import "./NoteCard.css";
import { resizeHandleStyle } from "./NoteCard.styles";
import { autoGrow } from "./NoteCard.utils";
import { handleDelete, handleChange } from "./NoteCard.handlers";

const Trash = ({ handleDelete }) => {
  let size = "24";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      stroke="#000000"
      fill="none"
      strokeWidth="1.5"
      onClick={handleDelete}
      style={{ cursor: "pointer" }}
    >
      <path d="m6 8 .668 8.681c.148 1.924.222 2.885.84 3.423.068.06.14.115.217.165.685.449 1.63.26 3.522-.118.36-.072.54-.108.721-.111h.064c.182.003.361.039.72.11 1.892.379 2.838.568 3.523.12.076-.05.15-.106.218-.166.617-.538.691-1.5.84-3.423L18 8"></path>
      <path
        strokeLinecap="round"
        d="m10.151 12.5.245 3.492M13.849 12.5l-.245 3.492M4 8s4.851 1 8 1 8-1 8-1M8 5l.447-.894A2 2 0 0 1 10.237 3h3.527a2 2 0 0 1 1.789 1.106L16 5"
      ></path>
    </svg>
  );
};

export const DEFAULT_COLORS = [
  "#b0b6c1",
  "#f9d423",
  "#f38181",
  "#95e1d3",
  "#a8d8ea",
];

export function getComplementaryColor(hex) {
  let num = parseInt(hex.replace("#", ""), 16);
  let r = 255 - (num >> 16);
  let g = 255 - ((num >> 8) & 0x00ff);
  let b = 255 - (num & 0x0000ff);
  return (
    "#" +
    ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()
  );
}

const MIN_WIDTH = 210;
const MIN_HEIGHT = 110;

const NoteCard = ({ note, onDelete }) => {
  const textAreaRef = useRef(null);
  const [noteData, setNoteData] = useState(note);

  useEffect(() => {
    setNoteData(note);
  }, [note]);

  useEffect(() => {
    autoGrow(textAreaRef);
  }, [noteData.text]);

  return (
    <div
      className="note-card"
      style={{
        backgroundColor: DEFAULT_COLORS[noteData.color],
        color: getComplementaryColor(DEFAULT_COLORS[noteData.color]),
        ...resizeHandleStyle(MIN_WIDTH, MIN_HEIGHT),
      }}
    >
      <textarea
        ref={textAreaRef}
        name="text"
        value={noteData.text}
        onChange={(e) => handleChange(e, setNoteData)}
        style={{ resize: "none", overflow: "hidden" }}
      />
      <div className="note-card-footer">
        <button onClick={() => handleDelete(noteData, onDelete)}>
          <Trash />
        </button>
      </div>
    </div>
  );
};

export default NoteCard;
