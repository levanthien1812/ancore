import { auth } from "@/auth";
import { prisma } from "@/db/prisma";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OnboardingForm } from "./onboarding-form";
import { revalidatePath } from "next/cache";

export const OnboardingDialog = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true },
  });

  // If user has already been onboarded, don't render the dialog
  if (user?.onboarded) {
    return null;
  }

  const handleSuccess = async () => {
    "use server";
    revalidatePath("/");
  };

  return (
    <Dialog open={true}>
      <DialogContent showCloseButton={false} className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome to Ancore!</DialogTitle>
          <DialogDescription>
            Let&apos;s personalize your learning experience. Tell us a bit about
            yourself.
          </DialogDescription>
        </DialogHeader>
        <OnboardingForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
};
