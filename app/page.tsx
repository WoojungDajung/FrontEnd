import Login from "@/components/home/Login";
import Swiper from "@/components/home/HeroSwiper";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const next = (await searchParams).next;
  const nextValue = Array.isArray(next) ? next[0] : next;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access-token");
  if (accessToken) {
    redirect("/appointments");
  }

  return (
    <main>
      <div className="flex flex-col gap-32">
        <Swiper />
        <Login next={nextValue} />
      </div>
    </main>
  );
}
