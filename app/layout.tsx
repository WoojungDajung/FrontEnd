import type { Metadata } from "next";
import "./globals.css";
import { pretendard } from "./fonts";

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
        <div className="w-390 mx-auto">
          <div className="w-342 mt-96 mb-40">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
