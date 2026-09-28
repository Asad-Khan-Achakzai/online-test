"use client";

import { useEffect, useRef } from "react";
import { EXAM_CONFIG } from "@/config/examConfig";
import { getFullscreenElement } from "@/lib/exam/fullscreen";
import {
  getTabId,
  readTabLock,
  writeTabLock,
} from "@/lib/exam/examStorage";
import type { ViolationReason } from "@/types/exam";

/**
 * Browser-level departure detection.
 *
 * A phone browser cannot disable the Home button, the app switcher, or the
 * lock screen. This hook terminates the attempt when the browser reports that
 * the page was hidden, lost focus, left fullscreen, navigated, or was opened
 * twice. It cannot prove why the operating system hid the page.
 *
 * Incoming calls, permission sheets, and some notification banners can look
 * the same as a deliberate app switch. Those events are not filtered out,
 * because the browser does not label them reliably.
 *
 * Focus loss is confirmed after a short delay so the fullscreen transition
 * started by the Start button is not treated as the candidate leaving.
 * Visibility, fullscreen exit, navigation, and page unload are immediate.
 */
const BLUR_CONFIRM_MS = 700;
const BLUR_GRACE_MS = 1200;
const FOREIGN_LOCK_MS = 3500;

interface TabMessage {
  type: "CLAIM" | "HELLO";
  tabId: string;
  attemptId: string;
}

export function useExamSecurity({
  enabled,
  attemptId,
  testId,
  onTerminate,
}: {
  enabled: boolean;
  attemptId: string | null;
  testId: string;
  onTerminate: (reason: ViolationReason) => void;
}): void {
  const onTerminateRef = useRef(onTerminate);
  useEffect(() => {
    onTerminateRef.current = onTerminate;
  }, [onTerminate]);

  useEffect(() => {
    if (!enabled || !attemptId) return;

    let stopped = false;
    let fullscreenEntered = false;
    let blurTimer: number | undefined;
    const blurGraceUntil = Date.now() + BLUR_GRACE_MS;
    const tabId = getTabId();

    const terminate = (reason: ViolationReason) => {
      if (stopped) return;
      onTerminateRef.current(reason);
    };

    const onVisibility = () => {
      if (!EXAM_CONFIG.terminateOnVisibilityChange) return;
      if (document.visibilityState === "hidden") {
        terminate("PAGE_HIDDEN");
      }
    };

    const onBlur = () => {
      if (!EXAM_CONFIG.terminateOnWindowBlur) return;
      if (Date.now() < blurGraceUntil) return;
      window.clearTimeout(blurTimer);
      blurTimer = window.setTimeout(() => {
        if (stopped) return;
        if (document.visibilityState === "hidden") {
          if (EXAM_CONFIG.terminateOnVisibilityChange) terminate("PAGE_HIDDEN");
          return;
        }
        if (!document.hasFocus()) terminate("WINDOW_BLUR");
      }, BLUR_CONFIRM_MS);
    };

    const onFocus = () => {
      window.clearTimeout(blurTimer);
    };

    const onFullscreenChange = () => {
      if (getFullscreenElement()) {
        fullscreenEntered = true;
        return;
      }
      if (!EXAM_CONFIG.terminateOnFullscreenExit) return;
      if (fullscreenEntered) terminate("FULLSCREEN_EXIT");
    };

    const onPopState = () => {
      if (!EXAM_CONFIG.terminateOnNavigation) return;
      window.history.pushState({ examGuard: attemptId }, "", window.location.href);
      terminate("NAVIGATION_ATTEMPT");
    };

    const onPageHide = () => {
      terminate("BROWSER_EXIT");
    };

    const onFreeze = () => {
      terminate("PAGE_HIDDEN");
    };

    const blockEvent = (event: Event) => {
      event.preventDefault();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const typing =
        target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
      if (!typing && event.key === "Backspace") {
        event.preventDefault();
      }
      if (
        (event.metaKey || event.ctrlKey) &&
        ["a", "c", "p", "v", "x"].includes(event.key.toLowerCase())
      ) {
        event.preventDefault();
      }
    };

    const onForeignTab = (otherTabId: string) => {
      if (otherTabId === tabId) return;
      terminate("MULTI_TAB");
    };

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("freeze", onFreeze);
    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange);
    window.addEventListener("popstate", onPopState);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);
    document.addEventListener("contextmenu", blockEvent);
    document.addEventListener("copy", blockEvent);
    document.addEventListener("cut", blockEvent);
    document.addEventListener("paste", blockEvent);
    document.addEventListener("dragstart", blockEvent);
    document.addEventListener("drop", blockEvent);
    document.addEventListener("selectstart", blockEvent);
    window.addEventListener("keydown", onKeyDown);

    window.history.pushState({ examGuard: attemptId }, "", window.location.href);
    document.documentElement.classList.add("exam-lock");

    if (
      EXAM_CONFIG.terminateOnVisibilityChange &&
      document.visibilityState === "hidden"
    ) {
      terminate("PAGE_HIDDEN");
    }

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(`exam:${testId}`);
      channel.onmessage = (event: MessageEvent<TabMessage>) => {
        const data = event.data;
        if (!data || data.tabId === tabId) return;
        onForeignTab(data.tabId);
      };
      const claim: TabMessage = { type: "CLAIM", tabId, attemptId };
      channel.postMessage(claim);
    } catch {
      // BroadcastChannel is missing in a few older webviews. The storage lock is the fallback.
      channel = null;
    }

    writeTabLock(testId, { tabId, attemptId, updatedAt: Date.now() });

    const heartbeat = window.setInterval(() => {
      const current = readTabLock(testId);
      if (
        current &&
        current.tabId !== tabId &&
        Date.now() - current.updatedAt < FOREIGN_LOCK_MS
      ) {
        onForeignTab(current.tabId);
        return;
      }
      writeTabLock(testId, { tabId, attemptId, updatedAt: Date.now() });
      try {
        channel?.postMessage({ type: "HELLO", tabId, attemptId } satisfies TabMessage);
      } catch {
        // The channel can close if the browser drops it. The lock still covers this tab.
      }
    }, 1000);

    return () => {
      stopped = true;
      window.clearTimeout(blurTimer);
      window.clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("freeze", onFreeze);
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange);
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
      document.removeEventListener("contextmenu", blockEvent);
      document.removeEventListener("copy", blockEvent);
      document.removeEventListener("cut", blockEvent);
      document.removeEventListener("paste", blockEvent);
      document.removeEventListener("dragstart", blockEvent);
      document.removeEventListener("drop", blockEvent);
      document.removeEventListener("selectstart", blockEvent);
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.classList.remove("exam-lock");
      channel?.close();
    };
  }, [attemptId, enabled, testId]);
}
