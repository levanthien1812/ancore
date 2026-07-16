"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/user.actions";
import Link from "next/link";
import React, { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { INITIAL_ACTION_STATE } from "@/lib/constants/initial-values";
import AlertMessage from "@/components/shared/alert-message";

const ResetPasswordForm = ({ token }: { token: string }) => {
  const [data, action] = useActionState(resetPassword, INITIAL_ACTION_STATE);

  const ResetPasswordButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button type="submit" className="w-full" isLoading={pending}>
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
        <AlertMessage data={data} />
        <div>
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            className="mt-1"
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
            className="mt-1"
          />
        </div>
        <div>
          <ResetPasswordButton />
        </div>
        <div className="">
          <p className="text-center text-sm">
            Remember your password?{" "}
            <Link
              href={"/sign-in"}
              target="_self"
              className="link text-primary hover:underline hover:text-primary-2"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
