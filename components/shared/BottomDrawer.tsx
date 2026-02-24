"use client";

import useControllableOpen from "@/hooks/useControllableOpen";
import useLockBodyScroll from "@/hooks/useLockBodyScroll";
import { cn } from "@/utils/cn";
import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  onVisibleChange?: (visible: boolean) => void;
  children: (api: { close: () => void }) => React.ReactNode;
};

const TRANSITION_MS = 300;

function usePresence(open: boolean) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<"open" | "closed">(
    open ? "open" : "closed",
  );

  const openDrawer = useEffectEvent(() => setState("open"));
  const closeDrawer = useEffectEvent(() => setState("closed"));
  const mountDrawer = useEffectEvent(() => setMounted(true));

  useEffect(() => {
    if (open) {
      // 1-1. 사용자가 드로워를 열면(open=true)
      // 마운트되서 y가 0이 되게 하기
      mountDrawer();
    } else {
      // 2-1. 사용자가 드로워를 닫으면(open = false)
      // state를 closed로 바꿔서 y가 0이 되게 하기
      // => 드로워가 아래로 내려감
      closeDrawer();
    }
  }, [open]);

  useEffect(() => {
    // 1-2. 마운트되면, state를 open로 바꿔서 y가 full이 되게 하기
    // => 드로워가 아래에서 위로 나타남
    if (mounted) {
      openDrawer();
    }
  }, [mounted]);

  useEffect(() => {
    // 2-2. 드로워가 아래로 내려간 상태 -> 이제 언마운트
    if (state === "closed") {
      setTimeout(() => setMounted(false), TRANSITION_MS);
    }
  }, [state]);

  return { mounted, state };
}

const BottomDrawer = ({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onVisibleChange,
  children,
}: Props) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const [open, setOpen] = useControllableOpen({
    open: openProp,
    defaultOpen,
    onOpenChange,
  });
  useLockBodyScroll(open);

  // useEffect(() => {
  //   if (!open) return;
  //   contentRef.current?.focus();
  // }, [open]);

  const { mounted, state } = usePresence(open);
  const onStateChanged = useEffectEvent((state: "open" | "closed") => {
    onVisibleChange?.(state === "open");
  });
  useEffect(() => {
    onStateChanged(state);
  }, [state]);

  const api = useMemo(() => ({ close: () => setOpen(false) }), [setOpen]);

  const portalContainer =
    typeof document !== "undefined" ? document.getElementById("drawer") : null;

  if (!portalContainer || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 max-w-full w-(--container-width) mx-auto">
      {/* overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/60"
        onClick={api.close}
      />

      {/* panel */}
      <div
        ref={contentRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        data-state={state}
        className={cn(
          "absolute inset-x-0 bottom-0 rounded-t-[32px] bg-white w-full h-448 overflow-hidden",
          "transform-gpu transition-transform duration-300 ease-out",
          "data-[state=closed]:translate-y-full data-[state=open]:translate-y-0",
        )}
      >
        {children(api)}
      </div>
    </div>,
    portalContainer,
  );
};

export default BottomDrawer;
