import { useNotes } from "../context/NoteContext";

const Sidebar = () => {
  const { state, dispatch } = useNotes();

  return (
    <div className="w-64 h-screen bg-gray-50 border-r border-gray-200 p-4 flex flex-col">
      <h1 className="text-xl font-bold text-gray-800 mb-6">Second Brain 🧠</h1>

      {/* Add Note Button */}
      <button
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg mb-4 hover:bg-indigo-700 transition"
        onClick={() =>
          dispatch({
            type: "ADD_NOTE",
            payload: { id: Date.now(), title: "New Note", content: "" },
          })
        }
      >
        + New Note
      </button>

      {/* Note List */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {state.notes.map((note) => (
          <div
            key={note.id}
            onClick={() => dispatch({ type: "SELECT_NOTE", payload: note.id })}
            className={`p-3 rounded-md cursor-pointer transition ${
              state.selectedNoteId === note.id
                ? "bg-indigo-100 text-indigo-700"
                : "hover:bg-gray-200"
            }`}
          >
            <h3 className="font-medium truncate">{note.title}</h3>
            <p className="text-xs text-gray-500 truncate">{note.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
