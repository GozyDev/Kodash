"use client";

import { Button } from "./ui/button";
import { DollarSign, Calendar, CheckCircle2, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { useTaskStore } from "@/app/store/useTask";
import type { Proposal } from "./IndivisualIssuepageClient";
import ConfirmProposalDecisionDialog from "@/components/ConfirmProposalDecisionDialog";

interface ProposalOverviewProps {
  proposal: Proposal[]; // Now correctly typed as an array
  orgId?: string;
  onEdit?: () => void;
  onWithdraw?: () => void;
  issueId?: string;
}

export default function ProposalOverview({
  proposal,
  orgId,
  issueId,
}: ProposalOverviewProps) {
  const [localProposals, setLocalProposals] = useState<Proposal[]>(proposal);
  useEffect(() => setLocalProposals(proposal), [proposal]);

  const [role, setRole] = useState<string | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"accept" | "cancel" | null>(null);
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
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
      } catch { /* ignore */ }
    })();
    return () => { mounted = false; };
  }, [orgId]);

  // Helper to format price for a specific proposal
  const formatPrice = (p: Proposal) => {
    if (!p.price) return "—";
    const currency = p.currency || "USD";
    const priceValue = typeof p.price === "string" ? parseFloat(p.price) : p.price;
    if (isNaN(priceValue)) return p.price.toString();

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceValue) + ` ${currency}`;
  };

  // Helper to format date for a specific proposal
  const formatDueDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch { return dateStr; }
  };

  return (
    <div className="space-y-6">
      {localProposals.map((item) => (
        <div key={item.id} className="rounded-xl border border-cardCB bg-cardC/70 p-3 md:p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-textNb">Proposal Overview</h3>
            <div className="flex items-center gap-2">
              {role === "client" && item.status === "pending" && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 px-3 text-sm bg-red-800/50 text-whiten rounded hover:bg-red-800/40"
                    onClick={() => {
                      setSelectedProposalId(item.id);
                      setPendingAction("cancel");
                      setConfirmDialogOpen(true);
                    }}
                  >
                    Cancel
                  </Button>

                  <button
                    className="h-8 px-3 text-xs bg-green-800/50 text-whiten rounded hover:bg-green-800/40"
                    onClick={() => {
                      setSelectedProposalId(item.id);
                      setPendingAction("accept");
                      setConfirmDialogOpen(true);
                    }}
                  >
                    Accept
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="text-xs text-textNc">
            <span className={`py-1 p-2 rounded ${
              item.status === "pending" ? "bg-cardICB/50" : 
              item.status === "accepted" ? "bg-green-800/50" : "bg-red-800/50"
            }`}>
              Proposal {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </span>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-cardCB bg-bgPrimary/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-xs font-medium text-textNd uppercase tracking-wide">Price</span>
              </div>
              <p className="text-lg font-semibold text-textNb">{formatPrice(item)}</p>
            </div>

            <div className="rounded-lg border border-cardCB bg-bgPrimary/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-textNd" />
                <span className="text-xs font-medium text-textNd uppercase tracking-wide">Due Date</span>
              </div>
              <p className="text-lg font-semibold text-textNb">{formatDueDate(item.due_date)}</p>
            </div>
          </div>

          {/* Definition of Done - Toggleable */}
          {item.dod && (
            <div className="space-y-3">
              <details className="group rounded-xl border border-cardCB bg-bgPrimary/20 overflow-hidden transition-all duration-300">
                <summary className="flex items-center justify-between p-4 cursor-pointer list-none hover:bg-cardCB/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-400" />
                    <h4 className="text-sm font-medium text-textNb">Definition of Done</h4>
                    <Info className="h-3.5 w-3.5 text-textNd" />
                  </div>
                  <div className="text-textNd transition-transform duration-300 group-open:rotate-180">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </summary>
                <div className="px-4 pb-4 pt-0 border-t border-cardCB/50">
                  <div className="mt-3 text-sm text-textNc whitespace-pre-wrap break-words leading-relaxed">
                    {item.dod}
                  </div>
                </div>
              </details>
            </div>
          )}
        </div>
      ))}

      <ConfirmProposalDecisionDialog
        open={confirmDialogOpen}
        onOpenChange={(open) => {
          if (processing) return;
          if (!open) { setPendingAction(null); setSelectedProposalId(null); }
          setConfirmDialogOpen(open);
        }}
        action={pendingAction || "accept"}
        onConfirm={async () => {
          if (!pendingAction || !issueId || !selectedProposalId) return;
          setProcessing(true);
          setErrorMsg(null);
          const newStatus = pendingAction === "accept" ? "accepted" : "canceled";

          try {
            const res = await fetch(`/api/proposal/${issueId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: newStatus, id: selectedProposalId }),
            });

            if (!res.ok) throw new Error("Failed to update");

            // Update state locally
            setLocalProposals(prev => prev.map(p => 
              p.id === selectedProposalId ? { ...p, status: newStatus } : p
            ));

            setProcessing(false);
            setConfirmDialogOpen(false);
          } catch (err) {
            setErrorMsg("Error updating proposal status");
            setProcessing(false);
          }
        }}
      />
      {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
    </div>
  );
}