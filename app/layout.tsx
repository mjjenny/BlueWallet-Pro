import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "THE BLUE WALLET",
  description: "BlueWallet Pro stable app.",
  icons: {
    icon: "/icon-192.png",
    shortcut: "/icon-192.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
