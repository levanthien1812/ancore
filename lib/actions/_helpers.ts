import { auth } from "@/auth";

export async function authenticationAction<T>(
  fn: (userId: string) => Promise<T>,
  fallback?: T
): Promise<T | null> {
  const session = await auth();

  if (!session?.user?.id) {
    if (fallback !== undefined) {
      return fallback;
    }
    throw new Error("UNAUTHORIZED");
  }

  return fn(session.user.id);
}
