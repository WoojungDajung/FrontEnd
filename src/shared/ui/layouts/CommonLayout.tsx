import { ReactNode } from "react";
import Footer from "../Footer";

interface CommonLayoutProps {
  children: ReactNode;
  backgroundColor?: string;
}

const CommonLayout = ({
  children,
  backgroundColor = "white",
}: CommonLayoutProps) => {
  return (
    <div
      className="w-full min-h-dvh h-full flex justify-center"
      style={{ backgroundColor }}
    >
      <div className="w-342 pb-40 flex flex-col gap-40">
        {children}
        <Footer />
      </div>
    </div>
  );
};

export default CommonLayout;
