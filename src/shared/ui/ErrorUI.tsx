import Image from "next/image";
import { ReactNode } from "react";

interface ErrorUIProps {
  mainMessage: string | ReactNode;
  subMessage?: string | ReactNode;
}

const ErrorUI = ({ mainMessage, subMessage }: ErrorUIProps) => {
  return (
    <div className="flex flex-col gap-24 items-center">
      <Image
        src={"/images/Error_Illustration.svg"}
        alt="울고 있는 이미지"
        width={160}
        height={160}
      />
      <div className="flex flex-col gap-8">
        <p className="typo-20-bold text-gray-800 text-center">{mainMessage}</p>
        {subMessage && (
          <p className="typo-16-regular text-gray-500 text-center">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  );
};

export default ErrorUI;
