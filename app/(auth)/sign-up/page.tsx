import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/images/logo-ancore-cut.png";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CredentialsSignupForm from "./credentials-signup-form";

export const metadata: Metadata = {
  title: "Sign In",
};

const SignInPage = async (props: {
  searchParams: Promise<{
    callbackUrl: string;
  }>;
}) => {
  const { callbackUrl } = await props.searchParams;

  const session = await auth();

  if (session && session.user) {
    return redirect(callbackUrl || "sign-in");
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="flex flex-col items-center">
          <Link href={"/"}>
            <Image src={Logo} height={50} alt="ancore-logo" />
          </Link>
          <CardTitle className="text-3xl">Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredentialsSignupForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
