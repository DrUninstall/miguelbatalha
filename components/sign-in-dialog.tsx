"use client";

import {
  useState,
  useEffect,
  useEffectEvent,
  useId,
  useRef,
  useSyncExternalStore,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import {
  motion,
  AnimatePresence,
  useIsPresent,
  useReducedMotion,
  type Transition,
} from "framer-motion";
import { X, ArrowLeft, Fingerprint, Wallet, Check } from "lucide-react";
import { useMeasure } from "@/lib/use-measure";
import styles from "./sign-in-dialog.module.css";

type Channel = "email" | "phone";
/** The tabs on the first step. */
type Method = Channel | "passkey";

type Step =
  | { kind: "choose" }
  | { kind: "wallets" }
  | { kind: "code"; channel: Channel; to: string }
  | { kind: "pending"; via: "passkey" | { wallet: string } }
  | { kind: "success"; via: string };

const CHOOSE: Step = { kind: "choose" };

/** Height + tab indicator: critically damped (no overshoot), settles in ~0.4s. */
const heightTransition = { type: "spring", duration: 0.4, bounce: 0 } satisfies Transition;
/** Step content crossfade/scale/blur. */
const contentTransition = { type: "spring", duration: 0.3, bounce: 0 } satisfies Transition;
/** Overlay and panel move as one: same spring, and the exit runs at 80% of the entrance. */
const openTransition = { type: "spring", duration: 0.3, bounce: 0 } satisfies Transition;
const closeTransition = { type: "spring", duration: 0.24, bounce: 0 } satisfies Transition;
const instant = { duration: 0 } satisfies Transition;

const PASSKEY_DELAY_MS = 1800;
const WALLET_DELAY_MS = 1500;

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

/** Method tab panes: fade + 8px slide, 0.15s each way; none for keyboard switches. */
const tabPaneVariants = {
  enter: { opacity: 0, y: 8 },
  center: { opacity: 1, y: 0 },
  exit: (skip: boolean) =>
    skip ? { opacity: 0, transition: instant } : { opacity: 0, y: -8 },
};

const tabs: { id: Method; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "passkey", label: "Passkey" },
];

const subscribeNoop = () => () => {};

/**
 * Child of AnimatePresence: tells its render function whether it is animating
 * out, so the closing overlay and panel stop taking clicks and focus at once
 * instead of blocking the page until their exit animation finishes.
 */
function ExitGuard({ children }: { children: (exiting: boolean) => ReactNode }) {
  return children(!useIsPresent());
}

const exitingStyle = { pointerEvents: "none" } as const;

/** Makes a step that is animating out non-interactive (and skipped by Tab). */
function PresenceGuard({ children }: { children: ReactNode }) {
  const isPresent = useIsPresent();
  return (
    <div inert={!isPresent} data-pane={isPresent ? "" : undefined}>
      {children}
    </div>
  );
}

function BackButton({ onBack }: { onBack: () => void }) {
  return (
    <button type="button" className={styles.backButton} onClick={onBack}>
      <ArrowLeft size={16} />
      Back
    </button>
  );
}

// ─────────── Default State ───────────

interface DefaultStateProps {
  activeTab: Method;
  /** `viaKeyboard` is true for arrow/Home/End, which switch instantly. */
  onTabChange: (tab: Method, viaKeyboard: boolean) => void;
  /** Pointer press on the tabs: later tab changes animate again. */
  onTabPointerDown: () => void;
  /** Last tab change came from the keyboard: skip the crossfade. */
  instantTabs: boolean;
  email: string;
  onEmailChange: (v: string) => void;
  phone: string;
  onPhoneChange: (v: string) => void;
  onContinue: () => void;
  onConnectWallet: () => void;
}

