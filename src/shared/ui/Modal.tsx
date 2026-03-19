"use client";

import { useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import useControllableOpen from "@/src/shared/hooks/useControllableOpen";
import useLockBodyScroll from "@/src/shared/hooks/useLockBodyScroll";
import { cn } from "@/src/shared/utils/cn";

interface ModalProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: (api: { close: () => void }) => React.ReactNode;
  className?: string;
}
const Modal = ({
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  children,
  className,
}: ModalProps) => {
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

  const api = useMemo(() => ({ close: () => setOpen(false) }), [setOpen]);

  const portalContainer =
    typeof document !== "undefined" ? document.getElementById("modal") : null;

  if (!portalContainer || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 max-w-full w-(--container-width) mx-auto">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={api.close} />

      {/* panel */}
      <div
        ref={contentRef}
        tabIndex={-1}
        role="dialog"
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "w-342 max-h-full overflow-auto rounded-[16px] bg-white border border-gray-100",
          className,
        )}
      >
        {children(api)}
      </div>
    </div>,
    portalContainer,
  );
};

export default Modal;
