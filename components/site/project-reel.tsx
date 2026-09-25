"use client";

import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import styles from "./project-reel.module.css";

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
  // Set once the viewer has pressed play or pause; after that, only they decide.
  const chosen = useRef(false);
  const time = useRef(0);

  const theme = resolvedTheme === "dark" ? "dark" : resolvedTheme === "light" ? "light" : null;

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
          if (!chosen.current && !reduced) video.play().catch(() => {});
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
    chosen.current = true;
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
