"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, TextArea } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { TabSelector } from "@/components/ui/tab-selector";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Stages } from "@/components/ui/stages";
import styles from "../[slug]/page.module.css";

export default function DesignSystem() {
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("overview");
  const [currentStage, setCurrentStage] = useState(0);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const stages = [
    { id: "1", label: "Account" },
    { id: "2", label: "Profile" },
    { id: "3", label: "Preferences" },
    { id: "4", label: "Complete" },
  ];

  return (
    <div className={styles.prose}>
      <p>
        Nobody gets excited about building a button component. Or an input field. Or a toggle. They&apos;re the vegetables of frontend development — essential, unglamorous, and the thing everyone skips when showing off their portfolio.
      </p>
      <p>
        But these are the components that ship in every feature. A flashy animation runs once. A good button gets clicked ten thousand times a day. Getting these right — consistent sizing, accessible focus states, predictable behavior — is the actual work of UI engineering.
      </p>

      <h2 className={styles.sectionHeading}>Buttons</h2>
      <p>
        Three variants: <strong>primary</strong> (highest emphasis), <strong>secondary</strong> (medium), <strong>tertiary</strong> (low). Four tones: brand, danger, neutral, success. Three sizes: small, medium, large. That&apos;s 36 combinations from a single component — and each one needs to look intentional, not generated.
      </p>
      <p>
        The sizing system uses a 4px grid. Small: 32px height, 12px horizontal padding. Medium: 40px, 16px. Large: 48px, 24px. Font sizes scale proportionally. The result is buttons that feel balanced at any size without manual adjustment.
      </p>
      <p>
        Focus states use a soft brand-colored glow (<code>box-shadow</code>) instead of the browser default outline. It&apos;s visible enough for keyboard navigation without being visually intrusive for mouse users — thanks to <code>:focus-visible</code>.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Button Variants</div>
        <div className={styles.demoColumn}>
          <div className={styles.buttonGrid}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="tertiary">Tertiary</Button>
          </div>
          <div className={styles.buttonGrid}>
            <Button variant="primary" tone="destructive">Destructive</Button>
            <Button variant="primary" tone="neutral">Neutral</Button>
            <Button variant="primary" size="small">Small</Button>
            <Button variant="primary" size="large">Large</Button>
          </div>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Form Inputs</h2>
      <p>
        Inputs are harder than they look. Label positioning, placeholder behavior, error states, disabled states, focus rings, autofill styling — each one is a design decision that affects usability.
      </p>
      <p>
        I went with top-aligned labels (always visible), placeholder text as hint (not label), and error messages that appear below the input with a red left border. The error state uses <code>box-shadow</code> for the red ring rather than <code>border</code> — shadows don&apos;t affect layout, so the input doesn&apos;t shift when an error appears.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Input & TextArea</div>
        <div className={styles.formDemoGrid}>
          <div className={styles.formGroup}>
            <span className={styles.formLabel}>Email</span>
            <Input
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <span className={styles.formLabel}>Message</span>
            <TextArea
              placeholder="Write something..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Selection Controls</h2>
      <p>
        Three patterns for different selection types. <strong>Segmented control</strong> for mutually exclusive options in a compact space — like view mode toggles. <strong>Tabs</strong> for content switching where each option has substantial associated content. <strong>Toggle</strong> for binary on/off settings.
      </p>
      <p>
        The segmented control uses a sliding background indicator with Framer Motion&apos;s <code>layoutId</code> — the highlight morphs from one segment to the next. Tabs use a bottom border indicator with the same technique. The toggle is CSS-only — a checkbox with a custom sliding thumb.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Segmented Control</div>
        <div className={styles.demoInner}>
          <SegmentedControl
            options={[
              { value: "grid", label: "Grid" },
              { value: "list", label: "List" },
              { value: "board", label: "Board" },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
        </div>
      </div>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Tab Selector</div>
        <div className={styles.demoInner}>
          <TabSelector
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "analytics", label: "Analytics" },
              { id: "settings", label: "Settings" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>
      </div>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Toggle Switch</div>
        <div className={styles.demoRow}>
          <Toggle
            checked={notificationsEnabled}
            onChange={setNotificationsEnabled}
          />
          <span style={{ fontSize: 14, color: "rgb(var(--text-weak))" }}>
            {notificationsEnabled ? "Enabled" : "Disabled"}
          </span>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Accordion</h2>
      <p>
        Collapsible content sections. The expand/collapse animation uses <code>max-height</code> with CSS transitions — not the most performant approach (it triggers layout), but for the small content amounts in accordions, it&apos;s imperceptible. The alternative — animating <code>transform: scaleY()</code> — distorts text, so it&apos;s a deliberate tradeoff.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Accordion</div>
        <div style={{ width: "100%", maxWidth: 480 }}>
          <Accordion>
            <AccordionItem title="What frameworks do you use?">
              React with Next.js for production apps. Framer Motion for animation. CSS Modules for styling with design tokens.
            </AccordionItem>
            <AccordionItem title="How do you handle state management?">
              React context for theme/auth. Local state for component-level concerns. Server state via React Query when needed.
            </AccordionItem>
            <AccordionItem title="What about testing?">
              Unit tests for utilities, integration tests for critical flows. Visual regression testing for component libraries.
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <h2 className={styles.sectionHeading}>Progress Stages</h2>
      <p>
        A multi-step progress indicator for wizards and onboarding flows. Each stage shows completed, current, and upcoming states. The connecting lines fill progressively — completed segments are solid, the current segment is partially filled, upcoming segments are empty.
      </p>

      <div className={styles.demo}>
        <div className={styles.demoLabel}>Progress Stages</div>
        <div className={styles.demoColumn}>
          <Stages stages={stages} currentStage={currentStage} />
          <div className={styles.stageControls}>
            <Button
              variant="secondary"
              size="small"
              onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
              disabled={currentStage === 0}
            >
              Back
            </Button>
            <Button
              variant="primary"
              size="small"
              onClick={() =>
                setCurrentStage(Math.min(stages.length - 1, currentStage + 1))
              }
              disabled={currentStage === stages.length - 1}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      <hr className={styles.separator} />

      <p>
        A design system isn&apos;t a component library — it&apos;s a set of decisions. Spacing scale, color tokens, sizing rules, interaction patterns. The components are just the decisions made tangible. Get the decisions right and the components build themselves. Get them wrong and no amount of polish helps.
      </p>
    </div>
  );
}
