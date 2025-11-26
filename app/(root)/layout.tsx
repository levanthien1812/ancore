import Header from "@/components/shared/header";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="pt-4 grow">{children}</main>
      <Toaster />
    </div>
  );
}
