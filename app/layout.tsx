import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { InstallPWA } from "@/components/InstallPWA";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Örnek Yaşam Evleri",
  description: "Modern yaşam kompleksi",
  manifest: "/manifest.json",
  themeColor: "#18181b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Örnek Yaşam Evleri",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Örnek Yaşam Evleri" />
        <meta name="theme-color" content="#18181b" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <InstallPWA />
      </body>
    </html>
  );
}
