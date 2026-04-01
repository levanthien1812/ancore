import { SessionProvider } from "next-auth/react";
import React from "react";
import { LayoutProvider } from "@/components/layout/layout-context";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <LayoutProvider>{children}</LayoutProvider>
    </SessionProvider>
  );
};

export default Providers;
