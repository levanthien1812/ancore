import Image from "next/image";
import Link from "next/link";
import React from "react";
import Logo from "@/public/images/logo-ancore-cut.png";
import UserButton from "./user-button";
import AddOrEditWord from "../../add-word/add-word";
import { auth } from "@/auth";
import NotificationButton from "./notification-button";

const Header = async () => {
  const session = await auth();
  return (
    <header className="w-full border-b sticky top-0 left-0 bg-white z-10">
      <div className="flex justify-between items-center container mx-auto py-1.5 sm:py-2 px-4">
        <div className="flex-start">
          <Link
            href={"./"}
            className="flex-start h-10 sm:h-12 md:h-14 flex items-center"
          >
            <Image
              src={Logo}
              height={50}
              alt="ancore-logo"
              className="h-full w-auto"
            />
          </Link>
        </div>
        <div className="flex gap-1 sm:gap-2 items-center">
          <NotificationButton />
          <AddOrEditWord />
          <UserButton user={session?.user} />
        </div>
      </div>
    </header>
  );
};

export default Header;
