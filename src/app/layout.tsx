import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

const instrumentSans = Instrument_Sans({ variable: "--font-sans", subsets: ["latin"] });
const instrumentSerif = Instrument_Serif({ variable: "--font-serif", weight: "400", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Vortex", template: "%s · Vortex" },
  description: "Transforme comentários em conversas e oportunidades.",
  applicationName: "Vortex",
  icons: { icon: "/icon.png", apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4f1ea",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR" className={`${instrumentSans.variable} ${instrumentSerif.variable}`}><body>{children}</body></html>;
}
