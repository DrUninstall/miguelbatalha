"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { CheckCircle, XCircle, Info, Loader2 } from "lucide-react";
import styles from "./toast.module.css";

type ToastType = "success" | "error" | "info" | "loading";

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
}

// ============================================
// Observer Pattern Store (Context-Free API)
// ============================================
type Subscriber = (toasts: ToastData[]) => void;

let toasts: ToastData[] = [];
const subscribers = new Set<Subscriber>();
let toastId = 0;

function generateId() {
  return `toast-${++toastId}`;
}

function notify() {
  subscribers.forEach((sub) => sub([...toasts]));
}

function addToast(type: ToastType, message: string, duration = 3000): string {
  const id = generateId();
  toasts = [...toasts, { id, type, message }];
  notify();

  if (type !== "loading" && duration > 0) {
    scheduleRemoval(id, duration);
  }

  return id;
}

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  notify();
}

function updateToast(id: string, data: Partial<Omit<ToastData, "id">>) {
  toasts = toasts.map((t) => (t.id === id ? { ...t, ...data } : t));
  notify();
}

// Timer management with visibility pause
const timers = new Map<string, { timeout: ReturnType<typeof setTimeout>; remaining: number; start: number }>();

function scheduleRemoval(id: string, duration: number) {
  const start = Date.now();
  const timeout = setTimeout(() => {
    timers.delete(id);
    removeToast(id);
  }, duration);
  timers.set(id, { timeout, remaining: duration, start });
}

function pauseAllTimers() {
  timers.forEach((timer, id) => {
    clearTimeout(timer.timeout);
    const elapsed = Date.now() - timer.start;
    timer.remaining = Math.max(0, timer.remaining - elapsed);
  });
}

function resumeAllTimers() {
  timers.forEach((timer, id) => {
    if (timer.remaining > 0) {
      timer.start = Date.now();
      timer.timeout = setTimeout(() => {
        timers.delete(id);
        removeToast(id);
      }, timer.remaining);
    }
  });
}

// Set up visibility change listener once
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      pauseAllTimers();
    } else {
      resumeAllTimers();
    }
  });
}

// ============================================
// Public Toast API
// ============================================
export const toast = Object.assign(
  (message: string, options?: { type?: ToastType; duration?: number }) => {
    return addToast(options?.type ?? "info", message, options?.duration);
  },
  {
    success: (message: string, duration?: number) => addToast("success", message, duration),
    error: (message: string, duration?: number) => addToast("error", message, duration),
    info: (message: string, duration?: number) => addToast("info", message, duration),
    loading: (message: string) => addToast("loading", message, 0),
    dismiss: (id: string) => removeToast(id),
    promise: <T,>(
      promise: Promise<T>,
      messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) }
    ): Promise<T> => {
      const id = addToast("loading", messages.loading, 0);

      promise
        .then((data) => {
          const msg = typeof messages.success === "function" ? messages.success(data) : messages.success;
          updateToast(id, { type: "success", message: msg });
          scheduleRemoval(id, 3000);
          return data;
        })
        .catch((err) => {
          const msg = typeof messages.error === "function" ? messages.error(err) : messages.error;
          updateToast(id, { type: "error", message: msg });
          scheduleRemoval(id, 3000);
        });

      return promise;
    },
  }
);

// ============================================
// Hook API (for convenience)
// ============================================
export function useToast() {
  return toast;
}

