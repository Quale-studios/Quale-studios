import Navbar from "../components/Navbar";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const cormorant = localFont({
  src: [
    {
      path: "./fonts/CormorantGaramond-VariableFont_wght.ttf",
      weight: "300 700",
      style: "normal",
    },
    {
      path: "./fonts/CormorantGaramond-Italic-VariableFont_wght.ttf",
      weight: "300 700",
      style: "italic",
    },
  ],
  display: "block",
});


export const metadata: Metadata = {
  title: "Quale Studios",
  description: "Feel the silence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
  lang="en"
  className={`${cormorant.className} h-full antialiased`}
>
      <body className="min-h-screen flex flex-col">
  <Navbar />
  <div className="flex-1">
    {children}
  </div>
</body>
    </html>
  );
}
