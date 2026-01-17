import type { Metadata } from "next";
import "./globals.css";
import { pretendard } from "./fonts";
import Footer from "@/components/shared/Footer";

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
    <html lang="en" className={pretendard.variable}>
      <body>
        <div className="w-390 min-h-dvh mx-auto flex justify-center">
          <div className="w-342 pt-96 pb-40 flex flex-col gap-40">
            {children}
            <Footer />
          </div>
          <div id="drawer" />
        </div>
        <div id="popup" className="z-100 fixed left-0 top-0" />
      </body>
    </html>
  );
}
