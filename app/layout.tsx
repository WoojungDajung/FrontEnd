import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "만날우정",
  description: "만나는 날짜, 우리 정하자",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
