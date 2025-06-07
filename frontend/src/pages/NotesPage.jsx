import { useEffect, useState } from "react";
import axios from "axios";
import NoteCard from "../components/NoteCard.jsx";

const NotesPage = () => {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/notes")
      .then((res) => {
        setNotes(res.data);
        console.log(res.data);
      })
      .catch((err) => {
        console.error("Error fetching notes:", err);
      });
  }, []);

  return (
    <div>
      {notes.map((note) => (
        <NoteCard
          key={note._id}
          note={{
            position: JSON.stringify(note.position),
            colors: JSON.stringify(note.colors),
            body: JSON.stringify(note.body),
          }}
        />
      ))}
    </div>
  );
};

export default NotesPage;
