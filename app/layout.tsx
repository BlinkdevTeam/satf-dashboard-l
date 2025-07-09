import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SATF Participant Dashboard",
  description: "Manage and review participants for the SATF events.",
  keywords: ["SATF", "dashboard", "participants", "event management"],
  authors: [{ name: "Lander Guevarra" }],
  openGraph: {
    title: "SATF Participant Dashboard",
    description: "Admin panel to manage SATF 2025 participant data",
    url: "https://satf-dashboard-l.vercel.app/",
    siteName: "SATF Dashboard",
    images: [
      {
        url: "/assets/satf-og-image.jpg",
        width: 1200,
        height: 630,
        alt: "SATF Dashboard Preview",
      },
    ],
    locale: "en_PH",
    type: "website",
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
        <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}
