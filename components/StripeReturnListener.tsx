// components/StripeReturnListener.tsx
"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
 // Assuming you use sonner or similar for toasts

export default function StripeReturnListener() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // We use a ref to make sure we don't call the API twice in strict mode
  const hasChecked = useRef(false);

  useEffect(() => {
    // 1. Check if we just came back from Stripe
    // Usually, you can add ?check_stripe=true to your return_url in the onboardFreelancer action
    // Or just run this check once on mount if you want to be safe.
    
    const checkStripeStatus = async () => {
      if (hasChecked.current) return;
      hasChecked.current = true;

      try {
        // 2. Call your Check API
        const res = await fetch("/api/stripe/check_status");
        const data = await res.json();

        if (data.status === "completed") {
          toast.success("Bank account connected successfully!");
          // 3. REFRESH the page data
          // This tells Next.js to re-fetch the data in your layout/sidebar
          router.refresh(); 
        } else if (data.status === "pending") {
           toast.info("Setup incomplete. Please finish adding your details.");
           router.refresh();
        }
      } catch (error) {
        console.error("Failed to check stripe status", error);
      }
    };

    checkStripeStatus();
  }, [router]);

  return null; // This component renders nothing, it's just logic
}