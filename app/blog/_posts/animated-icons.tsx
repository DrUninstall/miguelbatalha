"use client";

import { useState } from "react";
import {
  AnimatedHeart,
  AnimatedStar,
  AnimatedSpinner,
  PulsingDot,
  CopyButton,
  PlayPauseButton,
  MuteButton,
  VisibilityToggle,
  ExpandChevron,
  SubmitButton,
  LikeButton,
  DownloadButton,
} from "@/components/animated-icons";
import styles from "../[slug]/page.module.css";

export default function AnimatedIcons() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  return (
    <div className={styles.prose}>
      <p>
        Icons are the most common animated element in any interface — and the most commonly animated badly. A heart that snaps between empty and filled. A spinner that rotates with no easing. A toggle that teleports between states. These tiny details accumulate into an interface that feels either alive or dead.
      </p>
      <p>
        I built twelve icons, each with a different animation strategy matched to its specific purpose. The goal wasn&apos;t consistency for its own sake — it was <em>appropriate</em> motion for each context.
      </p>

      <h2 className={styles.sectionHeading}>Expressive Icons</h2>
      <p>
        The heart, star, like, and spinner are expressive — they communicate state through distinct visual transformations. The heart scales up on fill with a brief overshoot. The star rotates slightly as it fills, adding a subtle sparkle feeling. The spinner uses an asymmetric ease curve so it feels like it&apos;s working hard, not just spinning mindlessly.
      </p>
      <p>
        The pulsing dot is the simplest — just a scale oscillation — but it&apos;s the one I use most. Status indicators, online presence, recording state. Pulse communicates &quot;alive&quot; without any additional context.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Expressive Icons</div>
        <div className={styles.iconGrid}>
          <div className={styles.iconItem}>
            <AnimatedHeart />
            <span className={styles.iconLabel}>Heart</span>
          </div>
          <div className={styles.iconItem}>
            <AnimatedStar />
            <span className={styles.iconLabel}>Star</span>
          </div>
          <div className={styles.iconItem}>
            <LikeButton isLiked={isLiked} onToggle={() => setIsLiked(!isLiked)} />
            <span className={styles.iconLabel}>Like</span>
          </div>
          <div className={styles.iconItem}>
            <AnimatedSpinner />
            <span className={styles.iconLabel}>Spinner</span>
          </div>
          <div className={styles.iconItem}>
            <PulsingDot />
            <span className={styles.iconLabel}>Pulsing Dot</span>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>State Toggle Icons</h2>
      <p>
        These icons morph between two states — play/pause, mute/unmute, show/hide, expand/collapse. The key principle: the transition should hint at both the current state and the destination. A play button morphing to pause shows the triangular shape deforming into two bars — you see where it&apos;s coming from and where it&apos;s going.
      </p>
      <p>
        SVG path morphing handles most of these transitions. Both states need the same number of points for smooth interpolation — which means designing both icon states with compatible path structures from the start. It&apos;s a constraint that forces cleaner icon design.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>State Toggle Icons — Click to toggle</div>
        <div className={styles.iconGrid}>
          <div className={styles.iconItem}>
            <PlayPauseButton
              isPlaying={isPlaying}
              onToggle={() => setIsPlaying(!isPlaying)}
            />
            <span className={styles.iconLabel}>Play/Pause</span>
          </div>
          <div className={styles.iconItem}>
            <MuteButton
              isMuted={isMuted}
              onClick={() => setIsMuted(!isMuted)}
            />
            <span className={styles.iconLabel}>Mute</span>
          </div>
          <div className={styles.iconItem}>
            <VisibilityToggle
              isVisible={isVisible}
              onClick={() => setIsVisible(!isVisible)}
            />
            <span className={styles.iconLabel}>Visibility</span>
          </div>
          <div className={styles.iconItem}>
            <ExpandChevron
              isExpanded={isExpanded}
              onClick={() => setIsExpanded(!isExpanded)}
            />
            <span className={styles.iconLabel}>Expand</span>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Action Icons</h2>
      <p>
        Copy, submit, and download are action icons — they animate once to confirm the action happened. The copy button swaps to a checkmark. The submit button shows a brief loading state, then a check. The download button animates an arrow dropping into a tray.
      </p>
      <p>
        The confirmation animation is critical here. Without it, users don&apos;t know if their click registered. With it, you can skip the toast notification entirely — the icon itself is the feedback.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Action Icons — Click to trigger</div>
        <div className={styles.iconGrid}>
          <div className={styles.iconItem}>
            <CopyButton />
            <span className={styles.iconLabel}>Copy</span>
          </div>
          <div className={styles.iconItem}>
            <SubmitButton
              isSubmitted={isSubmitted}
              onClick={() => {
                setIsSubmitted(true);
                setTimeout(() => setIsSubmitted(false), 2000);
              }}
            />
            <span className={styles.iconLabel}>Submit</span>
          </div>
          <div className={styles.iconItem}>
            <DownloadButton />
            <span className={styles.iconLabel}>Download</span>
          </div>
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        Twelve icons, twelve different animation approaches. That sounds inconsistent, but it&apos;s actually the point. A heart filling and a spinner spinning serve completely different purposes — animating them identically would be the real inconsistency. Match the motion to the meaning, not to a universal rule.
      </p>
    </div>
  );
}
