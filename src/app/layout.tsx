import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { Providers } from "@/lib/providers";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RCA Talent — Connect RCA Graduates with Employers",
  description:
    "Rwanda Coding Academy talent marketplace. Students showcase verified profiles; companies discover and connect with the next generation of tech talent.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png", sizes: "any" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
