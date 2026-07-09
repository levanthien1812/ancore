"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/actions/user.actions";
import Link from "next/link";
import React, { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { INITIAL_ACTION_STATE } from "@/lib/constants/initial-values";
import { Info } from "lucide-react";

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
        {data.success && data.message && data.message.length > 0 && (
          <div className="flex items-center justify-center gap-1 bg-green-50 border border-green-300 rounded-md p-2">
            <Info width={16} height={16} className="text-green-500" />
            <p className="text-green-500 text-sm">{data.message}</p>
          </div>
        )}
        {data.success === false && data.message && data.message.length > 0 && (
          <div className="flex items-center justify-center gap-1 bg-red-50 border border-red-300 rounded-md p-2">
            <Info width={16} height={16} className="text-red-500" />
            <p className="text-red-500 text-sm">{data.message}</p>
          </div>
        )}
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
