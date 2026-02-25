"use client";

import { Delivery } from "@/action/deliveries";
import { DeliveryAttachments } from "./DeliveryAttachments";
import { DeliveryLinks } from "./DeliveryLinks";
import { DeliveryStatusBadge } from "./DeliveryStatusBadge";
import { DeliveryActionButtons } from "./DeliveryActionButtons";

interface DeliveryCardProps {
  delivery: Delivery;
  userRole?: string;
  onApprove?: (deliveryId: string, taskId: string) => Promise<void>;
  onRequestRevision?: (deliveryId: string, reason: string) => Promise<void>;
  onResubmit?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function DeliveryCard({
  delivery,
  userRole,
  onApprove,
  onRequestRevision,
  onResubmit,
}: DeliveryCardProps) {
  return (
    <div className="rounded-lg border border-cardCB bg-bgPrimary/40 p-4 space-y-4">
      {/* Header with date and status badge */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-textNd mb-0">
          {formatDate(delivery.created_at)}
        </p>
        <DeliveryStatusBadge status={delivery.status} />
      </div>

      {/* Message */}
      {delivery.message && (
        <div>
          <p className="text-sm md:text-base text-textNc leading-relaxed whitespace-pre-wrap">
            {delivery.message}
          </p>
        </div>
      )}

      {/* Attachments */}
      {delivery.attachments && delivery.attachments.length > 0 && (
        <DeliveryAttachments attachments={delivery.attachments} />
      )}

      {/* Links */}
      {delivery.links && delivery.links.length > 0 && (
        <DeliveryLinks links={delivery.links} />
      )}

      {/* Action Buttons */}
      {(onApprove || onRequestRevision || onResubmit) && (
        <div className="pt-4 border-t border-cardCB">
          <DeliveryActionButtons
            deliveryId={delivery.id}
            taskId={delivery.issueId}
            status={delivery.status}
            userRole={userRole}
            onApprove={onApprove}
            onRequestRevision={onRequestRevision}
            onResubmit={onResubmit}
          />
        </div>
      )}
    </div>
  );
}
