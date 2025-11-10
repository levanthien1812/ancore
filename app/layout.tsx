import type { Metadata } from "next";
import { Karma } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";

const karmaSans = Karma({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME}`,
    template: `%s | ${APP_NAME}`,
  },
  description: `${APP_DESCRIPTION}`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${karmaSans.className} antialiased`}>{children}</body>
    </html>
  );
}
