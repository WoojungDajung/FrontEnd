import { Address, Postcode } from "@/types/daum";
import { lockBodyScroll } from "@/utils/lockBodyScroll";
import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface PostcodePopupProps {
  onComplete?: (address: Address) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PostcodePopup = ({ onComplete, open, setOpen }: PostcodePopupProps) => {
  const postcode = useRef<Postcode | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const oncomplete = useCallback(
    (data: Address) => {
      onComplete?.(data);
      setOpen(false);
    },
    [onComplete, setOpen],
  );

  const createPostcodeInstance = useCallback((): Postcode | null => {
    if (!window.daum) return null;
    return new window.daum.Postcode({
      oncomplete,
      width: "390px",
      height: "100dvh",
    });
  }, [oncomplete]);

  useEffect(() => {
    postcode.current = createPostcodeInstance();
  }, [createPostcodeInstance]);

  useEffect(() => {
    // 검색창 임베딩
    if (open) {
      if (!postcode.current || !ref.current) return;
      postcode.current.embed(ref.current);
    }

    if (!open) return;
    lockBodyScroll(true);
    return () => lockBodyScroll(false);
  }, [open]);

  const onScriptLoaded = () => {
    console.log("Daum Postcode Script is Loaded");
    postcode.current = createPostcodeInstance();
  };

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        onLoad={onScriptLoaded}
      />

      {typeof document !== "undefined" &&
        document.getElementById("popup") &&
        open &&
        createPortal(
          <div className="w-390 h-dvh absolute left-[50dvw] top-0 -translate-x-1/2">
            <div
              className="w-full h-full absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <div
              ref={ref}
              className="absolute top-1/2 left-1/2 -translate-1/2"
            />
          </div>,
          document.getElementById("popup")!,
        )}
    </>
  );
};

export default PostcodePopup;
