"use client";

import { useCallback, useState } from "react";

export type StripeOnboardingStatus = "not_started" | "pending" | "completed" | "failed";

interface UseStripeOnboardingReturn {
  status: StripeOnboardingStatus | null;
  loading: boolean;
  error: string | null;
  checkStatus: () => Promise<StripeOnboardingStatus>;
  redirectToOnboarding: (returnTo: string) => Promise<void>;
  isComplete: boolean;
}

export function useStripeOnboarding(): UseStripeOnboardingReturn {
  const [status, setStatus] = useState<StripeOnboardingStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = useCallback(async (): Promise<StripeOnboardingStatus> => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/stripe/check_status");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to check Stripe status");
      }

      setStatus(data.status);
      return data.status;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      setError(errorMessage);
      setStatus("failed");
      return "failed";
    } finally {
      setLoading(false);
    }
  }, []);

  const redirectToOnboarding = useCallback(
    async (returnTo: string) => {
      try {
        setLoading(true);
        const res = await fetch("/action/onboard-freelancer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ returnTo }),
        });

        const data = await res.json();
        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to redirect";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    status,
    loading,
    error,
    checkStatus,
    redirectToOnboarding,
    isComplete: status === "completed",
  };
}
