import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import useLockBodyScroll from "@/src/shared/hooks/useLockBodyScroll";
import { Address, Postcode } from "@/types/daum";

interface PostcodePopupProps {
  onComplete?: (address: Address) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PostcodePopup = ({ onComplete, open, setOpen }: PostcodePopupProps) => {
  const postcode = useRef<Postcode | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const initPostcode = useCallback((oncomplete: (address: Address) => void) => {
    if (!window.daum) return;
    postcode.current = new window.daum.Postcode({
      oncomplete,
      width: "100%",
      height: "100dvh",
    });
  }, []);

  const oncomplete = useCallback(
    (address: Address) => {
      onComplete?.(address);
      setOpen(false);
    },
    [onComplete, setOpen],
  );

  useEffect(() => {
    initPostcode(oncomplete);
  }, [initPostcode, oncomplete]);

  /* 팝업이 열렸을 때 */
  useLockBodyScroll(open);
  useEffect(() => {
    // 검색창 임베딩
    if (!open) return;
    if (!postcode.current || !ref.current) return;
    postcode.current.embed(ref.current);
  }, [open]);

  return (
    <>
      <Script
        src="//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
        onLoad={() => console.log("Daum Postcode Script is Loaded")}
        onReady={() => initPostcode(oncomplete)}
      />

      {typeof document !== "undefined" &&
        document.getElementById("popup") &&
        open &&
        createPortal(
          <div className="max-w-dvw w-(--container-width) h-dvh absolute left-[50dvw] top-0 -translate-x-1/2">
            <div
              className="w-full h-full absolute inset-0 bg-black/60"
              onClick={() => setOpen(false)}
            />
            <div
              ref={ref}
              className="w-full absolute top-1/2 left-1/2 -translate-1/2"
            />
          </div>,
          document.getElementById("popup")!,
        )}
    </>
  );
};

export default PostcodePopup;
