import { auth } from "@/auth";
import Header from "@/components/shared/header";
import Sidebar from "@/components/shared/sidebar";
import { redirect } from "next/navigation";
import { Toaster } from "sonner";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()
  if (!session?.user?.id) {
    redirect("/sign-in");
  }

  return (
    <div className="flex h-screen flex-col">
      <Header />
      <div className="flex w-full grow overflow-hidden flex-col-reverse md:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
