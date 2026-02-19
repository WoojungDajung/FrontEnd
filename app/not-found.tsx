import ErrorUI from "@/components/shared/ErrorUI";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col gap-96 items-center justify-center">
      <ErrorUI mainMessage={"존재하지 않는 페이지입니다."} />
    </div>
  );
}
