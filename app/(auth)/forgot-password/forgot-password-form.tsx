"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgotPassword } from "@/lib/actions/user.actions";
import Link from "next/link";
import React, { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { INITIAL_ACTION_STATE } from "@/lib/constants/initial-values";

const ForgotPasswordForm = () => {
  const [data, action] = useActionState(forgotPassword, INITIAL_ACTION_STATE);

  const ForgotPasswordButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button type="submit" className="w-full" isLoading={pending}>
        {pending ? "Sending..." : "Send Reset Email"}
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

  return (
    <form onSubmit={handleSubmit}>
      <div className="container space-y-6">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1"
          />
        </div>
        <div>
          <ForgotPasswordButton />
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

export default ForgotPasswordForm;
