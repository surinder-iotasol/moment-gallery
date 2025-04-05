import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { GalleryProvider } from "@/context/GalleryContext";
import { ThemeProvider } from "@/context/ThemeContext";
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
  title: "Romantic Moments Gallery",
  description: "A beautiful gallery to store your romantic moments and memories",
  keywords: ["romantic", "gallery", "memories", "love", "moments", "photos"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <GalleryProvider>
              {children}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--primary)',
                    padding: '16px',
                    borderRadius: '10px',
                  },
                  success: {
                    iconTheme: {
                      primary: '#e11d48',
                      secondary: 'white',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#e11d48',
                      secondary: 'white',
                    },
                  },
                }}
              />
            </GalleryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
