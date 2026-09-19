import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Telugu, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n";
import { AuthProvider } from "@/lib/auth";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const notoSans = Noto_Sans({ variable: "--font-notosans", subsets: ["latin"] });
const notoSansTelugu = Noto_Sans_Telugu({ variable: "--font-notosans-telugu", subsets: ["telugu"] });
const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-notosans-devanagari",
  subsets: ["devanagari"],
});

export const metadata: Metadata = {
  title: "Sasyamedha — Smart Crop Care & Direct Market Access",
  description: "Check your crop, get treatment guidance, and sell for the best net return.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#1B5E20",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="te"
      className={`${notoSans.variable} ${notoSansTelugu.variable} ${notoSansDevanagari.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-surface text-foreground">
        <LanguageProvider>
          <AuthProvider>
            <ServiceWorkerRegister />
            {children}
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
