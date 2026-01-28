"use client";

import { addNote } from "@/lib/actions/note.actions";
import { initialActionState } from "@/lib/constants/initial-values";
import { useActionState, useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { QUERY_KEY } from "@/lib/constants/queryKey";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import FieldError from "../shared/field-error";
import type { Note } from "@prisma/client";
import TagList from "../shared/tag-list";
import { NOTE_TAGS } from "@/lib/constants/enums";
import RichTextEditor from "../shared/rich-text-editor";

interface AddNoteFormProps {
  note?: Note;
  onClose: () => void;
}

const AddNoteForm = ({ note, onClose }: AddNoteFormProps) => {
  const queryClient = useQueryClient();
  // Assuming `addNote` can also handle updates if an `id` is provided, similar to `saveWord`.
  const [state, formAction, isPending] = useActionState(
    addNote,
    initialActionState,
  );

  const { register, handleSubmit, setValue, getValues, watch } = useForm<Note>({
    defaultValues: note || {
      title: "",
      content: "",
      tags: "",
    },
  });

  const watchedContent = watch("content");

  const onSubmit = (data: Note) => {
    const formData = new FormData();

    if (note?.id) {
      formData.append("id", note.id);
    }

    formData.append("title", data.title || "");
    formData.append("content", data.content);
    formData.append("tags", data.tags || "");

    startTransition(() => {
      formAction(formData);
    });
  };

  useEffect(() => {
    if (state?.success) {
      // You might need to add GET_NOTES to your QUERY_KEY constants
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY.GET_NOTES] });
      onClose();
    }
  }, [state, onClose, queryClient]);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Hidden input for the note ID if editing */}
      {note?.id && <input type="hidden" {...register("id")} value={note.id} />}
      <div className="grid gap-4 py-4 max-h-[70vh] md:max-h-[600px] custom-scrollbar-y overflow-y-auto">
        <div className="grid gap-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            placeholder="e.g. Phrases for agreeing"
            {...register("title")}
          />
          <FieldError error={state?.errors?.title?.join(", ")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="content">Content</Label>
          <RichTextEditor
            value={watchedContent || ""}
            onChange={(value) => setValue("content", value)}
            placeholder="Write your notes here..."
          />
          <FieldError error={state?.errors?.content?.join(", ")} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="tags">Tags</Label>
          <Input
            id="tags"
            placeholder="pronunciation, grammar, expressions"
            {...register("tags")}
          />
          {(() => {
            const watched = (watch("tags") || "").toString();
            const selected = watched
              .split(",")
              .map((p: string) => p.trim())
              .filter(Boolean);

            return (
              <TagList
                items={NOTE_TAGS}
                selected={selected}
                onTagClick={(tag) => {
                  const current = getValues("tags") || "";
                  const parts = current
                    .split(",")
                    .map((p: string) => p.trim())
                    .filter(Boolean);
                  if (!parts.includes(tag)) {
                    parts.push(tag);
                    setValue("tags", parts.join(", "));
                  }
                }}
              />
            );
          })()}
          <p className="text-sm text-muted-foreground">
            Separate tags with a comma.
          </p>
          <FieldError error={state?.errors?.tags?.join(", ")} />
        </div>
      </div>
      {state && !state.success && !state.errors && (
        <FieldError error={state.message} />
      )}
      <div className="flex gap-2 justify-end mt-4">
        <Button variant={"outline"} type="button" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
};

export default AddNoteForm;
