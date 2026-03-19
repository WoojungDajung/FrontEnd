import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";
import "./globals.css";
import { pretendard } from "./fonts";
import Providers from "@/app/_providers/Providers";
import DevTool from "@/src/shared/dev/DevTool";
import { ToastContainer } from "@/src/shared/toast/ToastContainer";
import { ConfirmContainer } from "@/src/shared/confirm/ConfirmContainer";

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
            <ConfirmContainer />
            <ToastContainer />

            <DevTool />
          </>
        </Providers>
      </body>
    </html>
  );
}
