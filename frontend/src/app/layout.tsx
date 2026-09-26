import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "FedGuard | Privacy-Preserving Federated AI Platform",
  description: "Federated Financial Risk Intelligence Platform - 3D Claymorphism Architecture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-[#fcf6ee] text-slate-800 font-sans min-h-screen antialiased selection:bg-indigo-500/20 selection:text-indigo-800">
        {children}
      </body>
    </html>
  );
}
