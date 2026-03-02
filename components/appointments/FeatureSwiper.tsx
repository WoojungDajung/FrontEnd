"use client";

import { cn } from "@/utils/cn";
import { useCallback, useEffect, useRef, useState } from "react";
import { Swiper, SwiperClass, SwiperSlide } from "swiper/react";
import "swiper/css";
import CreateAppointmentForm from "./CreateAppointmentForm";
import AppointmentList from "./AppointmentList";

const features = [
  { id: "CREATE_APPOINTMENT", label: "약속 생성" },
  { id: "VIEW_APPOINTMENTS", label: "참여 목록" },
];

const FeatureSwiper = () => {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [selectedFeatureId, setSelectedFeatureId] =
    useState<string>("CREATE_APPOINTMENT");

  const swiperRef = useRef<SwiperClass | null>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const swiperElement = root.querySelector(".swiper") as
      | (HTMLElement & { swiper: SwiperClass })
      | null;
    if (!swiperElement) return;
    swiperRef.current = swiperElement.swiper;
  }, []);

  const onClickTab = useCallback(
    (featureId: string, tabIndex: number) => {
      if (featureId === selectedFeatureId) return;

      const swiper = swiperRef.current;
      if (!swiper) return;

      setSelectedFeatureId(featureId);
      swiper.slideTo(tabIndex);
    },
    [selectedFeatureId],
  );

  const onSlideChange = (swiper: SwiperClass) => {
    setSelectedFeatureId(features[swiper.activeIndex].id);
  };

  return (
    <div className="flex flex-col gap-16" ref={rootRef}>
      <div className="flex flex-row border-b border-gray-200">
        {features.map((feature, idx) => (
          <div
            key={feature.id}
            className={cn(
              "px-16 py-8 bg-white",
              feature.id === selectedFeatureId
                ? "text-primary-400 typo-16-semibold shadow-[inset_0_-2px_0_0_var(--color-primary-400)]"
                : "text-gray-500 typo-16-regular",
              selectedFeatureId !== feature.id && "cursor-pointer",
            )}
            onClick={() => onClickTab(feature.id, idx)}
          >
            {feature.label}
          </div>
        ))}
      </div>

      <Swiper className="w-full" onSlideChange={onSlideChange}>
        <SwiperSlide>
          <CreateAppointmentForm />
        </SwiperSlide>
        <SwiperSlide>
          {selectedFeatureId === "VIEW_APPOINTMENTS" && <AppointmentList />}
        </SwiperSlide>
      </Swiper>
    </div>
  );
};

export default FeatureSwiper;
