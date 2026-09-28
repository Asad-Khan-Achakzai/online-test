import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { EXAM_CONFIG } from "@/config/examConfig";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: EXAM_CONFIG.title,
    template: `%s · ${EXAM_CONFIG.title}`,
  },
  description: EXAM_CONFIG.description,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#16324f",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full font-sans">{children}</body>
    </html>
  );
}
