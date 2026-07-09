"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signInWithCredentials } from "@/lib/actions/user.actions";
import { ArrowRight, Info } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { startTransition, useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { INITIAL_ACTION_STATE } from "@/lib/constants/initial-values";
import { toast } from "sonner";

const CredentialsSigninForm = () => {
  const [data, action] = useActionState(
    signInWithCredentials,
    INITIAL_ACTION_STATE,
  );

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const success = searchParams.get("success");

  useEffect(() => {
    if (success === "signup") {
      toast.success("Sign up successful");
    }
  }, [success]);

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
      {success === "signup" && (
        <div className="flex items-center justify-center gap-1 bg-green-50 border border-green-300 rounded-md p-2">
          <Info width={16} height={16} className="text-green-500" />
          <p className="text-green-500 text-sm">
            Sign up successful! Please sign in to continue.
          </p>
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