function DefaultState({
  activeTab,
  onTabChange,
  onTabPointerDown,
  instantTabs,
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  onContinue,
  onConnectWallet,
}: DefaultStateProps) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const tabId = (t: Method) => `${id}-tab-${t}`;
  const panelId = `${id}-panel`;

  const handleTabKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((t) => t.id === activeTab);
    let next = index;
    if (e.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (e.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = tabs.length - 1;
    else return;
    e.preventDefault();
    onTabChange(tabs[next].id, true);
    document.getElementById(tabId(tabs[next].id))?.focus();
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onContinue();
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Tabs */}
      <div
        className={styles.tabsContainer}
        role="tablist"
        aria-label="Sign-in method"
        onKeyDown={handleTabKeyDown}
        onPointerDown={onTabPointerDown}
      >
        {tabs.map((tab) => {
          const selected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={tabId(tab.id)}
              role="tab"
              aria-selected={selected}
              aria-controls={panelId}
              tabIndex={selected ? 0 : -1}
              className={`${styles.tab} ${selected ? styles.tabActive : ""}`}
              onClick={() => onTabChange(tab.id, false)}
            >
              {selected && (
                <motion.span
                  className={styles.tabIndicator}
                  layoutId={`${id}-tab-indicator`}
                  transition={instantTabs ? instant : heightTransition}
                />
              )}
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div
        role="tabpanel"
        id={panelId}
        aria-labelledby={tabId(activeTab)}
        tabIndex={activeTab === "passkey" ? 0 : undefined}
      >
        {/* `custom` reaches the exiting pane too, whose own props are from the
            previous render, so a keyboard switch also skips the fade-out. */}
        <AnimatePresence mode="wait" initial={false} custom={instantTabs}>
          <motion.div
            key={activeTab}
            custom={instantTabs}
            variants={tabPaneVariants}
            initial={reduceMotion || instantTabs ? false : "enter"}
            animate="center"
            exit={reduceMotion ? undefined : "exit"}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "email" && (
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor={`${id}-email`}>
                  Email address
                </label>
                <input
                  id={`${id}-email`}
                  type="email"
                  autoComplete="email"
                  className={styles.input}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => onEmailChange(e.target.value)}
                />
              </div>
            )}
            {activeTab === "phone" && (
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor={`${id}-phone`}>
                  Phone number
                </label>
                <input
                  id={`${id}-phone`}
                  type="tel"
                  autoComplete="tel"
                  className={styles.input}
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => onPhoneChange(e.target.value)}
                />
              </div>
            )}
            {activeTab === "passkey" && (
              <div className={styles.formGroup}>
                <p className={styles.bodyText}>
                  Use your device&apos;s biometric authentication or security key to sign
                  in securely.
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <button type="submit" className={styles.submitButton}>
        {activeTab === "passkey" ? "Authenticate with passkey" : "Continue"}
      </button>

      {/* Divider */}
      <div className={styles.divider} aria-hidden="true">
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>or</span>
        <div className={styles.dividerLine} />
      </div>

      {/* Connect Wallet Button */}
      <button type="button" className={styles.optionButton} onClick={onConnectWallet}>
        <div className={styles.optionIcon}>
          <Wallet size={20} />
        </div>
        <div className={styles.optionContent}>
          <div className={styles.optionTitle}>Connect wallet</div>
          <div className={styles.optionDescription}>MetaMask, WalletConnect & more</div>
        </div>
      </button>
    </form>
  );
}

// ─────────── Connect Wallet State ───────────

const wallets = [
  { id: "metamask", name: "MetaMask", className: styles.walletMetamask },
  { id: "walletconnect", name: "WalletConnect", className: styles.walletWalletConnect },
  { id: "coinbase", name: "Coinbase", className: styles.walletCoinbase },
  { id: "phantom", name: "Phantom", className: styles.walletPhantom },
];

function ConnectWalletState({
  onBack,
  onSelect,
}: {
  onBack: () => void;
  onSelect: (name: string) => void;
}) {
  return (
    <div>
      <BackButton onBack={onBack} />
      <h3 className={styles.stepTitle}>Choose a wallet</h3>
      <div className={styles.walletGrid}>
        {wallets.map((wallet) => (
          <button
            key={wallet.id}
            type="button"
            className={styles.walletButton}
            onClick={() => onSelect(wallet.name)}
          >
            <div className={`${styles.walletIcon} ${wallet.className}`}>
              <Wallet size={20} />
            </div>
            <span className={styles.walletName}>{wallet.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─────────── Code State (email + phone) ───────────

const CODE_LENGTH = 6;

function CodeState({
  channel,
  to,
  onBack,
  onVerify,
}: {
  channel: Channel;
  to: string;
  onBack: () => void;
  onVerify: () => void;
}) {
  const id = useId();
  const [code, setCode] = useState("");
  // Validate on submit; once it has failed, the message clears as soon as the code is fixed.
  const [submitted, setSubmitted] = useState(false);
  // Pasted codes arrive as "123 456" or "123-456": keep only the digits.
  const isComplete = code.replace(/\D/g, "").length === CODE_LENGTH;
  const showError = submitted && !isComplete;
  const errorId = `${id}-error`;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
        if (isComplete) onVerify();
      }}
    >
      <BackButton onBack={onBack} />
      <h3 className={styles.stepTitle}>
        {channel === "email" ? "Check your email" : "Verify your phone"}
      </h3>
      <p className={`${styles.bodyText} ${styles.stepDescription}`}>
        {channel === "email"
          ? `We sent a verification code to ${to || "your email address"}.`
          : `We sent a verification code via SMS to ${to || "your phone"}.`}
      </p>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor={`${id}-code`}>
          Verification code
        </label>
        <input
          id={`${id}-code`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          spellCheck={false}
          className={`${styles.input} ${showError ? styles.inputInvalid : ""}`}
          placeholder="Enter 6-digit code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-invalid={showError}
          aria-describedby={showError ? errorId : undefined}
        />
        {showError && (
          <p id={errorId} className={styles.fieldError} role="alert">
            Enter the {CODE_LENGTH}-digit code from the {channel === "email" ? "email" : "text message"}.
          </p>
        )}
      </div>
      <button type="submit" className={styles.submitButton}>
        Verify
      </button>
    </form>
  );
}

// ─────────── Pending State (passkey + wallet) ───────────

function PendingState({
  icon,
  message,
  delay,
  onBack,
  onDone,
}: {
  icon: ReactNode;
  message: string;
  delay: number;
  onBack: () => void;
  onDone: () => void;
}) {
  const done = useEffectEvent(onDone);

  // Simulate the platform prompt resolving after a short delay.
  useEffect(() => {
    const timer = setTimeout(() => done(), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div>
      <BackButton onBack={onBack} />
      <div className={styles.passkeyContainer}>
        <div className={styles.passkeyWrapper}>
          {/* CSS keyframes, so the reduced-motion rule stops it. */}
          <div className={styles.passkeySpinner} />
          <div className={styles.passkeyInner}>
            <div className={styles.passkeyIconWrapper}>
              <div className={styles.passkeyIconInner}>{icon}</div>
            </div>
          </div>
        </div>
        <p className={styles.passkeyText} role="status">
          {message}
        </p>
      </div>
    </div>
  );
}

// ─────────── Success State ───────────

function SuccessState({ via, onDone }: { via: string; onDone: () => void }) {
  return (
    <div className={styles.successContainer}>
      <div className={styles.successIcon}>
        <Check size={28} />
      </div>
      {/* A live region, not a heading: announced when the step appears. */}
      <p className={styles.stepTitle} role="status">
        You&apos;re signed in
      </p>
      <p className={`${styles.bodyText} ${styles.stepDescription}`}>
        Signed in with {via}.
      </p>
      <button
        type="button"
        className={styles.submitButton}
        onClick={onDone}
        data-autofocus
      >
        Done
      </button>
    </div>
  );
}

// ─────────── Main Dialog Component ───────────

export function SignInDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>(CHOOSE);
  const [activeTab, setActiveTab] = useState<Method>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  // Set when the method tab was changed with arrow/Home/End: the tab pane,
  // indicator and dialog height then switch instantly. Cleared by a pointer
  // press on the tabs and by any step change.
  const [instantTabs, setInstantTabs] = useState(false);
  const [ref, bounds] = useMeasure<HTMLDivElement>();
  const reduceMotion = useReducedMotion();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  // Portal target only exists on the client.
  const canPortal = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false
  );

  const close = () => {
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // Runs once the dialog has finished animating out, so it reopens at the start.
  const reset = () => {
    setStep(CHOOSE);
    setActiveTab("email");
    setInstantTabs(false);
  };

  // Escape closes
  const onEscape = useEffectEvent(close);
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Lock page scroll while open (compensating for the scrollbar width)
  useEffect(() => {
    if (!isOpen) return;
    const { body, documentElement } = document;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [isOpen]);

  // Move focus into the dialog on open, and into each new step as it appears
  useEffect(() => {
    if (!isOpen) return;
    const pane = dialogRef.current?.querySelector<HTMLElement>(
      `[data-step="${step.kind}"] > [data-pane]`
    );
    const target =
      pane?.querySelector<HTMLElement>("[data-autofocus]") ??
      pane?.querySelector<HTMLElement>("input") ??
      pane?.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus({ preventScroll: true });
  }, [isOpen, step.kind]);

  // Trap Tab / Shift+Tab inside the dialog
  const handleDialogKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const focusable = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)
    ).filter((el) => el.tabIndex >= 0 && !el.closest("[inert]") && el.getClientRects().length > 0);
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || !dialogRef.current.contains(active))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && (active === last || !dialogRef.current.contains(active))) {
      e.preventDefault();
      first.focus();
    }
  };

  const goToStep = (next: Step) => {
    setInstantTabs(false);
    setStep(next);
  };

  const handleContinue = () => {
    if (activeTab === "passkey") goToStep({ kind: "pending", via: "passkey" });
    else goToStep({ kind: "code", channel: activeTab, to: (activeTab === "email" ? email : phone).trim() });
  };

  const renderStep = () => {
    switch (step.kind) {
      case "choose":
        return (
          <DefaultState
            activeTab={activeTab}
            onTabChange={(tab, viaKeyboard) => {
              setInstantTabs(viaKeyboard);
              setActiveTab(tab);
            }}
            onTabPointerDown={() => setInstantTabs(false)}
            instantTabs={instantTabs}
            email={email}
            onEmailChange={setEmail}
            phone={phone}
            onPhoneChange={setPhone}
            onContinue={handleContinue}
            onConnectWallet={() => goToStep({ kind: "wallets" })}
          />
        );
      case "wallets":
        return (
          <ConnectWalletState
            onBack={() => goToStep(CHOOSE)}
            onSelect={(wallet) => goToStep({ kind: "pending", via: { wallet } })}
          />
        );
      case "code": {
        const { channel, to } = step;
        return (
          <CodeState
            channel={channel}
            to={to}
            onBack={() => goToStep(CHOOSE)}
            onVerify={() => goToStep({ kind: "success", via: to || channel })}
          />
        );
      }
      case "pending": {
        const { via } = step;
        return via === "passkey" ? (
          <PendingState
            icon={<Fingerprint size={32} />}
            message="Waiting for authentication…"
            delay={PASSKEY_DELAY_MS}
            onBack={() => goToStep(CHOOSE)}
            onDone={() => goToStep({ kind: "success", via: "a passkey" })}
          />
        ) : (
          <PendingState
            icon={<Wallet size={32} />}
            message={`Confirm in ${via.wallet}…`}
            delay={WALLET_DELAY_MS}
            onBack={() => goToStep({ kind: "wallets" })}
            onDone={() => goToStep({ kind: "success", via: via.wallet })}
          />
        );
      }
      case "success":
        return <SuccessState via={step.via} onDone={close} />;
      default: {
        const unhandled: never = step;
        return unhandled;
      }
    }
  };

  const dialog = (
    <AnimatePresence onExitComplete={reset}>
      {isOpen && (
        <ExitGuard key="dialog">
          {(exiting) => (
            <>
              <motion.div
                key="overlay"
                className={styles.overlay}
                inert={exiting}
                style={exiting ? exitingStyle : undefined}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: reduceMotion ? instant : openTransition }}
                exit={{ opacity: 0, transition: reduceMotion ? instant : closeTransition }}
                onClick={close}
              />
              {/* Full-viewport grid layer does the centring; the panel only animates scale/y/opacity. */}
              <div key="layer" className={styles.dialogLayer} inert={exiting}>
                <motion.div
                  ref={dialogRef}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby={titleId}
                  className={styles.dialogPanel}
                  // The panel sets pointer-events: auto in CSS; drop it while exiting.
                  style={exiting ? exitingStyle : undefined}
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    transition: reduceMotion ? instant : openTransition,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.95,
                    y: 10,
                    transition: reduceMotion ? instant : closeTransition,
                  }}
                  onKeyDown={handleDialogKeyDown}
                >
                  <motion.div
                    className={styles.heightClip}
                    initial={false}
                    animate={{ height: bounds.height || "auto" }}
                    transition={reduceMotion || instantTabs ? instant : heightTransition}
                  >
                    <div ref={ref} className={styles.dialogContent}>
                      {/* Header */}
                      <div className={styles.dialogHeader}>
                        <h2 id={titleId} className={styles.dialogTitle}>
                          Sign in
                        </h2>
                        <button
                          type="button"
                          className={styles.closeButton}
                          onClick={close}
                          aria-label="Close"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      {/* Content */}
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.div
                          key={step.kind}
                          data-step={step.kind}
                          initial={
                            reduceMotion
                              ? false
                              : { opacity: 0, scale: 0.95, filter: "blur(4px)" }
                          }
                          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                          exit={
                            reduceMotion
                              ? undefined
                              : { opacity: 0, scale: 0.95, filter: "blur(4px)" }
                          }
                          transition={contentTransition}
                        >
                          <PresenceGuard>{renderStep()}</PresenceGuard>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </>
          )}
        </ExitGuard>
      )}
    </AnimatePresence>
  );

  return (
    <div className={styles.demoContainer}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.triggerButton}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        Sign in
      </button>

      {canPortal && createPortal(dialog, document.body)}
    </div>
  );
}
