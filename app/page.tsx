import Login from "@/components/home/Login";
import Swiper from "@/components/home/HeroSwiper";

export default function Home() {
  return (
    <main>
      <div className="flex flex-col gap-32">
        <Swiper />
        <Login />
      </div>
    </main>
  );
}
