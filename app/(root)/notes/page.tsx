import AddNote from "@/components/add-note/add-note";
import NotesList from "@/components/notes/notes-list";
import React from "react";

const NotesPage = () => {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-4">Notes</h1>
        <AddNote />
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Notes</h2>
        <NotesList />
      </div>
    </div>
  );
};

export default NotesPage;
