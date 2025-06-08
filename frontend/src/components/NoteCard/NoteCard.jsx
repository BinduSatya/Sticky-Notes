import { useRef, useEffect, useState } from "react";
import axios from "axios";
import Trash from "../../icons/Trash.jsx";
import { handleDelete, handleChange } from "./NoteCard.handlers.js";
import { DEFAULT_COLORS, getComplementaryColor } from "../../utils/color";
import { resizeHandleStyle } from "./NoteCard.styles";
import { autoGrow } from "./NoteCard.utils";

const MIN_WIDTH = 210;
const MIN_HEIGHT = 110;

const NoteCard = ({ note, onDelete }) => {
  const {
    position: initialPosition,
    colors: initialColors,
    body: initialBody,
    title: initialTitle,
  } = note;
  const textAreaRef = useRef(null);

  const [position, setPosition] = useState(initialPosition);
  const [body, setBody] = useState(initialBody);
  const [title, setTitle] = useState(initialTitle);
  const [size, setSize] = useState({
    width: note.width || MIN_WIDTH,
    height: note.height || MIN_HEIGHT,
  });
  const [colors, setColors] = useState(initialColors);
  const [hovered, setHovered] = useState(false);

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

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  // Editable header blur handler
  const handleHeaderBlur = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/notes/${note._id}`, {
        title,
      });
    } catch (err) {
      alert("Error updating note title");
    }
  };

  // Body blur handler
  const handleBodyBlur = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/notes/${note._id}`, {
        body,
      });
    } catch (err) {
      alert("Error updating note body");
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    if (e.target.dataset.resize) return;
    if (!e.shiftKey) return; // Only allow drag with Shift
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
        console.log("Resizing east");

        newWidth = Math.max(
          MIN_WIDTH,
          Math.min(startW + dx, workareaRect.right - startLeft)
        );
      }
      // Handle south (bottom)
      if (dir.includes("s")) {
        console.log("Resizing south");
        newHeight = Math.max(
          MIN_HEIGHT,
          Math.min(startH + dy, workareaRect.bottom - startTop)
        );
      }
      // Handle west (left)
      if (dir.includes("w")) {
        console.log("Resizing west");
        // The right edge stays at startLeft + startW
        let proposedLeft = startLeft + dx;
        // Clamp so right edge doesn't go past workarea's right, and left doesn't go past workarea's left
        proposedLeft = Math.max(
          0,
          Math.min(proposedLeft, startLeft + startW - MIN_WIDTH)
        );
        newWidth = startLeft + startW - proposedLeft;
        newLeft = proposedLeft;
      }
      // Handle north (top)
      if (dir.includes("n")) {
        console.log("Resizing north");

        const maxDy = startH - MIN_HEIGHT;
        dy = Math.min(dy, maxDy); // Don't allow shrinking past min height
        let proposedTop = startTop + dy;
        // Clamp so bottom edge doesn't go past workarea
        proposedTop = Math.max(
          workareaRect.top,
          Math.min(proposedTop, workareaRect.bottom - MIN_HEIGHT)
        );
        newHeight = Math.max(MIN_HEIGHT, startH - (proposedTop - startTop));
        newTop = proposedTop - workareaRect.top;
      }

      // Clamp newLeft and newTop to not go outside workarea
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
      // Save new size and position
      try {
        await axios.patch(`http://localhost:5000/api/notes/${note._id}`, {
          position,
          width: size.width,
          height: size.height,
        });
      } catch (err) {
        console.error("Error updating note size/position:", err);
      }
      resizing.current = null;
    } else {
      // Save position only
      try {
        await axios.patch(`http://localhost:5000/api/notes/${note._id}`, {
          position,
        });
      } catch (err) {
        console.error("Error updating note position:", err);
      }
    }
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
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
  };

  // Toggle color on ctrl+click
  const handleCardClick = async (e) => {
    if (e.ctrlKey) {
      // Find the next color in DEFAULT_COLORS
      const currentIdx = DEFAULT_COLORS.indexOf(colors.colorHeader);
      const nextIdx = (currentIdx + 1) % DEFAULT_COLORS.length;
      const nextColor = DEFAULT_COLORS[nextIdx];
      const newColors = {
        colorHeader: nextColor,
        colorBody: getComplementaryColor(nextColor),
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
    }
  };

  return (
    <div
      ref={cardRef}
      className="card"
      style={{
        backgroundColor: hovered ? `${colors.colorBody}CC` : colors.colorBody,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: hovered ? size.width * 1.02 : size.width,
        height: hovered ? size.height * 1.02 : size.height,
        position: "absolute",
        cursor: dragging.current ? "grabbing" : "default", // normal cursor when not dragging
        userSelect: "none",
        borderRadius: 5,
        boxShadow: hovered
          ? "0 8px 32px 0 rgba(5, 5, 33, 0.18)"
          : "0 4px 24px 0 rgba(5, 5, 33, 0.13)",
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        overflow: "hidden",
        transition:
          "box-shadow 0.2s, background-color 0.2s, width 0.15s, height 0.15s",
        zIndex: hovered ? 2 : 1,
      }}
      onMouseDown={handleMouseDown}
      onClick={handleCardClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="card-header"
        style={{
          backgroundColor: colors.colorHeader,
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
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleHeaderBlur}
            style={{
              marginLeft: 8,
              background: "transparent",
              border: "none",
              color: colors.colorBody,
              fontWeight: "bold",
              fontSize: "1.1em",
              outline: "none",
              width: "100%",
              minWidth: 0,
              flex: 1,
            }}
            spellCheck={false}
          />
        </span>
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

      {/* Resize handles */}
      <div
        style={resizeHandleStyle("nwse-resize", { top: -6, left: -6 })}
        onMouseDown={handleResizeMouseDown("nw")}
        data-resize
      />
      <div
        style={resizeHandleStyle("nesw-resize", { top: -6, right: -6 })}
        onMouseDown={handleResizeMouseDown("ne")}
        data-resize
      />
      <div
        style={resizeHandleStyle("nwse-resize", { bottom: -6, right: -6 })}
        onMouseDown={handleResizeMouseDown("se")}
        data-resize
      />
      <div
        style={resizeHandleStyle("nesw-resize", { bottom: -6, left: -6 })}
        onMouseDown={handleResizeMouseDown("sw")}
        data-resize
      />
      <div
        style={resizeHandleStyle("ns-resize", {
          top: -6,
          left: "50%",
          transform: "translateX(-50%)",
        })}
        onMouseDown={handleResizeMouseDown("n")}
        data-resize
      />
      <div
        style={resizeHandleStyle("ew-resize", {
          top: "50%",
          right: -6,
          transform: "translateY(-50%)",
        })}
        onMouseDown={handleResizeMouseDown("e")}
        data-resize
      />
      <div
        style={resizeHandleStyle("ns-resize", {
          bottom: -6,
          left: "50%",
          transform: "translateX(-50%)",
        })}
        onMouseDown={handleResizeMouseDown("s")}
        data-resize
      />
      <div
        style={resizeHandleStyle("ew-resize", {
          top: "50%",
          left: -6,
          transform: "translateY(-50%)",
        })}
        onMouseDown={handleResizeMouseDown("w")}
        data-resize
      />
    </div>
  );
};

export default NoteCard;
