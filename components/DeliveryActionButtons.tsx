"use client";

import { useState } from "react";
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
import {
  CheckCircle2,
  MessageSquare,
  Check,
  X,
} from "lucide-react";
import { ReleaseFundsDialog } from "./ReleaseFundsDialog";
import ConfirmRevisionDialog from "./ConfirmRevisionDialog";

interface DeliveryActionButtonsProps {
  deliveryId: string;
  taskId: string;
  status: "pending" | "in_review" | "approved" | "rejected" | "revision";
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
  const [revisionActionDialogOpen, setRevisionActionDialogOpen] = useState(false);
  const [revisionAction, setRevisionAction] = useState<"reject" | "accept" | null>(null);

  const [revisionReason, setRevisionReason] = useState("");
  const [approving, setApproving] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number | null>(null);
  const [approvalError, setApprovalError] = useState<string | null>(null);
  const [loadingAmount, setLoadingAmount] = useState(false);

  const isClient = userRole?.toUpperCase() === "CLIENT";
  const isFreelancer = userRole?.toUpperCase() === "FREELANCER";

  const openRevisionActionDialog = (action: "reject" | "accept") => {
    setRevisionAction(action);
    setRevisionActionDialogOpen(true);
  };

  const handleApproveClick = async () => {
    setApprovalError(null);
    setLoadingAmount(true);

    try {
      const response = await fetch(`/api/payments/amount?taskId=${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentAmount(data.amount);
      } else {
        setPaymentAmount(null);
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
    } catch (err: unknown) {
      console.error("Approval error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to approve delivery";
      setApprovalError(message);
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

  if (isFreelancer) {
    if (status === "revision") {
      return (
        <>
          <div className="flex flex-col gap-5">
            <p className="text-sm text-[#F59E0B]/90">
              Revision request has been made on the deliverables
            </p>

            <div className="flex gap-2">
              <Button
                onClick={() => openRevisionActionDialog("reject")}
                className="flex items-center gap-2 bg-cardICB/50"
              >
                <X size={16} />
                Reject Request
              </Button>

              <Button
                onClick={() => openRevisionActionDialog("accept")}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Check size={16} />
                Accept Request
              </Button>
            </div>
          </div>

          <ConfirmRevisionDialog
            open={revisionActionDialogOpen}
            onOpenChange={setRevisionActionDialogOpen}
            action={revisionAction ?? "reject"}
            onConfirm={onResubmit}
          />
        </>
      );
    }

    return null;
  }

  if (isClient) {
    if (status === "pending" || status === "in_review") {
      return (
        <>
          <div className="flex gap-2 flex-col md:flex-row">
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

          <Dialog
            open={revisionDialogOpen}
            onOpenChange={setRevisionDialogOpen}
          >
            <DialogContent className="sm:max-w-[500px] bg-cardC text-textNa border border-cardCB">
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