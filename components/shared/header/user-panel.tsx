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
import { Settings2, UserIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { User } from "next-auth";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import Settings from "../../settings/settings";
import { useState, useTransition } from "react";

const UserPanel = ({ user }: { user?: User }) => {
  const { data: session } = useSession();
  const currentUser = user || session?.user;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

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
        <DropdownMenuTrigger asChild>
          <Button>
            <div className="flex items-center gap-1">
              <UserIcon width={18} />
              <span className="hidden sm:block">{firstName}</span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-56 p-2 space-y-1 bg-white shadow rounded-md"
          align="end"
        >
          <DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <div className="flex flex-col spacy-y-1">
                  <div className="text-xl font-medium leading-none">
                    {currentUser.name}
                  </div>
                  <div className="text-sm leading-none text-muted-foreground mt-1">
                    {currentUser.email}
                  </div>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuLabel>
          <Separator />
          <DropdownMenuItem>
            <Button
              variant={"secondary"}
              className="w-full"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings2 />
              Settings
            </Button>
          </DropdownMenuItem>

          <Separator />
          <DropdownMenuItem
            className="mt-2"
            onSelect={(e) => {
              e.preventDefault();
            }}
          >
            <form
              action={() => {
                startTransition(async () => {
                  await signOutUser();
                });
              }}
              className="w-full"
            >
              <Button type="submit" className="w-full" isLoading={isPending}>
                Sign out
              </Button>
            </form>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {isSettingsOpen && (
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogContent className="md:min-w-[800px]">
            <DialogTitle>Settings</DialogTitle>
            <Settings />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default UserPanel;
