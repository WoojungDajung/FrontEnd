import MeetingForm from "@/components/home/MeetingForm";
import StarShineIcon from "@/components/home/StartShineIcon";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full flex flex-col gap-40">
      <main className="w-full flex flex-col gap-24">
        <section className="w-full flex flex-col gap-16 items-center">
          <Image src="/icon_128.png" alt="아이콘" width={80} height={80} />
          <div className="w-full flex flex-col gap-8 items-center">
            <div>
              <h1 className="typo-24-bold text-center text-gray-800">
                만날우정
              </h1>
              <p className="typo-14-regular text-center text-gray-600">
                만나는 날짜, 우리 정하자
              </p>
            </div>
            <div className="flex flex-row gap-4 bg-primary-25 px-8 py-4 rounded-40">
              <StarShineIcon />
              <span className="text-primary-400 typo-12-regular">Beta</span>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-12">
          <div className="p-16 bg-gray-50 rounded-16">
            <p className="text-primary-400 typo-14-medium">애매해도 괜찮아요</p>
            <p className="text-gray-600 typo-12-regular">
              확실하지 않은 날도 선택 가능해서 부담 없이 투표해요.
            </p>
          </div>
          <div className="p-16 bg-gray-50 rounded-16">
            <p className="text-primary-400 typo-14-medium">딱 맞는 조합 추천</p>
            <p className="text-gray-600 typo-12-regular">
              날짜, 장소 조합으로 추천하고중간 지점도 알려줘요.
            </p>
          </div>
        </div>

        <MeetingForm />
      </main>

      <div className="text-gray-400">
        <p className="text-center typo-14-regular">
          문제가 발생했나요?
          <br />
          오류 신고 및 문의: <Link href={"/"}>구글폼</Link>
        </p>
      </div>
    </div>
  );
}
