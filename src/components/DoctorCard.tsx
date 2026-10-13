"use client";

import Image from "next/image";
import {
  Star,
  Building2,
  MapPin,
  CheckCircle2,
  Sparkles,
  CalendarCheck,
  ShieldCheck,
  Phone,
} from "lucide-react";

export default function DoctorCard() {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden h-full">
      {/* Doctor Photo Section with Badge */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <Image
          src="/doctor.jpg"
          alt="Dr. Elizabeth Evans, MD"
          fill
          className="object-cover object-top"
          priority
          sizes="(max-width: 1024px) 100vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur-xs">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span>4.9</span>
          <span className="text-slate-400 font-normal">(182 reviews)</span>
        </div>
      </div>

      {/* Doctor Info Body */}
      <div className="flex flex-1 flex-col p-5">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <span>Verified Physician</span>
            <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mt-1">
            Dr. Elizabeth Evans, MD
          </h2>
          <p className="text-sm font-medium text-slate-500">
            Pediatrics / Family Medicine
          </p>
        </div>

        {/* Badges */}
        <div className="mt-3.5 flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200/60">
            <ShieldCheck className="h-3.5 w-3.5" />
            In-Network
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-700 border border-teal-200/60">
            <Sparkles className="h-3.5 w-3.5" />
            Accepting Patients
          </span>
        </div>

        <div className="my-4 border-t border-slate-100" />

        {/* Clinic & Location Details */}
        <div className="space-y-3 text-sm text-slate-600">
          <div className="flex items-start gap-2.5">
            <Building2 className="h-4 w-4 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-slate-800">Eastside Pediatrics, NY</p>
              <p className="text-xs text-slate-500 mt-0.5">240 Eastside Ave, New York, NY</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-500">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span>0.8 miles away &bull; Manhattan</span>
          </div>
        </div>

        {/* Next Available Metric */}
        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between rounded-lg bg-teal-50/80 border border-teal-100 p-3">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-teal-700" />
              <span className="text-xs font-medium text-slate-600">Next Available:</span>
            </div>
            <span className="rounded-md bg-teal-700 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs">
              Today
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
