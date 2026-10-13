"use client";

import { useEffect, useState, useCallback } from "react";
import { Hourglass, Lock } from "lucide-react";

interface HoldBannerProps {
  initialMinutes?: number;
  initialSeconds?: number;
}

export default function HoldBanner({
  initialMinutes = 4,
  initialSeconds = 52,
}: HoldBannerProps) {
  const [timeLeft, setTimeLeft] = useState(
    initialMinutes * 60 + initialSeconds
  );

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = useCallback((totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, []);

  return (
    <div
      className="mx-auto w-full max-w-7xl px-4 pt-4 sm:px-6 lg:px-8"
      role="alert"
      aria-live="polite"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#FEF3C7] bg-[#FFFBEB] px-4 py-3 sm:px-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
            <Hourglass className="h-5 w-5 animate-pulse" />
          </div>
          <p className="text-sm font-medium text-amber-950">
            This slot is temporarily held for{" "}
            <span className="inline-flex items-center rounded-md bg-amber-200/80 px-2 py-0.5 font-mono text-sm font-bold text-amber-900 tracking-wider">
              {formatTime(timeLeft)}
            </span>{" "}
            to secure your time. Please complete your booking below.
          </p>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-amber-700 font-medium">
          <Lock className="h-3.5 w-3.5" />
          <span>Guaranteed Hold</span>
        </div>
      </div>
    </div>
  );
}
