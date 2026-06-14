import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import "react-circular-progressbar/dist/styles.css";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import Providers from "./providers";
import { QueryProvider } from "@/lib/query-provider";
import SelectionAddWord from "@/components/shared/selection-add-word";
import { auth } from "@/auth";
import NotificationListener from "@/lib/notification-listener";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${font.className} antialiased tracking-tight`}>
        <QueryProvider>
          <Providers>
            {/* SelectionAddWord must be inside Providers to access Session and Query contexts */}
            {session?.user && (
              <>
                <SelectionAddWord />
                <NotificationListener />
              </>
            )}
            {children}
          </Providers>
        </QueryProvider>
      </body>
    </html>
  );
}
