export const resizeHandleStyle = (cursor, style = {}) => ({
  position: "absolute",
  zIndex: 20,
  width: 12,
  height: 12,
  background: "rgba(90,108,255,0.12)",
  borderRadius: 4,
  border: "1px solid #bfc7e0",
  cursor,
  opacity: 0.1,
  ...style,
});
