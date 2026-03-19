import { Suspense } from "react";
import RetryButton from "./RetryButton";
import ErrorUI from "@/src/shared/ui/ErrorUI";
import CommonLayout from "@/src/shared/ui/layouts/CommonLayout";

const Page = () => {
  return (
    <CommonLayout>
      <div className="flex-1 flex flex-col gap-96 items-center justify-center pt-90">
        <ErrorUI
          mainMessage={"일시적인 오류가 발생했어요..."}
          subMessage={
            <>
              네트워크를 연결해 주시고
              <br />
              잠시 후에 다시 시도해 주세요.
            </>
          }
        />
        <Suspense>
          <RetryButton />
        </Suspense>
      </div>
    </CommonLayout>
  );
};

export default Page;
