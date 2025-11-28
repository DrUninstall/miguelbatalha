"use client";

import Link from "next/link";
import { Toaster, useToast } from "@/components/toast";
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
import { ThemeToggle, ThemeToggleExpanded } from "@/components/theme-toggle";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Input, TextArea } from "@/components/ui/input";
import { TabSelector } from "@/components/ui/tab-selector";
import { Stages } from "@/components/ui/stages";
import { Toggle } from "@/components/ui/toggle";
import { PaginatedList } from "@/components/ui/paginated-list";
import { SimpleList, List } from "@/components/ui/list";
import { Button } from "@/components/ui/button";
import { CardHover } from "@/components/card-hover";
import { TextReveal } from "@/components/text-reveal";
import { OrbitAnimation } from "@/components/orbit-animation";
import { CoinFlip } from "@/components/coin-flip";
import { HoldToDelete } from "@/components/hold-to-delete";
import {
  SharedLayoutTabs,
  SharedLayoutSwap,
  SharedLayoutCard,
} from "@/components/shared-layout-demo";
import {
  GradientTypes,
  GradientColorSpaces,
  AnimatedGradient,
  AnimatedBorderGradient,
  LayeredGradients,
} from "@/components/gradient-demos";
import { MouseFollowPattern } from "@/components/mouse-follow-pattern";
import { WillChangeDemo } from "@/components/will-change-demo";
import { CollectionPreview } from "@/components/collection-preview";
import { MagnifiedDock } from "@/components/magnified-dock";
import { SignInDialog } from "@/components/sign-in-dialog";
import { Mail, User, Zap, Code, Palette } from "lucide-react";
import { useState } from "react";
import styles from "./page.module.css";

