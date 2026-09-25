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
} from "framer-motion";
import { X, ArrowLeft, Fingerprint, Wallet, Check } from "lucide-react";
import { useMeasure } from "@/lib/use-measure";
import styles from "./sign-in-dialog.module.css";

type DialogStep =
  | "default"
  | "email"
  | "phone"
  | "passkey"
  | "connect-wallet"
  | "wallet-pending"
  | "success";
type TabType = "email" | "phone" | "passkey";

/** Height + tab indicator: critically damped (no overshoot), settles in ~0.4s. */
const heightTransition = { type: "spring" as const, duration: 0.4, bounce: 0 };
/** Step content crossfade/scale/blur. */
const contentTransition = { type: "spring" as const, duration: 0.3, bounce: 0 };
/** Dialog panel entrance/exit: a hint of bounce. */
const panelTransition = { type: "spring" as const, duration: 0.4, bounce: 0.1 };
const instant = { duration: 0 };

const PASSKEY_DELAY_MS = 1800;
const WALLET_DELAY_MS = 1500;

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])';

const tabs: { id: TabType; label: string }[] = [
  { id: "email", label: "Email" },
  { id: "phone", label: "Phone" },
  { id: "passkey", label: "Passkey" },
];

const subscribeNoop = () => () => {};

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
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
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
  email,
  onEmailChange,
  phone,
  onPhoneChange,
  onContinue,
  onConnectWallet,
}: DefaultStateProps) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const tabId = (t: TabType) => `${id}-tab-${t}`;
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
    onTabChange(tabs[next].id);
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
              onClick={() => onTabChange(tab.id)}
            >
              {selected && (
                <motion.span
                  className={styles.tabIndicator}
                  layoutId={`${id}-tab-indicator`}
                  transition={heightTransition}
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
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
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
        {activeTab === "passkey" ? "Authenticate with Passkey" : "Continue"}
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
          <div className={styles.optionTitle}>Connect Wallet</div>
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

function CodeState({
  title,
  description,
  onBack,
  onVerify,
}: {
  title: string;
  description: string;
  onBack: () => void;
  onVerify: () => void;
}) {
  const id = useId();
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onVerify();
      }}
    >
      <BackButton onBack={onBack} />
      <h3 className={styles.stepTitle}>{title}</h3>
      <p className={`${styles.bodyText} ${styles.stepDescription}`}>{description}</p>
      <div className={styles.formGroup}>
        <label className={styles.label} htmlFor={`${id}-code`}>
          Verification code
        </label>
        <input
          id={`${id}-code`}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          className={styles.input}
          placeholder="Enter 6-digit code"
          maxLength={6}
        />
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
  const reduceMotion = useReducedMotion();
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
          <motion.div
            className={styles.passkeySpinner}
            animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
            transition={
              reduceMotion
                ? instant
                : { duration: 1.25, repeat: Infinity, ease: "linear", repeatType: "loop" }
            }
          />
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

function SuccessState({
  method,
  onDone,
  onRestart,
}: {
  method: string;
  onDone: () => void;
  onRestart: () => void;
}) {
  return (
    <div className={styles.successContainer}>
      <div className={styles.successIcon}>
        <Check size={28} />
      </div>
      <h3 className={styles.stepTitle} role="status">
        You&apos;re signed in
      </h3>
      <p className={`${styles.bodyText} ${styles.stepDescription}`}>
        Signed in with {method}.
      </p>
      <button
        type="button"
        className={styles.submitButton}
        onClick={onDone}
        data-autofocus
      >
        Done
      </button>
      <button type="button" className={styles.textButton} onClick={onRestart}>
        Use a different method
      </button>
    </div>
  );
}

// ─────────── Main Dialog Component ───────────

export function SignInDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<DialogStep>("default");
  const [activeTab, setActiveTab] = useState<TabType>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [method, setMethod] = useState("email");
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

  // Reset to default state after the exit animation
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep("default");
        setActiveTab("email");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

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
      `[data-step="${step}"] > [data-pane]`
    );
    const target =
      pane?.querySelector<HTMLElement>("[data-autofocus]") ??
      pane?.querySelector<HTMLElement>("input") ??
      pane?.querySelector<HTMLElement>(FOCUSABLE);
    target?.focus({ preventScroll: true });
  }, [isOpen, step]);

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

  const handleContinue = () => {
    if (activeTab === "passkey") {
      setMethod("a passkey");
      setStep("passkey");
    } else if (activeTab === "email") {
      setMethod(email || "email");
      setStep("email");
    } else {
      setMethod(phone || "phone");
      setStep("phone");
    }
  };

  const handleBack = () => setStep("default");
  const handleSuccess = () => setStep("success");

  const renderState = () => {
    switch (step) {
      case "default":
        return (
          <DefaultState
            activeTab={activeTab}
            onTabChange={setActiveTab}
            email={email}
            onEmailChange={setEmail}
            phone={phone}
            onPhoneChange={setPhone}
            onContinue={handleContinue}
            onConnectWallet={() => setStep("connect-wallet")}
          />
        );
      case "connect-wallet":
        return (
          <ConnectWalletState
            onBack={handleBack}
            onSelect={(name) => {
              setMethod(name);
              setStep("wallet-pending");
            }}
          />
        );
      case "wallet-pending":
        return (
          <PendingState
            icon={<Wallet size={32} />}
            message={`Confirm in ${method}…`}
            delay={WALLET_DELAY_MS}
            onBack={() => setStep("connect-wallet")}
            onDone={handleSuccess}
          />
        );
      case "email":
        return (
          <CodeState
            title="Check your email"
            description={`We sent a verification code to ${email || "your email address"}.`}
            onBack={handleBack}
            onVerify={handleSuccess}
          />
        );
      case "phone":
        return (
          <CodeState
            title="Verify your phone"
            description={`We sent a verification code via SMS to ${phone || "your phone"}.`}
            onBack={handleBack}
            onVerify={handleSuccess}
          />
        );
      case "passkey":
        return (
          <PendingState
            icon={<Fingerprint size={32} />}
            message="Waiting for authentication…"
            delay={PASSKEY_DELAY_MS}
            onBack={handleBack}
            onDone={handleSuccess}
          />
        );
      case "success":
        return <SuccessState method={method} onDone={close} onRestart={handleBack} />;
    }
  };

  const dialog = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="overlay"
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reduceMotion ? instant : { duration: 0.2 }}
            onClick={close}
          />
          {/* Full-viewport grid layer does the centring; the panel only animates scale/y/opacity. */}
          <div key="layer" className={styles.dialogLayer}>
            <motion.div
              ref={dialogRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              className={styles.dialogPanel}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={reduceMotion ? instant : panelTransition}
              onKeyDown={handleDialogKeyDown}
            >
              <motion.div
                className={styles.heightClip}
                initial={false}
                animate={{ height: bounds.height || "auto" }}
                transition={reduceMotion ? instant : heightTransition}
              >
                <div ref={ref} className={styles.dialogContent}>
                  {/* Header */}
                  <div className={styles.dialogHeader}>
                    <h2 id={titleId} className={styles.dialogTitle}>
                      Sign In
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
                      key={step}
                      data-step={step}
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
                      <PresenceGuard>{renderState()}</PresenceGuard>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </>
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
        Sign In
      </button>

      {canPortal && createPortal(dialog, document.body)}
    </div>
  );
}
