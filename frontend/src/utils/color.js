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
