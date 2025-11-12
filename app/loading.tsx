import React from "react";
import Image from "next/image";
import Logo from "@/public/images/logo-ancore-cut.png";

const LoadingPage = () => {
  return (
    <div className="flex flex-col space-y-4 justify-center items-center h-screen">
      <Image src={Logo} height={32} alt="ancore-logo" />
      <p className="font-bold text-xl">Loading...</p>
    </div>
  );
};

export default LoadingPage;
