"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, ArrowRight } from "lucide-react";

interface StripeOnboardingRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinueToOnboarding: () => void;
  status?: string;
}

export default function StripeOnboardingRequiredDialog({
  open,
  onOpenChange,
  onContinueToOnboarding,
  status = "not_started",
}: StripeOnboardingRequiredDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      await onContinueToOnboarding();
    } finally {
      setIsLoading(false);
    }
  };

  const getMessage = () => {
    switch (status) {
      case "pending":
        return "You've started the Stripe setup but haven't finished. Please complete your account setup to submit proposals.";
      case "failed":
        return "Your Stripe setup encountered an error. Please try again to connect your account.";
      case "not_started":
      default:
        return "To submit proposals and get paid, you need to connect your bank account with Stripe. This is a one-time setup that takes just a few minutes.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-cardC text-textNa border-none border border-cardCB">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <DialogTitle>Complete Stripe Setup</DialogTitle>
          </div>
          <DialogDescription className="text-textNc pt-2">
            {getMessage()}
          </DialogDescription>
        </DialogHeader>

        <div className="bg-cardICB/30 rounded-lg p-4 border border-cardCB space-y-2">
          <p className="text-sm font-medium text-textNa">What you&apos;ll do:</p>
          <ul className="text-sm text-textNc space-y-1 ml-4">
            <li>✓ Verify your business information</li>
            <li>✓ Add your bank account details</li>
            <li>✓ Confirm your identity</li>
          </ul>
        </div>

        <DialogFooter className="flex gap-2 sm:flex-row flex-col">
          <Button
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="flex-1 bg-cardICB/50 hover:bg-cardICB/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isLoading}
            className="flex-1 bg-[#7c3aed] hover:bg-[#7c3aede8] flex items-center justify-center gap-2"
          >
            {isLoading ? "Redirecting..." : "Continue to Stripe"}
            {!isLoading && <ArrowRight size={16} />}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
