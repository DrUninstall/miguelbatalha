"use client";

import { createContext, useContext } from "react";

/** True while the enclosing blog demo is paused by its Pause toggle. */
export const DemoPausedContext = createContext(false);

export function useDemoPaused() {
  return useContext(DemoPausedContext);
}
