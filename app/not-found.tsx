import Image from "next/image";
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import NotFound from "@/public/images/not-found.png";
import { Compass, House } from "lucide-react";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col space-y-4 justify-center items-center h-screen w-full p-4">
      <Image src={NotFound} height={360} alt="not-found" />
      <p className="font-bold text-3xl text-center">Oops! Page not found</p>
      <p className="text-base text-muted-foreground text-center">
        The page you&apos;re looking for doesn&apos;t exist or has been removed.
      </p>
      <div className="mx-auto mt-4 flex flex-col sm:flex-row gap-2 w-full md:w-fit">
        <Button className="w-full md:w-40">
          <House width={16} />
          <Link href={"/"}>Back to home</Link>
        </Button>
        <Button className="w-full md:w-40" variant="outline">
          <Compass width={16} />
          <Link href={"/words"}>Explores words</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
