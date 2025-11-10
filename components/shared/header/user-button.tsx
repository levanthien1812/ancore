import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/actions/user.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { UserIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

const UserButton = async () => {
  const session = await auth();

  if (!session || !session.user) {
    return (
      <Button asChild>
        <Link href={"/sign-in"}>
          <UserIcon />
          Sign in
        </Link>
      </Button>
    );
  }

  const firstInitial = session.user.name?.charAt(0).toUpperCase() ?? "You";

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button asChild>
            <div className="flex items-center gap-1">
              <UserIcon />
              {firstInitial}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel>
            <div className="flex flex-col spacy-y-1">
              <div className="text-sm font-medium leading-none">
                {session.user.name}
              </div>
              <div className="text-sm leading-none text-muted-foreground">
                {session.user.email}
              </div>
            </div>
            <DropdownMenuItem>
              <form action={signOutUser} className="w-full">
                <Button type="submit" className="w-full">
                  Sign out
                </Button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuLabel>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserButton;
