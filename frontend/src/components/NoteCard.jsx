import { useRef, useEffect, useState } from "react";
import axios from "axios";
import Trash from "../icons/Trash";

const MIN_WIDTH = 210;
const MIN_HEIGHT = 110;
const DEFAULT_COLORS = [
  "#b0b6c1", // muted gray-blue
  "#f9d423", // muted yellow
  "#f38181", // muted coral
  "#95e1d3", // muted teal
  "#a8d8ea", // muted light blue
];

// Utility to get complementary color
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

const NoteCard = ({ note, onDelete }) => {
  const {
    position: initialPosition,
    colors: initialColors,
    body: initialBody,
    title,
  } = note;
  const textAreaRef = useRef(null);

  const [position, setPosition] = useState(initialPosition);
  const [body, setBody] = useState(initialBody);
  const [size, setSize] = useState({
    width: note.width || MIN_WIDTH,
    height: note.height || MIN_HEIGHT,
  });
  const [colors, setColors] = useState(initialColors);
  const [pickerOpen, setPickerOpen] = useState(false);

  const resizing = useRef(null);
  const cardRef = useRef(null);
  const dragging = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    autoGrow(textAreaRef);
  }, []);

  useEffect(() => {
    setPosition(initialPosition);
  }, [initialPosition]);

  useEffect(() => {
    setBody(initialBody);
  }, [initialBody]);

  function autoGrow(textAreaRef) {
    const { current } = textAreaRef;
    if (!current) return;
    current.style.height = "auto";
    current.style.height = current.scrollHeight + "px";
  }

  // Delete handler
  const handleDelete = async () => {
    try {
      await axios.delete(
        `https://stickynotes-7etc.onrender.com/api/notes/${note._id}`
      );
      if (onDelete) onDelete(note._id);
    } catch (err) {
      alert("Error deleting note");
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.dataset.resize) return;
    dragging.current = true;
    const cardRect = cardRef.current.getBoundingClientRect();
    const sidebar = document.querySelector('[style*="position: fixed"]');
    const sidebarWidth = sidebar ? sidebar.offsetWidth : 0;
    const workarea = document.querySelector(".workarea-bg");
    const workareaRect = workarea.getBoundingClientRect();
    const scrollTop = workarea.scrollTop;

    offset.current = {
      x: e.clientX - cardRect.left,
      y: e.clientY - cardRect.top + scrollTop - workareaRect.top,
      sidebarWidth,
      workareaTop: workareaRect.top,
      scrollTop,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Allow resizing from all corners and sides
  const handleResizeMouseDown = (dir) => (e) => {
    e.stopPropagation();
    resizing.current = {
      dir,
      startX: e.clientX,
      startY: e.clientY,
      startW: size.width,
      startH: size.height,
      startLeft: position.x,
      startTop: position.y,
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  const handleMouseMove = (e) => {
    if (resizing.current) {
      const { dir, startX, startY, startW, startH, startLeft, startTop } =
        resizing.current;
      let dx = e.clientX - startX;
      let dy = e.clientY - startY;
      let newWidth = startW;
      let newHeight = startH;
      let newLeft = startLeft;
      let newTop = startTop;

      const workarea = document.querySelector(".workarea-bg");
      const workareaRect = workarea.getBoundingClientRect();

      // Handle east (right)
      if (dir.includes("e")) {
        newWidth = Math.max(
          MIN_WIDTH,
          Math.min(startW + dx, workareaRect.right - startLeft)
        );
      }
      // Handle south (bottom)
      if (dir.includes("s")) {
        newHeight = Math.max(
          MIN_HEIGHT,
          Math.min(startH + dy, workareaRect.bottom - startTop)
        );
      }
      // Handle west (left)
      if (dir.includes("w")) {
        let proposedLeft = startLeft + dx;
        proposedLeft = Math.max(
          0,
          Math.min(proposedLeft, startLeft + startW - MIN_WIDTH)
        );
        newWidth = startLeft + startW - proposedLeft;
        newLeft = proposedLeft;
      }
      // Handle north (top)
      if (dir.includes("n")) {
        const maxDy = startH - MIN_HEIGHT;
        dy = Math.min(dy, maxDy);
        let proposedTop = startTop + dy;
        proposedTop = Math.max(
          workareaRect.top,
          Math.min(proposedTop, workareaRect.bottom - MIN_HEIGHT)
        );
        newHeight = Math.max(MIN_HEIGHT, startH - (proposedTop - startTop));
        newTop = proposedTop - workareaRect.top;
      }

      newLeft = Math.max(0, Math.min(newLeft, workareaRect.width - newWidth));
      newTop = Math.max(0, Math.min(newTop, workareaRect.height - newHeight));

      setSize({ width: newWidth, height: newHeight });
      setPosition({ x: newLeft, y: newTop });
      return;
    }

    if (!dragging.current) return;
    const sidebarWidth = offset.current.sidebarWidth || 0;
    const workarea = document.querySelector(".workarea-bg");
    const workareaRect = workarea.getBoundingClientRect();
    const scrollTop = workarea.scrollTop;

    const newX = Math.max(
      0,
      Math.min(
        workarea.offsetWidth - cardRef.current.offsetWidth,
        e.clientX - sidebarWidth - offset.current.x
      )
    );
    const newY = Math.max(
      0,
      Math.min(
        workarea.scrollHeight - cardRef.current.offsetHeight,
        e.clientY - workareaRect.top + scrollTop - offset.current.y
      )
    );
    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = async () => {
    dragging.current = false;
    if (resizing.current) {
      try {
        await axios.patch(
          `https://stickynotes-7etc.onrender.com/api/notes/${note._id}`,
          {
            position,
            width: size.width,
            height: size.height,
          }
        );
      } catch (err) {
        console.error("Error updating note size/position:", err);
      }
      resizing.current = null;
    } else {
      try {
        await axios.patch(
          `https://stickynotes-7etc.onrender.com/api/notes/${note._id}`,
          {
            position,
          }
        );
      } catch (err) {
        console.error("Error updating note position:", err);
      }
    }
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  // Update body in backend on blur
  const handleBodyBlur = async () => {
    try {
      await axios.patch(
        `https://stickynotes-7etc.onrender.com/api/notes/${note._id}`,
        {
          body,
        }
      );
    } catch (err) {
      console.error("Error updating note body:", err);
    }
  };

  // Color change handler
  const handleColorChange = async (newColor) => {
    const newColors = {
      colorHeader: newColor,
      colorBody: getComplementaryColor(newColor),
    };
    setColors(newColors);
    try {
      await axios.patch(
        `https://stickynotes-7etc.onrender.com/api/notes/${note._id}`,
        {
          colors: newColors,
        }
      );
    } catch (err) {
      alert("Error updating note color");
    }
    setPickerOpen(false);
  };

  // Resize handles for all corners and sides
  const handleStyle = (cursor, style) => ({
    position: "absolute",
    visibility: "none",
    zIndex: 10,
    opacity: 0.4,
    width: 12,
    height: 12,
    background: "rgba(255,255,255,0.07)",
    borderRadius: 4,
    border: "0.5px dotted #aaa",
    cursor,
    ...style,
  });

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        backgroundColor: colors.colorBody,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: size.width,
        height: size.height,
        position: "absolute",
        cursor: dragging.current ? "grabbing" : "grab",
        userSelect: "none",
        borderRadius: 5,
        boxShadow: "0 4px 24px 0 rgba(5, 5, 33, 0.13)",
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
      onMouseDown={handleMouseDown}
    >
      <div
        className="card-header"
        style={{
          backgroundColor: colors.colorHeader,
          cursor: "grab",
          borderRadius: "5px 5px 0 0",
          padding: "8px 12px",
          color: colors.colorBody,
          fontWeight: "bold",
          fontSize: "1.1em",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <span style={{ display: "flex", alignItems: "center" }}>
          <Trash handleDelete={handleDelete} style={{ cursor: "pointer" }} />
          <span style={{ marginLeft: 8 }}>{title}</span>
        </span>
        {/* Color Picker Toggle Button at Top Right */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setPickerOpen((open) => !open);
          }}
          style={{
            background: "#fff",
            border: "1px solid #bfc7e0",
            borderRadius: "50%",
            width: 28,
            height: 28,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 4px 0 rgba(20,20,40,0.10)",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 18,
            color: "#5a6cff",
            marginLeft: 8,
            zIndex: 3,
          }}
          aria-label="Change note color"
        >
          🎨
        </button>
        {/* Color Picker Panel (shown only if pickerOpen) */}
        {pickerOpen && (
          <div
            style={{
              position: "absolute",
              top: -48,
              right: 0,
              left: "auto",
              background: "#fff",
              border: "1px solid #bfc7e0",
              borderRadius: 8,
              boxShadow: "0 2px 12px 0 rgba(20,20,40,0.18)",
              padding: "8px 12px",
              display: "flex",
              gap: 8,
              zIndex: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {DEFAULT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleColorChange(c)}
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: "50%",
                  border:
                    colors.colorHeader === c
                      ? "2px solid #5a6cff"
                      : "1px solid #353a4a",
                  background: c,
                  cursor: "pointer",
                  outline: "none",
                  boxShadow:
                    colors.colorHeader === c ? "0 0 0 2px #bfc7e0" : "none",
                  marginBottom: 0,
                }}
                aria-label={`Change note color to ${c}`}
              />
            ))}
          </div>
        )}
      </div>

      <div
        className="card-body"
        style={{
          height: "calc(100% - 40px)",
          padding: "8px 12px",
        }}
      >
        <textarea
          ref={textAreaRef}
          style={{
            color: colors.colorHeader,
            width: "100%",
            height: "100%",
            resize: "none",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "1em",
            wordBreak: "break-word",
            overflow: "auto",
          }}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            autoGrow(textAreaRef);
          }}
          onBlur={handleBodyBlur}
        />
      </div>
    </div>
  );
};

export default NoteCard;
