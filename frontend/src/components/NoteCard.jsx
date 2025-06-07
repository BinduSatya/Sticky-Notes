import { useRef, useEffect, useState } from "react";
import axios from "axios";
import Trash from "../icons/Trash";

const MIN_WIDTH = 210;
const MIN_HEIGHT = 110;

const NoteCard = ({ note, onDelete }) => {
  const { position: initialPosition, colors, body: initialBody, title } = note;
  const textAreaRef = useRef(null);

  const [position, setPosition] = useState(initialPosition);
  const [body, setBody] = useState(initialBody);
  const [size, setSize] = useState({
    width: note.width || MIN_WIDTH,
    height: note.height || MIN_HEIGHT,
  });
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
      await axios.delete(`http://localhost:5000/api/notes/${note._id}`);
      if (onDelete) onDelete(note._id);
    } catch (err) {
      alert("Error deleting note");
    }
  };

  // Drag handlers
  const handleMouseDown = (e) => {
    // Only drag if not resizing
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

  // Update body in backend on blur
  const handleBodyBlur = async () => {
    try {
      await axios.patch(`http://localhost:5000/api/notes/${note._id}`, {
        body,
      });
    } catch (err) {
      console.error("Error updating note body:", err);
    }
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
        borderRadius: 8,
        boxShadow: "0 4px 24px 0 rgba(60,60,120,0.13)",
        minWidth: MIN_WIDTH,
        minHeight: MIN_HEIGHT,
        overflow: "hidden",
        transition: "box-shadow 0.2s",
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Resize handles: corners */}
      <div
        data-resize
        onMouseDown={handleResizeMouseDown("nw")}
        style={handleStyle("nwse-resize", { left: -6, top: -6 })}
      />
      <div
        data-resize
        onMouseDown={handleResizeMouseDown("ne")}
        style={handleStyle("nesw-resize", { right: -6, top: -6 })}
      />
      <div
        data-resize
        onMouseDown={handleResizeMouseDown("sw")}
        style={handleStyle("nesw-resize", { left: -6, bottom: -6 })}
      />
      <div
        data-resize
        onMouseDown={handleResizeMouseDown("se")}
        style={handleStyle("nwse-resize", { right: -6, bottom: -6 })}
      />
      {/* Resize handles: sides */}
      <div
        data-resize
        onMouseDown={handleResizeMouseDown("n")}
        style={handleStyle("ns-resize", {
          left: "50%",
          top: -6,
          transform: "translateX(-50%)",
        })}
      />
      <div
        data-resize
        onMouseDown={handleResizeMouseDown("s")}
        style={handleStyle("ns-resize", {
          left: "50%",
          bottom: -6,
          transform: "translateX(-50%)",
        })}
      />
      <div
        data-resize
        onMouseDown={handleResizeMouseDown("w")}
        style={handleStyle("ew-resize", {
          left: -6,
          top: "50%",
          transform: "translateY(-50%)",
        })}
      />
      <div
        data-resize
        onMouseDown={handleResizeMouseDown("e")}
        style={handleStyle("ew-resize", {
          right: -6,
          top: "50%",
          transform: "translateY(-50%)",
        })}
      />

      <div
        className="card-header"
        style={{
          backgroundColor: colors.colorHeader,
          cursor: "grab",
          borderRadius: "8px 8px 0 0",
          padding: "8px 12px",
          color: colors.colorText,
          fontWeight: "bold",
          fontSize: "1.1em",
          display: "flex",
          alignItems: "center",
        }}
      >
        <span style={{ marginLeft: 8 }}>
          <Trash handleDelete={handleDelete} style={{ cursor: "pointer" }} />
          {title}
        </span>
      </div>

      <div
        className="card-body"
        style={{ height: "calc(100% - 40px)", padding: "8px 12px" }}
      >
        <textarea
          ref={textAreaRef}
          style={{
            color: colors.colorText,
            width: "100%",
            height: "100%",
            resize: "none",
            background: "transparent",
            border: "none",
            outline: "none",
            fontSize: "1em",
            wordBreak: "break-word",
            overflow: "hidden",
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
