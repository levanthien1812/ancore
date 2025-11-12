"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUpWithCredentials } from "@/lib/actions/user.actions";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";

const CredentialsSignupForm = () => {
  const [data, action] = useActionState(signUpWithCredentials, {
    success: false,
    message: "",
  });

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const SignupButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button disabled={pending} type="submit" className="w-full">
        {pending ? "Signing up..." : "Sign up"}
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
      <input type="hidden" name="callbackUrl" value={callbackUrl || "/"} />
      <div className="container space-y-6">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
          />
        </div>
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="password"
          />
        </div>
        <div>
          <Label htmlFor="confirm-password">Confirm Password</Label>
          <Input
            id="confirm-password"
            name="confirm-password"
            type="password"
            required
            autoComplete="confirm-password"
          />
        </div>
        <div>
          <SignupButton />
        </div>
        {!data.success && (
          <div className="text-center text-destructive">{data.message}</div>
        )}
        <div className="">
          <p className="text-center text-sm">
            Already have an account?{" "}
            <Link href={"/sign-in"} target="_self" className="link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSignupForm;
