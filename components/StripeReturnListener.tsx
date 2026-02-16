// components/StripeReturnListener.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function StripeReturnListener() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Ref to prevent double-checking in strict mode
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkStripeStatus = async () => {
      // Only run check if we have NOT already checked in this mount (prevents React Strict Mode double-call)
      if (hasChecked.current) return;
      hasChecked.current = true;

      // Check for stripe_return parameter - only run status check if present
      const stripeReturn = searchParams?.get("stripe_return");

      if (!stripeReturn) {
        return;
      }

      try {

        // Call check status API
        const res = await fetch("/api/stripe/check_status");
        const data = await res.json();

        if (data.status === "completed") {
          toast.success("Bank account connected successfully!");
          router.refresh();
        } else if (data.status === "pending") {
          toast.info("Setup incomplete. Please finish adding your details.");
          router.refresh();
        } else if (data.status === "failed") {
          toast.error("Failed to complete Stripe setup. Please try again.");
        }
      } catch (error) {
        console.error("Failed to check stripe status", error);
        toast.error("Error checking Stripe setup status");
      } finally {
        // Remove the stripe_return parameter from URL after processing
        // This prevents the toast from showing again if user navigates away and back
        if (stripeReturn) {
          const url = new URL(window.location.href);
          url.searchParams.delete("stripe_return");
          window.history.replaceState({}, "", url.toString());
        }
      }
    };

    checkStripeStatus();
  }, [router, searchParams]);

  return null; // This component renders nothing, it's just logic
}