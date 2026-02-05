"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";
import style from "./LoadingSpinner.module.css";

type Phase = "idle" | "loading" | "success";

interface LoadingSpinnerProps {
  size: number;
  open: boolean;
  success?: boolean;
  onClose?: () => void;
  successHoldMs?: number;
}

const LoadingSpinner = ({
  size,
  open,
  success = false,
  onClose,
  successHoldMs = 600,
}: LoadingSpinnerProps) => {
  const [phase, setPhase] = useState<Phase>("idle");

  const changePhase = useEffectEvent((phase: Phase) => setPhase(phase));

  useEffect(() => {
    if (!open) {
      changePhase("idle");
      return;
    }
    changePhase(success ? "success" : "loading");
  }, [open, success]);

  useEffect(() => {
    if (phase !== "success") return;
    const t = window.setTimeout(() => onClose?.(), successHoldMs);
    return () => window.clearTimeout(t);
  }, [phase, successHoldMs, onClose]);

  if (!open) return null;

  return phase === "loading" ? (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <div className={style.spinner8} style={{ "--size": `${size}px` } as any} />
  ) : (
    <Image
      src="/images/loading/success.svg"
      alt="완료"
      width={size}
      height={size}
      draggable={false}
      className={style.successFade}
    />
  );
};

export default LoadingSpinner;
