export function lockBodyScroll(lock: boolean) {
  const body = document.body;
  if (!body) return;

  if (lock) {
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    body.dataset.drawerScrollLock = "true";
    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
  } else {
    if (body.dataset.drawerScrollLock === "true") {
      delete body.dataset.drawerScrollLock;
      body.style.overflow = "";
      body.style.paddingRight = "";
    }
  }
}
