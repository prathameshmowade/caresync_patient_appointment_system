"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CLINICAL_SERVICES,
  calculateCompositeAvailability,
} from "@/lib/scheduling/compositeScheduler";
import { CompositeSlot } from "@/lib/types/scheduling";

interface DynamicDateTab {
  dateObj: Date;
  day: string; // "Mon"
  date: string; // "Nov 9"
  fullDate: string; // "Monday, Nov 9, 2026"
  monthName: string; // "Nov"
  monthFullName: string; // "November"
  dayNum: string; // "09"
  year: number;
  isoString: string; // "2026-11-09"
}

// Generate 5 workdays for a given Monday
function getWeekTabs(startDate: Date): DynamicDateTab[] {
  const tabs: DynamicDateTab[] = [];
  const base = new Date(startDate);
  // Normalize to Monday of that week
  const day = base.getDay();
  const diff = base.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(base);
  monday.setDate(diff);

  for (let i = 0; i < 5; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);

    const dayName = cur.toLocaleDateString("en-US", { weekday: "short" });
    const monthShort = cur.toLocaleDateString("en-US", { month: "short" });
    const monthFull = cur.toLocaleDateString("en-US", { month: "long" });
    const dayNum = String(cur.getDate()).padStart(2, "0");
    const year = cur.getFullYear();

    tabs.push({
      dateObj: cur,
      day: dayName,
      date: `${monthShort} ${cur.getDate()}`,
      fullDate: cur.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      monthName: monthShort,
      monthFullName: monthFull,
      dayNum,
      year,
      isoString: `${year}-${String(cur.getMonth() + 1).padStart(2, "0")}-${dayNum}`,
    });
  }
  return tabs;
}

