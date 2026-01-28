import z from "zod";

export const saveNoteSchema = z.object({
  title: z.string().trim().optional().or(z.literal("")),
  content: z.string().trim().min(1, "Content is required."),
  tags: z.string().trim().optional().or(z.literal("")),
});

export type SaveNoteFormData = z.infer<typeof saveNoteSchema>;
