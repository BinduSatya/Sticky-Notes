import { useRef, useEffect, useState } from "react";
import { DEFAULT_COLORS, getComplementaryColor } from "../../utils/color";
import { resizeHandleStyle } from "./NoteCard.styles";
import { autoGrow } from "./NoteCard.utils";

const MIN_WIDTH = 210;
const MIN_HEIGHT = 110;

const SpecialNoteCard = () => {
  const textAreaRef = useRef(null);

  // Use a fixed color for the special note, e.g., the first color in DEFAULT_COLORS
  const specialColor = DEFAULT_COLORS[0];
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [body, setBody] = useState("click shift to drag, ctrl to resize");
  const [title, setTitle] = useState("Special Note");
  const [size, setSize] = useState({
    width: MIN_WIDTH,
    height: MIN_HEIGHT,
  });
  const [colors, setColors] = useState({
    colorHeader: specialColor,
    colorBody: getComplementaryColor(specialColor),
  });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    autoGrow(textAreaRef);
  }, []);

  // No delete handler!

  return (
    <div
      className="card"
      style={{
        backgroundColor: hovered ? `${colors.colorBody}CC` : colors.colorBody,
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: hovered ? size.width * 1.02 : size.width,
        height: hovered ? size.height * 1.02 : size.height,
        position: "absolute",
        cursor: "default",
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
          {/* No Trash icon here */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            readOnly
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
          readOnly
        />
      </div>
      {/* Optionally, add resize handles here if you want */}
    </div>
  );
};

export default SpecialNoteCard;
