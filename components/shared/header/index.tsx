import Image from "next/image";
import Link from "next/link";
import React from "react";
import Logo from "@/public/images/logo-ancore-cut.png";
import UserButton from "./user-button";
import AddWord from "../../add-word/add-word";
import { auth } from "@/auth";

const Header = async () => {
  const session = await auth();
  return (
    <header className="w-full border-b sticky top-0 left-0 bg-white z-10">
      <div className="flex justify-between items-center container mx-auto py-2">
        <div className="flex-start">
          <Link href={"./"} className="flex-start">
            <Image src={Logo} height={50} alt="ancore-logo" />
          </Link>
        </div>
        <div className="flex gap-2">
          <AddWord />
          <UserButton user={session?.user} />
        </div>
      </div>
    </header>
  );
};

export default Header;
