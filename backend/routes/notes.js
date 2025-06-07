router.post("/", async (req, res) => {
  try {
    const note = new Note({
      title: req.body.title, // <-- Add this
      body: req.body.body,
      colors: req.body.colors,
      position: req.body.position,
      width: req.body.width,
      height: req.body.height,
    });
    await note.save();
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch("/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Note not found" });

    if (req.body.title !== undefined) note.title = req.body.title; // <-- Add this
    if (req.body.body !== undefined) note.body = req.body.body;
    if (req.body.colors !== undefined) note.colors = req.body.colors;
    if (req.body.position !== undefined) note.position = req.body.position;
    if (req.body.width !== undefined) note.width = req.body.width;
    if (req.body.height !== undefined) note.height = req.body.height;

    await note.save();
    res.json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});