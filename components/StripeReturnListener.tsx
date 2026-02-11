// components/StripeReturnListener.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

const STRIPE_CHECK_FLAG = "stripe_onboarding_checked";

export default function StripeReturnListener() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Ref to prevent double-checking in strict mode
  const hasChecked = useRef(false);

  useEffect(() => {
    const checkStripeStatus = async () => {
      // Only run check if we have NOT already checked in this session
      if (hasChecked.current) return;
      hasChecked.current = true;

      // Check for stripe_return parameter - only run status check if present
      const stripeReturn = searchParams?.get("stripe_return");
      
      // Also check sessionStorage to prevent running check if already done this session
      const alreadyChecked = sessionStorage.getItem(STRIPE_CHECK_FLAG);

      if (!stripeReturn || alreadyChecked) {
        return;
      }

      try {
        // Set the flag before making the request to prevent duplicate checks
        sessionStorage.setItem(STRIPE_CHECK_FLAG, "true");

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