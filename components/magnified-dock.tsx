"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  AnimatePresence,
  MotionValue,
} from "framer-motion";
import {
  Globe,
  Mail,
  MessageSquare,
  Image,
  StickyNote,
  Calendar,
  Music,
  Settings,
  LucideIcon,
} from "lucide-react";
import styles from "./magnified-dock.module.css";

// Animation constants
const SCALE = 2.25;
const DISTANCE = 110;
const NUDGE = 40;
const SPRING = { mass: 0.1, stiffness: 170, damping: 12 };

// App icons configuration
const APPS: { name: string; icon: LucideIcon; color: string }[] = [
  { name: "Safari", icon: Globe, color: "#007AFF" },
  { name: "Mail", icon: Mail, color: "#5856D6" },
  { name: "Messages", icon: MessageSquare, color: "#34C759" },
  { name: "Photos", icon: Image, color: "#FF9500" },
  { name: "Notes", icon: StickyNote, color: "#FFCC00" },
  { name: "Calendar", icon: Calendar, color: "#FF3B30" },
  { name: "Music", icon: Music, color: "#FF2D55" },
  { name: "Settings", icon: Settings, color: "#8E8E93" },
];

function DockIcon({
  app,
  mouseLeft,
}: {
  app: { name: string; icon: LucideIcon; color: string };
  mouseLeft: MotionValue<number>;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // Calculate distance from mouse to icon center
  const distance = useTransform(() => {
    const bounds = ref.current
      ? { x: ref.current.offsetLeft, width: ref.current.offsetWidth }
      : { x: 0, width: 0 };
    return mouseLeft.get() - bounds.x - bounds.width / 2;
  });

  // Scale based on proximity
  const scale = useTransform(distance, [-DISTANCE, 0, DISTANCE], [1, SCALE, 1]);

  // Offset calculation for push effect
  const x = useTransform(() => {
    const d = distance.get();
    if (d === -Infinity) return 0;
    if (d < -DISTANCE || d > DISTANCE) {
      return Math.sign(d) * -1 * NUDGE;
    }
    return (-d / DISTANCE) * NUDGE * scale.get();
  });

  const scaleSpring = useSpring(scale, SPRING);
  const xSpring = useSpring(x, SPRING);
  const y = useMotionValue(0);

  const handleClick = () => {
    // Bounce animation on click
    animate(y, [0, -40, 0], {
      repeat: 2,
      ease: [
        [0, 0, 0.2, 1],
        [0.8, 0, 1, 1],
      ],
      duration: 0.7,
    });
  };

  const Icon = app.icon;

  return (
    <div className={styles.iconWrapper}>
      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className={styles.tooltip}
            initial={{ opacity: 0, y: 4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
          >
            {app.name}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Icon button */}
      <motion.button
        ref={ref}
        className={styles.appIcon}
        style={{
          x: xSpring,
          scale: scaleSpring,
          y,
          backgroundColor: app.color,
        }}
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        aria-label={app.name}
      >
        <Icon size={20} color="white" strokeWidth={2} />
      </motion.button>
    </div>
  );
}

export function MagnifiedDock() {
  const mouseLeft = useMotionValue(-Infinity);
  const mouseRight = useMotionValue(-Infinity);

  // Dynamic background expansion
  const left = useTransform(mouseLeft, [0, 40], [0, -40]);
  const right = useTransform(mouseRight, [0, 40], [0, -40]);
  const leftSpring = useSpring(left, SPRING);
  const rightSpring = useSpring(right, SPRING);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, right } = e.currentTarget.getBoundingClientRect();
    const offsetLeft = e.clientX - left;
    const offsetRight = right - e.clientX;
    mouseLeft.set(offsetLeft);
    mouseRight.set(offsetRight);
  };

  const handleMouseLeave = () => {
    mouseLeft.set(-Infinity);
    mouseRight.set(-Infinity);
  };

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.dock}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Dynamic background */}
        <motion.div
          className={styles.dockBackground}
          style={{ left: leftSpring, right: rightSpring }}
        />

        {/* App icons */}
        {APPS.map((app) => (
          <DockIcon key={app.name} app={app} mouseLeft={mouseLeft} />
        ))}
      </motion.div>
    </div>
  );
}
