"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TabSelector, getTabId } from "@/components/ui/tab-selector";
import { Stages } from "@/components/ui/stages";
import { toast } from "@/components/toast";
import {
  AnimatedHeart,
  AnimatedStar,
  AnimatedSpinner,
  PulsingDot,
  LikeButton,
  PlayPauseButton,
  MuteButton,
  VisibilityToggle,
  ExpandButton,
  CopyButton,
  SubmitButton,
  DownloadButton,
} from "@/components/animated-icons";
import ui from "../_components/post.module.css";
import styles from "./the-boring-components.module.css";

export function ButtonsDemo() {
  const deleteDraft = () =>
    toast("Draft deleted", {
      action: { label: "Undo", onClick: () => toast.success("Draft restored") },
    });
  return (
    <div className={ui.row}>
      <Button variant="primary" tone="brand">Save</Button>
      <Button variant="secondary" tone="brand">Preview</Button>
      <Button variant="tertiary" tone="brand">Cancel</Button>
      <Button variant="primary" tone="destructive" onClick={deleteDraft}>
        Delete
      </Button>
      <Button variant="secondary">Export</Button>
    </div>
  );
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Reward early, punish late: nothing is flagged until the field has been left
// with a bad value once. After that, the error clears as soon as it's fixed.
export function FieldDemo() {
  const [email, setEmail] = useState("");
  const [failed, setFailed] = useState(false);
  const invalid = email !== "" && !EMAIL.test(email);
  const error = failed && invalid ? "Enter an email address like name@example.com." : undefined;
  return (
    <div className={ui.stack}>
      <Input
        label="Work email"
        type="email"
        autoComplete="email"
        placeholder="name@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => setFailed(invalid)}
        error={error}
      />
    </div>
  );
}

const TABS = [
  { id: "overview", label: "Overview", content: "Three open tasks, one due today." },
  { id: "analytics", label: "Analytics", content: "142 visits this week, up 12% on the last." },
  { id: "settings", label: "Settings", content: "Who can see this project, and who gets emailed." },
];

export function SelectionDemo() {
  const [view, setView] = useState("grid");
  const [tab, setTab] = useState(TABS[0].id);
  const [notify, setNotify] = useState(true);
  const tablistId = useId();
  const panelId = `${tablistId}-panel`;
  const activeTab = TABS.find((t) => t.id === tab) ?? TABS[0];
  return (
    <div className={`${ui.stack} ${ui.stackCentered}`}>
      <SegmentedControl
        aria-label="View"
        options={[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
          { value: "board", label: "Board" },
        ]}
        value={view}
        onChange={setView}
      />
      <div className={styles.tabs}>
        <TabSelector
          id={tablistId}
          aria-label="Project sections"
          tabs={TABS.map(({ id, label }) => ({ id, label, panelId }))}
          activeTab={tab}
          onTabChange={setTab}
        />
        <div
          role="tabpanel"
          id={panelId}
          aria-labelledby={getTabId(tablistId, activeTab.id)}
          tabIndex={0}
          className={styles.panel}
        >
          {activeTab.content}
        </div>
      </div>
      <Toggle label="Email notifications" checked={notify} onChange={setNotify} />
    </div>
  );
}

const STEPS = [
  { id: "account", label: "Account" },
  { id: "profile", label: "Profile" },
  { id: "preferences", label: "Preferences" },
  { id: "done", label: "Done" },
];

export function StagesDemo() {
  const [step, setStep] = useState(0);
  return (
    <div className={ui.stack}>
      <Stages
        aria-label="Sign-up progress"
        stages={STEPS}
        currentStage={step}
      />
      <div className={ui.row}>
        <Button
          variant="secondary"
          size="small"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
        >
          Back
        </Button>
        <Button
          variant="primary"
          tone="brand"
          size="small"
          onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={step === STEPS.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const retry = () =>
  toast.promise(wait(1200), {
    loading: "Reconnecting…",
    success: "Connected",
    error: "Still can’t reach the server",
  });

export function ToastDemo() {
  return (
    <div className={ui.row}>
      <Button size="small" onClick={() => toast.success("Changes saved")}>
        Success
      </Button>
      <Button
        size="small"
        onClick={() => toast.error("Couldn’t reach the server.", { action: { label: "Retry", onClick: retry } })}
      >
        Error
      </Button>
      <Button
        size="small"
        onClick={() =>
          toast.promise(wait(1500), {
            loading: "Uploading…",
            success: "Upload complete",
            error: "Upload failed",
          })
        }
      >
        Loading → success
      </Button>
    </div>
  );
}

export function IconsDemo() {
  const [liked, setLiked] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const items: [string, React.ReactNode][] = [
    ["Favorite", <AnimatedHeart key="heart" />],
    ["Star", <AnimatedStar key="star" />],
    ["Like", <LikeButton key="like" isLiked={liked} onToggle={() => setLiked(!liked)} />],
    ["Play", <PlayPauseButton key="play" isPlaying={playing} onToggle={() => setPlaying(!playing)} />],
    ["Mute", <MuteButton key="mute" isMuted={muted} onToggle={() => setMuted(!muted)} />],
    ["Show password", <VisibilityToggle key="show" isVisible={visible} onToggle={() => setVisible(!visible)} />],
    ["Show details", <ExpandButton key="expand" isExpanded={expanded} onToggle={() => setExpanded(!expanded)} />],
    ["Copy", <CopyButton key="copy" />],
    ["Send", <SubmitButton key="send" />],
    ["Download", <DownloadButton key="download" />],
    ["Loading", <AnimatedSpinner key="spinner" />],
    ["Online", <PulsingDot key="dot" />],
  ];
  return (
    <div className={ui.iconGrid}>
      {items.map(([label, node]) => (
        <div key={label} className={ui.iconItem}>
          {node}
          {/* Matches each control's accessible name (WCAG 2.5.3). */}
          <span aria-hidden="true">{label}</span>
        </div>
      ))}
    </div>
  );
}
