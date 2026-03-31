import { useEffect, useState } from "react";

/**
 * SSR에서는 false, 클라이언트 mount 이후 true를 반환한다.
 * SSR로 렌더된 인터랙티브 요소가 hydration 전에 클릭되는 race condition 방지에 사용한다.
 */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
