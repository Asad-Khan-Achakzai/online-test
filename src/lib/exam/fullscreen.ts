type FullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => void;
};

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
};

/**
 * Fullscreen is requested from the Start button click so the browser still
 * treats it as a user gesture. iPhone Safari often rejects this call.
 * A rejection is not an exit: monitoring continues through visibility and focus.
 * Leaving fullscreen after it was actually entered is a violation.
 */
export function requestExamFullscreen(): void {
  const element = document.documentElement as FullscreenElement;
  if (typeof element.requestFullscreen === "function") {
    try {
      void Promise.resolve(element.requestFullscreen({ navigationUI: "hide" })).catch(
        () => undefined,
      );
    } catch {
      void Promise.resolve(element.requestFullscreen()).catch(() => undefined);
    }
    return;
  }
  element.webkitRequestFullscreen?.();
}

export function getFullscreenElement(): Element | null {
  const doc = document as FullscreenDocument;
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

export function fullscreenApiAvailable(): boolean {
  const element = document.documentElement as FullscreenElement;
  return (
    typeof element.requestFullscreen === "function" ||
    typeof element.webkitRequestFullscreen === "function"
  );
}
