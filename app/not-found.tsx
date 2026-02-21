import ErrorUI from "@/components/shared/ErrorUI";

export default function NotFound() {
  return (
    <div className="flex flex-col gap-96 items-center justify-center pt-90">
      <ErrorUI mainMessage={"존재하지 않는 페이지입니다."} />
    </div>
  );
}