function ComponentsPageContent() {
  const toast = useToast();
  const [isHovered, setIsHovered] = useState(false);

  // Segmented Control state
  const [viewMode, setViewMode] = useState("grid");

  // Input states
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [emailInvalid, setEmailInvalid] = useState(false);

  // Tab Selector state
  const [activeTab, setActiveTab] = useState("overview");

  // Stages state
  const [currentStage, setCurrentStage] = useState(0);
  const stages = [
    { id: "1", label: "Account" },
    { id: "2", label: "Profile" },
    { id: "3", label: "Preferences" },
    { id: "4", label: "Complete" },
  ];

  // Toggle state
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Animated icon states
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // List data
  const items = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Item ${i + 1}`,
    description: `This is a description for item ${i + 1}`,
  }));

  return (
    <div className={styles.page}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.navContainer}>
          <Link href="/" className={styles.logo}>
            Miguel Batalha
          </Link>
          <div className={styles.navLinks}>
            <Link href="/#work" className={styles.navLink}>
              Work
            </Link>
            <Link href="/components" className={styles.navLinkActive}>
              Components
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className={styles.header}>
        <h1 className={styles.title}>
          Components
        </h1>
        <p className={styles.description}>
          A collection of beautifully designed, reusable UI components built with React, TypeScript, and Framer Motion.
        </p>
      </section>

      {/* Components Showcase */}
      <main className={styles.main}>
        <div className={styles.sections}>

        {/* Toast Notifications */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Toast Notifications</h2>
          <p className={styles.sectionDescription}>
            Elegant toast notifications with smooth animations. Click the buttons below to see them in action.
          </p>
          <div className={styles.buttonGrid}>
            <Button
              onClick={() => toast.success("Changes saved successfully!")}
              variant="primary"
              tone="neutral"
              size="small"
            >
              Show Success
            </Button>
            <Button
              onClick={() => toast.error("Something went wrong!")}
              variant="primary"
              tone="destructive"
              size="small"
            >
              Show Error
            </Button>
            <Button
              onClick={() => toast.info("Here's some useful information")}
              variant="primary"
              tone="brand"
              size="small"
            >
              Show Info
            </Button>
          </div>
        </section>

        {/* Card Hover */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Card Hover</h2>
          <p className={styles.sectionDescription}>
            Interactive card with hidden description that reveals on hover or focus.
          </p>
          <div className={styles.cardHoverDemo}>
            <CardHover title="Project name" subtitle="Project description" />
          </div>
        </section>

        {/* Text Reveal */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Text Reveal</h2>
          <p className={styles.sectionDescription}>
            Animated text reveal where each letter appears with a staggered delay.
          </p>
          <div className={styles.textRevealDemo}>
            <TextReveal text="Animations" />
          </div>
        </section>

        {/* Orbiting Animation */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Orbiting Animation</h2>
          <p className={styles.sectionDescription}>
            3D orbiting animation using CSS transforms and perspective.
          </p>
          <div className={styles.orbitDemo}>
            <OrbitAnimation />
          </div>
        </section>

        {/* Coin Flip */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Coin Flip</h2>
          <p className={styles.sectionDescription}>
            3D coin rotation with front, back, and edge using CSS transforms.
          </p>
          <div className={styles.coinDemo}>
            <CoinFlip />
          </div>
        </section>

        {/* Hold to Delete */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Hold to Delete</h2>
          <p className={styles.sectionDescription}>
            Press and hold the button to reveal the delete confirmation using clip-path animation.
          </p>
          <div className={styles.holdToDeleteDemo}>
            <HoldToDelete />
          </div>
        </section>

        {/* Shared Layout Animations */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Shared Layout Animations</h2>
          <p className={styles.sectionDescription}>
            Framer Motion&apos;s layoutId enables smooth FLIP animations between different elements.
          </p>

          {/* Single Element Demo */}
          <div className={styles.sharedLayoutDemo}>
            <h3 className={styles.subsectionTitle}>Single Element</h3>
            <p className={styles.sectionDescription}>
              A circle animates to different positions based on the selected tab.
            </p>
            <SharedLayoutTabs />
          </div>

          {/* Multiple Elements Demo */}
          <div className={styles.sharedLayoutDemo}>
            <h3 className={styles.subsectionTitle}>Multiple Elements</h3>
            <p className={styles.sectionDescription}>
              Multiple circles with unique layoutIds can swap positions smoothly.
            </p>
            <SharedLayoutSwap />
          </div>

          {/* Card Expansion Demo */}
          <div className={styles.sharedLayoutDemo}>
            <h3 className={styles.subsectionTitle}>Card Expansion</h3>
            <p className={styles.sectionDescription}>
              Card expands to a dialog using shared layout, with content fading via AnimatePresence.
            </p>
            <SharedLayoutCard />
          </div>

          {/* Collection Preview */}
          <div className={styles.sharedLayoutDemo}>
            <h3 className={styles.subsectionTitle}>Collection Preview</h3>
            <p className={styles.sectionDescription}>
              Click to expand from stacked cards to dock view. Hover in expanded state for scale and push effect.
            </p>
            <CollectionPreview />
          </div>
        </section>

        {/* Gradients */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Gradients</h2>
          <p className={styles.sectionDescription}>
            CSS gradients showcase including gradient types, color space interpolation, animations, and layered effects.
          </p>

          {/* Gradient Types */}
          <div className={styles.gradientDemo}>
            <h3 className={styles.subsectionTitle}>Gradient Types</h3>
            <p className={styles.sectionDescription}>
              The three primary CSS gradient functions: linear, radial, and conic.
            </p>
            <GradientTypes />
          </div>

          {/* Color Space Comparison */}
          <div className={styles.gradientDemo}>
            <h3 className={styles.subsectionTitle}>Color Space Interpolation</h3>
            <p className={styles.sectionDescription}>
              Red to blue gradient in sRGB vs LAB — LAB produces a perceptually uniform transition.
            </p>
            <GradientColorSpaces />
          </div>

          {/* Animated Gradient */}
          <div className={styles.gradientDemo}>
            <h3 className={styles.subsectionTitle}>Animated Gradient</h3>
            <p className={styles.sectionDescription}>
              Smooth gradient animation using background-position on an oversized background.
            </p>
            <AnimatedGradient />
          </div>

          {/* Animated Border Gradient */}
          <div className={styles.gradientDemo}>
            <h3 className={styles.subsectionTitle}>Animated Border</h3>
            <p className={styles.sectionDescription}>
              Gradient border effect using padding on an outer wrapper with an inner solid background.
            </p>
            <AnimatedBorderGradient />
          </div>

          {/* Layered Gradients */}
          <div className={styles.gradientDemo}>
            <h3 className={styles.subsectionTitle}>Layered Gradients</h3>
            <p className={styles.sectionDescription}>
              Combining multiple gradients and blend modes for unique visual effects.
            </p>
            <LayeredGradients />
          </div>
        </section>

        {/* Mouse Follow Pattern */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Mouse Follow Pattern</h2>
          <p className={styles.sectionDescription}>
            Interactive grid using useMotionValue, useSpring, and useTransform.
            Shapes rotate toward cursor with spring physics and spotlight opacity.
          </p>
          <div className={styles.patternDemo}>
            <MouseFollowPattern />
          </div>
        </section>

        {/* Magnified Dock */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Magnified Dock</h2>
          <p className={styles.sectionDescription}>
            macOS-style dock with magnification. Uses useTransform for distance-based
            scaling and Infinity as null value to keep transforms clean. Click to bounce.
          </p>
          <MagnifiedDock />
        </section>

        {/* Will-Change Demo */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>will-change Property</h2>
          <p className={styles.sectionDescription}>
            Hint to browsers to pre-promote elements to GPU layers before animation starts.
            Avoids first-frame stutter by preparing compositor resources ahead of time.
          </p>
          <WillChangeDemo />
        </section>

        {/* Sign-In Dialog */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Sign-In Dialog</h2>
          <p className={styles.sectionDescription}>
            Animated multi-step dialog with smooth height transitions, morphing tabs, and content switching using AnimatePresence.
          </p>
          <SignInDialog />
        </section>

        {/* Animated Icons */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Animated Icons</h2>
          <p className={styles.sectionDescription}>
            Interactive icons with delightful micro-animations. Hover or click to see them come to life.
          </p>
          <div className={styles.iconGrid}>
            <div className={styles.iconDemo}>
              <AnimatedHeart size={32} />
              <p className={styles.iconLabel}>Heart</p>
            </div>
            <div className={styles.iconDemo}>
              <AnimatedStar size={32} />
              <p className={styles.iconLabel}>Star</p>
            </div>
            <div className={styles.iconDemo}>
              <AnimatedSpinner size={32} />
              <p className={styles.iconLabel}>Spinner</p>
            </div>
            <div className={styles.iconDemo}>
              <PulsingDot size={16} />
              <p className={styles.iconLabel}>Status</p>
            </div>
          </div>

          {/* Icon Switch Animations */}
          <h3 className={styles.subsectionTitle}>Icon Transitions</h3>
          <p className={styles.sectionDescription}>
            Contextual icon switches with blur, scale, and opacity animations. Click to toggle states.
          </p>
          <div className={styles.iconGrid}>
            <div className={styles.iconDemo}>
              <CopyButton size={24} onCopy={() => navigator.clipboard.writeText("Copied!")} />
              <p className={styles.iconLabel}>Copy</p>
            </div>
            <div className={styles.iconDemo}>
              <PlayPauseButton size={24} isPlaying={isPlaying} onToggle={() => setIsPlaying(!isPlaying)} />
              <p className={styles.iconLabel}>Play/Pause</p>
            </div>
            <div className={styles.iconDemo}>
              <MuteButton size={24} isMuted={isMuted} onToggle={() => setIsMuted(!isMuted)} />
              <p className={styles.iconLabel}>Mute</p>
            </div>
            <div className={styles.iconDemo}>
              <VisibilityToggle size={24} isVisible={isVisible} onToggle={() => setIsVisible(!isVisible)} />
              <p className={styles.iconLabel}>Visibility</p>
            </div>
            <div className={styles.iconDemo}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px' }}
              >
                <ExpandChevron size={24} isExpanded={isExpanded} />
              </button>
              <p className={styles.iconLabel}>Expand</p>
            </div>
            <div className={styles.iconDemo}>
              <SubmitButton
                size={24}
                isSubmitted={isSubmitted}
                onSubmit={() => {
                  setIsSubmitted(true);
                  setTimeout(() => setIsSubmitted(false), 2000);
                }}
              />
              <p className={styles.iconLabel}>Submit</p>
            </div>
            <div className={styles.iconDemo}>
              <LikeButton size={24} isLiked={isLiked} onToggle={() => setIsLiked(!isLiked)} />
              <p className={styles.iconLabel}>Like</p>
            </div>
            <div className={styles.iconDemo}>
              <DownloadButton />
              <p className={styles.iconLabel}>Download</p>
            </div>
          </div>
        </section>

        {/* Interactive Cards */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Interactive Cards</h2>
          <div className={styles.showcaseGrid}>
            <div
              className={styles.showcaseCard}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <h3 className={styles.showcaseCardTitle}>
                Product Strategy
              </h3>
              <p className={styles.showcaseCardDescription}>
                Building roadmaps that balance user needs, technical constraints, and business goals.
              </p>
            </div>
            <div className={styles.showcaseCard}>
              <h3 className={styles.showcaseCardTitle}>
                UI/UX Design
              </h3>
              <p className={styles.showcaseCardDescription}>
                Creating interfaces that are beautiful, intuitive, and performant.
              </p>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Buttons</h2>
          <p className={styles.sectionDescription}>
            Comprehensive button system with type (hierarchy), tone (color scheme), and size variations.
          </p>

          {/* Primary Variant */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Primary (Highest Emphasis)</h3>
            <div className={styles.buttonGrid}>
              <Button variant="primary" tone="brand">Brand</Button>
              <Button variant="primary" tone="neutral">Neutral</Button>
              <Button variant="primary" tone="destructive">Destructive</Button>
              <Button variant="primary" tone="inverse">Inverse</Button>
            </div>
          </div>

          {/* Secondary Variant */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Secondary (Medium Emphasis)</h3>
            <div className={styles.buttonGrid}>
              <Button variant="secondary" tone="brand">Brand</Button>
              <Button variant="secondary" tone="neutral">Neutral</Button>
              <Button variant="secondary" tone="destructive">Destructive</Button>
              <Button variant="secondary" tone="inverse">Inverse</Button>
            </div>
          </div>

          {/* Tertiary Variant */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Tertiary (Low Emphasis)</h3>
            <div className={styles.buttonGrid}>
              <Button variant="tertiary" tone="brand">Brand</Button>
              <Button variant="tertiary" tone="neutral">Neutral</Button>
              <Button variant="tertiary" tone="destructive">Destructive</Button>
              <Button variant="tertiary" tone="inverse">Inverse</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Sizes</h3>
            <div className={styles.buttonGrid}>
              <Button variant="primary" tone="brand" size="small">Small</Button>
              <Button variant="primary" tone="brand" size="medium">Medium</Button>
              <Button variant="primary" tone="brand" size="large">Large</Button>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Badges</h2>
          <p className={styles.sectionDescription}>
            Status badges for different states and contexts.
          </p>
          <div className={styles.badgeGrid}>
            <span className={`${styles.badge} ${styles.badgeNeutral}`}>
              Default
            </span>
            <span className={`${styles.badge} ${styles.badgeSuccess}`}>
              Success
            </span>
            <span className={`${styles.badge} ${styles.badgeWarning}`}>
              Warning
            </span>
            <span className={`${styles.badge} ${styles.badgeError}`}>
              Error
            </span>
            <span className={`${styles.badge} ${styles.badgeInfo}`}>
              Info
            </span>
          </div>
        </section>

        {/* Theme Toggle */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Theme Toggle</h2>
          <p className={styles.sectionDescription}>
            Switch between light and dark modes with smooth transitions.
          </p>
          <div className={styles.themeToggleSection}>
            <div className={styles.themeToggleDemo}>
              <p className={styles.themeToggleLabel}>Compact</p>
              <ThemeToggle />
            </div>
            <div className={styles.themeToggleDemo}>
              <p className={styles.themeToggleLabel}>Expanded</p>
              <ThemeToggleExpanded />
            </div>
          </div>
        </section>

        {/* Accordion */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Accordion</h2>
          <Accordion>
            <AccordionItem title="What is your design philosophy?">
              <p style={{ color: 'rgb(var(--text-weak))' }}>
                I believe in creating minimal, functional designs that prioritize user experience.
                Every element should serve a purpose, and complexity should only be added when it
                genuinely improves the user's journey.
              </p>
            </AccordionItem>
            <AccordionItem title="What technologies do you use?">
              <p style={{ color: 'rgb(var(--text-weak))' }}>
                I work primarily with React, TypeScript, Next.js, and custom design systems for web development.
                For animations, I use Framer Motion to create smooth, performant interactions.
              </p>
            </AccordionItem>
            <AccordionItem title="How do you approach product strategy?">
              <p style={{ color: 'rgb(var(--text-weak))' }}>
                Product strategy starts with understanding user needs and business goals. I balance
                data-driven insights with user research to build roadmaps that deliver real value
                while remaining technically feasible.
              </p>
            </AccordionItem>
          </Accordion>
        </section>

        {/* Segmented Control */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Segmented Control</h2>
          <p className={styles.sectionDescription}>
            Animated segmented control with sliding thumb indicator.
          </p>
          <SegmentedControl
            options={[
              { value: "grid", label: "Grid", icon: Palette },
              { value: "list", label: "List", icon: Code },
              { value: "compact", label: "Compact", icon: Zap },
            ]}
            value={viewMode}
            onChange={setViewMode}
          />
          <p className={styles.selectedValue}>
            Selected: <span className={styles.selectedValueStrong}>{viewMode}</span>
          </p>
        </section>

        {/* Input & TextArea */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Form Inputs</h2>
          <p className={styles.sectionDescription}>
            Form inputs with icon support, validation states, and consistent styling.
          </p>
          <div className={styles.formSection}>
            <Input
              label="Email"
              type="email"
              icon={Mail}
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              invalid={emailInvalid}
            />
            <Input
              label="Username"
              icon={User}
              placeholder="Enter username"
              optional
            />
            <TextArea
              label="Message"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </section>

        {/* Tab Selector */}
        <section className={styles.section} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '32px 32px 0' }}>
            <h2 className={styles.sectionTitle} style={{ marginBottom: '24px' }}>Tab Selector</h2>
          </div>
          <TabSelector
            tabs={[
              { id: "overview", label: "Overview" },
              { id: "analytics", label: "Analytics" },
              { id: "reports", label: "Reports" },
              { id: "settings", label: "Settings" },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
          <div style={{ padding: '32px' }}>
            <p style={{ color: 'rgb(var(--text-weak))' }}>
              Content for <span style={{ fontWeight: 500, color: 'rgb(var(--text-strong))' }}>{activeTab}</span> tab
            </p>
          </div>
        </section>

        {/* Stages */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Progress Stages</h2>
          <Stages
            stages={stages}
            currentStage={currentStage}
            onBack={currentStage > 0 ? () => setCurrentStage(currentStage - 1) : undefined}
          />
          <div className={styles.buttonActions}>
            <Button
              onClick={() => setCurrentStage(Math.max(0, currentStage - 1))}
              disabled={currentStage === 0}
              variant="secondary"
              tone="neutral"
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStage(Math.min(stages.length - 1, currentStage + 1))}
              disabled={currentStage === stages.length - 1}
              variant="primary"
              tone="brand"
            >
              Next
            </Button>
          </div>
        </section>

        {/* Toggle */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Toggle Switch</h2>
          <p className={styles.sectionDescription}>
            Animated toggle switches with spring physics.
          </p>
          <div className={styles.formSection}>
            <Toggle
              label="Enable notifications"
              checked={notificationsEnabled}
              onChange={setNotificationsEnabled}
            />
            <Toggle
              label="Auto-save (disabled)"
              checked={false}
              onChange={() => {}}
              disabled
            />
            <Toggle
              label="Small toggle"
              size="small"
              checked={true}
              onChange={() => {}}
            />
          </div>
        </section>

        {/* Paginated List */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Paginated List</h2>
          <p className={styles.sectionDescription}>
            List with pagination controls and page navigation.
          </p>
          <PaginatedList
            items={items}
            itemsPerPage={5}
            renderItem={(item) => (
              <div className={styles.listItem}>
                <h4 className={styles.listItemTitle}>{item.title}</h4>
                <p className={styles.listItemDescription}>{item.description}</p>
              </div>
            )}
          />
        </section>

        {/* Scrollable List */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Scrollable List</h2>
          <p className={styles.sectionDescription}>
            Virtualized list component with smooth scrolling for large datasets.
          </p>
          <List
            items={items}
            renderItem={(item) => (
              <div className={styles.listItem}>
                <h4 className={styles.listItemTitle}>{item.title}</h4>
                <p className={styles.listItemDescription}>{item.description}</p>
              </div>
            )}
            itemHeight={80}
          />
        </section>

        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContainer}>
          <div className={styles.footerContent}>
            <p className={styles.footerText}>
              © 2025 Miguel Batalha. All rights reserved.
            </p>
            <div className={styles.footerLinks}>
              <Link
                href="https://www.linkedin.com/in/miguelbatalha"
                target="_blank"
                className={styles.footerLink}
              >
                LinkedIn
              </Link>
              <Link
                href="mailto:miguelbatalhamusic@gmail.com"
                className={styles.footerLink}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function ComponentsPage() {
  return (
    <Toaster>
      <ComponentsPageContent />
    </Toaster>
  );
}
