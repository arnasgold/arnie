/** Fired by the composer so the mark can unfold while the visitor is typing. */
export const COMPOSER_EVENT = "arnie:composer";

export type ComposerDetail = { focused: boolean };

export function emitComposerFocus(focused: boolean) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<ComposerDetail>(COMPOSER_EVENT, { detail: { focused } }));
}
