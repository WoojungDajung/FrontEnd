"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState } from "react";
import style from "./LoadingSpinner.module.css";

type Phase = "idle" | "loading" | "success";

interface LoadingSpinnerProps {
  open: boolean;
  success?: boolean;
  onClose?: () => void;
  successHoldMs?: number;
}

const LoadingSpinner = ({
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

  return (
    <div className="fixed inset-0 z-50 grid place-items-center">
      {phase === "loading" ? (
        <div className={style.spinner8} />
      ) : (
        <Image
          src="/images/loading/success.svg"
          alt="완료"
          width={24}
          height={24}
          draggable={false}
          className={style.successFade}
        />
      )}
    </div>
  );
};

export default LoadingSpinner;
