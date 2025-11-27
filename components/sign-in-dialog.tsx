"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft, Mail, Phone, Fingerprint, Wallet } from "lucide-react";
import { useMeasure } from "@/lib/use-measure";
import styles from "./sign-in-dialog.module.css";

type DialogStep = "default" | "connect-wallet" | "email" | "phone" | "passkey";
type TabType = "email" | "phone" | "passkey";

const springTransition = {
  type: "spring" as const,
  duration: 0.4,
  bounce: 0,
};

const contentTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

// ─────────── Default State ───────────

interface DefaultStateProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onContinue: () => void;
  onConnectWallet: () => void;
}

function DefaultState({ activeTab, onTabChange, onContinue, onConnectWallet }: DefaultStateProps) {
  const tabs: { id: TabType; label: string }[] = [
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "passkey", label: "Passkey" },
  ];

  return (
    <div>
      {/* Tabs */}
      <div className={styles.tabsContainer}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
        <motion.div
          className={styles.tabIndicator}
          layoutId="sign-in-tab-indicator"
          style={{
            left: `calc(${tabs.findIndex((t) => t.id === activeTab) * 33.33}% + 4px)`,
            width: "calc(33.33% - 8px)",
          }}
          transition={springTransition}
        />
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "email" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Email address</label>
              <input
                type="email"
                className={styles.input}
                placeholder="you@example.com"
              />
            </div>
          )}
          {activeTab === "phone" && (
            <div className={styles.formGroup}>
              <label className={styles.label}>Phone number</label>
              <input
                type="tel"
                className={styles.input}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          )}
          {activeTab === "passkey" && (
            <div className={styles.formGroup}>
              <p style={{ fontSize: 14, color: "rgb(var(--text-weak))" }}>
                Use your device&apos;s biometric authentication or security key to sign in securely.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <button className={styles.submitButton} onClick={onContinue}>
        {activeTab === "passkey" ? "Authenticate with Passkey" : "Continue"}
      </button>

      {/* Divider */}
      <div className={styles.divider}>
        <div className={styles.dividerLine} />
        <span className={styles.dividerText}>or</span>
        <div className={styles.dividerLine} />
      </div>

      {/* Connect Wallet Button */}
      <button className={styles.optionButton} onClick={onConnectWallet}>
        <div className={styles.optionIcon}>
          <Wallet size={20} />
        </div>
        <div className={styles.optionContent}>
          <div className={styles.optionTitle}>Connect Wallet</div>
          <div className={styles.optionDescription}>MetaMask, WalletConnect & more</div>
        </div>
      </button>
    </div>
  );
}

// ─────────── Connect Wallet State ───────────

interface ConnectWalletStateProps {
  onBack: () => void;
}

