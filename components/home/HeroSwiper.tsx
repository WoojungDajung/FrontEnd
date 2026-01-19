"use client";

import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "./hero-swiper.css";

const HeroSwiper = () => {
  return (
    <section className="w-full">
      <Swiper modules={[Pagination]} pagination={{ clickable: true }}>
        <SwiperSlide>
          <div className="w-full px-24 flex flex-col gap-48 items-center">
            <p className="typo-24-bold text-gray-800">
              약속의 시작부터 끝까지
              <br />
              <span className="text-primary-400">만날우정</span>으로 한 번에
            </p>
            <Image
              src="/images/onboarding-illustration-1.svg"
              alt="온보딩 이미지"
              width={296}
              height={236}
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="w-full flex flex-col gap-32 items-center">
            <div className="flex flex-col gap-4">
              <p className="typo-24-bold text-gray-800">애매해도 괜찮아요.</p>
              <p className="typo-16-regular text-gray-500">
                애매한 일정도 선택할 수 있어요.
                <br />
                모든 날을 고르면 최적의 일정을 찾아드려요.
              </p>
            </div>
            <Image
              src="/images/onboarding-illustration-2.svg"
              alt="온보딩 이미지"
              width={296}
              height={236}
            />
          </div>
        </SwiperSlide>
        <SwiperSlide>
          <div className="w-full flex flex-col gap-80 items-center">
            <div className="flex flex-col gap-4">
              <p className="typo-24-bold text-gray-800">
                딱 맞는 조합 추천해드려요.
              </p>
              <p className="typo-16-regular text-gray-500">
                날짜와 장소를 조합한 만날우정 추천으로
                <br />
                약속을 쉽게 정해보세요.
              </p>
            </div>
            <Image
              src="/images/onboarding-illustration-3.svg"
              alt="온보딩 이미지"
              width={254}
              height={159}
            />
          </div>
        </SwiperSlide>
      </Swiper>
    </section>
  );
};

export default HeroSwiper;
