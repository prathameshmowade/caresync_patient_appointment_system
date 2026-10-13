"use client";

import {
  CalendarDays,
  MapPin,
  User,
  ArrowRight,
  X,
  Stethoscope,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

interface BookingSummaryProps {
  selectedSlot: string;
  selectedDateLabel: string;
}

export default function BookingSummary({
  selectedSlot,
  selectedDateLabel,
}: BookingSummaryProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden h-full">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-4.5 bg-slate-50/50">
        <h2 className="text-base font-bold text-slate-900 sm:text-lg">
          Booking Summary
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Review your appointment reservation
        </p>
      </div>

      {/* Appointment Information Card */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3.5">
          {/* Doctor Info */}
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-100 text-teal-800">
              <Stethoscope className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Doctor
              </span>
              <p className="text-sm font-bold text-slate-900">
                Dr. Elizabeth Evans, MD
              </p>
              <p className="text-xs text-slate-500">Pediatrics / Family Medicine</p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Selected Date &amp; Time
              </span>
              <p className="text-sm font-bold text-slate-900">
                {selectedDateLabel}
              </p>
              <p className="text-xs font-semibold text-teal-700 mt-0.5">
                at {selectedSlot} EST
              </p>
            </div>
          </div>

          {/* Location */}
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-800">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Clinic Location
              </span>
              <p className="text-sm font-bold text-slate-900">
                Eastside Pediatrics
              </p>
              <p className="text-xs text-slate-500">240 Eastside Ave, New York, NY</p>
            </div>
          </div>

          {/* Visit Type */}
          <div className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 border border-slate-100">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 text-violet-800">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Visit Type
              </span>
              <p className="text-sm font-bold text-slate-900">
                In-Person &bull; Consultation
              </p>
              <p className="text-xs text-slate-500">Duration: 30 minutes</p>
            </div>
          </div>
        </div>

        {/* Action Buttons & Badges */}
        <div className="pt-2 space-y-3">
          {/* Primary CTA */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3.5 text-sm font-bold text-white shadow-md shadow-teal-700/20 transition-all hover:bg-teal-800 hover:shadow-lg hover:shadow-teal-700/25 active:scale-[0.99]"
          >
            <span>Continue to Patient Info (Step 2)</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          {/* Secondary Action */}
          <button
            type="button"
            className="flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:text-rose-600"
          >
            <X className="h-3.5 w-3.5" />
            <span>Cancel Reservation</span>
          </button>

          {/* Trust badges */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-600" />
              HIPAA Compliant
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-teal-600" />
              Free Cancellation
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
