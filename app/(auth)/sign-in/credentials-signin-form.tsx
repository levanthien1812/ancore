"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { startTransition, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { INITIAL_ACTION_STATE } from "@/lib/constants/initial-values";

const CredentialsSigninForm = () => {
  const [data, action] = useActionState(
    signInWithCredentials,
    INITIAL_ACTION_STATE,
  );

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");

  const SignInButton = () => {
    const { pending } = useFormStatus();

    return (
      <Button type="submit" className="w-full" isLoading={pending}>
        {pending ? "Signing in..." : "Sign in"}
        <ArrowRight width={20} height={16} />
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="password"
            className="mt-1"
          />
        </div>
        <div className="">
          <p className="text-end text-sm">
            <Link
              href={"/forgot-password"}
              target="_self"
              className="text-primary hover:underline hover:text-primary-2"
            >
              Forgot your password?
            </Link>
          </p>
        </div>
        <div>
          <SignInButton />
        </div>
        {!data.success && (
          <div className="text-center text-destructive">{data.message}</div>
        )}
        <div className="">
          <p className="text-center text-sm">
            Don&apos;t have an account yet?{" "}
            <Link
              href={"/sign-up"}
              target="_self"
              className="text-primary hover:underline hover:text-primary-2"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
};

export default CredentialsSigninForm;
