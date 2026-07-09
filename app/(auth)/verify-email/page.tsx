import Link from "next/link";
import Image from "next/image";
import Logo from "@/public/images/logo-ancore-cut.png";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import VerifyEmailForm from "./verify-email-form";

const page = async ({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) => {
  const { email } = await searchParams;

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="p-8">
        <CardHeader className="flex flex-col items-center">
          <Link href={"/"}>
            <Image src={Logo} height={50} alt="ancore-logo" />
          </Link>
          <CardTitle className="text-3xl">Verify your email</CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent an email to <strong>{email}</strong>. Please verify
            your email address to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <VerifyEmailForm email={email || ""} />
        </CardContent>
      </Card>
    </div>
  );
};

export default page;
