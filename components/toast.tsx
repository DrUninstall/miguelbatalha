"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
  useSyncExternalStore,
} from "react";
import { CheckCircle, XCircle, Info, Loader2, X } from "lucide-react";
import styles from "./toast.module.css";

type ToastType = "success" | "error" | "info" | "loading";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  /** ms before it dismisses itself; Infinity keeps it until dismissed. */
  duration?: number;
  /** A button in the toast. A toast with an action stays until it's used or dismissed. */
  action?: ToastAction;
}

interface ToastData {
  id: string;
  type: ToastType;
  message: string;
  action?: ToastAction;
  /** How many identical toasts arrived in a row and were folded into this one. */
  count: number;
  /** True for the EXIT_MS window between dismissal and removal from the DOM */
  removing: boolean;
}

// Reading time: ~200 words a minute is 300ms a word, with a floor so a
// two-word toast is still on screen long enough to be noticed.
const MS_PER_WORD = 300;
const MIN_DWELL_MS = 4000;

/** Errors, actions and loading toasts wait for the person; the rest time out. */
function dwellMs(type: ToastType, message: string, action?: ToastAction): number {
  if (type === "error" || type === "loading" || action) return Infinity;
  const words = message.trim().split(/\s+/).length;
  return Math.max(MIN_DWELL_MS, words * MS_PER_WORD);
}

const EXIT_MS = 200; // matches the exit transition in toast.module.css
const VISIBLE_TOASTS = 3; // collapsed stack shows the newest three
const STACK_PEEK = 8; // px each older toast peeks out above the one in front
const STACK_SCALE_STEP = 0.05; // each older toast is 5% smaller
const GAP = 12; // px between toasts when the stack is expanded

// ============================================
// Store (context-free, read with useSyncExternalStore)
// ============================================
let toasts: ToastData[] = [];
const listeners = new Set<() => void>();
let toastId = 0;

function emit() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const EMPTY: ToastData[] = [];
const getSnapshot = () => toasts;
const getServerSnapshot = () => EMPTY;

function addToast(type: ToastType, message: string, options: ToastOptions = {}): string {
  const { action } = options;
  const duration = options.duration ?? dwellMs(type, message, action);

  // The same message again, straight after itself, bumps a count and restarts
  // the timer instead of stacking a copy.
  const newest = toasts.findLast((t) => !t.removing);
  const repeatable = type !== "loading" && !action;
  if (repeatable && newest && !newest.action && newest.type === type && newest.message === message) {
    toasts = toasts.map((t) => (t.id === newest.id ? { ...t, count: t.count + 1 } : t));
    emit();
    scheduleRemoval(newest.id, duration);
    return newest.id;
  }

  const id = `toast-${++toastId}`;
  toasts = [...toasts, { id, type, message, action, count: 1, removing: false }];
  emit();
  scheduleRemoval(id, duration);
  return id;
}

function updateToast(id: string, data: Partial<Pick<ToastData, "type" | "message">>) {
  if (!toasts.some((t) => t.id === id && !t.removing)) return;
  toasts = toasts.map((t) => (t.id === id ? { ...t, ...data } : t));
  emit();
}

// Dismissal is two-step: flag the toast so its exit transition plays, then
// drop it from the list once the transition has finished.
function dismissToast(id: string) {
  clearTimer(id);
  if (!toasts.some((t) => t.id === id && !t.removing)) return;
  toasts = toasts.map((t) => (t.id === id ? { ...t, removing: true } : t));
  emit();
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id);
    emit();
  }, EXIT_MS);
}

// ============================================
// Pausable timers
// ============================================
interface Timer {
  remaining: number;
  start: number;
  timeout: ReturnType<typeof setTimeout> | null;
}

const timers = new Map<string, Timer>();
// Timers run only while this set is empty ("hidden" tab, "interaction" hover/focus).
const pauseReasons = new Set<string>();

function startTimer(id: string, timer: Timer) {
  timer.start = Date.now();
  timer.timeout = setTimeout(() => dismissToast(id), timer.remaining);
}

function clearTimer(id: string) {
  const timer = timers.get(id);
  if (timer?.timeout) clearTimeout(timer.timeout);
  timers.delete(id);
}

function scheduleRemoval(id: string, duration: number) {
  clearTimer(id);
  if (!Number.isFinite(duration) || duration <= 0) return; // persistent
  const timer: Timer = { remaining: duration, start: 0, timeout: null };
  timers.set(id, timer);
  if (pauseReasons.size === 0) startTimer(id, timer);
}

function setPaused(reason: string, paused: boolean) {
  const wasPaused = pauseReasons.size > 0;
  if (paused) pauseReasons.add(reason);
  else pauseReasons.delete(reason);
  const isPaused = pauseReasons.size > 0;
  if (wasPaused === isPaused) return;

  timers.forEach((timer, id) => {
    if (isPaused) {
      if (!timer.timeout) return;
      clearTimeout(timer.timeout);
      timer.timeout = null;
      timer.remaining = Math.max(0, timer.remaining - (Date.now() - timer.start));
    } else {
      startTimer(id, timer);
    }
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    setPaused("hidden", document.hidden);
  });
}

