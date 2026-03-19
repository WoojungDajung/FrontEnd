import LoadingSpinner from "@/src/shared/ui/LoadingSpinner";
import { Suspense } from "react";
import LoginSuccessHandler from "./LoginSuccessHandler";

const Page = () => {
  return (
    <div className="fixed left-0 top-0 w-dvw h-dvh grid place-content-center">
      <LoadingSpinner open size={25} />

      <Suspense>
        <LoginSuccessHandler />
      </Suspense>
    </div>
  );
};

export default Page;
