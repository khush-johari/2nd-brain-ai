import { createContext, useContext, useReducer } from "react";

// 1. Define Initial State (Dummy Data for testing)
const initialState = {
  notes: [
    { id: 1, title: "React Ideas", content: "Learn useContext..." },
    { id: 2, title: "Project Plan", content: "Build a Second Brain..." },
  ],
  selectedNoteId: 1, // Which note is currently open?
};

// 2. Define the "Reducer" (The logic for changing state)
const notesReducer = (state, action) => {
  switch (action.type) {
    case "SELECT_NOTE":
      return { ...state, selectedNoteId: action.payload };
    case "ADD_NOTE":
      return { ...state, notes: [...state.notes, action.payload] };
    // We will add DELETE and UPDATE later
    default:
      return state;
  }
};

// 3. Create Context
const NoteContext = createContext();

// 4. Create Provider Component
export const NoteProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  return (
    <NoteContext.Provider value={{ state, dispatch }}>
      {children}
    </NoteContext.Provider>
  );
};

// 5. Custom Hook for easy access
export const useNotes = () => useContext(NoteContext);
