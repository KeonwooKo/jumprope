import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { IconsSprite } from "@/components/icons-sprite";

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700", "800"],
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "줄넘기 체크",
  description: "Jumprope check — MVP",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className={`${notoSansKR.className} bg-panel-sub`}>
        <IconsSprite />
        <div className="mx-auto w-full max-w-md min-h-dvh bg-white">{children}</div>
      </body>
    </html>
  );
}
