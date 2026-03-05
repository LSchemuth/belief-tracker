import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Belief Tracker",
  description: "Your personal belief database",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased bg-[#09090b] text-zinc-100`}>
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-60 min-h-screen">{children}</main>
        </div>
      </body>
    </html>
  );
}
