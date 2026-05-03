import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import Providers from "./providers";
import { QueryProvider } from "@/lib/query-provider";

const font = DM_Sans({
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
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${font.className} antialiased tracking-tight`}>
        <Providers>
          <QueryProvider>{children}</QueryProvider>
        </Providers>
      </body>
    </html>
  );
}
