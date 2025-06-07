export function handleDelete(noteData, onDelete) {
  onDelete(noteData.id);
}

export function handleChange(e, setNoteData) {
  const { name, value } = e.target;
  setNoteData((prev) => ({ ...prev, [name]: value }));
}