// ============================================
// Toast Component
// ============================================
function Toast({
  index,
  data,
  totalCount,
  isHovered,
  onRemove,
}: {
  index: number;
  data: ToastData;
  totalCount: number;
  isHovered: boolean;
  onRemove: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);
  const [removing, setRemoving] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{
    startX: number;
    startY: number;
    startTime: number;
    currentX: number;
  } | null>(null);

  useEffect(() => {
    // Trigger enter animation on next frame
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleRemove = useCallback(() => {
    setRemoving(true);
    // Wait for exit animation
    setTimeout(() => onRemove(data.id), 200);
  }, [data.id, onRemove]);

  // Swipe-to-dismiss handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (data.type === "loading") return;
    const el = toastRef.current;
    if (!el) return;

    el.setPointerCapture(e.pointerId);
    dragState.current = {
      startX: e.clientX,
      startY: e.clientY,
      startTime: Date.now(),
      currentX: 0,
    };
    el.style.transition = "none";
  }, [data.type]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current || !toastRef.current) return;

    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;

    // Apply friction for upward movement (negative deltaY)
    let adjustedX = deltaX;
    if (deltaY < 0) {
      adjustedX = deltaX * 0.3; // Friction
    }

    dragState.current.currentX = adjustedX;
    toastRef.current.style.transform = `translateX(calc(-50% + ${adjustedX}px))`;
    toastRef.current.style.opacity = `${1 - Math.abs(adjustedX) / 200}`;
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!dragState.current || !toastRef.current) return;

    const el = toastRef.current;
    el.releasePointerCapture(e.pointerId);
    el.style.transition = "";

    const deltaX = dragState.current.currentX;
    const elapsed = Date.now() - dragState.current.startTime;
    const velocity = Math.abs(deltaX) / elapsed;

    // Dismiss if velocity is high enough or dragged far enough
    if (velocity > 0.5 || Math.abs(deltaX) > 100) {
      const direction = deltaX > 0 ? 1 : -1;
      el.style.transform = `translateX(calc(-50% + ${direction * 300}px))`;
      el.style.opacity = "0";
      handleRemove();
    } else {
      // Snap back
      el.style.transform = "";
      el.style.opacity = "";
    }

    dragState.current = null;
  }, [handleRemove]);

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle className={`${styles.icon} ${styles.iconSuccess}`} />;
      case "error":
        return <XCircle className={`${styles.icon} ${styles.iconError}`} />;
      case "info":
        return <Info className={`${styles.icon} ${styles.iconInfo}`} />;
      case "loading":
        return <Loader2 className={`${styles.icon} ${styles.iconLoading}`} />;
    }
  };

  // Calculate visual index (reverse order - newest at bottom)
  const visualIndex = totalCount - 1 - index;

  return (
    <div
      ref={toastRef}
      className={styles.toast}
      style={
        {
          "--index": visualIndex,
          "--scale": isHovered ? 1 : 1 - visualIndex * 0.05,
          "--y-offset": isHovered ? visualIndex : 0,
        } as React.CSSProperties
      }
      data-mounted={mounted}
      data-removing={removing}
      data-hovered={isHovered}
      role="alert"
      aria-live="polite"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {getIcon(data.type)}
      <span className={styles.message}>{data.message}</span>
    </div>
  );
}

// ============================================
// Toaster Container
// ============================================
export function Toaster({ children }: { children?: React.ReactNode }) {
  const [toastList, setToastList] = useState<ToastData[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Subscribe to toast store
    const handleChange = (newToasts: ToastData[]) => {
      setToastList(newToasts);
    };
    subscribers.add(handleChange);
    // Sync initial state
    setToastList([...toasts]);

    return () => {
      subscribers.delete(handleChange);
    };
  }, []);

  const handleRemove = useCallback((id: string) => {
    // Clear any pending timer
    const timer = timers.get(id);
    if (timer) {
      clearTimeout(timer.timeout);
      timers.delete(id);
    }
    removeToast(id);
  }, []);

  return (
    <>
      {children}
      <div
        className={styles.toaster}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Gap filler pseudo-elements are handled in CSS */}
        {toastList.map((t, i) => (
          <Toast
            key={t.id}
            index={i}
            data={t}
            totalCount={toastList.length}
            isHovered={isHovered}
            onRemove={handleRemove}
          />
        ))}
      </div>
    </>
  );
}
