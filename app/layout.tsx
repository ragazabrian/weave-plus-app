import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { RoleProvider } from "@/lib/role-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "weave+",
  description: "Team knowledge base + course platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full bg-sky-tint text-ink font-geist">
        <RoleProvider>{children}</RoleProvider>
      </body>
    </html>
  );
}
