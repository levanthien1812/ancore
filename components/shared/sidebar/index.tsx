"use client";
import {
  BookAudio,
  CircleQuestionMark,
  House,
  Star,
  ArrowLeftToLine,
  ArrowRightToLine,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo } from "react";
import { signOutUser } from "@/lib/actions/user.actions";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

type SidebarItem = {
  title: string;
  icon: React.ReactNode;
  path: string;
};

const SidebarItem = ({
  item,
  open,
  isActive,
}: {
  item: SidebarItem;
  open: boolean;
  isActive: boolean;
}) => {
  return (
    <li className="flex-1 md:flex-none">
      <Link
        href={item.path}
        className={cn(
          "flex items-center justify-center md:justify-start gap-2 py-2 px-4 bg-white hover:bg-primary-2 hover:text-white transition-all ease-in duration-150 rounded-lg md:rounded-none",
          isActive && "bg-primary-2 text-white",
        )}
      >
        {item.icon}
        {open && (
          <span className="hidden md:block w-[100px]">{item.title}</span>
        )}
      </Link>
    </li>
  );
};

const Sidebar = () => {
  const [open, setOpen] = React.useState(true);
  const pathname = usePathname();
  const sidebarItems = useMemo<SidebarItem[]>(() => {
    return [
      {
        title: "Home",
        icon: <House />,
        path: "/",
      },
      {
        title: "Word list",
        icon: <BookAudio />,
        path: "/words",
      },
      {
        title: "Review",
        icon: <Star />,
        path: "/review",
      },
      {
        title: "Quizzes",
        icon: <CircleQuestionMark />,
        path: "/quizzes",
      },
    ];
  }, []);

  return (
    <div className="w-full md:w-fit bg-white h-auto md:h-full shadow-md md:pt-8 p-2 md:pb-2 flex flex-row md:flex-col gap-2 group justify-between md:justify-start border-t md:border-t-0 md:border-r">
      <div className="hidden md:flex justify-end px-2">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "w-fit p-2 rounded-md bg-gray-200 flex justify-center items-center hover:bg-gray-300 text-gray-500 transition-opacity duration-300",
            !open && "opacity-0 group-hover:opacity-100",
          )}
        >
          {open ? (
            <ArrowLeftToLine height={16} width={16} />
          ) : (
            <ArrowRightToLine height={16} width={16} />
          )}
        </button>
      </div>
      <ul className="flex flex-row md:flex-col flex-1 md:flex-none w-full md:w-auto justify-around md:justify-start gap-1">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.title}
            item={item}
            open={open}
            isActive={
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path)
            }
          />
        ))}
      </ul>
      <div className="flex md:mt-auto justify-center items-center px-2 md:px-0">
        <form action={signOutUser}>
          <button
            type="submit"
            className="text-gray-500 text-sm hover:underline flex items-center gap-1 cursor-pointer group"
          >
            <LogOut
              width={16}
              height={16}
              className="group-hover:stroke-primary stroke-gray-500"
            />{" "}
            {open && <span className="hidden md:block">Sign out</span>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Sidebar;
