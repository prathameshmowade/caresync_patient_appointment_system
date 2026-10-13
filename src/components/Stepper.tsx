"use client";

import { Calendar, User, CheckCircle2, ChevronRight } from "lucide-react";

interface StepperProps {
  currentStep?: number;
}

export default function Stepper({ currentStep = 1 }: StepperProps) {
  return (
    <div className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav aria-label="Booking Progress" className="py-2.5">
          <ol className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
            {/* Step 1: Date & Time (Active) */}
            <li className="flex items-center">
              <div
                className="flex items-center gap-2.5 rounded-lg bg-teal-700 px-4 py-2 text-white font-medium shadow-xs"
                aria-current="step"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white">
                  1
                </span>
                <span className="whitespace-nowrap font-semibold">Date &amp; Time</span>
              </div>
              <ChevronRight className="ml-2 sm:ml-3 h-4 w-4 text-slate-300 shrink-0" aria-hidden="true" />
            </li>

            {/* Step 2: Patient Info (Inactive) */}
            <li className="flex items-center">
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-500 font-medium hover:text-slate-700 transition-colors">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                  2
                </span>
                <span className="whitespace-nowrap">Patient Info</span>
              </div>
              <ChevronRight className="ml-2 sm:ml-3 h-4 w-4 text-slate-300 shrink-0" aria-hidden="true" />
            </li>

            {/* Step 3: Confirmation (Inactive) */}
            <li className="flex items-center">
              <div className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-slate-400 font-medium">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-400">
                  3
                </span>
                <span className="whitespace-nowrap">Confirmation</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>
    </div>
  );
}
