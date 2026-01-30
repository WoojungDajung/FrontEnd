import Image from "next/image";
import { Suspense } from "react";
import RetryButton from "./RetryButton";

const Page = () => {
  return (
    <div className="flex flex-col gap-96 items-center">
      <div className="flex flex-col gap-24 items-center">
        <Image
          src={"/images/Error_Illustration.svg"}
          alt="울고 있는 이미지"
          width={160}
          height={160}
        />
        <div className="flex flex-col gap-8">
          <p className="typo-20-bold text-gray-800 text-center">
            일시적인 오류가 발생했어요...
          </p>
          <p className="typo-16-regular text-gray-500 text-center">
            네트워크를 연결해 주시고
            <br />
            잠시 후에 다시 시도해 주세요.
          </p>
        </div>
      </div>
      <Suspense>
        <RetryButton />
      </Suspense>
    </div>
  );
};

export default Page;
