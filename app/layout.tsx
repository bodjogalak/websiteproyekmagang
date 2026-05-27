import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Portal Magang DKIPSD Sulut", // %s akan diganti title di tiap page
    default: "Portal Magang DKIPSD Sulut", // Title default jika page tidak punya title khusus
  },
  description: "Sistem Pendaftaran Magang Dinas Komunikasi, Informatika, Persandian dan Statistik Sulawesi Utara",
  icons: {
    icon: "/sulut-icon.png", // (Opsional) Cara manual jika cara otomatis di bawah tidak jalan
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Provide session context to the app */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
