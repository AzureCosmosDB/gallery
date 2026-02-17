import type { UserState } from "../types";

export function restoreUserState(userState?: UserState | null) {
  const scrollTopPosition = userState?.scrollTopPosition ?? 0;
  const focusedElementId = userState?.focusedElementId;

  if (focusedElementId) {
    document.getElementById(focusedElementId)?.focus();
  }

  window.scrollTo({ top: scrollTopPosition });
}
