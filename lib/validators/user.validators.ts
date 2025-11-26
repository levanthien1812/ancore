import z from "zod";

export const signInFormSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(100),
});

export const signUpFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .max(100),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters long")
      .max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const onboardingFormSchema = z.object({
  level: z.string().min(1, "Please select your level."),
  topics: z
    .string()
    .refine((topics) => topics.split(",").filter(Boolean).length <= 3, {
      message: "You can only enter up to 3 topics.",
    }),
  dailyGoal: z.number().min(5, "Goal must be at least 5 minutes."),
});
