"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReleaseFundsDialog } from "./ReleaseFundsDialog";
import { CheckCircle2 } from "lucide-react";

interface ReleaseFundsButtonProps {
  userRole?: string;
  onRelease: () => Promise<void>;
  loading?: boolean;
}

export function ReleaseFundsButton({
  userRole,
  onRelease,
  loading = false,
}: ReleaseFundsButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  // Only show for clients (handle both uppercase and lowercase)
  const isClient = userRole?.toUpperCase() === "CLIENT";
  if (!isClient) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        <Button
          onClick={() => setDialogOpen(true)}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          <CheckCircle2 size={16} />
          Agree and Release Funds
        </Button>
      </div>

      <ReleaseFundsDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onConfirm={onRelease}
        loading={loading}
      />
    </>
  );
}
