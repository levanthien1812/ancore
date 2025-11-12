import Image from "next/image";
import React from "react";
import Logo from "@/public/images/logo-ancore-cut.png";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col space-y-4 justify-center items-center h-screen">
      <Image src={Logo} height={32} alt="ancore-logo" />
      <p className="font-bold text-3xl text-gray-600">Page not found</p>
      <Button>
        <Link href={"/"}>Back to home</Link>
      </Button>
    </div>
  );
};

export default NotFoundPage;
