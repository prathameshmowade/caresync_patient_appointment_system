"use client";

import {
  HeartPulse,
  Search,
  CalendarDays,
  ShieldCheck,
  HelpCircle,
  Bell,
  ChevronDown,
} from "lucide-react";

const navLinks = [
  { label: "Find a Doctor", icon: Search, href: "#", active: true },
  { label: "My Appointments", icon: CalendarDays, href: "#", active: false },
  { label: "Insurance Partners", icon: ShieldCheck, href: "#", active: false },
  { label: "Help", icon: HelpCircle, href: "#", active: false },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-8">
          <a
            href="#"
            className="flex items-center gap-2.5 transition-transform hover:scale-[1.01]"
            aria-label="CareSync Home"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-sm shadow-teal-600/20">
              <HeartPulse className="h-6 w-6 text-white" strokeWidth={2.3} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                Care<span className="text-teal-600">Sync</span>
              </span>
              <span className="text-[10px] font-medium tracking-wider text-slate-400 uppercase mt-0.5">
                Medical Network
              </span>
            </div>
          </a>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Main navigation">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.label}
                  href={link.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    link.active
                      ? "bg-teal-50 text-teal-800 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${link.active ? "text-teal-600" : "text-slate-400"}`} />
                  {link.label}
                </a>
              );
            })}
          </nav>
        </div>

        {/* Right side: Notifications & User profile */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="View notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-teal-500 ring-2 ring-white" />
          </button>

          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* User profile chip */}
          <button
            type="button"
            className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3 transition-all hover:border-slate-300 hover:shadow-xs"
            aria-label="User profile for Sarah C."
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-teal-700 to-teal-500 text-xs font-bold text-white shadow-xs">
              SC
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 leading-none">Sarah C.</p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">Patient</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>
      </div>
    </header>
  );
}
