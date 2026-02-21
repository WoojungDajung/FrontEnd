import ErrorUI from "@/components/shared/ErrorUI";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-96 items-center justify-center pt-90">
      <ErrorUI mainMessage={"존재하지 않는 페이지입니다."} />
      <Link
        href="/"
        className="button button--md button--primary typo-18-semibold"
      >
        홈으로 돌아가기
      </Link>
    </div>
  );
}
