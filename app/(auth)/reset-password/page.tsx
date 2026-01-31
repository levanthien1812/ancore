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
import ResetPasswordForm from "./reset-password-form";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password",
};

const ResetPasswordPage = async (props: {
  searchParams: Promise<{
    token: string;
  }>;
}) => {
  const { token } = await props.searchParams;

  if (!token) {
    return (
      <div className="w-full max-w-md mx-auto">
        <Card>
          <CardHeader className="flex flex-col items-center">
            <Link href={"/"}>
              <Image src={Logo} height={50} alt="ancore-logo" />
            </Link>
            <CardTitle className="text-3xl">Invalid Reset Link</CardTitle>
            <CardDescription>
              The reset link is invalid or has expired
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <Link href={"/forgot-password"} className="link">
                Request a new password reset
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="flex flex-col items-center">
          <Link href={"/"}>
            <Image src={Logo} height={50} alt="ancore-logo" />
          </Link>
          <CardTitle className="text-3xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
