"use client";

import { useState } from "react";
import { OutlineOrbitButton } from "@/components/outline-orbit-button";

export function OrbitButtonDemo() {
  const [clicks, setClicks] = useState(0);
  return (
    <OutlineOrbitButton onClick={() => setClicks((n) => n + 1)}>
      {clicks === 0 ? "Hover or focus me" : `Clicked ${clicks}×`}
    </OutlineOrbitButton>
  );
}
