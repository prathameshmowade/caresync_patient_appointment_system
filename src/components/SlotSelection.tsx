"use client";

import { Check, Sun, Sunset, Calendar, Clock } from "lucide-react";

interface DateTab {
  day: string;
  date: string;
  dateNum: number;
  slots: number;
}

const dates: DateTab[] = [
  { day: "Mon", date: "Nov 9", dateNum: 9, slots: 6 },
  { day: "Tue", date: "Nov 10", dateNum: 10, slots: 4 },
  { day: "Wed", date: "Nov 11", dateNum: 11, slots: 7 },
  { day: "Thu", date: "Nov 12", dateNum: 12, slots: 3 },
  { day: "Fri", date: "Nov 13", dateNum: 13, slots: 5 },
];

const morningSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
];

const afternoonSlots = [
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
];

interface SlotSelectionProps {
  selectedSlot: string;
  onSelectSlot: (slot: string) => void;
  selectedDate: number;
  onSelectDate: (dateIndex: number) => void;
}

export default function SlotSelection({
  selectedSlot,
  onSelectSlot,
  selectedDate,
  onSelectDate,
}: SlotSelectionProps) {
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-slate-50/50">
        <div>
          <h2 className="text-base font-bold text-slate-900 sm:text-lg">
            Available Appointments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Select an available time slot for your in-person consultation
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>EST (New York)</span>
        </div>
      </div>

      {/* 5-Day Horizontal Date Selector Tabs */}
      <div className="border-b border-slate-200 px-4 pt-3 pb-2 bg-white">
        <div className="grid grid-cols-5 gap-2">
          {dates.map((item, index) => {
            const isActive = index === selectedDate;
            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelectDate(index)}
                className={`relative flex flex-col items-center justify-center rounded-lg py-2.5 px-1 transition-all ${
                  isActive
                    ? "bg-teal-50 text-teal-800 border border-teal-200/80 shadow-xs"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
                aria-pressed={isActive}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  {item.day}
                </span>
                <span className={`text-sm font-bold mt-0.5 ${isActive ? "text-teal-900" : "text-slate-800"}`}>
                  {item.date}
                </span>
                <span className={`text-[11px] font-medium mt-0.5 ${isActive ? "text-teal-700 font-semibold" : "text-slate-400"}`}>
                  {item.slots} slots
                </span>

                {/* Teal Underline indicator */}
                {isActive && (
                  <span className="absolute -bottom-2 left-3 right-3 h-0.5 rounded-full bg-teal-700" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Slots Grid Section */}
      <div className="p-6 space-y-6 flex-1 flex flex-col justify-between">
        {/* Morning Slots */}
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-50 text-amber-600">
              <Sun className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Morning Slots</h3>
            <span className="text-xs text-slate-400 font-medium">(9:00 AM – 11:30 AM)</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {morningSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`group relative flex flex-col items-center justify-center rounded-lg border py-3 px-2 text-sm font-semibold transition-all duration-150 ${
                    isSelected
                      ? "border-teal-800 bg-teal-800 text-white shadow-sm ring-2 ring-teal-700/20"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-xs"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-1.5">
                    {isSelected && <Check className="h-4 w-4 text-teal-200" strokeWidth={2.5} />}
                    <span>{slot}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-medium tracking-wide text-teal-100 uppercase mt-0.5">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Afternoon Slots */}
        <div>
          <div className="flex items-center gap-2 mb-3.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-orange-50 text-orange-600">
              <Sunset className="h-4 w-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">Afternoon Slots</h3>
            <span className="text-xs text-slate-400 font-medium">(1:30 PM – 4:00 PM)</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {afternoonSlots.map((slot) => {
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={slot}
                  type="button"
                  onClick={() => onSelectSlot(slot)}
                  className={`group relative flex flex-col items-center justify-center rounded-lg border py-3 px-2 text-sm font-semibold transition-all duration-150 ${
                    isSelected
                      ? "border-teal-800 bg-teal-800 text-white shadow-sm ring-2 ring-teal-700/20"
                      : "border-slate-200 bg-slate-50 text-slate-800 hover:border-slate-300 hover:bg-white hover:-translate-y-0.5 hover:shadow-xs"
                  }`}
                  aria-pressed={isSelected}
                >
                  <div className="flex items-center gap-1.5">
                    {isSelected && <Check className="h-4 w-4 text-teal-200" strokeWidth={2.5} />}
                    <span>{slot}</span>
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-medium tracking-wide text-teal-100 uppercase mt-0.5">
                      Selected
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="rounded-lg bg-slate-50 border border-slate-100 px-3.5 py-2 text-xs text-slate-500 text-center">
          Appointments are typically 30 minutes. Please arrive 10 minutes prior for check-in.
        </div>
      </div>
    </div>
  );
}
