import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Infographic Presenter - AI-Powered Presentation Generator",
  description: "Transform your data into beautiful infographic presentations with AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
