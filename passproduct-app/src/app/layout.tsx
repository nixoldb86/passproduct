import type { Metadata, Viewport } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { I18nProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "PassProduct",
    template: "%s | PassProduct",
  },
  description: "Tu wallet de productos + marketplace premium. Guarda tus compras, conoce su valor y vende con confianza.",
  keywords: ["wallet", "marketplace", "segunda mano", "electrónica", "garantía", "reventa"],
  authors: [{ name: "PassProduct" }],
  creator: "PassProduct",
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://passproduct.app",
    siteName: "PassProduct",
    title: "PassProduct - Tu wallet de productos premium",
    description: "Guarda tus compras, conoce su valor de reventa y vende con confianza en nuestro marketplace verificado.",
  },
  twitter: {
    card: "summary_large_image",
    title: "PassProduct",
    description: "Tu wallet de productos + marketplace premium",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0C0C0E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: "#D4AF37",
          colorBackground: "#18181C",
          colorText: "#FAFAFA",
          colorTextSecondary: "#A1A1AA",
          colorInputBackground: "#1F1F24",
          colorInputText: "#FAFAFA",
          borderRadius: "12px",
        },
        elements: {
          formButtonPrimary: 
            "bg-[#D4AF37] hover:bg-[#E5C453] text-[#0C0C0E] font-medium",
          card: "bg-[#18181C] border border-[rgba(255,255,255,0.08)]",
          headerTitle: "text-[#FAFAFA]",
          headerSubtitle: "text-[#A1A1AA]",
          socialButtonsBlockButton: 
            "bg-[#1F1F24] border border-[rgba(255,255,255,0.08)] text-[#FAFAFA] hover:bg-[#26262C]",
          formFieldLabel: "text-[#A1A1AA]",
          formFieldInput: 
            "bg-[#1F1F24] border-[rgba(255,255,255,0.08)] text-[#FAFAFA]",
          footerActionLink: "text-[#D4AF37] hover:text-[#E5C453]",
          identityPreviewText: "text-[#FAFAFA]",
          identityPreviewEditButton: "text-[#D4AF37]",
          // UserButton dropdown styles
          userButtonPopoverCard: "bg-[#18181C] border border-[rgba(255,255,255,0.08)]",
          userButtonPopoverActionButton: "text-[#FAFAFA] hover:bg-[#26262C]",
          userButtonPopoverActionButtonText: "text-[#FAFAFA]",
          userButtonPopoverActionButtonIcon: "text-[#A1A1AA]",
          userButtonPopoverFooter: "hidden",
          userPreviewMainIdentifier: "text-[#FAFAFA]",
          userPreviewSecondaryIdentifier: "text-[#A1A1AA]",
        },
      }}
    >
      <html lang="es" className={inter.variable}>
        <body className="font-sans antialiased">
          <I18nProvider>
            {children}
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
