import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import MuiProviders from "./providers/MuiProviders";
import { mollieGlaston, lato } from "./fonts/fonts";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Solace Candidate Assignment",
  description: "Show us what you got",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${lato.className} ${mollieGlaston.variable}`}>
        <MuiProviders>{children}</MuiProviders>
      </body>
    </html>
  );
}
