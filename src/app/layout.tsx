import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NLA Visualization",
  description: "Explorable explanations for Numerical Linear Algebra",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} flex h-screen overflow-hidden`}>
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {children}
        </main>
      </body>
    </html>
  );
}
