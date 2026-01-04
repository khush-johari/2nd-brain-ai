import { useNotes } from "../context/NoteContext";

const Editor = () => {
  const { state } = useNotes();
  // Find the currently active note
  const activeNote = state.notes.find((n) => n.id === state.selectedNoteId);

  if (!activeNote) return <div className="p-10">Select a note...</div>;

  return (
    <div className="flex-1 h-screen p-8 bg-white">
      <h1 className="text-3xl font-bold mb-4">{activeNote.title}</h1>
      <textarea
        className="w-full h-[80vh] p-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-700 text-lg"
        value={activeNote.content}
        readOnly // We will make this editable in Day 3
      />
    </div>
  );
};

export default Editor;
