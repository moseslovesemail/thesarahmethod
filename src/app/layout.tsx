import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Sarah Method — Personal Pilates",
  description: "Personal Pilates programming built around your goals, equipment and schedule.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