export default function Home() {
  // Navigation / Stepper State: 1 = Date & Time, 2 = Patient Info, 3 = Confirmation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Date selection state (Defaults to Mon, Nov 9, 2026)
  const [anchorDate, setAnchorDate] = useState<Date>(() => new Date(2026, 10, 9));
  const [selectedDateObj, setSelectedDateObj] = useState<Date>(() => new Date(2026, 10, 9));
  const [selectedSlotTime, setSelectedSlotTime] = useState("10:00 AM");
  const [selectedServiceId, setSelectedServiceId] = useState("routine-consult");

  // Calendar Modal / Popover state for multi-month picker
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarViewMonth, setCalendarViewMonth] = useState<Date>(() => new Date(2026, 10, 1)); // Nov 2026

  // Resource dependency drawer
  const [showResourceInspector, setShowResourceInspector] = useState(false);

  // Live hold timer
  const [secondsLeft, setSecondsLeft] = useState(288); // 4m 48s

  // Step 2 Form States
  const [bookingRecipient, setBookingRecipient] = useState<"self" | "other">("self");
  const [patientFirstName, setPatientFirstName] = useState("Sarah");
  const [patientLastName, setPatientLastName] = useState("Chen");
  const [patientDob, setPatientDob] = useState("04/18/1994");
  const [patientGender, setPatientGender] = useState("female");
  const [patientPhone, setPatientPhone] = useState("(555) 234-5678");
  const [patientEmail, setPatientEmail] = useState("sarah.chen@example.com");
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [visitReason, setVisitReason] = useState("Annual Well-Child Checkup / General Consultation");
  const [symptomDesc, setSymptomDesc] = useState("Routine checkup and immunizations review before the upcoming school term.");
  const [emergName, setEmergName] = useState("");
  const [emergPhone, setEmergPhone] = useState("");

  // Step 3 UI States
  const [bookingRefCode] = useState("CS-892401");
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [showCalendarMenu, setShowCalendarMenu] = useState(false);

  // Hold Timer tick
  useEffect(() => {
    if (secondsLeft <= 0) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsLeft]);

  const formattedTimer = useMemo(() => {
    const m = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const s = String(secondsLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [secondsLeft]);

  // Dynamic Week Tabs around anchorDate
  const currentWeekTabs = useMemo(() => {
    return getWeekTabs(anchorDate);
  }, [anchorDate]);

  // Selected date info
  const selectedDateTab = useMemo<DynamicDateTab>(() => {
    const monthShort = selectedDateObj.toLocaleDateString("en-US", { month: "short" });
    const monthFull = selectedDateObj.toLocaleDateString("en-US", { month: "long" });
    const dayNum = String(selectedDateObj.getDate()).padStart(2, "0");
    const year = selectedDateObj.getFullYear();
    return {
      dateObj: selectedDateObj,
      day: selectedDateObj.toLocaleDateString("en-US", { weekday: "short" }),
      date: `${monthShort} ${selectedDateObj.getDate()}`,
      fullDate: selectedDateObj.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      monthName: monthShort,
      monthFullName: monthFull,
      dayNum,
      year,
      isoString: `${year}-${String(selectedDateObj.getMonth() + 1).padStart(2, "0")}-${dayNum}`,
    };
  }, [selectedDateObj]);

  const selectedService = useMemo(
    () => CLINICAL_SERVICES.find((s) => s.id === selectedServiceId) || CLINICAL_SERVICES[0],
    [selectedServiceId]
  );

  // Calculate composite slots for the selected date
  const computedSlots: CompositeSlot[] = useMemo(() => {
    return calculateCompositeAvailability(selectedDateTab.date, selectedServiceId);
  }, [selectedDateTab.date, selectedServiceId]);

  const morningSlots = computedSlots.filter((s) => s.timePeriod === "MORNING");
  const afternoonSlots = computedSlots.filter((s) => s.timePeriod === "AFTERNOON");

  // Selected slot allocation
  const currentAllocation = useMemo(() => {
    const active = computedSlots.find((s) => s.time === selectedSlotTime);
    return active?.allocatedResources;
  }, [computedSlots, selectedSlotTime]);

  // Handlers for Week & Month Navigation
  const handlePrevWeek = () => {
    const prev = new Date(anchorDate);
    prev.setDate(prev.getDate() - 7);
    setAnchorDate(prev);
    // Select the Monday of that week
    const tabs = getWeekTabs(prev);
    setSelectedDateObj(tabs[0].dateObj);
  };

  const handleNextWeek = () => {
    const next = new Date(anchorDate);
    next.setDate(next.getDate() + 7);
    setAnchorDate(next);
    const tabs = getWeekTabs(next);
    setSelectedDateObj(tabs[0].dateObj);
  };

  const handleSelectMonth = (year: number, monthZeroIndex: number) => {
    // 1st workday of that month
    const target = new Date(year, monthZeroIndex, 1);
    // If weekend, move to Monday
    if (target.getDay() === 0) target.setDate(target.getDate() + 1);
    if (target.getDay() === 6) target.setDate(target.getDate() + 2);

    setAnchorDate(target);
    setSelectedDateObj(target);
    setShowCalendarModal(false);
  };

  const handleSelectSpecificDate = (date: Date) => {
    setSelectedDateObj(date);
    setAnchorDate(date);
    setShowCalendarModal(false);
  };

  // Switch Recipient (Myself vs Dependent Child)
  const handleRecipientChange = (type: "self" | "other") => {
    setBookingRecipient(type);
    if (type === "self") {
      setPatientFirstName("Sarah");
      setPatientLastName("Chen");
      setPatientDob("04/18/1994");
      setPatientGender("female");
      setVisitReason("Annual Well-Child Checkup / General Consultation");
    } else {
      setPatientFirstName("Leo");
      setPatientLastName("Chen");
      setPatientDob("09/12/2018");
      setPatientGender("male");
      setVisitReason("Pediatric Wellness & Immunization Review");
    }
  };

  // Copy helpers
  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingRefCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText("240 Eastside Ave, Suite 410, New York, NY 10028");
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  // Calendar export helper
  const handleGoogleCalendar = () => {
    const title = encodeURIComponent(`Pediatric Consultation - Dr. Elizabeth Evans`);
    const details = encodeURIComponent(
      `Appointment with Dr. Elizabeth Evans, MD at Eastside Pediatrics for ${patientFirstName} ${patientLastName}. Service: ${selectedService.name}. Booking ID: ${bookingRefCode}`
    );
    const loc = encodeURIComponent("Eastside Pediatrics, 240 Eastside Ave, Ste 410, New York, NY");
    // Format YYYYMMDDTHHmmssZ
    const y = selectedDateObj.getFullYear();
    const m = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDateObj.getDate()).padStart(2, "0");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${details}&location=${loc}&dates=${y}${m}${d}T100000Z/${y}${m}${d}T104500Z`;
    window.open(url, "_blank");
  };

  const handleDownloadIcs = () => {
    const y = selectedDateObj.getFullYear();
    const m = String(selectedDateObj.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDateObj.getDate()).padStart(2, "0");
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//CareSync Healthcare//Appointment Schedule//EN
BEGIN:VEVENT
UID:${bookingRefCode}@caresync.health
DTSTAMP:${y}${m}${d}T100000Z
DTSTART:${y}${m}${d}T100000Z
DTEND:${y}${m}${d}T104500Z
SUMMARY:Dr. Elizabeth Evans - Pediatric Consultation
DESCRIPTION:Patient: ${patientFirstName} ${patientLastName}. Service: ${selectedService.name}. Ref: ${bookingRefCode}
LOCATION:Eastside Pediatrics, 240 Eastside Ave, Ste 410, New York, NY
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", `CareSync-Appointment-${bookingRefCode}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build calendar matrix for Calendar Modal
  const calendarDays = useMemo(() => {
    const year = calendarViewMonth.getFullYear();
    const month = calendarViewMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0 is Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: Array<{ date: Date | null; isCurrentMonth: boolean }> = [];
    // Padding before 1st of month (starting Monday)
    const pad = (firstDay + 6) % 7;
    for (let i = 0; i < pad; i++) {
      days.push({ date: null, isCurrentMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({ date: new Date(year, month, d), isCurrentMonth: true });
    }
    return days;
  }, [calendarViewMonth]);

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* 1. Header & Global Navigation */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-gutter">
          <Link href="/" className="flex items-center gap-space-sm hover:opacity-95 transition-opacity">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[22px]">ecg_heart</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold leading-none">
                CareSync
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider mt-0.5">
                Composite Resource Scheduling
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-space-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className={`px-space-md py-space-sm rounded-lg font-label-lg transition-colors ${
                currentStep === 1
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              Find a Doctor
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className={`px-space-md py-space-sm rounded-lg font-label-lg transition-colors ${
                currentStep === 3
                  ? "bg-surface-container-high text-on-surface"
                  : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              }`}
            >
              My Appointments
            </button>
            <a
              href="#"
              className="px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded-lg"
            >
              Insurance Partners
            </a>
            <a
              href="#"
              className="px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded-lg"
            >
              Help
            </a>
          </nav>

          <div className="flex items-center gap-space-md">
            <button
              onClick={() => setShowResourceInspector(!showResourceInspector)}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">hub</span>
              <span>Resource Dependency Graph</span>
            </button>

            <Link
              href="/login"
              className="flex items-center gap-space-sm pl-space-sm group cursor-pointer hover:opacity-90 transition-opacity"
              title="Open Patient Portal Login"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center group-hover:ring-2 ring-primary/40 transition-all">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="font-label-lg text-label-lg text-on-surface leading-none font-semibold">
                  Sarah C.
                </span>
                <span className="text-[10px] text-primary font-medium leading-none mt-0.5">
                  Sign In / Portal &rarr;
                </span>
              </div>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 pt-16 bg-surface">
        <div className="max-w-7xl mx-auto px-margin py-margin">
          <div className="flex flex-col w-full">
            {/* 2. Interactive Stepper Wizard */}
            <div className="w-full bg-surface-container-lowest shadow-xs rounded-xl p-space-sm mb-space-md">
              <div className="flex items-center justify-between gap-space-sm px-space-sm py-space-xs">
                {/* Step 1: Date & Time */}
                <button
                  onClick={() => setCurrentStep(1)}
                  className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-all text-left ${
                    currentStep === 1
                      ? "bg-primary-container text-on-primary shadow-xs"
                      : currentStep > 1
                      ? "bg-primary-fixed/30 text-on-primary-fixed hover:bg-primary-fixed/50"
                      : "text-on-surface-variant opacity-75"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-label-md text-label-md flex items-center justify-center font-bold ${
                      currentStep === 1
                        ? "bg-surface-container-lowest text-primary"
                        : currentStep > 1
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {currentStep > 1 ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      "1"
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                      Step 1
                    </span>
                    <span className="font-label-lg text-label-lg font-semibold tracking-tight">
                      Date &amp; Time
                    </span>
                  </div>
                </button>

                <div
                  className={`flex-1 h-0.5 rounded-full mx-space-xs transition-colors ${
                    currentStep >= 2 ? "bg-primary" : "bg-surface-container-highest"
                  }`}
                />

                {/* Step 2: Patient Info */}
                <button
                  onClick={() => setCurrentStep(2)}
                  className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-all text-left ${
                    currentStep === 2
                      ? "bg-primary-container text-on-primary shadow-xs"
                      : currentStep > 2
                      ? "bg-primary-fixed/30 text-on-primary-fixed hover:bg-primary-fixed/50"
                      : "text-on-surface-variant opacity-75 hover:bg-surface-container"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-label-md text-label-md flex items-center justify-center font-semibold ${
                      currentStep === 2
                        ? "bg-surface-container-lowest text-primary font-bold"
                        : currentStep > 2
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {currentStep > 2 ? (
                      <span className="material-symbols-outlined text-[16px]">check</span>
                    ) : (
                      "2"
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                      Step 2
                    </span>
                    <span className="font-label-lg text-label-lg font-semibold">
                      Patient Info
                    </span>
                  </div>
                </button>

                <div
                  className={`flex-1 h-0.5 rounded-full mx-space-xs transition-colors ${
                    currentStep === 3 ? "bg-primary" : "bg-surface-container-highest"
                  }`}
                />

                {/* Step 3: Confirmation */}
                <button
                  onClick={() => setCurrentStep(3)}
                  className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-all text-left ${
                    currentStep === 3
                      ? "bg-primary-container text-on-primary shadow-xs"
                      : "text-on-surface-variant opacity-60 hover:opacity-90 hover:bg-surface-container"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-label-md text-label-md flex items-center justify-center font-semibold ${
                      currentStep === 3
                        ? "bg-surface-container-lowest text-primary font-bold"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {currentStep === 3 ? (
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                    ) : (
                      "3"
                    )}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">
                      Step 3
                    </span>
                    <span className="font-label-lg text-label-lg font-semibold">
                      Confirmation
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. Banner (Timer Hold on Steps 1 & 2, Reassurance Banner on Step 3) */}
            {currentStep < 3 ? (
              <div className="w-full bg-tertiary-fixed/30 border border-tertiary/20 rounded-xl p-space-md mb-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-space-md">
                  <div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary shrink-0">
                    <span className="material-symbols-outlined text-[24px]">lock_clock</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-space-xs">
                      <span className="font-label-lg text-label-lg font-bold text-on-tertiary-fixed">
                        Composite Resource Lock Active
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-ping" />
                      <span className="ml-1 text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Provider &cap; Room &cap; Equipment Locked
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      Temporarily securing <strong>Dr. Evans</strong> +{" "}
                      <strong>{currentAllocation?.room.name || "Exam Room 3A"}</strong> +{" "}
                      <strong>{currentAllocation?.equipment[0]?.name || "Vitals Station"}</strong> to
                      guarantee room availability upon arrival.
                    </p>
                  </div>
                </div>

                {/* Countdown Timer Pill */}
                <div className="flex items-center gap-space-xs bg-surface-container-lowest px-space-md py-space-xs rounded-full shadow-xs shrink-0 self-start sm:self-auto border border-outline-variant/30">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">timer</span>
                  <span className="font-headline-sm text-headline-sm text-tertiary font-bold tracking-wider tabular-nums">
                    {formattedTimer}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                    remains
                  </span>
                </div>
              </div>
            ) : (
              <div className="w-full bg-primary-fixed/30 border border-primary/20 rounded-xl p-space-md mb-space-lg shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                <div className="flex items-start sm:items-center gap-space-md">
                  <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0 shadow-sm">
                    <span className="material-symbols-outlined text-[22px]">mark_email_read</span>
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-headline-sm text-headline-sm text-on-primary-fixed font-bold">
                        Appointment Confirmed!
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-lowest font-mono text-label-md text-primary font-bold shadow-xs">
                        <span className="material-symbols-outlined text-[14px]">tag</span>
                        {bookingRefCode}
                      </span>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                      Official verification &amp; preparation instructions dispatched to{" "}
                      <span className="font-semibold text-on-surface">{patientEmail}</span> and via SMS
                      to <span className="font-semibold text-on-surface">{patientPhone}</span>.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-space-sm self-end md:self-auto shrink-0">
                  <button
                    onClick={handleCopyCode}
                    className="px-space-md py-space-xs rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all flex items-center gap-1.5 shadow-xs border border-outline-variant/20"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedCode ? "check" : "content_copy"}
                    </span>
                    <span>{copiedCode ? "Copied!" : "Copy Code"}</span>
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Receipt</span>
                  </button>
                </div>
              </div>
            )}

            {/* Resource Dependency Inspector Drawer (Collapsible) */}
            {showResourceInspector && (
              <div className="mb-space-lg rounded-xl border border-primary/20 bg-primary-container/5 p-4 animate-fade-in shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-primary/10">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">dataset</span>
                    <h3 className="font-bold text-sm text-primary">
                      Multi-Resource Dependency Graph &bull; Eastside Pediatrics Clinic Floor
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowResourceInspector(false)}
                    className="text-xs text-primary/70 hover:text-primary font-semibold"
                  >
                    Close &times;
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-outline-variant/30">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Physician Availability
                    </p>
                    <p className="text-slate-500 mt-1">Dr. Elizabeth Evans, MD</p>
                    <p className="text-emerald-700 font-semibold mt-0.5">Free at {selectedSlotTime}</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-outline-variant/30">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Exam Rooms (3 Standard / 1 Procedure)
                    </p>
                    <p className="text-slate-500 mt-1">{currentAllocation?.room.name || "Suite 3A"} Assigned</p>
                    <p className="text-emerald-700 font-semibold mt-0.5">Category {selectedService.requiredRoomCategory} Verified</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-outline-variant/30">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Equipment &amp; Staff Mutex
                    </p>
                    <p className="text-slate-500 mt-1">
                      {currentAllocation?.equipment.map((e) => e.name).join(", ") || "Vitals Station"}
                    </p>
                    <p className="text-emerald-700 font-semibold mt-0.5">MA: {currentAllocation?.staff?.name || "MA Jenkins"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                STEP 1: DATE & TIME SELECTION (WITH MULTI-MONTH NAVIGATION & CALENDAR PICKER)
                ========================================================================= */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Left Column: Doctor Profile Card (3 cols) */}
                <div className="lg:col-span-3">
                  <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-md flex flex-col gap-space-md">
                    <div className="flex items-start gap-space-sm">
                      <div className="relative">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAs3KHrIT0IgEz-GAhNzRAcEgUt0RSoVwBXMuvQ53zDH5LFO9elgOUEH7gELGUuvkvTr17THAPSrxXPj8QXBhNxWsVdgxskFybcLIJvT6g4bxQ3NlU_SY5PHUKr_FlyEWEDz0RO6yHwly0IkABchXpzUr71l-LgI8gIIrp5L3JAVnz47_JzEA_WYZMZSp__xgXhk4YNByOj4Fpy4XBIcr8-c3eAmcQC3XesDONhRbRNlLr3qW61msiH"
                          alt="Dr. Elizabeth Evans"
                          className="w-16 h-16 rounded-xl object-cover shadow-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[11px] shadow-xs">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                          Pediatrics
                        </span>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                          Dr. Elizabeth Evans, MD
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                          Family &amp; Pediatric Care
                        </p>
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-tertiary text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-label-lg text-label-lg font-bold text-on-surface">4.9</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">(182 reviews)</span>
                      </div>
                      <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
                        In-Network
                      </span>
                    </div>

                    <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                      <div className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                          check_circle
                        </span>
                        <span>Accepting new pediatric patients</span>
                      </div>
                      <div className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">
                          translate
                        </span>
                        <span>Languages: English, Spanish (Clinical)</span>
                      </div>
                      <div className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">
                          location_on
                        </span>
                        <span className="text-on-surface">
                          Eastside Pediatrics, Ste 410<br />
                          <span className="text-outline">240 Eastside Ave, New York, NY</span>
                        </span>
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-space-sm space-y-1">
                      <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm font-bold">
                        <span className="material-symbols-outlined text-[18px]">verified_user</span>
                        <span>Mount Sinai Affiliated Network</span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant leading-relaxed">
                        HIPAA Level-3 certified electronic health record syncing and real-time room locking.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Middle Column: Date & Slot Picker with Multi-Month Navigation (6 cols) */}
                <div className="lg:col-span-6 flex flex-col gap-space-md">
                  {/* Service Selection Card */}
                  <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-md">
                    <div className="flex items-center justify-between mb-space-sm">
                      <div className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[20px]">medical_services</span>
                        <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          Select Clinical Procedure
                        </h3>
                      </div>
                      <span className="text-xs text-outline font-semibold">Step 1 of 3</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {CLINICAL_SERVICES.map((srv) => {
                        const isSelected = srv.id === selectedServiceId;
                        return (
                          <button
                            key={srv.id}
                            onClick={() => setSelectedServiceId(srv.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? "border-primary bg-primary-fixed/20 shadow-xs"
                                : "border-outline-variant/40 bg-surface-container-low hover:border-outline"
                            }`}
                          >
                            <div>
                              <p className={`font-bold text-xs ${isSelected ? "text-primary" : "text-on-surface"}`}>
                                {srv.name}
                              </p>
                              <p className="text-[11px] text-on-surface-variant mt-1 line-clamp-2">
                                {srv.description}
                              </p>
                            </div>
                            <div className="mt-2 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px]">
                              <span className="text-outline font-medium">{srv.durationMinutes} min</span>
                              <span className="font-bold text-primary">₹{srv.copayAmount.toLocaleString('en-IN')}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multi-Month Date Strip & Calendar Picker Card */}
                  <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-md flex flex-col gap-space-md">
                    {/* Month Header & Pagination */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-outline-variant/20">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                            {selectedDateTab.monthFullName} {selectedDateTab.year}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                            Live Schedule
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant">
                          Selected: <span className="font-semibold text-on-surface">{selectedDateTab.fullDate}</span>
                        </p>
                      </div>

                      {/* Quick Navigation Controls */}
                      <div className="flex items-center gap-1.5 self-start sm:self-auto">
                        <button
                          onClick={handlePrevWeek}
                          className="h-8 px-2.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-on-surface text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Previous Week"
                        >
                          <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                          <span className="hidden sm:inline">Prev</span>
                        </button>
                        <button
                          onClick={handleNextWeek}
                          className="h-8 px-2.5 rounded-lg border border-outline-variant/40 hover:bg-surface-container text-on-surface text-xs font-medium flex items-center gap-1 transition-colors"
                          title="Next Week"
                        >
                          <span className="hidden sm:inline">Next</span>
                          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                        <button
                          onClick={() => {
                            setCalendarViewMonth(selectedDateObj);
                            setShowCalendarModal(true);
                          }}
                          className="h-8 px-3 rounded-lg bg-primary-container text-on-primary hover:bg-primary text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                          title="Pick date from multi-month calendar"
                        >
                          <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                          <span>Pick Month / Date</span>
                        </button>
                      </div>
                    </div>

                    {/* Quick Month Jump Chips */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
                      <span className="text-outline uppercase text-[10px] font-bold tracking-wider shrink-0">
                        Quick Jump:
                      </span>
                      {[
                        { label: "Nov 2026", y: 2026, m: 10 },
                        { label: "Dec 2026", y: 2026, m: 11 },
                        { label: "Jan 2027", y: 2027, m: 0 },
                        { label: "Feb 2027", y: 2027, m: 1 },
                      ].map((chip) => {
                        const isCurrentMonth =
                          selectedDateObj.getFullYear() === chip.y &&
                          selectedDateObj.getMonth() === chip.m;
                        return (
                          <button
                            key={chip.label}
                            onClick={() => handleSelectMonth(chip.y, chip.m)}
                            className={`px-3 py-1 rounded-full shrink-0 font-medium transition-all ${
                              isCurrentMonth
                                ? "bg-primary text-on-primary font-bold shadow-xs"
                                : "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            {chip.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Week Date Tabs Strip */}
                    <div className="grid grid-cols-5 gap-2">
                      {currentWeekTabs.map((tab) => {
                        const isSelected = tab.isoString === selectedDateTab.isoString;
                        return (
                          <button
                            key={tab.isoString}
                            onClick={() => setSelectedDateObj(tab.dateObj)}
                            className={`flex flex-col items-center justify-center py-2.5 px-1 rounded-xl transition-all cursor-pointer ${
                              isSelected
                                ? "bg-primary-container text-on-primary shadow-sm ring-2 ring-primary/30"
                                : "bg-surface-container-low hover:bg-surface-container text-on-surface border border-outline-variant/30"
                            }`}
                          >
                            <span className="text-[11px] font-semibold uppercase tracking-wider opacity-85">
                              {tab.day}
                            </span>
                            <span className="font-headline-sm text-headline-sm font-extrabold leading-tight mt-0.5">
                              {tab.dayNum}
                            </span>
                            <span
                              className={`text-[10px] mt-1 px-1.5 py-0.2 rounded-full font-bold ${
                                isSelected
                                  ? "bg-surface-container-lowest text-primary"
                                  : "text-primary bg-primary/10"
                              }`}
                            >
                              Available
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Time Slot Picker */}
                    <div className="space-y-space-md pt-2">
                      {/* Morning Slots */}
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          <span className="material-symbols-outlined text-[16px] text-amber-500">wb_sunny</span>
                          <span>Morning Slots (09:00 AM – 12:00 PM)</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {morningSlots.map((slot) => {
                            const isSelected = slot.time === selectedSlotTime;
                            return (
                              <button
                                key={slot.time}
                                disabled={!slot.isAvailable}
                                onClick={() => setSelectedSlotTime(slot.time)}
                                title={slot.isAvailable ? "Click to lock this slot" : slot.bottleneckMessage}
                                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all relative flex flex-col items-center justify-center ${
                                  !slot.isAvailable
                                    ? "bg-surface-container-high text-outline cursor-not-allowed opacity-50 line-through"
                                    : isSelected
                                    ? "bg-primary text-on-primary shadow-sm ring-2 ring-primary/40 scale-[1.02]"
                                    : "bg-surface-container hover:bg-primary-fixed/30 text-on-surface border border-outline-variant/30 cursor-pointer"
                                }`}
                              >
                                <span>{slot.time}</span>
                                {slot.isAvailable && isSelected && (
                                  <span className="text-[9px] font-normal leading-none mt-0.5 opacity-90">
                                    Locked
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Afternoon Slots */}
                      <div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                          <span className="material-symbols-outlined text-[16px] text-orange-500">wb_twilight</span>
                          <span>Afternoon Slots (01:30 PM – 04:30 PM)</span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {afternoonSlots.map((slot) => {
                            const isSelected = slot.time === selectedSlotTime;
                            return (
                              <button
                                key={slot.time}
                                disabled={!slot.isAvailable}
                                onClick={() => setSelectedSlotTime(slot.time)}
                                title={slot.isAvailable ? "Click to lock this slot" : slot.bottleneckMessage}
                                className={`py-2 px-1 rounded-lg text-xs font-bold transition-all relative flex flex-col items-center justify-center ${
                                  !slot.isAvailable
                                    ? "bg-surface-container-high text-outline cursor-not-allowed opacity-50 line-through"
                                    : isSelected
                                    ? "bg-primary text-on-primary shadow-sm ring-2 ring-primary/40 scale-[1.02]"
                                    : "bg-surface-container hover:bg-primary-fixed/30 text-on-surface border border-outline-variant/30 cursor-pointer"
                                }`}
                              >
                                <span>{slot.time}</span>
                                {slot.isAvailable && isSelected && (
                                  <span className="text-[9px] font-normal leading-none mt-0.5 opacity-90">
                                    Locked
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Step 1 Booking Summary (3 cols) */}
                <div className="lg:col-span-3 sticky top-20">
                  <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/20 p-space-md flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                      <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        Booking Summary
                      </h3>
                      <span className="bg-surface-container text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                        Step 1 of 3
                      </span>
                    </div>

                    <div className="space-y-space-sm font-body-sm text-body-sm">
                      {/* Selected Slot Metadata */}
                      <div className="flex items-start gap-space-xs text-on-surface">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                          calendar_month
                        </span>
                        <div>
                          <span className="font-bold block">{selectedDateTab.fullDate}</span>
                          <span className="text-on-surface-variant font-medium">
                            {selectedSlotTime} &bull; {selectedService.durationMinutes} min
                          </span>
                        </div>
                      </div>

                      {/* Room & Resource Mutex Status */}
                      <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs flex flex-col gap-1">
                        <div className="flex items-center gap-1 font-bold text-emerald-800">
                          <span className="material-symbols-outlined text-[16px]">verified</span>
                          <span>Composite Mutex Reserved</span>
                        </div>
                        <p className="text-emerald-700 text-[11px]">
                          <strong>Room:</strong> {currentAllocation?.room.name || "Exam Room 3A"} <br />
                          <strong>Equipment:</strong> {currentAllocation?.equipment[0]?.name || "Vitals Hub A"} <br />
                          <strong>Staff:</strong> {currentAllocation?.staff?.name || "MA Jenkins"}
                        </p>
                      </div>

                      {/* Location */}
                      <div className="flex items-start gap-space-xs text-on-surface">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
                          apartment
                        </span>
                        <div>
                          <span className="font-bold block">Eastside Pediatrics</span>
                          <span className="text-on-surface-variant">240 Eastside Ave, Ste 410, NY</span>
                        </div>
                      </div>
                    </div>

                    {/* Insurance & Copay Card (In Rupees ₹) */}
                    <div className="bg-surface-container-low rounded-xl p-space-md space-y-2">
                      <div className="flex items-center justify-between text-body-sm font-body-sm">
                        <span className="text-on-surface-variant">Insurance Carrier:</span>
                        <span className="font-bold text-on-surface">Aetna Choice POS II</span>
                      </div>
                      <div className="flex items-center justify-between text-body-sm font-body-sm">
                        <span className="text-on-surface-variant">Service Rate:</span>
                        <span className="text-on-surface line-through font-mono">₹1,500.00</span>
                      </div>
                      <div className="flex items-center justify-between font-label-lg text-label-lg pt-1 border-t border-outline-variant/30 text-on-surface">
                        <span className="font-bold">Estimated Copay:</span>
                        <span className="text-primary font-headline-sm text-headline-sm font-bold">
                          ₹{selectedService.copayAmount.toLocaleString('en-IN')}.00
                        </span>
                      </div>
                      <p className="text-[11px] text-on-surface-variant pt-1 leading-tight">
                        No payment required right now. Copay is verified and collected upon clinic check-in.
                      </p>
                    </div>

                    {/* Advance to Step 2 */}
                    <div className="flex flex-col gap-2 pt-1">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-lg flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <span>Continue to Patient Info (Step 2)</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =========================================================================
                STEP 2: PATIENT INFO & LEGAL DEMOGRAPHICS FORM
                ========================================================================= */}
            {currentStep === 2 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Left Column: Doctor Card & Selected Slot Preview (3 cols) */}
                <aside className="lg:col-span-3 space-y-space-md">
                  <div className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-md flex flex-col gap-space-md">
                    <div className="flex items-start gap-space-md">
                      <div className="relative shrink-0">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuAs3KHrIT0IgEz-GAhNzRAcEgUt0RSoVwBXMuvQ53zDH5LFO9elgOUEH7gELGUuvkvTr17THAPSrxXPj8QXBhNxWsVdgxskFybcLIJvT6g4bxQ3NlU_SY5PHUKr_FlyEWEDz0RO6yHwly0IkABchXpzUr71l-LgI8gIIrp5L3JAVnz47_JzEA_WYZMZSp__xgXhk4YNByOj4Fpy4XBIcr8-c3eAmcQC3XesDONhRbRNlLr3qW61msiH"
                          alt="Dr. Elizabeth Evans"
                          className="w-16 h-16 rounded-xl object-cover shadow-xs"
                        />
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-container text-on-primary flex items-center justify-center text-[11px]">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
                          Pediatrics
                        </span>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                          Dr. Elizabeth Evans, MD
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">Family &amp; Pediatric Care</p>
                      </div>
                    </div>

                    <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <span
                          className="material-symbols-outlined text-tertiary text-[18px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          star
                        </span>
                        <span className="font-label-lg text-label-lg text-on-surface font-bold">4.9</span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">(182 reviews)</span>
                      </div>
                      <span className="bg-primary/10 text-primary font-label-sm text-label-sm px-2 py-0.5 rounded-full font-bold">
                        In-Network
                      </span>
                    </div>

                    <div className="space-y-space-xs font-body-sm text-body-sm text-on-surface-variant pt-space-xs">
                      <div className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">check_circle</span>
                        <span>Accepting new pediatric patients</span>
                      </div>
                      <div className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">translate</span>
                        <span>Languages: English, Spanish (Clinical)</span>
                      </div>
                      <div className="flex items-start gap-space-xs">
                        <span className="material-symbols-outlined text-outline text-[18px] shrink-0 mt-0.5">location_on</span>
                        <span className="text-on-surface">Eastside Pediatrics, Ste 410<br /><span className="text-outline">240 Eastside Ave, New York, NY</span></span>
                      </div>
                    </div>

                    {/* Selected Slot Recap */}
                    <div className="bg-surface-container rounded-lg p-space-sm flex flex-col gap-1">
                      <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">event_seat</span>
                        Selected Appointment
                      </span>
                      <span className="font-label-lg text-label-lg text-on-surface font-bold">
                        {selectedDateTab.fullDate} &bull; {selectedSlotTime}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {selectedService.name} ({selectedService.durationMinutes} min)
                      </span>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="font-label-sm text-label-sm text-primary hover:text-primary-container font-semibold mt-1 inline-flex items-center gap-0.5 text-left cursor-pointer"
                      >
                        Change slot <span className="material-symbols-outlined text-[14px]">edit_calendar</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-xs">
                    <div className="flex items-center gap-space-xs text-primary font-label-lg text-label-lg font-bold">
                      <span className="material-symbols-outlined text-[20px]">verified_user</span>
                      <span>Accredited Provider</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Mount Sinai Affiliated Network. HIPAA Level-3 certified digital charting and records sync.
                    </p>
                  </div>
                </aside>

                {/* Center Column: Patient Info Form (6 cols) */}
                <main className="lg:col-span-6 space-y-space-md">
                  {/* Recipient Segmented Selector Panel */}
                  <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-lg space-y-space-md">
                    <div className="flex flex-col gap-1">
                      <h1 className="font-headline-md text-headline-md text-on-surface font-bold">Patient Details</h1>
                      <p className="font-body-md text-body-md text-on-surface-variant">Who is this clinical consultation for?</p>
                    </div>

                    {/* Toggle / Segmented Radio Buttons */}
                    <div className="grid grid-cols-2 gap-space-sm bg-surface-container-low p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleRecipientChange("self")}
                        className={`flex items-center justify-center gap-space-xs py-2.5 px-space-md rounded-lg cursor-pointer font-label-lg text-label-lg font-bold transition-all ${
                          bookingRecipient === "self"
                            ? "bg-surface-container-lowest text-primary shadow-sm"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">person</span>
                        <span>Myself (Sarah C.)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRecipientChange("other")}
                        className={`flex items-center justify-center gap-space-xs py-2.5 px-space-md rounded-lg cursor-pointer font-label-lg text-label-lg transition-all ${
                          bookingRecipient === "other"
                            ? "bg-surface-container-lowest text-primary font-bold shadow-sm"
                            : "text-on-surface-variant hover:text-on-surface"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">family_restroom</span>
                        <span>Someone else (Child)</span>
                      </button>
                    </div>

                    {/* Notice */}
                    <div className="bg-secondary-fixed/40 rounded-lg p-space-sm flex items-start gap-space-sm text-on-secondary-container font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">info</span>
                      <div>
                        <span className="font-bold">Pediatric Clinic Notice:</span> Dr. Evans specializes in Pediatrics and Adolescent Medicine. If booking on behalf of a dependent or minor child, please enter their exact legal medical record name and birthdate below.
                      </div>
                    </div>
                  </section>

                  {/* Legal Demographics Form Panel */}
                  <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-lg space-y-space-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs font-bold">
                        <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                        Legal Identity &amp; Demographics
                      </h3>
                      <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">* Required for insurance</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      {/* First Name */}
                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between" htmlFor="firstName">
                          <span>Legal First Name</span>
                          <span className="text-error">*</span>
                        </label>
                        <input
                          id="firstName"
                          value={patientFirstName}
                          onChange={(e) => setPatientFirstName(e.target.value)}
                          className="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Legal first name"
                          type="text"
                        />
                      </div>

                      {/* Last Name */}
                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between" htmlFor="lastName">
                          <span>Legal Last Name</span>
                          <span className="text-error">*</span>
                        </label>
                        <input
                          id="lastName"
                          value={patientLastName}
                          onChange={(e) => setPatientLastName(e.target.value)}
                          className="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          placeholder="Legal last name"
                          type="text"
                        />
                      </div>

                      {/* Date of Birth */}
                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between" htmlFor="dob">
                          <span>Date of Birth</span>
                          <span className="text-error">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="dob"
                            value={patientDob}
                            onChange={(e) => setPatientDob(e.target.value)}
                            className="w-full h-12 px-space-md pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            placeholder="MM/DD/YYYY"
                            type="text"
                          />
                          <span className="material-symbols-outlined text-outline absolute right-3 top-3.5 pointer-events-none text-[20px]">
                            calendar_today
                          </span>
                        </div>
                      </div>

                      {/* Legal Sex */}
                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between" htmlFor="gender">
                          <span>Sex Assigned at Birth</span>
                          <span className="text-error">*</span>
                        </label>
                        <select
                          id="gender"
                          value={patientGender}
                          onChange={(e) => setPatientGender(e.target.value)}
                          className="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                        >
                          <option value="female">Female</option>
                          <option value="male">Male</option>
                          <option value="other">Intersex / Other</option>
                          <option value="undisclosed">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                  </section>

                  {/* Contact Information Panel */}
                  <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-lg space-y-space-md">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs font-bold">
                      <span className="material-symbols-outlined text-primary text-[20px]">contact_phone</span>
                      Contact &amp; Verification
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                      {/* Mobile Phone */}
                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="phone">
                          Mobile Phone
                        </label>
                        <div className="relative">
                          <input
                            id="phone"
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            type="tel"
                            className="w-full h-12 px-space-md pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                          <span className="material-symbols-outlined text-outline absolute right-3 top-3.5 pointer-events-none text-[20px]">
                            smartphone
                          </span>
                        </div>
                      </div>

                      {/* Email Address */}
                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="email">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            id="email"
                            value={patientEmail}
                            onChange={(e) => setPatientEmail(e.target.value)}
                            type="email"
                            className="w-full h-12 px-space-md pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                          />
                          <span className="material-symbols-outlined text-outline absolute right-3 top-3.5 pointer-events-none text-[20px]">
                            mail
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* SMS Reminder Checkbox */}
                    <label className="flex items-start gap-space-sm cursor-pointer group select-none pt-1">
                      <input
                        type="checkbox"
                        checked={smsOptIn}
                        onChange={(e) => setSmsOptIn(e.target.checked)}
                        className="w-5 h-5 mt-0.5 rounded accent-primary cursor-pointer shrink-0"
                      />
                      <div className="text-on-surface font-body-md text-body-md">
                        <span className="font-semibold">Send SMS text reminders &amp; digital check-in links</span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Receive automated check-in forms 24 hours prior to visit.
                        </p>
                      </div>
                    </label>
                  </section>

                  {/* Visit Reason & Symptoms */}
                  <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-lg space-y-space-md">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs font-bold">
                      <span className="material-symbols-outlined text-primary text-[20px]">stethoscope</span>
                      Reason for Visit &amp; Symptoms
                    </h3>

                    <div className="space-y-space-md">
                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="visit-reason">
                          Appointment Category
                        </label>
                        <select
                          id="visit-reason"
                          value={visitReason}
                          onChange={(e) => setVisitReason(e.target.value)}
                          className="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
                        >
                          <option>Annual Well-Child Checkup / General Consultation</option>
                          <option>Vaccine &amp; Immunization Administration</option>
                          <option>Acute Illness / Cough / Fever Assessment</option>
                          <option>Sports &amp; Camp Physical Clearance</option>
                          <option>Follow-up Visit / Medication Review</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between" htmlFor="symptom-desc">
                          <span>Brief description for Dr. Evans</span>
                          <span className="font-body-sm text-body-sm text-outline">Optional</span>
                        </label>
                        <textarea
                          id="symptom-desc"
                          rows={3}
                          value={symptomDesc}
                          onChange={(e) => setSymptomDesc(e.target.value)}
                          className="w-full p-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
                          placeholder="Share any symptoms, previous medical history, or specific questions for this consultation..."
                        />
                      </div>
                    </div>
                  </section>

                  {/* Primary Insurance Verification Block (In Rupees ₹) */}
                  <section className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-lg space-y-space-md">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-space-xs font-bold">
                        <span className="material-symbols-outlined text-primary text-[20px]">health_and_safety</span>
                        Primary Insurance
                      </h3>
                      <span className="flex items-center gap-1 font-label-sm text-label-sm text-primary font-bold bg-primary-fixed/30 px-2 py-0.5 rounded-full">
                        <span className="material-symbols-outlined text-[14px]">shield</span>
                        Verified Active
                      </span>
                    </div>

                    <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div className="flex items-start gap-space-md">
                        <div className="w-12 h-12 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                          <span className="material-symbols-outlined text-[26px]">credit_card</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-label-lg text-label-lg font-bold text-on-surface">Aetna Choice POS II</h4>
                            <span className="text-primary font-label-sm text-label-sm font-semibold">Tier 1 Network</span>
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Member ID: <span className="font-mono text-on-surface font-bold">W9482•••••</span> &bull; Group: 88204-NY
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Subscriber: {patientFirstName} {patientLastName} ({bookingRecipient === "self" ? "Self" : "Parent / Guardian"})
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="font-label-sm text-label-sm text-primary hover:text-primary-container font-bold px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-left shrink-0 cursor-pointer"
                      >
                        + Change Insurance
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                      <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                      <span>
                        Estimated patient copay is <strong>₹{selectedService.copayAmount.toLocaleString('en-IN')}.00</strong> based on verified in-network benefits. No payment charged today.
                      </span>
                    </div>
                  </section>

                  {/* Emergency Contact Accordion */}
                  <details className="bg-surface-container-lowest rounded-xl shadow-xs border border-outline-variant/20 p-space-lg group cursor-pointer">
                    <summary className="flex items-center justify-between font-headline-sm text-headline-sm text-on-surface list-none font-bold">
                      <span className="flex items-center gap-space-xs">
                        <span className="material-symbols-outlined text-primary text-[20px]">contacts</span>
                        Emergency Contact / Guardian (Optional)
                      </span>
                      <span className="material-symbols-outlined text-outline group-open:rotate-180 transition-transform">
                        expand_more
                      </span>
                    </summary>
                    <div className="pt-space-md grid grid-cols-1 sm:grid-cols-2 gap-space-md cursor-default">
                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="emergName">
                          Contact Full Name
                        </label>
                        <input
                          id="emergName"
                          value={emergName}
                          onChange={(e) => setEmergName(e.target.value)}
                          placeholder="e.g. David Chen (Spouse / Parent)"
                          type="text"
                          className="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="emergPhone">
                          Emergency Phone Number
                        </label>
                        <input
                          id="emergPhone"
                          value={emergPhone}
                          onChange={(e) => setEmergPhone(e.target.value)}
                          placeholder="(555) 000-0000"
                          type="tel"
                          className="w-full h-12 px-space-md rounded-lg bg-surface-container-low text-on-surface font-body-md text-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </details>
                </main>

                {/* Right Column: Sticky Summary with CTAs (3 cols) */}
                <aside className="lg:col-span-3 sticky top-20 space-y-space-md">
                  <div className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/20 p-space-lg flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-sm border-b border-surface-container-high/40">
                      <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">Booking Summary</h3>
                      <span className="bg-surface-container text-primary font-label-sm text-label-sm px-2.5 py-0.5 rounded-full font-bold">
                        Step 2 of 3
                      </span>
                    </div>

                    <div className="flex items-center gap-space-sm">
                      <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0">
                        <span className="material-symbols-outlined text-[22px]">medical_services</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-label-lg text-label-lg font-bold text-on-surface truncate">Dr. Elizabeth Evans</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">Pediatrics &amp; Family Health</p>
                      </div>
                    </div>

                    <div className="space-y-space-sm bg-surface-container-low p-space-md rounded-xl font-body-sm text-body-sm">
                      <div className="flex items-start gap-space-xs text-on-surface">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">calendar_month</span>
                        <div>
                          <span className="font-bold block">{selectedDateTab.fullDate}</span>
                          <span className="text-on-surface-variant font-medium">{selectedSlotTime} ({selectedService.durationMinutes} min)</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-space-xs text-on-surface">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">apartment</span>
                        <div>
                          <span className="font-bold block">Eastside Pediatrics</span>
                          <span className="text-on-surface-variant">240 Eastside Ave, Ste 410, NY</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-space-xs text-on-surface">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">diversity_1</span>
                        <div>
                          <span className="font-bold block">In-Person Consultation</span>
                          <span className="text-on-surface-variant">{currentAllocation?.room.name || "Exam Room 3A"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-space-xs text-on-surface pt-1 border-t border-surface-container-high/40">
                        <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">account_circle</span>
                        <div>
                          <span className="font-bold block">Patient: {patientFirstName} {patientLastName}</span>
                          <span className="text-on-surface-variant">
                            Booking for: {bookingRecipient === "self" ? "Self" : "Child / Dependent"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Financial Breakdown (In Rupees ₹) */}
                    <div className="bg-surface-container rounded-xl p-space-md space-y-2">
                      <div className="flex items-center justify-between text-body-sm font-body-sm">
                        <span className="text-on-surface-variant">Carrier Coverage:</span>
                        <span className="font-bold text-on-surface">Aetna Choice POS</span>
                      </div>
                      <div className="flex items-center justify-between text-body-sm font-body-sm">
                        <span className="text-on-surface-variant">Office Visit Fee:</span>
                        <span className="text-on-surface line-through font-mono">₹1,500.00</span>
                      </div>
                      <div className="flex items-center justify-between font-label-lg text-label-lg pt-1 border-t border-surface-container-high/50 text-on-surface">
                        <span className="font-bold">Estimated Copay:</span>
                        <span className="text-primary font-headline-sm text-headline-sm font-bold">
                          ₹{selectedService.copayAmount.toLocaleString('en-IN')}.00
                        </span>
                      </div>
                      <p className="text-[11px] text-outline-variant leading-tight pt-1">
                        Final copayment collected at clinic check-in. Subject to deductible requirements.
                      </p>
                    </div>

                    {/* Step 2 Actions */}
                    <div className="space-y-space-xs pt-space-xs">
                      <button
                        onClick={() => setCurrentStep(3)}
                        className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary font-label-lg text-label-lg font-bold rounded-lg flex items-center justify-center gap-space-xs shadow-md transition-all active:scale-[0.99] cursor-pointer"
                      >
                        <span>Review &amp; Confirm (Step 3)</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="w-full h-10 bg-transparent hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-label-md text-label-md rounded-lg flex items-center justify-center gap-space-xs transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                        <span>Back to Date &amp; Time</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 text-outline text-xs pt-space-xs text-center">
                      <span className="material-symbols-outlined text-[16px] text-primary">lock</span>
                      <span>HIPAA Compliant &bull; 256-bit encryption</span>
                    </div>
                  </div>

                  <div className="bg-surface-container-low rounded-xl p-space-md flex items-center gap-space-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-secondary text-[24px]">support_agent</span>
                    <div className="font-body-sm text-body-sm min-w-0">
                      <p className="font-bold text-on-surface">Need booking assistance?</p>
                      <p>Eastside Triage desk: <a className="text-primary font-bold hover:underline" href="tel:2125550198">(212) 555-0198</a></p>
                    </div>
                  </div>
                </aside>
              </div>
            )}

            {/* =========================================================================
                STEP 3: APPOINTMENT CONFIRMATION & RECEIPT
                ========================================================================= */}
            {currentStep === 3 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
                {/* Main Region (8 Cols) */}
                <div className="lg:col-span-8 flex flex-col gap-space-lg">
                  {/* Celebration & Hero Card */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-outline-variant/20 flex flex-col gap-space-lg relative overflow-hidden">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md pb-space-sm">
                      <div className="flex items-center gap-space-md">
                        <div className="relative shrink-0">
                          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary shadow-md">
                              <span className="material-symbols-outlined text-[30px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                check_circle
                              </span>
                            </div>
                          </div>
                          <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-fixed text-primary flex items-center justify-center shadow-xs">
                            <span className="material-symbols-outlined text-[14px]">verified</span>
                          </span>
                        </div>
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-primary font-label-sm text-label-sm uppercase font-bold tracking-wider mb-1">
                            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
                            Direct Booking Finalized
                          </div>
                          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-extrabold">
                            You&apos;re all set, {patientFirstName}!
                          </h1>
                          <p className="font-body-lg text-body-lg text-on-surface-variant">
                            Your in-person pediatric consultation with Dr. Elizabeth Evans, MD is scheduled and secured.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Toolbar */}
                    <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-wrap items-center justify-between gap-space-sm">
                      {/* Add to Calendar Menu */}
                      <div className="relative">
                        <button
                          onClick={() => setShowCalendarMenu(!showCalendarMenu)}
                          className="px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-lg text-label-lg flex items-center gap-2 shadow-xs transition-all border border-outline-variant/30 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-primary text-[20px]">calendar_add_on</span>
                          <span>Add to Calendar</span>
                          <span className="material-symbols-outlined text-[18px] text-outline">expand_more</span>
                        </button>

                        {showCalendarMenu && (
                          <div className="absolute left-0 top-full mt-2 w-56 bg-surface-container-lowest rounded-xl shadow-xl p-space-xs z-30 flex flex-col gap-1 border border-outline-variant/30">
                            <button
                              onClick={() => {
                                handleGoogleCalendar();
                                setShowCalendarMenu(false);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-[18px] text-primary">event</span>
                              <span>Google Calendar</span>
                            </button>
                            <button
                              onClick={() => {
                                handleDownloadIcs();
                                setShowCalendarMenu(false);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-[18px] text-secondary">calendar_today</span>
                              <span>Apple iCal (.ics)</span>
                            </button>
                            <button
                              onClick={() => {
                                handleGoogleCalendar();
                                setShowCalendarMenu(false);
                              }}
                              className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors text-left"
                            >
                              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">mail</span>
                              <span>Outlook Calendar</span>
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-space-xs">
                        <button
                          onClick={() => window.print()}
                          className="px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-lg text-label-lg flex items-center gap-2 shadow-xs transition-all border border-outline-variant/30 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">print</span>
                          <span>Print Slip</span>
                        </button>
                        <button
                          onClick={() => window.print()}
                          className="px-space-md py-space-sm rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-lg text-label-lg flex items-center gap-2 shadow-xs transition-all border border-outline-variant/30 cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[18px] text-primary">picture_as_pdf</span>
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Primary Appointment Details Card */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-outline-variant/20 flex flex-col gap-space-lg">
                    <div className="flex items-center justify-between pb-space-xs">
                      <div className="flex items-center gap-space-sm">
                        <span className="material-symbols-outlined text-primary text-[24px]">event_available</span>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">Appointment Summary</h3>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-sm text-label-sm uppercase tracking-wide font-bold">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        Guaranteed Slot
                      </span>
                    </div>

                    {/* Date Spotlight Hero Banner */}
                    <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col md:flex-row md:items-center justify-between gap-space-md">
                      <div className="flex items-center gap-space-md">
                        <div className="w-14 h-14 rounded-xl bg-primary text-on-primary flex flex-col items-center justify-center shrink-0 shadow-sm text-center">
                          <span className="text-[10px] uppercase font-bold tracking-wider leading-none">
                            {selectedDateTab.monthName}
                          </span>
                          <span className="font-headline-md text-headline-md font-extrabold leading-none mt-0.5">
                            {selectedDateTab.dayNum}
                          </span>
                          <span className="text-[9px] uppercase font-semibold leading-none mt-0.5">
                            {selectedDateTab.day}
                          </span>
                        </div>
                        <div>
                          <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            {selectedDateTab.fullDate}
                          </div>
                          <div className="font-body-md text-body-md text-primary font-semibold flex items-center gap-1.5 mt-0.5">
                            <span className="material-symbols-outlined text-[18px]">schedule</span>
                            {selectedSlotTime} &bull; {selectedService.durationMinutes} Minutes ({selectedService.name})
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-lg bg-surface-container-lowest text-on-surface-variant font-label-md text-label-md flex items-center gap-1 shadow-xs">
                          <span className="material-symbols-outlined text-[16px] text-secondary">person_pin</span>
                          In-Person Visit
                        </span>
                      </div>
                    </div>

                    {/* Provider Module */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md items-center p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                      <div className="md:col-span-3 flex justify-center md:justify-start">
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md">
                          <img
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAs3KHrIT0IgEz-GAhNzRAcEgUt0RSoVwBXMuvQ53zDH5LFO9elgOUEH7gELGUuvkvTr17THAPSrxXPj8QXBhNxWsVdgxskFybcLIJvT6g4bxQ3NlU_SY5PHUKr_FlyEWEDz0RO6yHwly0IkABchXpzUr71l-LgI8gIIrp5L3JAVnz47_JzEA_WYZMZSp__xgXhk4YNByOj4Fpy4XBIcr8-c3eAmcQC3XesDONhRbRNlLr3qW61msiH"
                            alt="Dr. Elizabeth Evans"
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center text-[10px] shadow-sm">
                            <span className="material-symbols-outlined text-[12px]">medical_services</span>
                          </span>
                        </div>
                      </div>
                      <div className="md:col-span-9 flex flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-headline-md text-headline-md text-on-surface font-bold">
                            Dr. Elizabeth Evans, MD
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-full bg-secondary-fixed/50 text-on-secondary-fixed font-label-md text-label-md font-semibold">
                            Board Certified
                          </span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant">
                          Pediatrics &amp; Adolescent Medicine &bull; Mount Sinai Health Affiliate
                        </p>
                        <div className="flex flex-wrap items-center gap-space-md mt-1 font-body-sm text-body-sm text-on-surface-variant">
                          <div className="flex items-center gap-1 text-tertiary">
                            <span className="material-symbols-outlined text-[16px] text-tertiary-container" style={{ fontVariationSettings: "'FILL' 1" }}>
                              star
                            </span>
                            <span className="font-bold text-on-surface">4.9</span> (412 patient reviews)
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                            <span>Aetna Choice In-Network</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px] text-secondary">translate</span>
                            <span>English, Spanish</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Location & Navigation Module */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-space-md p-space-md rounded-xl bg-surface-container-low">
                      <div className="md:col-span-7 flex flex-col justify-between gap-space-md">
                        <div>
                          <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider mb-1">
                            <span className="material-symbols-outlined text-[16px]">pin_drop</span>
                            Clinical Location
                          </div>
                          <h5 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                            Eastside Pediatrics Care Center
                          </h5>
                          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                            240 Eastside Avenue, Suite 410 (4th Floor)<br />
                            New York, NY 10028
                          </p>
                        </div>
                        <div className="space-y-2 font-body-sm text-body-sm text-on-surface-variant">
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">local_parking</span>
                            <span><strong>Parking:</strong> On-site building garage with 2-hour validated clinical parking. Enter via 78th St.</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="material-symbols-outlined text-[18px] text-primary shrink-0 mt-0.5">elevator</span>
                            <span><strong>Check-in Desk:</strong> Take Tower B elevators to Floor 4. Check in at Reception Pod C.</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-space-sm pt-space-xs">
                          <a
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-space-md py-space-xs rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-md text-label-md transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <span className="material-symbols-outlined text-[16px]">directions</span>
                            <span>Get Directions</span>
                          </a>
                          <button
                            onClick={handleCopyAddress}
                            className="px-space-md py-space-xs rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all flex items-center gap-1.5 shadow-xs border border-outline-variant/30 cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              {copiedAddress ? "check" : "content_copy"}
                            </span>
                            <span>{copiedAddress ? "Copied!" : "Copy Address"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Clinic Floor Map Image */}
                      <div className="md:col-span-5 h-48 md:h-full min-h-[180px] rounded-xl overflow-hidden relative shadow-inner bg-slate-200">
                        <img
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHPcCu-hThUHL9BFIlXARMvbvliaCsfkaJVh9LRIoyoFHCFTI-lBc_UWp7BK4p_0y1Z4aP9C-LGOIPiocAwhAEywrQIdgX1sln34crld6yqrEHRP92hndFYbeoo2H5PUnp5PGJltqHtWfWAxw0Bfbr-ziJUY4xm2jbdL6c-jmcAz-KYfJ8ycNPBFlqOVylZnc_7QLGFsVcoy3rJ0VdiYHBeeLeKbUTQOVXr7E5O_18xZClFmxHnK80"
                          alt="Eastside Center Location"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-inverse-surface/60 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1.5 rounded-lg bg-surface-container-lowest/90 backdrop-blur-md flex items-center justify-between text-on-surface shadow-sm">
                          <div className="flex items-center gap-1.5 font-label-md text-label-md font-semibold truncate">
                            <span className="material-symbols-outlined text-primary text-[16px]">location_on</span>
                            <span className="truncate">Upper East Side Hub</span>
                          </div>
                          <span className="text-[11px] text-primary font-bold">Suite 410</span>
                        </div>
                      </div>
                    </div>

                    {/* Patient Information Recap */}
                    <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30">
                      <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-outline-variant/20">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">badge</span>
                          <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                            Patient Information
                          </span>
                        </div>
                        <span className="text-primary bg-primary/10 px-2 py-0.5 rounded-full font-label-md text-label-md font-semibold">
                          Verified Record
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-space-md font-body-sm text-body-sm">
                        <div>
                          <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                            Full Legal Name
                          </span>
                          <span className="font-semibold text-on-surface font-body-md text-body-md">
                            {patientFirstName} {patientLastName}
                          </span>
                        </div>
                        <div>
                          <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                            DOB &amp; Gender
                          </span>
                          <span className="font-semibold text-on-surface font-body-md text-body-md">
                            {patientDob} ({patientGender})
                          </span>
                        </div>
                        <div>
                          <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                            Mobile Contact
                          </span>
                          <span className="font-semibold text-on-surface font-body-md text-body-md">
                            {patientPhone}
                          </span>
                        </div>
                        <div>
                          <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">
                            Visit Intent
                          </span>
                          <span className="font-semibold text-on-surface font-body-md text-body-md truncate block">
                            {visitReason}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pre-Visit Checklist */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-outline-variant/20 flex flex-col gap-space-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-xs pb-space-xs">
                      <div>
                        <div className="inline-flex items-center gap-1 text-primary font-label-sm text-label-sm uppercase font-bold tracking-wider">
                          <span className="material-symbols-outlined text-[16px]">task_alt</span>
                          Pre-Visit Preparation
                        </div>
                        <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
                          What to Expect on Your Visit
                        </h3>
                      </div>
                      <span className="text-on-surface-variant font-body-sm text-body-sm">3 minutes preparation required</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between gap-space-sm hover:shadow-xs transition-shadow">
                        <div className="flex items-start gap-space-sm">
                          <div className="w-8 h-8 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[20px]">assignment</span>
                          </div>
                          <div>
                            <h5 className="font-label-lg text-label-lg text-on-surface font-bold">1. Digital Intake Forms</h5>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                              Complete your medical history and pediatric milestones online before arriving.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-space-xs">
                          <span className="font-label-sm text-label-sm text-primary font-semibold">Estimated: 3 mins</span>
                          <span className="inline-flex items-center gap-1 font-label-md text-label-md text-primary font-bold cursor-pointer hover:underline">
                            Start Forms Now &rarr;
                          </span>
                        </div>
                      </div>

                      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between gap-space-sm hover:shadow-xs transition-shadow">
                        <div className="flex items-start gap-space-sm">
                          <div className="w-8 h-8 rounded-lg bg-secondary-fixed text-secondary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[20px]">alarm</span>
                          </div>
                          <div>
                            <h5 className="font-label-lg text-label-lg text-on-surface font-bold">2. Arrival Time: 15 min early</h5>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                              Please arrive 15 minutes ahead of scheduled time for biometric &amp; nurse vitals intake.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary">notifications_active</span>
                          <span>SMS reminder will trigger 1 hour prior</span>
                        </div>
                      </div>

                      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between gap-space-sm hover:shadow-xs transition-shadow">
                        <div className="flex items-start gap-space-sm">
                          <div className="w-8 h-8 rounded-lg bg-tertiary-fixed text-tertiary flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                          </div>
                          <div>
                            <h5 className="font-label-lg text-label-lg text-on-surface font-bold">3. What to Bring</h5>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                              Valid government photo ID, active Aetna Insurance card, and any recent immunization cards.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                          <span>Digital cards accepted in CareSync App</span>
                        </div>
                      </div>

                      <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col justify-between gap-space-sm hover:shadow-xs transition-shadow">
                        <div className="flex items-start gap-space-sm">
                          <div className="w-8 h-8 rounded-lg bg-surface-container-high text-on-surface flex items-center justify-center shrink-0 mt-0.5">
                            <span className="material-symbols-outlined text-[20px]">masks</span>
                          </div>
                          <div>
                            <h5 className="font-label-lg text-label-lg text-on-surface font-bold">4. Mask &amp; Clinical Safety</h5>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                              Masks are optional in waiting lounges. Complimentary surgical masks available at intake.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 pt-space-xs text-on-surface-variant font-label-sm text-label-sm">
                          <span className="material-symbols-outlined text-[16px] text-primary">sanitizer</span>
                          <span>HEPA-filtered clinical pods</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sidebar (Summary, Billing & Action Panel - 4 Cols) */}
                <aside className="lg:col-span-4 flex flex-col gap-space-lg lg:sticky lg:top-20">
                  {/* Booking & Payment Status Card (In Rupees ₹) */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-md border border-outline-variant/20 flex flex-col gap-space-md">
                    <div className="flex items-center justify-between pb-space-xs">
                      <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold tracking-wider">
                        Booking Receipt
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed/40 text-on-primary-fixed font-label-sm text-label-sm font-bold">
                        <span className="material-symbols-outlined text-[14px]">verified</span> Verified In-Network
                      </span>
                    </div>

                    <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                      <div>
                        <span className="block text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                          Reference ID
                        </span>
                        <span className="font-mono text-headline-sm text-headline-sm text-on-surface font-extrabold">
                          #{bookingRefCode}
                        </span>
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="w-9 h-9 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-primary flex items-center justify-center transition-colors shadow-xs border border-outline-variant/30 cursor-pointer"
                        title="Copy Reference Code"
                      >
                        <span className="material-symbols-outlined text-[18px]">
                          {copiedCode ? "check" : "copy_all"}
                        </span>
                      </button>
                    </div>

                    <div className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-secondary text-[22px] shrink-0 mt-0.5">shield</span>
                      <div className="font-body-sm text-body-sm">
                        <div className="font-semibold text-on-surface">Aetna Choice POS II</div>
                        <div className="text-on-surface-variant">Member: W9482••••• &bull; Tier 1 Hub</div>
                        <div className="text-primary font-label-sm text-label-sm mt-0.5 flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-[14px]">check</span> Real-time Eligibility Verified
                        </div>
                      </div>
                    </div>

                    {/* Financial Breakdown Table in INR ₹ */}
                    <div className="flex flex-col gap-2 pt-space-xs font-body-sm text-body-sm">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Specialist Consultation Fee</span>
                        <span className="font-medium line-through text-outline">₹1,500.00</span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Contracted Payer Discount</span>
                        <span className="text-primary font-medium">-₹1,000.00</span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Plan Deductible Status</span>
                        <span className="font-medium text-on-surface">Met (₹0.00)</span>
                      </div>
                      <div className="flex justify-between text-on-surface font-semibold pt-space-xs border-t border-outline-variant/20">
                        <div className="flex items-center gap-1">
                          <span>Contracted Copay</span>
                          <span className="material-symbols-outlined text-[14px] text-outline" title="Due at check-in or pre-payable online">
                            info
                          </span>
                        </div>
                        <span className="font-headline-sm text-headline-sm text-primary font-bold">
                          ₹{selectedService.copayAmount.toLocaleString('en-IN')}.00
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-space-xs pt-space-xs">
                      <button className="w-full h-12 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-lg text-label-lg font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer">
                        <span className="material-symbols-outlined text-[20px]">credit_card</span>
                        <span>Pay Copay Online (₹{selectedService.copayAmount.toLocaleString('en-IN')}.00)</span>
                      </button>
                      <p className="text-center text-[11px] text-on-surface-variant">
                        Online payment optional. You can also settle at the clinic intake desk.
                      </p>
                    </div>
                  </div>

                  {/* Portal Navigation & Actions */}
                  <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs border border-outline-variant/20 flex flex-col gap-space-md">
                    <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">Next Steps &amp; Navigation</h4>
                    <div className="flex flex-col gap-space-xs">
                      <button
                        onClick={() => {
                          setCurrentStep(1);
                        }}
                        className="w-full h-11 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold flex items-center justify-between px-space-md transition-colors shadow-xs cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">calendar_month</span>
                          <span>Book Another Appointment</span>
                        </div>
                        <span className="material-symbols-outlined text-outline text-[18px]">add</span>
                      </button>

                      <Link
                        href="/login"
                        className="w-full h-11 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-lg text-label-lg font-semibold flex items-center justify-between px-space-md transition-colors shadow-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]">account_circle</span>
                          <span>Go to Patient Portal</span>
                        </div>
                        <span className="material-symbols-outlined text-outline text-[18px]">chevron_right</span>
                      </Link>
                    </div>

                    <div className="pt-space-xs">
                      <div className="flex items-start gap-2 text-on-surface-variant font-body-sm text-body-sm">
                        <span className="material-symbols-outlined text-[18px] text-outline shrink-0 mt-0.5">change_circle</span>
                        <div>
                          <span>Need to make changes? Reschedule or cancel without penalty up to <strong>24 hours prior</strong>.</span>
                          <div className="mt-1">
                            <button
                              onClick={() => setCurrentStep(1)}
                              className="text-error font-label-md text-label-md font-semibold hover:underline cursor-pointer"
                            >
                              Reschedule or Cancel Visit
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support Widget */}
                  <div className="bg-surface-container-low rounded-xl p-space-md flex flex-col gap-space-sm">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">headset_mic</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">Eastside Clinic Support</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">
                      Clinical questions or wheelchair assistance upon arrival? Our nursing desk is active.
                    </p>
                    <div className="flex flex-col gap-2 pt-1 font-label-md text-label-md">
                      <a className="flex items-center gap-2 text-on-surface hover:text-primary transition-colors" href="tel:2125550198">
                        <span className="material-symbols-outlined text-[16px] text-primary">call</span>
                        <span>Triage Desk: (212) 555-0198</span>
                      </a>
                    </div>
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* =========================================================================
          INTERACTIVE MULTI-MONTH CALENDAR PICKER MODAL
          ========================================================================= */}
      {showCalendarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[24px]">calendar_month</span>
                <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                  Select Booking Date
                </h3>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="w-8 h-8 rounded-full hover:bg-surface-container text-on-surface-variant flex items-center justify-center cursor-pointer"
              >
                &times;
              </button>
            </div>

            {/* Month / Year header with previous and next month controls */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  const prev = new Date(calendarViewMonth);
                  prev.setMonth(prev.getMonth() - 1);
                  setCalendarViewMonth(prev);
                }}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <span className="font-bold text-base text-on-surface">
                {calendarViewMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button
                onClick={() => {
                  const next = new Date(calendarViewMonth);
                  next.setMonth(next.getMonth() + 1);
                  setCalendarViewMonth(next);
                }}
                className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </div>

            {/* Quick Month Selector Buttons */}
            <div className="grid grid-cols-4 gap-1.5 text-xs">
              {[
                { name: "Nov '26", y: 2026, m: 10 },
                { name: "Dec '26", y: 2026, m: 11 },
                { name: "Jan '27", y: 2027, m: 0 },
                { name: "Feb '27", y: 2027, m: 1 },
              ].map((mBtn) => {
                const isActive =
                  calendarViewMonth.getFullYear() === mBtn.y &&
                  calendarViewMonth.getMonth() === mBtn.m;
                return (
                  <button
                    key={mBtn.name}
                    onClick={() => setCalendarViewMonth(new Date(mBtn.y, mBtn.m, 1))}
                    className={`py-1 rounded-lg font-semibold text-center transition-colors ${
                      isActive
                        ? "bg-primary text-on-primary"
                        : "bg-surface-container-low hover:bg-surface-container text-on-surface"
                    }`}
                  >
                    {mBtn.name}
                  </button>
                );
              })}
            </div>

            {/* Weekday Labels (Mon - Sun) */}
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-outline">
              <span>Mo</span>
              <span>Tu</span>
              <span>We</span>
              <span>Th</span>
              <span>Fr</span>
              <span>Sa</span>
              <span>Su</span>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 text-center text-sm">
              {calendarDays.map((item, idx) => {
                if (!item.date) {
                  return <div key={`pad-${idx}`} className="h-9" />;
                }

                const isWeekend = item.date.getDay() === 0 || item.date.getDay() === 6;
                const isSelected =
                  item.date.getFullYear() === selectedDateObj.getFullYear() &&
                  item.date.getMonth() === selectedDateObj.getMonth() &&
                  item.date.getDate() === selectedDateObj.getDate();

                return (
                  <button
                    key={item.date.toISOString()}
                    disabled={isWeekend}
                    onClick={() => handleSelectSpecificDate(item.date!)}
                    className={`h-9 rounded-lg flex items-center justify-center font-semibold transition-all ${
                      isSelected
                        ? "bg-primary text-on-primary font-bold shadow-xs scale-105"
                        : isWeekend
                        ? "text-outline/40 cursor-not-allowed bg-transparent"
                        : "hover:bg-primary-fixed/40 text-on-surface cursor-pointer"
                    }`}
                  >
                    {item.date.getDate()}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-outline-variant/20 flex items-center justify-between text-xs text-on-surface-variant">
              <span>Weekdays available for pediatric consultations.</span>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="px-3 py-1 rounded-lg bg-surface-container font-semibold hover:bg-surface-container-high"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full bg-surface-container-low border-t border-outline-variant/20 py-space-xl mt-auto">
        <div className="max-w-7xl mx-auto px-margin flex flex-col md:flex-row items-center justify-between gap-space-md text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-space-xs">
            <div className="w-6 h-6 rounded bg-primary-container flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[14px]">ecg_heart</span>
            </div>
            <span className="font-label-lg text-label-lg text-on-surface font-semibold">
              CareSync Healthcare Network
            </span>
          </div>
          <p className="text-center md:text-left text-xs">
            &copy; 2026 CareSync Inc. All clinical records and consultations protected under HIPAA compliance standards.
          </p>
          <div className="flex items-center gap-space-lg text-xs">
            <a className="hover:text-on-surface transition-colors" href="#">
              Privacy Practices
            </a>
            <a className="hover:text-on-surface transition-colors" href="#">
              Terms of Service
            </a>
            <a className="hover:text-on-surface transition-colors" href="#">
              Patient Rights
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
