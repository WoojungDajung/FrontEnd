"use client";

import useControllableOpen from "@/hooks/useControllableOpen";
import { cn } from "@/utils/cn";
import { lockBodyScroll } from "@/utils/lockBodyScroll";
import { useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

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
  const [open, setOpen] = useControllableOpen({
    open: openProp,
    defaultOpen,
    onOpenChange,
  });

  const contentRef = useRef<HTMLDivElement | null>(null);
  const portalContainer =
    typeof document !== "undefined" ? document.getElementById("modal") : null;

  const api = useMemo(() => ({ close: () => setOpen(false) }), [setOpen]);

  useEffect(() => {
    if (!open) return;
    lockBodyScroll(true);
    return () => lockBodyScroll(false);
  }, [open]);

  // useEffect(() => {
  //   if (!open) return;
  //   contentRef.current?.focus();
  // }, [open]);

  if (!portalContainer || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 w-390 mx-auto">
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
