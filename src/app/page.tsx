"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  CLINICAL_SERVICES,
  calculateCompositeAvailability,
} from "@/lib/scheduling/compositeScheduler";
import { CompositeSlot } from "@/lib/types/scheduling";

interface DateTab {
  day: string;
  date: string;
  fullDate: string;
  slots: number;
}

const dateTabs: DateTab[] = [
  { day: "Mon", date: "Nov 9", fullDate: "Monday, Nov 9, 2026", slots: 6 },
  { day: "Tue", date: "Nov 10", fullDate: "Tuesday, Nov 10, 2026", slots: 4 },
  { day: "Wed", date: "Nov 11", fullDate: "Wednesday, Nov 11, 2026", slots: 8 },
  { day: "Thu", date: "Nov 12", fullDate: "Thursday, Nov 12, 2026", slots: 5 },
  { day: "Fri", date: "Nov 13", fullDate: "Friday, Nov 13, 2026", slots: 3 },
];

export default function Home() {
  const [selectedDateIndex, setSelectedDateIndex] = useState(0);
  const [selectedSlotTime, setSelectedSlotTime] = useState("10:00 AM");
  const [selectedServiceId, setSelectedServiceId] = useState("routine-consult");
  const [currentStep, setCurrentStep] = useState(1);
  const [secondsLeft, setSecondsLeft] = useState(288); // 4m 48s
  const [showResourceInspector, setShowResourceInspector] = useState(false);

  // Live countdown timer
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

  const selectedDate = dateTabs[selectedDateIndex];
  const selectedService = useMemo(
    () => CLINICAL_SERVICES.find((s) => s.id === selectedServiceId) || CLINICAL_SERVICES[0],
    [selectedServiceId]
  );

  // Calculate composite resource availability: Provider ∩ Room ∩ Equipment ∩ Staff
  const computedSlots: CompositeSlot[] = useMemo(() => {
    return calculateCompositeAvailability(selectedDate.date, selectedServiceId);
  }, [selectedDate.date, selectedServiceId]);

  const morningSlots = computedSlots.filter((s) => s.timePeriod === "MORNING");
  const afternoonSlots = computedSlots.filter((s) => s.timePeriod === "AFTERNOON");

  // Selected slot's compound allocation
  const currentAllocation = useMemo(() => {
    const active = computedSlots.find((s) => s.time === selectedSlotTime);
    return active?.allocatedResources;
  }, [computedSlots, selectedSlotTime]);

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* 1. Header & Navigation */}
      <header className="fixed top-0 left-0 right-0 w-full z-50 bg-surface-container-lowest border-b border-outline-variant/30 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="h-16 max-w-7xl mx-auto px-margin flex items-center justify-between gap-gutter">
          <div className="flex items-center gap-space-sm">
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
          </div>

          <nav className="hidden md:flex items-center gap-space-xs">
            <a
              href="#"
              className="px-space-md py-space-sm transition-colors bg-surface-container-high text-on-surface font-label-lg rounded-lg"
            >
              Find a Doctor
            </a>
            <a
              href="#"
              className="px-space-md py-space-sm font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors rounded-lg"
            >
              My Appointments
            </a>
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
            {/* 2. Stepper Breadcrumb Header */}
            <div className="w-full bg-surface-container-lowest shadow-xs rounded-xl p-space-sm mb-space-md">
              <div className="flex items-center justify-between gap-space-sm px-space-sm py-space-xs">
                {/* Step 1: Active */}
                <div
                  className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg shadow-xs transition-colors ${
                    currentStep === 1
                      ? "bg-primary-container text-on-primary"
                      : "text-on-surface-variant opacity-75 cursor-pointer"
                  }`}
                  onClick={() => setCurrentStep(1)}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-label-md text-label-md flex items-center justify-center font-bold ${
                      currentStep === 1
                        ? "bg-surface-container-lowest text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    1
                  </span>
                  <span className="font-label-lg text-label-lg font-semibold tracking-tight">
                    Date &amp; Time
                  </span>
                  {currentStep === 1 && (
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  )}
                </div>

                <div className="flex-1 h-0.5 bg-surface-container-highest rounded-full mx-space-xs" />

                {/* Step 2 */}
                <div
                  className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-colors cursor-pointer ${
                    currentStep === 2
                      ? "bg-primary-container text-on-primary"
                      : "text-on-surface-variant opacity-75"
                  }`}
                  onClick={() => setCurrentStep(2)}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-label-md text-label-md flex items-center justify-center font-semibold ${
                      currentStep === 2
                        ? "bg-surface-container-lowest text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    2
                  </span>
                  <span className="font-label-lg text-label-lg">Patient Info</span>
                  <span className="material-symbols-outlined text-[18px] text-outline-variant">
                    chevron_right
                  </span>
                </div>

                <div className="flex-1 h-0.5 bg-surface-container-highest rounded-full mx-space-xs" />

                {/* Step 3 */}
                <div
                  className={`flex items-center gap-space-sm px-space-md py-space-xs rounded-lg transition-colors cursor-pointer ${
                    currentStep === 3
                      ? "bg-primary-container text-on-primary"
                      : "text-on-surface-variant opacity-60"
                  }`}
                  onClick={() => setCurrentStep(3)}
                >
                  <span
                    className={`w-6 h-6 rounded-full font-label-md text-label-md flex items-center justify-center font-semibold ${
                      currentStep === 3
                        ? "bg-surface-container-lowest text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    3
                  </span>
                  <span className="font-label-lg text-label-lg">Confirmation</span>
                </div>
              </div>
            </div>

            {/* 3. Temporary Hold Alert Banner - Compound Resource Mutex */}
            <div className="w-full bg-tertiary-fixed/30 border border-tertiary/20 rounded-lg p-space-md mb-space-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
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
                    <p className="text-emerald-700 font-semibold mt-0.5">Free at 10:00 AM</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-outline-variant/30">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Exam Rooms (3 Standard / 1 Procedure)
                    </p>
                    <p className="text-slate-500 mt-1">Pediatric Suite 3A Assigned</p>
                    <p className="text-amber-700 font-semibold mt-0.5">Rooms 1 &amp; 2 occupied by Dr. Vance</p>
                  </div>
                  <div className="p-3 bg-white rounded-lg border border-outline-variant/30">
                    <p className="font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Equipment &amp; Staff Mutex
                    </p>
                    <p className="text-slate-500 mt-1">Pediatric Vitals Hub A Locked</p>
                    <p className="text-emerald-700 font-semibold mt-0.5">MA Sarah Jenkins Assigned</p>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Main 3-Column Booking Layout Grid */}
            <div className="w-full grid grid-cols-12 gap-gutter items-start">
              {/* LEFT COLUMN: Doctor Profile Card (col-span-12 lg:col-span-3) */}
              <div className="col-span-12 lg:col-span-3 flex flex-col gap-space-md">
                <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-xs flex flex-col gap-space-md">
                  {/* Physician Portrait & Status */}
                  <div className="relative">
                    <img
                      className="w-full h-56 object-cover rounded-lg shadow-xs"
                      alt="Dr. Elizabeth Evans, MD"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVr9-oohztvGL17sr3tSYXjjgw7sVe-ziqURWlIPquTp5t1hsuRb-mXzloNK03kYBsrlAVyGjnaTH335AJl3V8r1zhAFrw0YFuj00pPqwFFHtDyyLvJdJaWz-I-93w2R9WOyusr5buVGS-5e2jwthhmErioekYPTOhsg3UotnTghsvI38Lc0rEcxu83rmclu12SJ4YSurqyMVrcHA1w_ZhQj6Vm2qY9SE2MtNM66UhhwZ4LC7I_iV9"
                    />
                    <div className="absolute bottom-3 left-3 bg-primary-container text-on-primary px-space-sm py-0.5 rounded-full text-label-sm font-label-sm flex items-center gap-1 shadow-xs">
                      <span className="material-symbols-outlined text-[14px]">bolt</span>
                      <span>Next Available: Today</span>
                    </div>
                  </div>

                  {/* Name & Specialty */}
                  <div>
                    <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      Dr. Elizabeth Evans, MD
                    </h2>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Pediatrics &amp; Family Medicine
                    </p>
                    <div className="flex items-center gap-space-xs mt-space-xs">
                      <span
                        className="material-symbols-outlined text-[18px] text-tertiary"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        star
                      </span>
                      <span className="font-label-lg text-label-lg font-bold text-on-surface">
                        4.9
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        (182 verified reviews)
                      </span>
                    </div>
                  </div>

                  {/* Badges & Verification */}
                  <div className="flex flex-wrap gap-space-xs">
                    <span className="bg-primary-fixed text-on-primary-fixed px-space-sm py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span>
                      In-Network
                    </span>
                    <span className="bg-secondary-fixed text-on-secondary-fixed px-space-sm py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                      Accepting Patients
                    </span>
                  </div>

                  <div className="w-full h-px bg-surface-container-highest" />

                  {/* Clinic Location Details */}
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                      Primary Clinic Location
                    </span>
                    <div className="flex items-start gap-space-sm">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                        location_on
                      </span>
                      <div>
                        <p className="font-label-lg text-label-lg text-on-surface font-semibold">
                          Eastside Pediatrics, NY
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          240 Eastside Ave, Suite 410
                          <br />
                          New York, NY 10028
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Credentials / Spoken Languages */}
                  <div className="flex flex-col gap-space-xs">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline">
                      Spoken Languages
                    </span>
                    <div className="flex gap-space-xs">
                      <span className="bg-surface-container px-space-sm py-0.5 rounded text-label-sm font-label-sm text-on-surface-variant">
                        English
                      </span>
                      <span className="bg-surface-container px-space-sm py-0.5 rounded text-label-sm font-label-sm text-on-surface-variant">
                        Spanish (Clinical)
                      </span>
                    </div>
                  </div>

                  {/* Practice Highlights Sparkline */}
                  <div className="bg-surface-container-low rounded-lg p-space-sm flex items-center justify-between">
                    <div>
                      <p className="font-label-sm text-label-sm text-outline">Avg. Wait Time</p>
                      <p className="font-headline-sm text-headline-sm font-bold text-primary">
                        8 mins
                      </p>
                    </div>
                    <svg
                      className="w-20 h-8 text-primary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 100 32"
                    >
                      <path d="M0 24 Q 25 18, 45 22 T 80 8 L 100 12" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* CENTER COLUMN: Slot Selection Matrix with Composite Resource Collision Check (col-span-12 lg:col-span-6) */}
              <div className="col-span-12 lg:col-span-6 flex flex-col gap-space-lg bg-surface-container-lowest rounded-xl p-space-lg shadow-xs">
                {/* Header row & Timezone selector */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                  <div>
                    <h1 className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">
                      Available Appointments
                    </h1>
                    <p className="font-body-md text-body-md text-on-surface-variant">
                      Real-time intersection of Physician, Room &amp; Equipment availability
                    </p>
                  </div>
                  <div className="flex items-center gap-space-xs bg-surface-container-low px-space-md py-space-xs rounded-lg self-start sm:self-auto">
                    <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                      public
                    </span>
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Eastern Time (UTC-5)
                    </span>
                  </div>
                </div>

                {/* Clinical Service / Procedure Modality Selector */}
                <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-on-surface flex items-center gap-1.5 uppercase tracking-wider">
                      <span className="material-symbols-outlined text-[16px] text-primary">medical_services</span>
                      Select Clinical Service (Resource Requirements)
                    </span>
                    <span className="text-[10px] text-primary font-semibold">
                      Auto-updates resource dependencies
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {CLINICAL_SERVICES.map((srv) => {
                      const isSelected = srv.id === selectedServiceId;
                      return (
                        <button
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          type="button"
                          className={`flex flex-col items-start p-2.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? "bg-primary-container text-on-primary border-primary shadow-xs font-medium"
                              : "bg-surface-container-lowest text-on-surface border-outline-variant/30 hover:border-primary/40"
                          }`}
                        >
                          <span className="text-xs font-bold leading-snug">{srv.name}</span>
                          <span
                            className={`text-[10px] mt-1 ${
                              isSelected ? "text-on-primary/80" : "text-on-surface-variant"
                            }`}
                          >
                            {srv.durationMinutes} min &bull; ₹{srv.copayAmount.toLocaleString('en-IN')} copay
                          </span>
                          <span
                            className={`text-[9px] mt-1 px-1.5 py-0.2 rounded font-mono ${
                              isSelected
                                ? "bg-on-primary/20 text-on-primary"
                                : "bg-surface-container-high text-on-surface-variant"
                            }`}
                          >
                            Req: {srv.requiredRoomCategory.replace("_", " ")}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5-Day Horizontal Date Selector Tabs */}
                <div className="grid grid-cols-5 gap-space-xs bg-surface-container-low p-space-xs rounded-xl">
                  {dateTabs.map((item, index) => {
                    const isActive = index === selectedDateIndex;
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDateIndex(index)}
                        className={`flex flex-col items-center justify-center p-space-sm rounded-lg transition-all ${
                          isActive
                            ? "bg-primary-container text-on-primary shadow-xs scale-[1.02]"
                            : "hover:bg-surface-container text-on-surface-variant hover:text-on-surface"
                        }`}
                        type="button"
                      >
                        <span className="font-label-sm text-label-sm opacity-90 uppercase tracking-wider">
                          {item.day}
                        </span>
                        <span
                          className={`font-headline-sm text-headline-sm my-0.5 ${
                            isActive ? "font-bold text-on-primary" : "font-semibold text-on-surface"
                          }`}
                        >
                          {item.date}
                        </span>
                        <span
                          className={`px-space-xs py-0.5 rounded-full font-label-sm text-[10px] ${
                            isActive
                              ? "bg-on-primary/20 text-on-primary"
                              : "text-on-surface-variant"
                          }`}
                        >
                          {item.slots} slots
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* MORNING SLOTS SECTION WITH MULTI-RESOURCE STATUS */}
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center justify-between text-on-surface">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-primary text-[20px]">
                        light_mode
                      </span>
                      <h2 className="font-headline-sm text-headline-sm font-bold">
                        Morning Sessions
                      </h2>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        (9:00 AM – 12:00 PM)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-space-sm">
                    {morningSlots.map((slot) => {
                      const isSelected = selectedSlotTime === slot.time && slot.isAvailable;
                      const isBlocked = !slot.isAvailable;

                      return (
                        <button
                          key={slot.time}
                          disabled={isBlocked}
                          onClick={() => slot.isAvailable && setSelectedSlotTime(slot.time)}
                          className={`py-space-sm px-2 rounded-lg font-label-lg text-label-lg flex flex-col items-center justify-center transition-all relative ${
                            isSelected
                              ? "bg-primary-container text-on-primary shadow-md font-bold"
                              : isBlocked
                              ? "bg-slate-100 text-slate-400 border border-dashed border-slate-300 cursor-not-allowed opacity-80"
                              : "bg-surface-container-low hover:bg-surface-container hover:shadow-xs text-on-surface"
                          }`}
                          type="button"
                          title={isBlocked ? slot.bottleneckMessage : undefined}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <span>{slot.time}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px]">
                                check_circle
                              </span>
                            )}
                          </div>

                          {isSelected ? (
                            <span className="bg-on-primary/20 text-on-primary px-space-xs py-0.2 rounded font-label-sm text-[10px] uppercase font-bold tracking-wider mt-0.5">
                              [Selected]
                            </span>
                          ) : isBlocked ? (
                            <span className="text-[9px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded mt-0.5 leading-tight text-center">
                              {slot.bottleneck === "ROOM_COLLISION"
                                ? "Room Collision"
                                : slot.bottleneck === "EQUIPMENT_IN_USE"
                                ? "Equipment Busy"
                                : "Unavailable"}
                            </span>
                          ) : (
                            <span className="font-label-sm text-[10px] text-teal-700 font-semibold flex items-center gap-0.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              {slot.allocatedResources?.room.name.replace("Exam Room ", "Room ") || "In-Person"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* AFTERNOON SLOTS SECTION WITH MULTI-RESOURCE STATUS */}
                <div className="flex flex-col gap-space-md">
                  <div className="flex items-center gap-space-xs text-on-surface">
                    <span className="material-symbols-outlined text-tertiary-container text-[20px]">
                      sunny
                    </span>
                    <h2 className="font-headline-sm text-headline-sm font-bold">
                      Afternoon Sessions
                    </h2>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      (1:30 PM – 5:00 PM)
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-space-sm">
                    {afternoonSlots.map((slot) => {
                      const isSelected = selectedSlotTime === slot.time && slot.isAvailable;
                      const isBlocked = !slot.isAvailable;

                      return (
                        <button
                          key={slot.time}
                          disabled={isBlocked}
                          onClick={() => slot.isAvailable && setSelectedSlotTime(slot.time)}
                          className={`py-space-sm px-2 rounded-lg font-label-lg text-label-lg flex flex-col items-center justify-center transition-all relative ${
                            isSelected
                              ? "bg-primary-container text-on-primary shadow-md font-bold"
                              : isBlocked
                              ? "bg-slate-100 text-slate-400 border border-dashed border-slate-300 cursor-not-allowed opacity-80"
                              : "bg-surface-container-low hover:bg-surface-container hover:shadow-xs text-on-surface"
                          }`}
                          type="button"
                          title={isBlocked ? slot.bottleneckMessage : undefined}
                        >
                          <div className="flex items-center gap-1 font-bold">
                            <span>{slot.time}</span>
                            {isSelected && (
                              <span className="material-symbols-outlined text-[16px]">
                                check_circle
                              </span>
                            )}
                          </div>

                          {isSelected ? (
                            <span className="bg-on-primary/20 text-on-primary px-space-xs py-0.2 rounded font-label-sm text-[10px] uppercase font-bold tracking-wider mt-0.5">
                              [Selected]
                            </span>
                          ) : isBlocked ? (
                            <span className="text-[9px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-1 py-0.2 rounded mt-0.5 leading-tight text-center">
                              {slot.bottleneck === "ROOM_COLLISION"
                                ? "Room Collision"
                                : slot.bottleneck === "EQUIPMENT_IN_USE"
                                ? "Equipment Busy"
                                : "Unavailable"}
                            </span>
                          ) : (
                            <span className="font-label-sm text-[10px] text-teal-700 font-semibold flex items-center gap-0.5 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                              {slot.allocatedResources?.room.name.replace("Exam Room ", "Room ") || "In-Person"}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Collision Prevention Advisory */}
                <div className="bg-surface-container-high/40 rounded-lg p-space-md flex items-start gap-space-sm border border-outline-variant/30">
                  <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">
                    verified_user
                  </span>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    <strong>Zero-Collision Guarantee:</strong> Each bookable slot cross-checks provider calendars against exam room assignments and diagnostic machinery before locking.
                  </p>
                </div>
              </div>

              {/* RIGHT COLUMN: Booking Summary Sidebar with Composite Resource Bundle (col-span-12 lg:col-span-3) */}
              <div className="col-span-12 lg:col-span-3">
                <div className="sticky top-20 bg-surface-container-lowest rounded-xl p-space-lg shadow-xs flex flex-col gap-space-md">
                  {/* Header */}
                  <div className="flex items-center justify-between pb-space-sm">
                    <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                      Booking Summary
                    </h2>
                    <span className="bg-surface-container-high text-on-surface font-label-sm text-label-sm px-space-xs py-0.5 rounded-md font-semibold">
                      Step {currentStep} of 3
                    </span>
                  </div>

                  <div className="w-full h-px bg-surface-container-highest" />

                  {/* Appointment Details List */}
                  <div className="flex flex-col gap-space-md">
                    {/* Healthcare Provider */}
                    <div className="flex items-start gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-primary-fixed/50 flex items-center justify-center text-primary shrink-0">
                        <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                          Healthcare Provider
                        </span>
                        <p className="font-label-lg text-label-lg font-bold text-on-surface">
                          Dr. Elizabeth Evans, MD
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Pediatrics Specialist
                        </p>
                      </div>
                    </div>

                    {/* Reserved Time */}
                    <div className="flex items-start gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                          Reserved Time
                        </span>
                        <p className="font-label-lg text-label-lg font-bold text-primary">
                          {selectedDate.fullDate}
                        </p>
                        <p className="font-body-md text-body-md font-bold text-primary">
                          {selectedSlotTime} EST ({selectedService.durationMinutes} min)
                        </p>
                      </div>
                    </div>

                    {/* COMPOSITE RESOURCE LOCK BREAKDOWN (Clinical Mutex) */}
                    <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80 space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-800">
                        <span className="material-symbols-outlined text-[16px]">lock</span>
                        <span className="text-xs font-bold uppercase tracking-wider">
                          Compound Clinical Lock
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">meeting_room</span>
                            Room:
                          </span>
                          <span className="font-semibold text-slate-800">
                            {currentAllocation?.room.name || "Suite 3A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">biotech</span>
                            Equipment:
                          </span>
                          <span className="font-semibold text-slate-800">
                            {currentAllocation?.equipment[0]?.name || "Vitals Hub A"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-slate-500 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px] text-emerald-600">support_agent</span>
                            Aux Staff:
                          </span>
                          <span className="font-semibold text-slate-800">
                            {currentAllocation?.staff?.name || "MA Jenkins"}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 border-t border-emerald-200/50 flex items-center gap-1 text-[10px] text-emerald-700 font-medium">
                        <span className="material-symbols-outlined text-[12px]">check</span>
                        <span>Multi-Resource Mutex: 4/4 Verified Free</span>
                      </div>
                    </div>

                    {/* Clinic Location */}
                    <div className="flex items-start gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                        <span className="material-symbols-outlined text-[18px]">pin_drop</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                          Location
                        </span>
                        <p className="font-label-lg text-label-lg font-semibold text-on-surface">
                          Eastside Pediatrics &bull; Suite 410
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          240 Eastside Ave, New York, NY
                        </p>
                      </div>
                    </div>

                    {/* Visit Type */}
                    <div className="flex items-start gap-space-sm">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-on-surface-variant shrink-0">
                        <span className="material-symbols-outlined text-[18px]">person</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                          Service
                        </span>
                        <p className="font-label-lg text-label-lg font-semibold text-on-surface">
                          {selectedService.name}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-px bg-surface-container-highest" />

                  {/* Insurance Verification Block */}
                  <div className="bg-surface-container-low rounded-lg p-space-sm flex flex-col gap-1">
                    <div className="flex items-center gap-space-xs text-primary">
                      <span className="material-symbols-outlined text-[16px]">verified_user</span>
                      <span className="font-label-sm text-label-sm font-bold uppercase">
                        Insurance Verified
                      </span>
                    </div>
                    <p className="font-label-lg text-label-lg font-bold text-on-surface">
                      Aetna Choice POS II
                    </p>
                    <div className="flex items-center justify-between text-on-surface-variant font-body-sm text-body-sm mt-1">
                      <span>Estimated Copay</span>
                      <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                        ₹{selectedService.copayAmount.toLocaleString('en-IN')}.00
                      </span>
                    </div>
                  </div>

                  {/* Action CTAs */}
                  <div className="flex flex-col gap-space-sm pt-space-xs">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-primary-container hover:bg-primary text-on-primary py-space-sm px-space-md rounded-xl font-label-lg text-label-lg font-bold shadow-md flex items-center justify-center gap-space-xs transition-colors cursor-pointer"
                      type="button"
                    >
                      <span>Continue to Patient Info (Step 2)</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </button>

                    <button
                      className="w-full py-space-xs text-on-surface-variant hover:text-error font-label-md text-label-md text-center transition-colors cursor-pointer"
                      type="button"
                    >
                      Cancel Reservation
                    </button>
                  </div>

                  <p className="font-body-sm text-[11px] text-center text-outline leading-tight">
                    Multi-resource holds automatically release after 5 minutes of inactivity.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

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
