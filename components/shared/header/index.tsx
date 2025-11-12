import Image from "next/image";
import Link from "next/link";
import React from "react";
import Logo from "@/public/images/logo-ancore-cut.png";
import UserButton from "./user-button";
import AddWord from "../../word/add-word";

const Header = () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex justify-between items-center">
        <div className="flex-start">
          <Link href={"./"} className="flex-start">
            <Image src={Logo} height={50} alt="ancore-logo" />
          </Link>
        </div>
        <AddWord />
        <UserButton />
      </div>
    </header>
  );
};

export default Header;
