import FeatureSwiper from "@/components/appointments/FeatureSwiper";
import StarShineIcon from "@/components/setup-meeting/StartShineIcon";
import Image from "next/image";

const Page = () => {
  return (
    <main>
      <div className="flex flex-row gap-8 items-center">
        <div className="flex flex-row gap-4 items-center">
          <Image src="/icon_32.png" alt="아이콘" width={20} height={20} className="w-20 h-20" />
          <p className="typo-20-bold text-gray-800">만날우정</p>
        </div>
        <div className="flex flex-row gap-4 bg-primary-25 px-8 py-4 rounded-[40px]">
          <StarShineIcon />
          <span className="text-primary-400 typo-12-regular">Beta</span>
        </div>
      </div>

      <FeatureSwiper />
    </main>
  );
};

export default Page;
