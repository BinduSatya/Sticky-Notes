export function autoGrow(textAreaRef) {
  const { current } = textAreaRef;
  if (!current) return;
  current.style.height = "auto";
  current.style.height = current.scrollHeight + "px";
}