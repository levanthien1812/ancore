import Header from "@/components/shared/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="my-auto">
      <main>{children}</main>
    </div>
  );
}
