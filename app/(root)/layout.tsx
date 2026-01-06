import Header from "@/components/shared/header";
import Sidebar from "@/components/shared/sidebar";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex w-full grow overflow-hidden">
        <Sidebar />
        <main className="pt-4 grow overflow-y-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
