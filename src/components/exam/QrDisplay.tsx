"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import QRCode from "qrcode";
import { EXAM_CONFIG } from "@/config/examConfig";
import { questionCount } from "@/data/test";

function subscribeNoop(): () => void {
  return () => {};
}

function readOrigin(): string {
  return window.location.origin;
}

function readServerOrigin(): string {
  return "";
}

export function QrDisplay({ testId }: { testId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origin = useSyncExternalStore(subscribeNoop, readOrigin, readServerOrigin);
  const url = origin ? `${origin}/test/${testId}` : "";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !url) return;
    void QRCode.toCanvas(canvas, url, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 720,
      color: { dark: "#16324f", light: "#ffffff" },
    });
  }, [url]);

  async function download() {
    if (!url) return;
    const dataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 2,
      width: 720,
      color: { dark: "#16324f", light: "#ffffff" },
    });
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${testId}-qr.png`;
    anchor.click();
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col items-center px-6 py-10 text-center">
      <p className="text-[11px] font-semibold tracking-[0.16em] text-navy uppercase">
        {EXAM_CONFIG.organization}
      </p>
      <h1 className="mt-3 text-4xl font-semibold text-foreground">{EXAM_CONFIG.title}</h1>
      <p className="mt-3 max-w-xl text-lg leading-7 text-muted">
        Scan this code to open the examination. Every candidate uses the same code.
        Each phone then starts its own one-time attempt.
      </p>
      <p className="mt-2 text-base text-foreground">
        {questionCount()} questions · {EXAM_CONFIG.durationMinutes} minutes
      </p>
      <div className="mt-8 rounded-2xl border border-line bg-surface p-4">
        <canvas
          ref={canvasRef}
          aria-label={`QR code for ${EXAM_CONFIG.title}`}
          className="h-auto w-[min(72vw,420px)]"
        />
      </div>
      <p className="mt-4 max-w-xl text-sm break-all text-muted">{url || "Preparing code…"}</p>
      <div className="no-print mt-6 flex w-full max-w-sm flex-col gap-3">
        <button
          type="button"
          onClick={() => void download()}
          disabled={!url}
          className="flex h-12 items-center justify-center rounded-xl bg-navy text-base font-semibold text-white disabled:bg-navy/35"
        >
          Download QR code
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="flex h-12 items-center justify-center rounded-xl border border-line bg-surface text-base font-semibold text-navy"
        >
          Print
        </button>
      </div>
      <p className="no-print mt-8 max-w-xl text-sm leading-6 text-muted">
        Open this page on the deployed site before displaying the code. The QR address
        is the address of this browser, so a code generated on localhost only works on
        that computer.
      </p>
    </main>
  );
}
