"use server";

import { prisma } from "@/db/prisma";
import { saveNoteSchema } from "../validators";
import { revalidatePath } from "next/cache";
import { authenticationAction } from "./_helpers";
import type { Note } from "@prisma/client";

export const addNote = async (prevState: unknown, formData: FormData) =>
  authenticationAction(async (userId) => {
    const noteId = formData.get("id") as string | null;

    const validatedFields = saveNoteSchema.safeParse({
      title: formData.get("title"),
      content: formData.get("content"),
      tags: formData.get("tags"),
    });

    if (!validatedFields.success) {
      return {
        success: false,
        message: "Validation failed.",
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }

    const noteData = validatedFields.data;

    try {
      if (noteId) {
        // Update existing note
        const existingNote = await prisma.note.findFirst({
          where: { id: noteId, userId },
        });

        if (!existingNote) {
          return {
            success: false,
            message: "Note not found or permission denied.",
          };
        }

        await prisma.note.update({
          where: { id: noteId },
          data: { ...noteData },
        });
      } else {
        // Create new note
        await prisma.note.create({
          data: {
            ...noteData,
            userId,
          },
        });
      }

      revalidatePath("/notes");

      return { success: true, message: "Note saved successfully." };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Database error: Failed to save note.",
      };
    }
  });

export const getNotes = async () =>
  authenticationAction(async (userId) => {
    try {
      const notes = await prisma.note.findMany({
        where: { userId },
        orderBy: [{ highlighted: "desc" }, { createdAt: "desc" }],
      });

      return { success: true, data: notes };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Database error: Failed to fetch notes.",
      };
    }
  });

export const deleteNote = async (noteId: string) =>
  authenticationAction(async (userId) => {
    try {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId },
      });

      if (!note) {
        return {
          success: false,
          message: "Note not found or permission denied.",
        };
      }

      await prisma.note.delete({
        where: { id: noteId },
      });

      revalidatePath("/notes");

      return { success: true, message: "Note deleted successfully." };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Database error: Failed to delete note.",
      };
    }
  });

export const toggleHighlightNote = async (noteId: string) =>
  authenticationAction(async (userId) => {
    try {
      const note = await prisma.note.findFirst({
        where: { id: noteId, userId },
      });

      if (!note) {
        return {
          success: false,
          message: "Note not found or permission denied.",
        };
      }

      await prisma.note.update({
        where: { id: noteId },
        data: { highlighted: !note.highlighted },
      });

      revalidatePath("/notes");

      return { success: true, message: "Note highlight toggled successfully." };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Database error: Failed to toggle highlight.",
      };
    }
  });
