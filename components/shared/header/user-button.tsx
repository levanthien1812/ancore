"use client";
import { Button } from "@/components/ui/button";
import { signOutUser } from "@/lib/actions/user.actions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";

const UserButton = ({ user }: { user?: User }) => {
  const { data: session } = useSession();
  const currentUser = user || session?.user;

  if (!currentUser) {
    return (
      <Button asChild>
        <Link href={"/sign-in"}>
          <UserIcon />
          Sign in
        </Link>
      </Button>
    );
  }

  const firstName = currentUser.name?.split(" ")[0] || "You";

  return (
    <div className="flex gap-2 items-center">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button asChild>
            <div className="flex items-center gap-1">
              <UserIcon />
              {firstName}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 p-2 bg-white shadow rounded-md"
          align="end"
        >
          <DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <div className="flex flex-col spacy-y-1">
                  <div className="text-sm font-medium leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-sm leading-none text-muted-foreground mt-1">
                    {currentUser.email}
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuItem
              className="mt-2"
              onSelect={(e) => {
                e.preventDefault();
              }}
            >
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
