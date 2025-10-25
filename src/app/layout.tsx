import React from "react";
import "./globals.css";

export const metadata = {
  title: "Simple POS",
  description: "POS demo",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="app-container" style={{ fontFamily: "system-ui, sans-serif" }}>{children}</body>
    </html>
  );
}


