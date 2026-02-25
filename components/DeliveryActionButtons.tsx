"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, RotateCcw, MessageSquare } from "lucide-react";
import { ReleaseFundsDialog } from "./ReleaseFundsDialog";

interface DeliveryActionButtonsProps {
  deliveryId: string;
  taskId: string;
  status: "pending" | "in_review" | "approved" | "rejected";
  userRole?: string;
  onApprove?: (deliveryId: string, taskId: string) => Promise<void>;
  onRequestRevision?: (deliveryId: string, reason: string) => Promise<void>;
  onResubmit?: () => void;
}

export function DeliveryActionButtons({
  deliveryId,
  taskId,
  status,
  userRole,
  onApprove,
  onRequestRevision,
  onResubmit,
}: DeliveryActionButtonsProps) {
  const [revisionDialogOpen, setRevisionDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [loadingAmount, setLoadingAmount] = useState(false);

  const isClient = userRole?.toUpperCase() === "CLIENT";
  const isFreelancer = userRole?.toUpperCase() === "FREELANCER";

  // Fetch payment amount when approve dialog is about to open
  const handleApproveClick = async () => {
    setApprovalError(null);
    setLoadingAmount(true);
    try {
      const response = await fetch(`/api/payments/amount?taskId=${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentAmount(data.amount);
      }
    } catch (err) {
      console.error("Failed to fetch payment amount:", err);
      setPaymentAmount(null);
    } finally {
      setLoadingAmount(false);
      setApproveDialogOpen(true);
    }
  };

  const handleApprove = async () => {
    if (!onApprove) return;
    setApproving(true);
    setApprovalError(null);
    try {
      await onApprove(deliveryId, taskId);
      setApproveDialogOpen(false);
    } catch (err: any) {
      console.error("Approval error:", err);
      setApprovalError(err.message || "Failed to approve delivery");
    } finally {
      setApproving(false);
    }
  };

  const handleRequestRevision = async () => {
    if (!onRequestRevision) return;
    setRequesting(true);
    try {
      await onRequestRevision(deliveryId, revisionReason);
      setRevisionDialogOpen(false);
      setRevisionReason("");
    } finally {
      setRequesting(false);
    }
  };

  // Freelancer view
  if (isFreelancer) {
    if (status === "rejected") {
      return (
        <div className="flex gap-2">
          <Button
            onClick={onResubmit}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw size={16} />
            Re-submit Delivery
          </Button>
        </div>
      );
    }
    return null;
  }

  // Client view
  if (isClient) {
    if (status === "pending" || status === "in_review") {
      return (
        <>
          <div className="flex gap-2">
            <Button
              onClick={handleApproveClick}
              disabled={approving || loadingAmount}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 size={16} />
              {approving ? "Approving..." : "Approve & Release Funds"}
            </Button>
            <Button
              onClick={() => setRevisionDialogOpen(true)}
              disabled={requesting}
              variant="outline"
              className="flex items-center gap-2 border-amber-500 text-amber-600 hover:bg-amber-50"
            >
              <MessageSquare size={16} />
              Request Revision
            </Button>
          </div>

          {/* Approval Dialog */}
          <ReleaseFundsDialog
            open={approveDialogOpen}
            onOpenChange={setApproveDialogOpen}
            onConfirm={handleApprove}
            loading={approving}
            amount={paymentAmount ?? undefined}
            currency="USD"
            isApproval={true}
            error={approvalError}
          />

          {/* Revision Dialog */}
          <Dialog open={revisionDialogOpen} onOpenChange={setRevisionDialogOpen}>
            <DialogContent className="sm:max-w-[500px] bg-cardC text-textNa border-none border border-cardCB">
              <DialogHeader>
                <DialogTitle>Request Revision</DialogTitle>
                <DialogDescription className="text-textNd">
                  Provide feedback on what needs to be revised
                </DialogDescription>
              </DialogHeader>

              <Textarea
                placeholder="Describe what changes or revisions you'd like..."
                value={revisionReason}
                onChange={(e) => setRevisionReason(e.target.value)}
                className="min-h-[120px] border-cardCB text-textNc placeholder:text-textNd rounded-md"
              />

              <DialogFooter>
                <Button
                  onClick={() => setRevisionDialogOpen(false)}
                  variant="outline"
                  className="border-cardCB text-textNb"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleRequestRevision}
                  disabled={requesting || !revisionReason.trim()}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {requesting ? "Sending..." : "Send Request"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      );
    }
  }

  return null;
}
