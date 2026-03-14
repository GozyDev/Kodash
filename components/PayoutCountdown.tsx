// app/tasks/PayoutCountdown.tsx
"use client";

import { Timer, TriangleAlert } from "lucide-react";
import { useState, useEffect } from "react";

export default function PayoutCountdown({
  deadline,
  className,
  outer
}: {
  deadline: string;
  className: string;
  outer: string;
}) {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const distance = target - now;

      if (distance <= 0) {
        // The 7 days are completely gone
        setTimeLeft("Deadline passed - Auto-payout is triggering");
        setIsExpired(true);
        clearInterval(timer);
      } else {
        // Calculate days and hours left
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        );

        if (days > 1) {
          setTimeLeft(`${days} days left for auto-payout`);
        } else if (days === 1) {
          setTimeLeft(`1 day left for auto-payout`);
        } else {
          // Less than 24 hours left
          setTimeLeft(`Less than 1 day left (${hours} hours remaining)`);
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [deadline]);

  return (
    <div
      className={`mt-5 ${outer}  flex flex-col gap-2 bg-cardC/0  text-sm  ${
        isExpired ? "border-red-200" : ""
      }`}
    >
      <div className={`flex ${className}`}>
        <span className=" text-[13px] uppercase tracking text-textNc inline-flex items-center gap-1">
          {isExpired ? (
            <TriangleAlert
              size={15}
              strokeWidth={2}
              className="text-yellow-700"
            />
          ) : (
            <Timer size={15} strokeWidth={2} className="text-pink-700" />
          )}
          {isExpired ? "Action Required" : "Review Period"}
        </span>
        <span className="text-xs opacity-70 ">
          Deadline: {new Date(deadline).toLocaleDateString()}
        </span>
      </div>

      {/* This is the clear text you wanted */}
      <p className="text-sm text-textNc">{timeLeft}</p>

      <button
        onClick={(e) => {
          e.stopPropagation();
          // Dispute logic
        }}
        className="mt-2 w-max px-4 py-2 bg-cardCB/90 text-white text-xs rounded-md hover:bg-cardCB/50 transition-colors cursor-pointer"
      >
        RAISE A DISPUTE
      </button>
    </div>
  );
}
