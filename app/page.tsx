import Login from "@/components/home/Login";
import Swiper from "@/components/home/HeroSwiper";
import { Suspense } from "react";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col gap-32">
        <Swiper />
        <Suspense>
          <Login />
        </Suspense>
      </div>
    </main>
  );
}
