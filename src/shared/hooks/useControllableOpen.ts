import { useState } from "react";

interface useControllableOpenProps {
  open?: boolean;
  defaultOpen: boolean;
  onOpenChange?: (open: boolean) => void;
}

const useControllableOpen = ({
  open,
  defaultOpen,
  onOpenChange,
}: useControllableOpenProps) => {
  const [internal, setInternal] = useState(defaultOpen);
  const isControlled = open !== undefined;
  const value = isControlled ? open! : internal;

  const set = (next: boolean) => {
    if (!isControlled) setInternal(next);
    onOpenChange?.(next);
  };

  return [value, set] as const;
};

export default useControllableOpen;
