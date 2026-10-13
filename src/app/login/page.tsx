"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<"patient" | "staff">("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("sarah.c@example.com");
  const [password, setPassword] = useState("CareSync#2026");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Modals & alerts
  const [mrnModalOpen, setMrnModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setAuthSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1200);
    }, 1000);
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface min-h-screen flex flex-col antialiased">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] border-b border-outline-variant/30">
        <div className="h-16 md:h-20 max-w-[1280px] mx-auto px-margin flex items-center justify-between gap-gutter">
          <Link href="/" className="flex items-center gap-space-sm group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-on-primary shadow-xs transition-transform group-hover:scale-105">
              <span className="material-symbols-outlined text-[24px]">cardiology</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
                CareSync
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                Patient Portal
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-space-lg">
            <Link
              href="/"
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs px-space-sm"
            >
              Book Appointment
            </Link>
            <Link
              href="/"
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs px-space-sm"
            >
              Find a Doctor
            </Link>
            <a
              href="#"
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs px-space-sm"
            >
              Insurance Partners
            </a>
            <a
              href="#"
              className="font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface transition-colors py-space-xs px-space-sm"
            >
              Help
            </a>
          </nav>

          <div className="flex items-center gap-space-md">
            <div className="hidden sm:flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md py-space-xs px-space-sm">
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              <span>24/7 Triage</span>
            </div>
            <div className="flex items-center gap-space-xs bg-surface-container-low px-space-sm py-space-xs rounded-lg text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]">language</span>
              <span className="font-label-md text-label-md text-on-surface font-semibold">EN</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full pt-20 md:pt-24 bg-surface flex-1">
        <div className="flex flex-col w-full">
          <div className="w-full max-w-[1280px] mx-auto px-margin py-space-xl">
            {/* Top System Verification Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-space-lg">
              <div className="flex items-center gap-space-xs text-on-surface-variant font-label-md text-label-md">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
                <span className="tracking-wide">CLINICAL IDENTITY GATEWAY: OPERATIONAL</span>
                <span className="text-outline-variant">&bull;</span>
                <span>LATENCY 18ms</span>
              </div>
              <div className="hidden md:flex items-center gap-space-sm text-on-surface-variant font-label-md text-label-md">
                <span className="material-symbols-outlined text-[16px] text-primary">
                  security_update_good
                </span>
                <span>TLS 1.3 Strict Mutual Authentication Active</span>
              </div>
            </div>

            {/* Main Asymmetric Auth Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-stretch">
              {/* Left Column: Clinical Trust & Assurance Panel (7 Cols) */}
              <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-space-lg lg:p-space-xl flex flex-col justify-between relative overflow-hidden shadow-xs border border-outline-variant/20">
                {/* Subtle Ambient Background Accents */}
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-space-lg">
                  {/* Institutional Pill */}
                  <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container text-primary w-fit font-label-sm text-label-sm uppercase tracking-wider">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    <span>Accredited Clinical Coordination Portal</span>
                  </div>

                  {/* Main Title & Reassurance Hook */}
                  <div className="flex flex-col gap-space-xs">
                    <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
                      Precision Health at Your Fingertips.
                    </h1>
                    <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
                      Access real-time clinical notes, seamless specialist bookings, and protected health metrics under verified institutional protocols.
                    </p>
                  </div>

                  {/* Core Capability Bento-Rows */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md pt-space-xs">
                    <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-xs flex flex-col gap-space-xs">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">calendar_clock</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        24/7 Scheduling
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Instant confirmation for in-person or telehealth consultations without wait queues.
                      </p>
                    </div>

                    <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-xs flex flex-col gap-space-xs">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">forum</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Care Team Chat
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Direct encrypted messaging with Dr. Elizabeth Evans and your specialized care circle.
                      </p>
                    </div>

                    <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-xs flex flex-col gap-space-xs">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">biotech</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Instant Lab Results
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Diagnostic reports, vitals trends, and physician-reviewed interpretations released securely.
                      </p>
                    </div>

                    <div className="bg-surface-container-lowest p-space-md rounded-lg shadow-xs flex flex-col gap-space-xs">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">assured_workload</span>
                      </div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Coverage Verification
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        Real-time in-network eligibility checks and transparent pre-visit co-pay calculations.
                      </p>
                    </div>
                  </div>

                  {/* Physician In-Service Badge Feature with Generative Image */}
                  <div className="bg-surface-container-lowest rounded-lg p-space-md flex items-center gap-space-md shadow-xs">
                    <img
                      className="w-14 h-14 rounded-full object-cover shrink-0"
                      alt="Dr. Elizabeth Evans, MD"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuCgVAbCAWsjStNERnnovrvD0BlmFZNnw_yJhyqNruvz9-64TXvnU598UOYUhgAtgWPne9uBU52pAQ41CqNCM6GA5u3zc9tlEaQG8N_hm7rCTBJOZkYrS7SsFtGL9krttalZYcdxEp09g7WjgQzS4bLqQ5k5fo3aEPHP_1UxWoLiwQvXAJiSJRSVfY--aGGgoMUr5d6E0vQOH4MeF84lvI-h3FdSZWvPXnkCv0_sm-wR6183ojg_4EmN"
                    />
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-space-xs">
                        <span className="font-label-lg text-label-lg text-on-surface font-bold truncate">
                          Dr. Elizabeth Evans, MD, FACC
                        </span>
                        <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        Chief of Pediatrics &bull; On-Call Triage Available
                      </span>
                    </div>
                    <div className="ml-auto hidden sm:flex items-center gap-1.5 px-space-sm py-1 bg-surface-container rounded-full text-primary font-label-sm text-label-sm font-semibold">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                      <span>Available</span>
                    </div>
                  </div>
                </div>

                {/* Lower Section: Patient Voice & Security Credentials */}
                <div className="relative z-10 pt-space-lg mt-space-md flex flex-col gap-space-md">
                  {/* Testimonial Quote */}
                  <div className="bg-surface-container p-space-md rounded-lg flex items-start gap-space-md">
                    <span className="material-symbols-outlined text-primary text-[28px] shrink-0">
                      format_quote
                    </span>
                    <div className="flex flex-col gap-space-xs">
                      <p className="font-body-md text-body-md text-on-surface italic">
                        &ldquo;Managing pediatric visits and records has never been smoother. Booking with Dr. Evans took under a minute, and test results were shared within four hours.&rdquo;
                      </p>
                      <span className="font-label-sm text-label-sm text-on-surface-variant font-bold tracking-wide">
                        &mdash; SARAH C., REGISTERED PATIENT SINCE 2022
                      </span>
                    </div>
                  </div>

                  {/* Compliance Badges Ribbon */}
                  <div className="flex flex-wrap items-center gap-space-xs">
                    <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">policy</span>
                      <span>HIPAA Compliant</span>
                    </div>
                    <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">enhanced_encryption</span>
                      <span>256-Bit SSL/TLS</span>
                    </div>
                    <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">security</span>
                      <span>HITRUST CSF Certified</span>
                    </div>
                    <div className="flex items-center gap-space-xs px-space-sm py-1 rounded bg-surface-container-lowest text-on-surface-variant font-label-sm text-label-sm">
                      <span className="material-symbols-outlined text-[16px] text-primary">gavel</span>
                      <span>SOC2 Type II</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Login Container (5 Cols) */}
              <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-space-lg lg:p-space-xl flex flex-col justify-between shadow-md relative border border-outline-variant/30">
                <div className="flex flex-col gap-space-lg">
                  {/* Form Header */}
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
                      Secured Access
                    </span>
                    <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                      Welcome Back
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Sign in to manage your appointments, health records, and family coverage.
                    </p>
                  </div>

                  {/* Role Toggle Tabs */}
                  <div className="w-full bg-surface-container-low p-1 rounded-lg flex items-center">
                    <button
                      type="button"
                      onClick={() => setRole("patient")}
                      className={`flex-1 py-space-xs px-space-sm rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-space-xs cursor-pointer ${
                        role === "patient"
                          ? "bg-surface-container-lowest text-primary shadow-xs font-bold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">person</span>
                      <span>Patient Portal</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole("staff")}
                      className={`flex-1 py-space-xs px-space-sm rounded-lg font-label-md text-label-md transition-all flex items-center justify-center gap-space-xs cursor-pointer ${
                        role === "staff"
                          ? "bg-surface-container-lowest text-primary shadow-xs font-bold"
                          : "text-on-surface-variant hover:text-on-surface"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">medical_services</span>
                      <span>Doctor / Staff</span>
                    </button>
                  </div>

                  {/* Actual Login Form */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                    {/* Email / MRN Input */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="usernameInput">
                          {role === "patient"
                            ? "Email Address or Medical Record Number (MRN)"
                            : "Institutional Email or Provider NPI ID"}
                        </label>
                        {role === "patient" && (
                          <button
                            type="button"
                            onClick={() => setMrnModalOpen(true)}
                            className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
                          >
                            Where&apos;s my MRN?
                          </button>
                        )}
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
                          badge
                        </span>
                        <input
                          id="usernameInput"
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder={
                            role === "patient"
                              ? "e.g. sarah.chen@example.com or MRN-89240"
                              : "e.g. dr.evans@caresynchospital.org or NPI-1049281"
                          }
                          className="w-full h-12 pl-10 pr-4 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-colors"
                        />
                      </div>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {role === "patient"
                          ? "Format: Clinical email address or 8-digit MRN stamped on your wristband or bill."
                          : "Format: Hospital institutional credentials or 10-digit National Provider Identifier."}
                      </span>
                    </div>

                    {/* Password Input */}
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="passwordInput">
                          Password
                        </label>
                        <a href="#" className="font-label-sm text-label-sm text-primary hover:underline">
                          Forgot Password?
                        </a>
                      </div>
                      <div className="relative flex items-center">
                        <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[20px] pointer-events-none">
                          key
                        </span>
                        <input
                          id="passwordInput"
                          type={showPassword ? "text" : "password"}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your confidential password"
                          className="w-full h-12 pl-10 pr-11 bg-surface-container-low rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest border border-transparent focus:border-primary transition-colors"
                        />
                        <button
                          type="button"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          title={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute right-3 z-10 p-1 rounded-md text-on-surface-variant hover:text-primary hover:bg-surface-container focus:outline-none flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <span className="material-symbols-outlined text-[20px] select-none">
                            {showPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Checkbox Row */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="w-4 h-4 rounded text-primary bg-surface-container-low focus:ring-primary accent-primary cursor-pointer"
                        />
                        <span className="font-body-sm text-body-sm text-on-surface">
                          Remember this secure device for 30 days
                        </span>
                      </label>
                    </div>

                    {/* Primary Action Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || authSuccess}
                      className="w-full h-12 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-lg text-label-lg flex items-center justify-center gap-space-xs transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-80"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined text-[20px] animate-spin">
                            progress_activity
                          </span>
                          <span>Verifying Credentials...</span>
                        </>
                      ) : authSuccess ? (
                        <>
                          <span className="material-symbols-outlined text-[20px]">
                            check_circle
                          </span>
                          <span>Authenticated! Loading Portal...</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[20px]">lock_open</span>
                          <span>
                            {role === "patient" ? "Sign In to CareSync" : "Authenticate Clinical Staff"}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-space-sm my-space-xs">
                      <div className="h-px bg-surface-container-high flex-1" />
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                        or sign in with
                      </span>
                      <div className="h-px bg-surface-container-high flex-1" />
                    </div>

                    {/* Secondary SSO Options */}
                    <div className="grid grid-cols-2 gap-space-sm">
                      <button
                        type="button"
                        onClick={() =>
                          setModalMessage(
                            "Passkey verification initiated. Please authenticate using Windows Hello, Touch ID, or your physical FIDO2 key."
                          )
                        }
                        className="h-11 px-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] text-primary">
                          fingerprint
                        </span>
                        <span>Passkey / Face ID</span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setModalMessage(
                            "Redirecting to Epic MyChart Federated SSO Gateway with OAuth 2.0 authorization code flow..."
                          )
                        }
                        className="h-11 px-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-space-xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[18px] text-secondary">
                          domain_verification
                        </span>
                        <span>MyChart / Epic SSO</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Lower Section: Registration & Concierge Help */}
                <div className="pt-space-lg mt-space-lg flex flex-col gap-space-md bg-surface-container-low p-space-md rounded-lg">
                  <div className="flex items-center justify-between flex-wrap gap-space-xs">
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      New to CareSync Health System?
                    </span>
                    <div className="flex items-center gap-space-sm">
                      <a href="#" className="font-label-sm text-label-sm text-primary hover:underline font-bold">
                        Create Account
                      </a>
                      <span className="text-outline-variant">&bull;</span>
                      <a href="#" className="font-label-sm text-label-sm text-primary hover:underline">
                        Activate Invite Code
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-space-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">
                      verified_user
                    </span>
                    <p className="font-body-sm text-body-sm leading-relaxed">
                      Protected by HIPAA Security Rule (45 CFR § 164.312). Access strictly logged and audited for medical confidentiality.
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm bg-surface-container-lowest p-space-xs rounded px-space-sm">
                    <span>Trouble accessing records?</span>
                    <div className="flex items-center gap-1 text-primary font-bold">
                      <span className="material-symbols-outlined text-[14px]">call</span>
                      <span>(212) 555-0198</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Notification Banner (Bottom Overline) */}
            <div className="mt-space-lg bg-surface-container-lowest p-space-md rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-space-md shadow-xs border border-outline-variant/20">
              <div className="flex items-center gap-space-sm">
                <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary shrink-0">
                  <span className="material-symbols-outlined text-[18px]">info</span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Emergency health concern? CareSync Portal is for non-urgent clinical routing. Dial{" "}
                  <span className="font-bold text-error">911</span> or report immediately to the nearest Emergency Department.
                </p>
              </div>
              <div className="flex items-center gap-space-md shrink-0">
                <span className="font-label-sm text-label-sm text-on-surface-variant">Version 4.19.8-Prod</span>
                <button
                  type="button"
                  onClick={() =>
                    setModalMessage(
                      "Digital Care Concierge: Our staff is ready to assist with account recovery at (212) 555-0198."
                    )
                  }
                  className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
                >
                  Live Chat Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full bg-surface-container-low mt-auto py-space-xl shadow-[0_1px_8px_rgba(0,0,0,0.02)] border-t border-outline-variant/20">
        <div className="max-w-[1280px] mx-auto px-margin">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-space-lg pb-space-lg">
            <div className="flex flex-wrap items-center gap-space-md">
              <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[16px]">health_and_safety</span>
                <span>HITRUST Certified</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-space-lg">
              <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">
                Terms of Service
              </a>
              <a href="#" className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface transition-colors">
                Patient Rights &amp; Responsibilities
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md pt-space-md border-t border-outline-variant/10 text-xs text-on-surface-variant">
            <p>&copy; 2026 CareSync Health System, Inc. All rights reserved.</p>
            <p>Emergency Medical Condition? Please call 911 immediately.</p>
          </div>
        </div>
      </footer>

      {/* MRN Info Modal */}
      {mrnModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">badge</span>
                Medical Record Number (MRN)
              </h3>
              <button
                onClick={() => setMrnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                &times;
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Your Medical Record Number (MRN) is an 8-digit unique ID located on:
            </p>
            <ul className="text-xs text-slate-700 list-disc list-inside space-y-1.5 bg-slate-50 p-3 rounded-lg">
              <li>Your hospital or clinic discharge paperwork</li>
              <li>The top-right corner of physical billing statements</li>
              <li>Your patient wristband from any recent clinic visit</li>
            </ul>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setMrnModalOpen(false)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generic Notice Modal */}
      {modalMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">info</span>
              CareSync Gateway Notice
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{modalMessage}</p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setModalMessage(null)}
                className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold hover:bg-primary-container"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
