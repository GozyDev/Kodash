"use client";

import { Button } from "./ui/button";
import {
  DollarSign,
  Calendar,
  CheckCircle2,
  Info,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTaskStore } from "@/app/store/useTask";
import { Loader2 } from "lucide-react";
import type { Proposal } from "./IndivisualIssuepageClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

interface ProposalOverviewProps {
  proposal: Proposal;
  orgId?: string;
  onEdit?: () => void;
  onWithdraw?: () => void;
  issueId?: string;
}

export default function ProposalOverview({
  proposal,
  orgId,
  onEdit,
  onWithdraw,
  issueId,
}: ProposalOverviewProps) {
  const [localProposal, setLocalProposal] = useState<Proposal>(proposal);
  useEffect(() => setLocalProposal(proposal), [proposal]);
  const [role, setRole] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "accept" | "reject" | null
  >(null);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!orgId) return;
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`/api/role/${orgId}`);
        if (!res.ok) return;
        const json = await res.json();
        if (mounted) setRole(json.role || null);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [orgId]);
  // Format price with currency
  const formatPrice = () => {
    if (!localProposal.price) return "—";
    const currency = localProposal.currency || "USD";
    const priceValue =
      typeof localProposal.price === "string"
        ? parseFloat(localProposal.price)
        : localProposal.price;

    if (isNaN(priceValue)) return localProposal.price.toString();

    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceValue);

    return `${formatted} ${currency}`;
  };

  // Format due date
  const formatDueDate = () => {
    if (!localProposal.due_date) return "—";
    try {
      const date = new Date(localProposal.due_date);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return localProposal.due_date;
    }
  };

  // Parse DOD - could be JSON array, newline-separated, or plain text
  const parseDOD = (): string[] => {
    if (!localProposal.dod) return [];

    try {
      const parsed = JSON.parse(localProposal.dod);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string" && item.trim());
      }
    } catch {
      const lines = localProposal.dod
        .split(/\n+/)
        .filter((line) => line.trim());
      if (lines.length > 1) {
        return lines.map((line) => line.trim());
      }
      return [localProposal.dod.trim()];
    }

    return [];
  };

  const dodItems = parseDOD();

  return (
    <div className="rounded-xl border border-cardCB bg-cardC p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-textNb">Proposal Overview</h3>
        <div className="flex items-center gap-2">
          {/* Action buttons visible only to CLIENT role and only when proposal is pending */}
          {role === "client" && localProposal.status === "pending" && (
            <div className="flex items-center gap-2">
              {/* <Button
                variant="secondary"
                size="sm"
                className="h-8 px-3 text-xs bg-[#f9be00]/40 hover:bg-[#f9be00]/30 text-whiten rounded"
              >
                
                Dispute
              </Button> */}

              <Button
                variant="destructive"
                size="sm"
                className="h-8 px-3 text-sm bg-red-800/50 text-whiten rounded hover:bg-red-800/40"
                onClick={() => {
                  setPendingAction("reject");
                  setConfirmOpen(true);
                }}
              >
                Reject
              </Button>

              <button
                className="h-8 px-3 text-xs bg-green-800/50 text-whiten rounded hover:bg-green-800/40"
                onClick={() => {
                  setPendingAction("accept");
                  setConfirmOpen(true);
                }}
              >
                Accept
              </button>
            </div>
          )}

          {/* {onEdit && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onEdit}
              className="h-8 px-3 text-xs"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edit
            </Button>
          )}
          {onWithdraw && (
            <Button
              variant="destructive"
              size="sm"
              onClick={onWithdraw}
              className="h-8 px-3 text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              Withdraw Proposal
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button> */}
        </div>
      </div>

      <div className="text-xs text-textNc">
        {localProposal.status === "pending" ? (
          <span className="bg-cardICB/50 py-1 p-2 rounded">
            Proposal Pending
          </span>
        ) : localProposal.status === "accepted" ? (
          <span className="bg-green-800/50 py-1 p-2 rounded">
            Proposal Accepted
          </span>
        ) : (
          <span className="bg-red-800/50 py-1 p-2 rounded">
            Proposal Canceled
          </span>
        )}
      </div>

      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (processing) return; // lock dialog while processing
          if (!open) setPendingAction(null);
          setConfirmOpen(open);
        }}
      >
        <DialogContent className="max-w-md" showCloseButton={!processing}>
          <DialogHeader>
            <DialogTitle>Confirm action</DialogTitle>
            <DialogDescription>
              This action cannot be reverted. Are you sure you want to proceed?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              disabled={processing}
              onClick={() => {
                if (processing) return;
                setConfirmOpen(false);
                setPendingAction(null);
                setErrorMsg(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={async () => {
                if (!pendingAction || !issueId) return;
                setProcessing(true);
                setErrorMsg(null);
                const newStatus =
                  pendingAction === "accept" ? "accepted" : "canceled";

                try {
                  const res = await fetch(`/api/proposal/${issueId}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      status: newStatus,
                      id: proposal.id,
                    }),
                  });

                  if (!res.ok) {
                    const err = await res.json().catch(() => null);
                    setErrorMsg(
                      err?.error || "Failed to update proposal status"
                    );
                    setProcessing(false);
                    return;
                  }

                  const json = await res.json().catch(() => null);
                  const updatedProposal = json?.proposal || null;

                  // Update local state only after server success
                  if (updatedProposal) {
                    setLocalProposal(updatedProposal);
                  } else {
                    setLocalProposal((p) => ({ ...p, status: newStatus }));
                  }

                  // Update global task store mapping
                  const tasks = useTaskStore.getState().task;
                  const updated = tasks.map((t) =>
                    t.id === issueId
                      ? {
                          ...t,
                          status:
                            newStatus === "accepted" ? "on-going" : t.status,
                        }
                      : t
                  );
                  useTaskStore.setState({ task: updated });

                  setProcessing(false);
                  setConfirmOpen(false);
                  setPendingAction(null);
                } catch (err) {
                  console.error("Error updating proposal status:", err);
                  setErrorMsg("Server error while updating proposal status");
                  setProcessing(false);
                }
              }}
            >
              {processing ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                </span>
              ) : (
                "Confirm"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Price Card */}
        <div className="rounded-lg border border-cardCB bg-cardC/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-green-400" />
            <span className="text-xs font-medium text-textNd uppercase tracking-wide">
              Price
            </span>
          </div>
          <p className="text-lg font-semibold text-textNb">{formatPrice()}</p>
        </div>

        {/* Due Date Card */}
        <div className="rounded-lg border border-cardCB bg-cardC/50 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-textNd" />
            <span className="text-xs font-medium text-textNd uppercase tracking-wide">
              Due Date
            </span>
          </div>
          <p className="text-lg font-semibold text-textNb">{formatDueDate()}</p>
        </div>
      </div>

      {/* Definition of Done */}
      {dodItems.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <h4 className="text-sm font-medium text-textNb">
              Definition of Done
            </h4>
            <Info className="h-3.5 w-3.5 text-textNd" />
          </div>
          <ul className="space-y-2 pl-6">
            {dodItems.map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-textNc"
              >
                <CheckCircle2 className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {dodItems.length === 0 && localProposal.dod && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <h4 className="text-sm font-medium text-textNb">
              Definition of Done
            </h4>
            <Info className="h-3.5 w-3.5 text-textNd" />
          </div>
          <p className="text-sm text-textNc pl-6">{localProposal.dod}</p>
        </div>
      )}
    </div>
  );
}