function ConnectWalletState({ onBack }: ConnectWalletStateProps) {
  const wallets = [
    { id: "metamask", name: "MetaMask", className: styles.walletMetamask },
    { id: "walletconnect", name: "WalletConnect", className: styles.walletWalletConnect },
    { id: "coinbase", name: "Coinbase", className: styles.walletCoinbase },
    { id: "phantom", name: "Phantom", className: styles.walletPhantom },
  ];

  return (
    <div>
      <button className={styles.backButton} onClick={onBack}>
        <ArrowLeft size={16} />
        Back
      </button>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: "16px 0 12px", color: "rgb(var(--text-strong))" }}>
        Choose a wallet
      </h3>
      <div className={styles.walletGrid}>
        {wallets.map((wallet) => (
          <button key={wallet.id} className={styles.walletButton}>
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

// ─────────── Email State ───────────

interface EmailStateProps {
  onBack: () => void;
}

function EmailState({ onBack }: EmailStateProps) {
  return (
    <div>
      <button className={styles.backButton} onClick={onBack}>
        <ArrowLeft size={16} />
        Back
      </button>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: "16px 0 4px", color: "rgb(var(--text-strong))" }}>
        Check your email
      </h3>
      <p style={{ fontSize: 14, color: "rgb(var(--text-weak))", marginBottom: 16 }}>
        We sent a verification code to your email address.
      </p>
      <div className={styles.formGroup}>
        <label className={styles.label}>Verification code</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter 6-digit code"
          maxLength={6}
        />
      </div>
      <button className={styles.submitButton}>
        Verify
      </button>
    </div>
  );
}

// ─────────── Phone State ───────────

interface PhoneStateProps {
  onBack: () => void;
}

function PhoneState({ onBack }: PhoneStateProps) {
  return (
    <div>
      <button className={styles.backButton} onClick={onBack}>
        <ArrowLeft size={16} />
        Back
      </button>
      <h3 style={{ fontSize: 16, fontWeight: 600, margin: "16px 0 4px", color: "rgb(var(--text-strong))" }}>
        Verify your phone
      </h3>
      <p style={{ fontSize: 14, color: "rgb(var(--text-weak))", marginBottom: 16 }}>
        We sent a verification code via SMS.
      </p>
      <div className={styles.formGroup}>
        <label className={styles.label}>Verification code</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Enter 6-digit code"
          maxLength={6}
        />
      </div>
      <button className={styles.submitButton}>
        Verify
      </button>
    </div>
  );
}

// ─────────── Passkey State ───────────

interface PasskeyStateProps {
  onBack: () => void;
}

function PasskeyState({ onBack }: PasskeyStateProps) {
  return (
    <div>
      <button className={styles.backButton} onClick={onBack}>
        <ArrowLeft size={16} />
        Back
      </button>
      <div className={styles.passkeyContainer}>
        <div className={styles.passkeyWrapper}>
          <motion.div
            className={styles.passkeySpinner}
            animate={{ rotate: 360 }}
            transition={{
              duration: 1.25,
              repeat: Infinity,
              ease: "linear",
              repeatType: "loop",
            }}
          />
          <div className={styles.passkeyInner}>
            <div className={styles.passkeyIconWrapper}>
              <div className={styles.passkeyIconInner}>
                <Fingerprint size={32} />
              </div>
            </div>
          </div>
        </div>
        <p className={styles.passkeyText}>
          Waiting for authentication...
        </p>
      </div>
    </div>
  );
}

// ─────────── Main Dialog Component ───────────

export function SignInDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<DialogStep>("default");
  const [activeTab, setActiveTab] = useState<TabType>("email");
  const [ref, bounds] = useMeasure<HTMLDivElement>();

  // Reset to default state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setStep("default");
        setActiveTab("email");
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleContinue = () => {
    if (activeTab === "passkey") {
      setStep("passkey");
    } else if (activeTab === "email") {
      setStep("email");
    } else if (activeTab === "phone") {
      setStep("phone");
    }
  };

  const handleBack = () => {
    setStep("default");
  };

  const renderState = () => {
    switch (step) {
      case "default":
        return (
          <DefaultState
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onContinue={handleContinue}
            onConnectWallet={() => setStep("connect-wallet")}
          />
        );
      case "connect-wallet":
        return <ConnectWalletState onBack={handleBack} />;
      case "email":
        return <EmailState onBack={handleBack} />;
      case "phone":
        return <PhoneState onBack={handleBack} />;
      case "passkey":
        return <PasskeyState onBack={handleBack} />;
      default:
        return null;
    }
  };

  const content = (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
        transition={contentTransition}
      >
        {renderState()}
      </motion.div>
    </AnimatePresence>
  );

  // Default height for the initial state
  const defaultHeight = 420;

  return (
    <div className={styles.demoContainer}>
      <button
        className={styles.triggerButton}
        onClick={() => setIsOpen(true)}
      >
        Sign In
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className={styles.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className={styles.dialogWrapper}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.1 }}
            >
              <motion.div
                animate={{
                  height: step === "default" ? defaultHeight : bounds.height || defaultHeight,
                }}
                transition={springTransition}
                style={{ overflow: "hidden" }}
              >
                <div ref={ref} className={styles.dialogContent}>
                  {/* Header */}
                  <div className={styles.dialogHeader}>
                    <h2 className={styles.dialogTitle}>Sign In</h2>
                    <button
                      className={styles.closeButton}
                      onClick={() => setIsOpen(false)}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Content */}
                  {content}
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
