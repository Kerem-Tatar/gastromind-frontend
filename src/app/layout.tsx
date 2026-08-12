import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-app",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GastroMind",
  description: "Restoranlar için AI destekli müşteri geri bildirim platformu",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
