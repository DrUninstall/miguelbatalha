"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import styles from "./hold-to-delete.module.css";

const HOLD_MS = 1500;
const CONFIRMED_MS = 1500;

type HoldState = "idle" | "holding" | "done";

const TrashIcon = () => (
  <svg height="16" strokeLinejoin="round" viewBox="0 0 16 16" width="16" aria-hidden="true">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M6.75 2.75C6.75 2.05964 7.30964 1.5 8 1.5C8.69036 1.5 9.25 2.05964 9.25 2.75V3H6.75V2.75ZM5.25 3V2.75C5.25 1.23122 6.48122 0 8 0C9.51878 0 10.75 1.23122 10.75 2.75V3H12.9201H14.25H15V4.5H14.25H13.8846L13.1776 13.6917C13.0774 14.9942 11.9913 16 10.6849 16H5.31508C4.00874 16 2.92263 14.9942 2.82244 13.6917L2.11538 4.5H1.75H1V3H1.75H3.07988H5.25ZM4.31802 13.5767L3.61982 4.5H12.3802L11.682 13.5767C11.6419 14.0977 11.2075 14.5 10.6849 14.5H5.31508C4.79254 14.5 4.3581 14.0977 4.31802 13.5767Z"
      fill="currentColor"
    />
  </svg>
);

/* Rendered twice: once as the button's own content, once inside the coloured overlay.
   Both labels are stacked in one grid cell so the button never changes width. */
function Content({ done }: { done: boolean }) {
  return (
    <>
      {done ? <Check size={16} strokeWidth={2.5} aria-hidden="true" /> : <TrashIcon />}
      <span className={styles.labels}>
        <span data-active={!done}>Hold to delete account</span>
        <span data-active={done}>Account deleted</span>
      </span>
    </>
  );
}

const isHoldKey = (key: string) => key === " " || key === "Enter";

export function HoldToDelete() {
  const [state, setState] = useState<HoldState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  // The wipe is only a picture of progress. This timer decides when the hold
  // succeeds, so the duration is the same with or without animation.
  const startHold = () => {
    if (state !== "idle") return;
    setState("holding");
    timer.current = setTimeout(() => {
      setState("done");
      timer.current = setTimeout(() => setState("idle"), CONFIRMED_MS);
    }, HOLD_MS);
  };

  const cancelHold = () => {
    if (state !== "holding") return;
    clearTimeout(timer.current);
    setState("idle");
  };

  return (
    <>
      <button
        type="button"
        className={styles.button}
        data-state={state}
        style={{ "--hold-duration": `${HOLD_MS}ms` }}
        onPointerDown={(e) => {
          if (e.button !== 0) return; // primary mouse button, pen tip or touch contact
          startHold();
        }}
        onPointerUp={cancelHold}
        onPointerLeave={cancelHold}
        onPointerCancel={cancelHold}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            cancelHold();
            return;
          }
          if (!isHoldKey(e.key)) return;
          e.preventDefault();
          if (e.repeat) return; // held keys auto-repeat; only the first press counts
          startHold();
        }}
        onKeyUp={(e) => {
          if (!isHoldKey(e.key)) return;
          e.preventDefault();
          cancelHold();
        }}
        onBlur={cancelHold}
        onContextMenu={(e) => {
          // A long press on touch opens the context menu; don't let it interrupt the hold.
          if (state === "holding") e.preventDefault();
        }}
      >
        <Content done={state === "done"} />
        <span className={styles.overlay} aria-hidden="true">
          <Content done={state === "done"} />
        </span>
      </button>
      <span className={styles.srOnly} role="status">
        {state === "done" ? "Account deleted" : ""}
      </span>
    </>
  );
}
