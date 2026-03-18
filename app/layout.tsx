import type { Metadata } from "next";
import "./globals.css";
import { pretendard } from "./fonts";
import Providers from "@/components/Providers";
import DevTool from "@/components/DevTool";
import { GoogleTagManager } from "@next/third-parties/google";
import { ToastContainer } from "@/components/ToastContainer";

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
      <GoogleTagManager gtmId="GTM-T2H4HVC6" />
      <body>
        <Providers>
          <>
            <div className="max-w-full w-(--container-width) mx-auto">
              {children}

              <div id="drawer" />
              <div id="modal" />
            </div>
            <div id="popup" className="z-100 fixed left-0 top-0" />
            <ToastContainer />
            <DevTool />
          </>
        </Providers>
      </body>
    </html>
  );
}