// ============================================
// Public Toast API
// ============================================
export const toast = Object.assign(
  (message: string, options?: ToastOptions & { type?: ToastType }) => {
    return addToast(options?.type ?? "info", message, options);
  },
  {
    success: (message: string, options?: ToastOptions) => addToast("success", message, options),
    error: (message: string, options?: ToastOptions) => addToast("error", message, options),
    info: (message: string, options?: ToastOptions) => addToast("info", message, options),
    loading: (message: string) => addToast("loading", message),
    dismiss: (id: string) => dismissToast(id),
    promise: <T,>(
      promise: Promise<T>,
      messages: { loading: string; success: string | ((data: T) => string); error: string | ((err: unknown) => string) }
    ): Promise<T> => {
      const id = addToast("loading", messages.loading);

      promise.then(
        (data) => {
          const msg = typeof messages.success === "function" ? messages.success(data) : messages.success;
          updateToast(id, { type: "success", message: msg });
          scheduleRemoval(id, dwellMs("success", msg));
        },
        (err) => {
          const msg = typeof messages.error === "function" ? messages.error(err) : messages.error;
          updateToast(id, { type: "error", message: msg });
          scheduleRemoval(id, dwellMs("error", msg));
        }
      );

      return promise;
    },
  }
);

// ============================================
// Toast Component
// ============================================
const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className={`${styles.icon} ${styles.iconSuccess}`} aria-hidden="true" />,
  error: <XCircle className={`${styles.icon} ${styles.iconError}`} aria-hidden="true" />,
  info: <Info className={`${styles.icon} ${styles.iconInfo}`} aria-hidden="true" />,
  loading: <Loader2 className={`${styles.icon} ${styles.iconLoading}`} aria-hidden="true" />,
};

interface ToastLayout {
  index: number; // 0 = newest (front)
  y: number; // px, negative = up
  scale: number;
  hidden: boolean;
}

function Toast({
  data,
  layout,
  onHeight,
  onDismiss,
  onTap,
}: {
  data: ToastData;
  layout: ToastLayout;
  onHeight: (id: string, height: number | null) => void;
  onDismiss: (id: string, viaKeyboard: boolean) => void;
  onTap: () => void;
}) {
  const toastRef = useRef<HTMLLIElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startTime: number; currentX: number } | null>(null);

  // Report our height so the expanded stack can offset toasts of different heights.
  useLayoutEffect(() => {
    const el = toastRef.current;
    if (!el) return;
    const observer = new ResizeObserver(() => onHeight(data.id, el.offsetHeight));
    observer.observe(el);
    return () => {
      observer.disconnect();
      onHeight(data.id, null);
    };
  }, [data.id, onHeight]);

  const canSwipe = data.type !== "loading" && !data.removing;

  const handlePointerDown = (e: React.PointerEvent<HTMLLIElement>) => {
    if (!canSwipe || e.button !== 0) return;
    if ((e.target as HTMLElement).closest("button")) return; // let the dismiss button click
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, startTime: Date.now(), currentX: 0 };
    el.style.transition = "none";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLLIElement>) => {
    if (!dragState.current) return;
    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;
    // Dragging up-and-sideways gets friction so a vertical scroll doesn't dismiss
    const adjustedX = deltaY < 0 ? deltaX * 0.3 : deltaX;
    dragState.current.currentX = adjustedX;
    e.currentTarget.style.setProperty("--swipe-x", `${adjustedX}px`);
    e.currentTarget.style.opacity = `${Math.max(0, 1 - Math.abs(adjustedX) / 200)}`;
  };

  const endDrag = (e: React.PointerEvent<HTMLLIElement>, cancelled: boolean) => {
    if (!dragState.current) return;
    const el = e.currentTarget;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    el.style.transition = "";

    const deltaX = dragState.current.currentX;
    const elapsed = Math.max(1, Date.now() - dragState.current.startTime);
    const velocity = Math.abs(deltaX) / elapsed; // px per ms
    dragState.current = null;

    if (!cancelled && (velocity > 0.5 || Math.abs(deltaX) > 100)) {
      el.dataset.swiped = "true";
      el.style.setProperty("--swipe-x", `${deltaX > 0 ? 100 : -100}%`);
      el.style.opacity = "0";
      onDismiss(data.id, false);
      return;
    }

    el.style.removeProperty("--swipe-x");
    el.style.opacity = "";
    // A tap (no real drag) on touch toggles the expanded stack
    if (!cancelled && Math.abs(deltaX) < 5 && e.pointerType !== "mouse") onTap();
  };

  return (
    <li
      ref={toastRef}
      className={styles.toast}
      style={
        {
          "--y": `${layout.y}px`,
          "--scale": layout.scale,
        } as React.CSSProperties
      }
      data-front={layout.index === 0}
      data-hidden={layout.hidden}
      data-removing={data.removing}
      data-toast
      inert={data.removing || layout.hidden}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(e) => endDrag(e, false)}
      onPointerCancel={(e) => endDrag(e, true)}
    >
      {ICONS[data.type]}
      <span className={styles.message}>
        {data.type === "error" && <span className={styles.srOnly}>Error: </span>}
        {data.message}
        {data.count > 1 && (
          <span className={styles.count}>
            <span aria-hidden="true">×{data.count}</span>
            <span className={styles.srOnly}>, {data.count} times</span>
          </span>
        )}
      </span>
      {data.action && (
        <button
          type="button"
          className={styles.action}
          data-toast-control={data.id}
          onClick={(e) => {
            data.action?.onClick();
            onDismiss(data.id, e.detail === 0);
          }}
        >
          {data.action.label}
        </button>
      )}
      {data.type !== "loading" && (
        <button
          type="button"
          className={styles.dismiss}
          aria-label="Dismiss notification"
          data-toast-control={data.id}
          onClick={(e) => onDismiss(data.id, e.detail === 0)}
        >
          <X aria-hidden="true" className={styles.dismissIcon} />
        </button>
      )}
    </li>
  );
}

