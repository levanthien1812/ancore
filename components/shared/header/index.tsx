import Image from "next/image";
import Link from "next/link";
import React from "react";
import Logo from "@/public/images/logo-ancore-cut.png";
import UserButton from "./user-button";
import AddWord from "../../add-word/add-word";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="flex justify-between items-center container mx-auto py-2">
        <div className="flex-start">
          <Link href={"./"} className="flex-start">
            <Image src={Logo} height={50} alt="ancore-logo" />
          </Link>
        </div>
        <div className="flex gap-2">
          <AddWord />
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
