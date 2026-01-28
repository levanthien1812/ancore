"use client";

import { useQuery } from "@tanstack/react-query";
import { getNotes } from "@/lib/actions/note.actions";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import NoteCard from "./note-card";

const NotesList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEY.GET_NOTES],
    queryFn: getNotes,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-3/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data?.success) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          Failed to load notes. Please try again.
        </p>
      </div>
    );
  }

  const notes = data?.data || [];

  if (notes.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          No notes yet. Create your first note!
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </div>
  );
};

export default NotesList;
