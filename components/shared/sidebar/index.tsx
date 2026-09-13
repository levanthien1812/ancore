"use client";
import {
  BookAudio,
  CircleQuestionMark,
  House,
  Star,
  ArrowLeftToLine,
  ArrowRightToLine,
  LogOut,
  NotebookPen,
  Mic,
} from "lucide-react";
import Link from "next/link";
import React, { useMemo, useState, useEffect } from "react";
import { signOutUser } from "@/lib/actions/user.actions";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import IconDisplay from "../icon-display";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getWordsToReviewCount } from "@/lib/actions/word.actions";

type SidebarItemConfig = {
  title: string;
  icon: React.ReactNode;
  path: string;
  onDismiss?: () => void;
  onAccept?: () => void;
  popoverContent?: React.ReactNode;
};

const SidebarItem = React.memo(
  ({
    item,
    open,
    isActive,
    showPopover,
    popoverSide,
  }: {
    item: SidebarItemConfig;
    open: boolean;
    isActive: boolean;
    showPopover?: boolean;
    popoverSide: "top" | "right";
  }) => {
    const router = useRouter();

    const handleMouseEnter = () => {
      router.prefetch(item.path);
    };

    const linkContent = (
      <Link
        href={item.path}
        onMouseEnter={handleMouseEnter}
        className={cn(
          "flex flex-col md:flex-row justify-between items-center md:justify-center gap-0 md:gap-2 py-0.5 md:py-2 px-2 md:px-4 bg-white hover:bg-primary-2 hover:text-white transition-all ease-in duration-150 rounded-sm md:rounded-l-none md:rounded-r-md",
          isActive && "bg-primary-2 text-white",
        )}
      >
        <span className="">{item.icon}</span>
        {open && (
          <span className="md:w-[100px] text-center text-[10px] md:text-sm md:text-start">
            {item.title}
          </span>
        )}
      </Link>
    );

    if (!showPopover) {
      return <li className="flex-1 md:flex-none">{linkContent}</li>;
    }

    return (
      <li className="flex-1 md:flex-none">
        <Popover open={showPopover}>
          <PopoverTrigger asChild>{linkContent}</PopoverTrigger>
          <PopoverContent
            side={popoverSide}
            align="center"
            sideOffset={12}
            className="w-64 p-3 bg-blue-50 border-blue-200 shadow-lg rounded-md z-50"
          >
            <p className="text-sm font-semibold text-blue-800">
              {item.popoverContent}
            </p>
            <div className="mt-2 border-t border-blue-100 pt-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                onClick={item.onDismiss}
              >
                Dismiss
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
                onClick={item.onAccept}
              >
                Go to review
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </li>
    );
  },
);
SidebarItem.displayName = "SidebarItem";

const Sidebar = () => {
  const [open, setOpen] = React.useState(true);
  const [popoverSide, setPopoverSide] = useState<"top" | "right">("right");
  const pathname = usePathname();
  const router = useRouter();

  const [isReviewNotificationDismissed, setIsReviewNotificationDismissed] =
    useState(false);

  const { data: wordsToReview } = useQuery({
    queryKey: ["get-word-counts"],
    queryFn: () => getWordsToReviewCount(),
    initialData: { dueToday: 0, dueInPast: 0 },
  });

  useEffect(() => {
    const handleResize = () => {
      // Update side based on the 'md' breakpoint (768px)
      setPopoverSide(window.innerWidth < 768 ? "top" : "right");
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("reviewNotificationDismissed");
    if (dismissed === "true") {
      setIsReviewNotificationDismissed(true);
    }
  }, []);

  const handleDismissNotification = React.useCallback(() => {
    setIsReviewNotificationDismissed(true);
    sessionStorage.setItem("reviewNotificationDismissed", "true");
  }, []);

  const handleAcceptNotification = React.useCallback(() => {
    handleDismissNotification();
    router.push("/review");
  }, [router, handleDismissNotification]);

  const sidebarItems = useMemo<SidebarItemConfig[]>(() => {
    return [
      {
        title: "Home",
        icon: <House width={22} />,
        path: "/",
      },
      {
        title: "Word list",
        icon: <BookAudio width={22} />,
        path: "/words",
      },
      {
        title: "Review",
        icon: <Star width={22} />,
        path: "/review",
        onDismiss: handleDismissNotification,
        onAccept: handleAcceptNotification,
        popoverContent: "You have a review session",
      },
      {
        title: "Quizzes",
        icon: <CircleQuestionMark width={22} />,
        path: "/quizzes",
      },
      {
        title: "Notes",
        icon: <NotebookPen width={22} />,
        path: "/notes",
      },
      {
        title: "Talk",
        icon: <Mic width={22} />,
        path: "/talk",
      },
    ];
  }, [handleAcceptNotification, handleDismissNotification]);

  const totalWordsToReview =
    (wordsToReview?.dueToday ?? 0) + (wordsToReview?.dueInPast ?? 0);

  const isReviewPopoverVisible =
    pathname !== "/review" &&
    totalWordsToReview > 0 &&
    !isReviewNotificationDismissed;

  return (
    <div className="w-full md:w-fit bg-white h-auto md:h-full shadow-md p-1 md:p-1.5 md:ps-0 sm:p-2 md:pt-8 md:pb-2 flex flex-row md:flex-col gap-2 group justify-between md:justify-start border-t md:border-t-0 md:border-r">
      <div className="hidden md:flex justify-end px-2">
        <IconDisplay
          asButton
          icon={open ? ArrowLeftToLine : ArrowRightToLine}
          onClick={() => setOpen(!open)}
          iconColor="text-primary"
        />
      </div>
      <ul className="flex flex-row md:flex-col flex-1 md:flex-none w-full md:w-auto justify-around md:justify-start gap-1">
        {sidebarItems.map((item) => (
          <SidebarItem
            key={item.title}
            item={item}
            open={open}
            popoverSide={popoverSide}
            showPopover={item.path === "/review" ? isReviewPopoverVisible : false}
            isActive={
              item.path === "/"
                ? pathname === "/"
                : pathname.startsWith(item.path)
            }
          />
        ))}
      </ul>
      <div className="hidden sm:flex md:mt-auto justify-center items-center px-2 md:px-0">
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
