"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import styles from "./project-reel.module.css";

const noop = () => () => {};

/**
 * A looping product reel. It plays muted on its own, stops while it's off
 * screen, and waits for a click under reduced motion. Sound is opt-in. The
 * file follows the site theme; until that's known, the poster behind the
 * video (chosen in CSS) stands in, so there's no flash of the wrong theme.
 */
export function ProjectReel({ src, label }: { src: { light: string; dark: string }; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const { resolvedTheme } = useTheme();
  const [paused, setPaused] = useState(true);
  const [muted, setMuted] = useState(true);
  // What the viewer last chose with the button; after that, only they decide.
  const chosen = useRef<"play" | "pause" | null>(null);
  const time = useRef(0);

  // The server can't know the theme. Choosing the file only after hydration
  // keeps the first client render equal to the server's; React doesn't patch
  // attributes that differ during hydration, so the src would never arrive.
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false
  );
  const theme = !hydrated ? null : resolvedTheme === "dark" ? "dark" : resolvedTheme === "light" ? "light" : null;

  useEffect(() => {
    const video = ref.current;
    if (!video || !theme) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const onLoaded = () => {
      // A theme switch swaps the file; carry on from the same moment.
      video.currentTime = time.current;
    };
    video.addEventListener("loadedmetadata", onLoaded, { once: true });

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const wants = chosen.current ? chosen.current === "play" : !reduced;
          if (wants) video.play().catch(() => {});
        } else if (!video.paused) {
          video.pause();
        }
      },
      { threshold: 0.25 }
    );
    observer.observe(video);
    return () => {
      observer.disconnect();
      video.removeEventListener("loadedmetadata", onLoaded);
      time.current = video.currentTime;
    };
  }, [theme]);

  function togglePlay() {
    const video = ref.current;
    if (!video) return;
    chosen.current = video.paused ? "play" : "pause";
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  return (
    <div className={styles.frame}>
      <video
        ref={ref}
        className={styles.video}
        src={theme ? src[theme] : undefined}
        muted={muted}
        loop
        playsInline
        preload="metadata"
        aria-label={label}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      />
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.control}
          aria-label="Sound"
          aria-pressed={!muted}
          onClick={() => setMuted((m) => !m)}
        >
          {muted ? <VolumeX aria-hidden /> : <Volume2 aria-hidden />}
        </button>
        <button
          type="button"
          className={styles.control}
          aria-label="Pause video"
          aria-pressed={paused}
          onClick={togglePlay}
        >
          {paused ? <Play aria-hidden /> : <Pause aria-hidden />}
        </button>
      </div>
    </div>
  );
}
