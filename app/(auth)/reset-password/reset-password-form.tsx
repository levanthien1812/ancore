"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/user.actions";
import Link from "next/link";
import React, { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";

const ResetPasswordForm = ({ token }: { token: string }) => {
  const [data, action] = useActionState(resetPassword, {
    success: false,
    message: "",
  });

  const ResetPasswordButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} type="submit" className="w-full">
        {pending ? "Resetting..." : "Reset Password"}
      </Button>
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    formData.append("token", token);

    startTransition(() => {
      action(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="container space-y-6">
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
          />
        </div>
        <div>
          <ResetPasswordButton />
        </div>
        {data.message && (
          <div
            className={`text-center ${data.success ? "text-green-600" : "text-destructive"}`}
          >
            {data.message}
          </div>
        )}
        <div className="">
          <p className="text-center text-sm">
            Remember your password?{" "}
            <Link href={"/sign-in"} target="_self" className="link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
