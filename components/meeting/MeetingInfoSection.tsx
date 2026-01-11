import PencilIcon from "./PencilIcon";
import SmilingFaceIcon from "./SmilngFaceIcon";

const MeetingInfoSection = () => {
  return (
    <section className="py-16 flex flex-col gap-24 items-center bg-white border border-gray-100 rounded-[24px]">
      <div className="w-full px-16">
        <div className="flex justify-center relative">
          <p className="typo-20-bold text-gray-800">스터디밥먹으러</p>
          <button className="absolute top-0 right-0 border border-gray-100 bg-white w-32 h-32 rounded-[12px] cursor-pointer">
            <PencilIcon />
          </button>
        </div>
        <div className="w-full flex gap-8 justify-center items-center">
          <p className="typo-16-regular text-gray-600">
            투표 마감일 2026.01.06
          </p>
          <div className="bg-primary-25 text-primary-400 rounded-[40px] px-8 py-4">
            D-5
          </div>
        </div>
      </div>
      <div className="flex justify-center">
        <SmilingFaceIcon />
      </div>
      <button className="button typo-18-semibold w-310 h-48">
        내 정보 입력하기
      </button>
    </section>
  );
};

export default MeetingInfoSection;
