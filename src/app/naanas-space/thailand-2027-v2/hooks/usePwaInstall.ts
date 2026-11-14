"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

const SW_SCRIPT_URL = "/thailand-2027-sw.js";
const SW_SCOPE = "/naanas-space/thailand-2027-v2";

export interface UsePwaInstallState {
  canInstall: boolean;
  isStandalone: boolean;
  isIosSafari: boolean;
  isPrompting: boolean;
  installStatusMessage: string | null;
  promptInstall: () => Promise<void>;
}

export function usePwaInstall(): UsePwaInstallState {
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [hasCapturedPrompt, setHasCapturedPrompt] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIosSafari, setIsIosSafari] = useState(false);
  const [supportsWebInstall, setSupportsWebInstall] = useState(false);
  const [isPrompting, setIsPrompting] = useState(false);
  const [installStatusMessage, setInstallStatusMessage] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standaloneMedia =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(display-mode: standalone)").matches;
    const iosStandalone =
      Boolean((window.navigator as { standalone?: boolean }).standalone);
    const standalone = Boolean(standaloneMedia || iosStandalone);
    setIsStandalone(standalone);

    const ua = window.navigator?.userAgent || "";
    const isIos = /iPhone|iPad|iPod/i.test(ua);
    const isWebkitSafari =
      /Safari/i.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua);
    setIsIosSafari(!standalone && isIos && isWebkitSafari);

    const navInstallFn =
      typeof Navigator !== "undefined" &&
      typeof (Navigator.prototype as { install?: unknown }).install ===
        "function";
    setSupportsWebInstall(navInstallFn);

    // Register route-scoped PWA Service Worker without touching v1
    if (
      "serviceWorker" in navigator &&
      typeof navigator.serviceWorker?.register === "function"
    ) {
      navigator.serviceWorker
        .register(SW_SCRIPT_URL, { scope: SW_SCOPE })
        .catch(() => {
          // Non-fatal in unsupported / localhost HTTP test environments
        });
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      setHasCapturedPrompt(true);
    };

    const handleAppInstalled = () => {
      deferredPromptRef.current = null;
      setHasCapturedPrompt(false);
      setIsStandalone(true);
      setInstallStatusMessage("Thailand '27 installed cleanly.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (isPrompting) return;
    setIsPrompting(true);
    try {
      const navWithInstall = navigator as Navigator & {
        install?: () => Promise<void>;
      };
      if (supportsWebInstall && typeof navWithInstall.install === "function") {
        await navWithInstall.install();
        setInstallStatusMessage("Thailand '27 app installed.");
        return;
      }

      const promptEvent = deferredPromptRef.current;
      if (promptEvent) {
        // Event is single-use: discard before awaiting user choice
        deferredPromptRef.current = null;
        setHasCapturedPrompt(false);
        await promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        setInstallStatusMessage(
          outcome === "accepted"
            ? "Thailand '27 app installed."
            : "Install prompt dismissed — reopen any time."
        );
      }
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        setInstallStatusMessage("Installation canceled.");
      } else {
        setInstallStatusMessage("Unable to launch install prompt.");
      }
    } finally {
      setIsPrompting(false);
    }
  }, [isPrompting, supportsWebInstall]);

  return {
    canInstall: !isStandalone && (supportsWebInstall || hasCapturedPrompt),
    isStandalone,
    isIosSafari,
    isPrompting,
    installStatusMessage,
    promptInstall,
  };
}
