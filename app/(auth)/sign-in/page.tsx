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
import CredentialsSigninForm from "./credentials-signin-form";
import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

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
    return redirect(callbackUrl || "/");
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader>
          <Link href={"/"}>
            <Image src={Logo} height={50} alt="ancore-logo" />
          </Link>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <CredentialsSigninForm />
        </CardContent>
      </Card>
    </div>
  );
};

export default SignInPage;
