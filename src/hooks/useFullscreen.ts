"use client";

import { useCallback } from "react";
import { requestExamFullscreen } from "@/lib/exam/fullscreen";

export function useFullscreen() {
  const requestFullscreen = useCallback(() => {
    requestExamFullscreen();
  }, []);
  return { requestFullscreen };
}
