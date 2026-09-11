import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { AnalyticsTracker } from "@/components/analytics-tracker";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} — La gran comiquería de Tucumán`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png", sizes: "64x64" },
      { url: "/images/logo/logo-japan-world-toys.webp", type: "image/webp" },
    ],
    shortcut: "/favicon.png",
    apple: "/images/logo/logo-japan-world-toys.webp",
  },
  keywords: [
    "funko pop",
    "figuras de anime",
    "manga",
    "comics",
    "sanrio",
    "naruto",
    "one piece",
    "dragon ball",
    "demon slayer",
    "tucumán",
    "argentina",
    "coleccionables",
  ],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — La gran comiquería de Tucumán`,
    description: SITE_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-scroll-behavior="smooth" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="min-h-screen flex flex-col antialiased bg-white">
        {/* Background fijo de la tienda */}
        <div
          className="fixed inset-0 z-0 bg-cover bg-center bg-[url('/images/backgrounds/fondo-panel-admin-mobile.webp')] md:bg-[url('/images/backgrounds/fondo-panel-admin.webp')]"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col flex-1 min-w-0">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <CartDrawer />
        <AnalyticsTracker />
      </body>
    </html>
  );
}