// ============================================
// Toaster Container
// ============================================
export function Toaster({ children }: { children?: React.ReactNode }) {
  const toastList = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const regionRef = useRef<HTMLDivElement>(null);

  // If the last toast disappears under the pointer/focus, no leave/blur event
  // fires; reset here so the next toast doesn't arrive expanded and paused.
  if (toastList.length === 0 && (hovered || focused)) {
    setHovered(false);
    setFocused(false);
  }

  const expanded = hovered || focused;

  // Pause every auto-dismiss timer while the stack is hovered or holds focus.
  useEffect(() => {
    setPaused("interaction", expanded);
    return () => setPaused("interaction", false);
  }, [expanded]);

  // Touch: a tap expands the stack; a tap anywhere else collapses it.
  useEffect(() => {
    if (!hovered) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!regionRef.current?.contains(e.target as Node)) setHovered(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [hovered]);

  const handleHeight = useCallback((id: string, height: number | null) => {
    setHeights((prev) => {
      if (height === null) {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return prev[id] === height ? prev : { ...prev, [id]: height };
    });
  }, []);

  const handleDismiss = useCallback((id: string, viaKeyboard: boolean) => {
    const active = document.activeElement as HTMLElement | null;
    if (active && regionRef.current?.contains(active)) {
      // Keep keyboard users inside the stack: move to a neighbouring toast's
      // first button. Mouse users just lose focus (so the stack can collapse).
      const toastEls = Array.from(
        regionRef.current.querySelectorAll<HTMLElement>('[data-toast]:not([data-removing="true"])')
      );
      const firstButtons = toastEls.map((el) => el.querySelector<HTMLButtonElement>("[data-toast-control]"));
      const i = firstButtons.findIndex((b) => b?.dataset.toastControl === id);
      const next = viaKeyboard && i !== -1 ? firstButtons[i + 1] ?? firstButtons[i - 1] : undefined;
      if (next) next.focus();
      else active.blur();
    }
    dismissToast(id);
  }, []);

  const handleTap = useCallback(() => setHovered((h) => !h), []);

  // Stack layout, newest first. Removing toasts keep their slot but don't push others.
  const layouts = new Map<string, ToastLayout>();
  let offset = 0;
  let index = 0;
  for (let i = toastList.length - 1; i >= 0; i--) {
    const t = toastList[i];
    layouts.set(t.id, {
      index,
      y: expanded ? -offset : -index * STACK_PEEK,
      scale: expanded ? 1 : 1 - index * STACK_SCALE_STEP,
      hidden: !expanded && index >= VISIBLE_TOASTS,
    });
    if (!t.removing) {
      offset += (heights[t.id] ?? 0) + GAP;
      index++;
    }
  }

  return (
    <>
      {children}
      {/* One persistent polite live region: always in the DOM so additions are announced */}
      <div
        ref={regionRef}
        role="status"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Notifications"
        className={styles.toaster}
        data-expanded={expanded}
        onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === "mouse" && setHovered(false)}
        onFocus={() => setFocused(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
        }}
      >
        <ol className={styles.list}>
          {toastList.map((t) => (
            <Toast
              key={t.id}
              data={t}
              layout={layouts.get(t.id)!}
              onHeight={handleHeight}
              onDismiss={handleDismiss}
              onTap={handleTap}
            />
          ))}
        </ol>
      </div>
    </>
  );
}
