import { useEffect, useRef, useState } from "react";

interface UseBottomSheetDialogOptions {
  open: boolean;
  onClose: () => void;
  /**
   * "non-modal": uses showModal() on mobile (<640px) and non-modal show() on sm+.
   * "close": mobile-only sheet that uses showModal() on mobile and closes if resized to sm+.
   * "modal": always uses top-layer showModal() across all viewports.
   */
  desktopMode: "non-modal" | "close" | "modal";
}

const DESKTOP_MEDIA_QUERY = "(min-width: 640px)";
let lastClosedOpener: { el: HTMLElement; time: number } | null = null;

function matchesDesktopViewport(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(DESKTOP_MEDIA_QUERY).matches
  );
}

function invokeClose(dialog: HTMLDialogElement) {
  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

/**
 * Coordinates a permanently mounted <dialog> element across mobile modal sheets
 * and desktop non-modal/closed viewports, including light-dismiss fallback,
 * Escape handling, and focus restoration back to the invoking element.
 */
export function useBottomSheetDialog({
  open,
  onClose,
  desktopMode,
}: UseBottomSheetDialogOptions) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  const wasOpenRef = useRef(false);
  const openerRef = useRef<HTMLElement | null>(null);
  const isModalRef = useRef(false);
  const suppressCloseCountRef = useRef(0);
  const [viewportChangeCount, setViewportChangeCount] = useState(0);

  onCloseRef.current = onClose;

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }
    const mql = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const onChange = () => setViewportChangeCount((c) => c + 1);
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    }
  }, []);

  useEffect(() => {
    void viewportChangeCount;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const desktopNow = matchesDesktopViewport();

    if (open) {
      if (!wasOpenRef.current) {
        const currentActive =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        if (
          currentActive &&
          currentActive !== document.body &&
          !dialog.contains(currentActive) &&
          !currentActive.closest("dialog")
        ) {
          openerRef.current = currentActive;
        } else if (
          lastClosedOpener &&
          Date.now() - lastClosedOpener.time < 500 &&
          lastClosedOpener.el.isConnected
        ) {
          openerRef.current = lastClosedOpener.el;
          lastClosedOpener = null;
        } else {
          openerRef.current = currentActive;
        }
      }
      wasOpenRef.current = true;

      if (desktopNow && desktopMode === "close") {
        if (dialog.open) invokeClose(dialog);
        onCloseRef.current();
        return;
      }

      const wantModal = desktopMode === "modal" || !desktopNow || desktopMode !== "non-modal";

      if (dialog.open && isModalRef.current !== wantModal) {
        suppressCloseCountRef.current += 1;
        invokeClose(dialog);
      }

      if (!dialog.open) {
        if (wantModal) {
          if (typeof dialog.showModal === "function") {
            dialog.showModal();
          } else {
            dialog.setAttribute("open", "");
          }
          isModalRef.current = true;
        } else {
          if (typeof dialog.show === "function") {
            dialog.show();
          } else {
            dialog.setAttribute("open", "");
          }
          isModalRef.current = false;
        }
      }
    } else {
      const hadBeenOpen = wasOpenRef.current;
      wasOpenRef.current = false;

      if (dialog.open) {
        invokeClose(dialog);
      }

      if (hadBeenOpen) {
        const opener = openerRef.current;
        openerRef.current = null;
        if (opener && opener.isConnected) {
          lastClosedOpener = { el: opener, time: Date.now() };
          const otherOpenModal = Array.from(
            document.querySelectorAll("dialog[open]")
          ).some((el) => el !== dialog);
          if (
            !otherOpenModal &&
            (!document.activeElement ||
              document.activeElement === document.body ||
              dialog.contains(document.activeElement))
          ) {
            opener.focus();
          }
        }
      }
      return;
    }

    const cleanups: Array<() => void> = [];

    if (!isModalRef.current) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onCloseRef.current();
        }
      };
      document.addEventListener("keydown", onKeyDown);
      cleanups.push(() => document.removeEventListener("keydown", onKeyDown));
    } else if (
      typeof HTMLDialogElement !== "undefined" &&
      !("closedBy" in HTMLDialogElement.prototype)
    ) {
      const outside = (e: PointerEvent) => {
        const r = dialog.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) return e.target === dialog;
        return (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        );
      };
      let pressedOutside = false;
      const onPointerDown = (e: PointerEvent) => {
        pressedOutside = outside(e);
      };
      const onPointerUp = (e: PointerEvent) => {
        if (pressedOutside && outside(e)) {
          if (typeof dialog.close === "function") {
            dialog.close();
          } else {
            onCloseRef.current();
          }
        }
      };
      dialog.addEventListener("pointerdown", onPointerDown);
      dialog.addEventListener("pointerup", onPointerUp);
      cleanups.push(() => {
        dialog.removeEventListener("pointerdown", onPointerDown);
        dialog.removeEventListener("pointerup", onPointerUp);
      });
    }

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [open, viewportChangeCount, desktopMode]);

  // Lock background document scroll when running as a dedicated full modal
  useEffect(() => {
    if (!open || desktopMode !== "modal" || typeof document === "undefined") {
      return;
    }
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open, desktopMode]);

  const handleDialogClose = () => {
    if (suppressCloseCountRef.current > 0) {
      suppressCloseCountRef.current -= 1;
      return;
    }
    if (!wasOpenRef.current) return;
    const dialog = dialogRef.current;
    if (dialog?.open) return;
    onCloseRef.current();
  };

  return { dialogRef, handleDialogClose };
}
