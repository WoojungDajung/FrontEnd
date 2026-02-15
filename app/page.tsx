import Login from "@/components/home/Login";
import Swiper from "@/components/home/HeroSwiper";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token");
  if (accessToken) {
    redirect("/appointments");
  }

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
