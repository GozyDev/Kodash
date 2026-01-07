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
import type { Proposal } from "./IndivisualIssuepageClient";

interface ProposalOverviewProps {
  proposal: Proposal;
  orgId?: string;
  onEdit?: () => void;
  onWithdraw?: () => void;
}

export default function ProposalOverview({
  proposal,
  orgId,
  onEdit,
  onWithdraw,
}: ProposalOverviewProps) {
  const [role, setRole] = useState<string | null>(null);

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
    if (!proposal.price) return "—";
    const currency = proposal.currency || "USD";
    const priceValue =
      typeof proposal.price === "string"
        ? parseFloat(proposal.price)
        : proposal.price;

    if (isNaN(priceValue)) return proposal.price.toString();

    const formatted = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(priceValue);

    // Append currency code for clarity (e.g., "$10,000 USD")
    return `${formatted} ${currency}`;
  };

  // Format due date
  const formatDueDate = () => {
    if (!proposal.due_date) return "—";
    try {
      const date = new Date(proposal.due_date);
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(date);
    } catch {
      return proposal.due_date;
    }
  };

  // Parse DOD - could be JSON array, newline-separated, or plain text
  const parseDOD = (): string[] => {
    if (!proposal.dod) return [];

    try {
      // Try parsing as JSON array first
      const parsed = JSON.parse(proposal.dod);
      if (Array.isArray(parsed)) {
        return parsed.filter((item) => typeof item === "string" && item.trim());
      }
    } catch {
      // Not JSON, try splitting by newlines
      const lines = proposal.dod.split(/\n+/).filter((line) => line.trim());
      if (lines.length > 1) {
        return lines.map((line) => line.trim());
      }
      // Single line, return as single item
      return [proposal.dod.trim()];
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
          {/* Action buttons visible only to CLIENT role */}
          {role === "client" && (
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
              >
                {/* Reject - red */}
                Reject
              </Button>

              <button className="h-8 px-3 text-xs bg-green-800/50 text-whiten rounded hover:bg-green-800/40">
                {/* Accept - green with slightly transparent background and solid border */}
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
        {proposal.status === "pending" ? (
          <span className="bg-cardICB/50 py-1 p-2 rounded">{proposal.status}</span>
        ) : proposal.status === "accepted" ? (
          <span className="bg-green-800/50 py-1 p-2 rounded">{proposal.status}</span>
        ) : (
          <span className="bg-red-800/50 py-1 p-2 rounded">{proposal.status}</span>
        )}
      </div>

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

      {dodItems.length === 0 && proposal.dod && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <h4 className="text-sm font-medium text-textNb">
              Definition of Done
            </h4>
            <Info className="h-3.5 w-3.5 text-textNd" />
          </div>
          <p className="text-sm text-textNc pl-6">{proposal.dod}</p>
        </div>
      )}
    </div>
  );
}
