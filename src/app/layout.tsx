import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ToastProvider } from "@/components/toast-provider";
import { getSettings, setting } from "@/lib/settings";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#4f46e5",
};

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const baseUrl = setting(s, "store_url", "http://localhost:3000");
  return {
    title: {
      default: setting(s, "store_name", "فروشگاه"),
      template: `%s | ${setting(s, "store_name", "فروشگاه")}`,
    },
    description: setting(s, "store_description"),
    metadataBase: new URL(baseUrl),
    openGraph: {
      type: "website",
      locale: "fa_IR",
      siteName: setting(s, "store_name", "فروشگاه"),
    },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className="min-h-screen flex flex-col">
        <ToastProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
