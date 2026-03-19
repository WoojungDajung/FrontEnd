import Link from "next/link";
import CommonLayout from "@/src/shared/ui/layouts/CommonLayout";
import ErrorUI from "@/src/shared/ui/ErrorUI";

export default function NotFound() {
  return (
    <CommonLayout>
      <div className="flex-1 flex flex-col gap-96 items-center justify-center pt-90">
        <ErrorUI mainMessage={"존재하지 않는 페이지입니다."} />
        <Link
          href="/"
          className="button button--md button--primary typo-18-semibold"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </CommonLayout>
  );
}
