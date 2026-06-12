import type { Metadata } from "next";
import { Anton, Barlow_Condensed, Oxanium } from "next/font/google";
import "./globals.css";

const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
  display: "swap",
});

const barlow = Barlow_Condensed({
  weight: ["300", "400", "500", "600", "700", "900"],
  variable: "--font-barlow",
  subsets: ["latin"],
  display: "swap",
});

const oxanium = Oxanium({
  weight: ["400", "500", "600", "700"],
  variable: "--font-oxanium",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ApeChain — The Layer 3 for APE",
  description: "Explore the ApeChain ecosystem.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${anton.variable} ${barlow.variable} ${oxanium.variable} h-full`}>
      <body className="h-full bg-[#0a0a0a] text-white antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
