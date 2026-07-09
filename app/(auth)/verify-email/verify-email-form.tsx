"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  verifyEmail,
  resendVerificationEmail,
} from "@/lib/actions/user.actions";
import { INITIAL_ACTION_STATE } from "@/lib/constants/initial-values";
import { Info } from "lucide-react";
import Link from "next/link";
import { useActionState, startTransition, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import WordDetail from "@/components/word-card/word-detail";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";

const VerifyEmailForm = ({ email }: { email: string }) => {
  const [data, action] = useActionState(verifyEmail, INITIAL_ACTION_STATE);
  const [isResending, setIsResending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleResend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isResending) return;
    setIsResending(true);

    const formData = new FormData(event.currentTarget);

    try {
      const res = await resendVerificationEmail(formData);
      if (res.success) {
        toast.success(res.message);
        event.currentTarget.reset();
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Failed to resend verification email");
    } finally {
      setIsResending(false);
      setOpen(false);
    }
  };

  const VerifyButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button type="submit" className="w-full" isLoading={pending}>
        {pending ? "Verifying..." : "Verify email"}
      </Button>
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    startTransition(() => {
      action(formData);
    });
  };

  if (data.success) {
    setTimeout(() => {
      window.location.href = "/sign-in";
    }, 1000);
  }

  return (
    <form onSubmit={handleSubmit}>
      {data.success && data.message && data.message.length > 0 && (
        <div className="flex items-center justify-center gap-1 bg-green-50 border border-green-300 rounded-md p-2">
          <Info width={16} height={16} className="text-green-500" />
          <p className="text-green-500 text-sm">{data.message}</p>
        </div>
      )}
      {!data.success && data.message && data.message.length > 0 && (
        <div className="flex items-center justify-center gap-1 bg-red-50 border border-red-300 rounded-md p-2">
          <Info width={16} height={16} className="text-destructive" />
          <p className="text-destructive text-sm">{data.message}</p>
        </div>
      )}
      <div className="container space-y-6 mt-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1"
            defaultValue={email}
          />
        </div>
        <div>
          <Label htmlFor="token">Verification token</Label>
          <Input
            id="token"
            name="token"
            type="token"
            required
            autoComplete="token"
            className="mt-1"
          />
        </div>
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="link"
                type="button"
                className="text-primary hover:underline hover:text-primary-2"
              >
                Resend verification email
              </Button>
            </DialogTrigger>
            <DialogContent className="p-4 rounded-2xl">
              <form onSubmit={handleResend} className="space-y-4">
                <DialogTitle className="text-2xl font-bold">
                  Resend verification email
                </DialogTitle>
                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="mt-1"
                    defaultValue={email}
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isResending}>
                    {isResending ? "Resending..." : "Resend verification email"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <VerifyButton />
        </div>
        <div className="">
          <p className="text-center text-sm">
            Already verified your email?{" "}
            <Link
              href={"/sign-in"}
              target="_self"
              className="text-primary hover:underline hover:text-primary-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
};

export default VerifyEmailForm;
