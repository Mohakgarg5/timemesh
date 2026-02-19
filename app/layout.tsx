import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TimeMesh - Find the Perfect Meeting Time",
  description:
    "Free group scheduling tool. Paint your availability, see overlap in real-time, and find the best meeting time for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          type="image/svg+xml"
          href="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNyIgZmlsbD0iI0ZGOEM2OSIvPjxyZWN0IHg9IjciIHk9IjciIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIi8+PHJlY3QgeD0iMTUiIHk9IjciIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjU1Ii8+PHJlY3QgeD0iNyIgeT0iMTUiIHdpZHRoPSI2IiBoZWlnaHQ9IjYiIHJ4PSIxLjUiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjU1Ii8+PHJlY3QgeD0iMTUiIHk9IjE1IiB3aWR0aD0iNiIgaGVpZ2h0PSI2IiByeD0iMS41IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+PC9zdmc+"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <div className="mesh-bg" />
        <main className="relative z-10">{children}</main>
      </body>
    </html>
  );
}
