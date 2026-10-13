import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareSync Healthcare — Book Your Appointment",
  description:
    "Schedule appointments with top-rated physicians. Fast, secure, and seamless healthcare booking.",
  keywords: ["healthcare", "appointment", "booking", "doctor", "CareSync"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col font-body-md antialiased">{children}</body>
    </html>
  );
}
