export function removeElementById(id: string): void {
  const el = typeof document !== "undefined" ? document.getElementById(id) : null;
  if (el?.parentNode) {
    el.parentNode.removeChild(el);
  }
}

const _attachedListeners = new WeakSet<HTMLElement>();

export function addClickListenerOnce(id: string, handler: (e: Event) => void): void {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id) as HTMLElement | null;
  if (!el) return;

  if (_attachedListeners.has(el)) return;
  _attachedListeners.add(el);

  el.addEventListener("click", handler);
}
