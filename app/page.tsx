import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import CommonLayout from "@/src/shared/ui/layouts/CommonLayout";
import Login from "@/src/features/auth/ui/Login";
import HeroSwiper from "@/app/_components/HeroSwiper";

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
    <CommonLayout>
      <main className="pt-90">
        <div className="flex flex-col gap-32">
          <HeroSwiper />
          <Login next={nextValue} />
        </div>
      </main>
    </CommonLayout>
  );
}
