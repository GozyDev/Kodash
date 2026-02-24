"use client";

import { Delivery } from "@/action/deliveries";
import { DeliveryAttachments } from "./DeliveryAttachments";
import { DeliveryLinks } from "./DeliveryLinks";

interface DeliveryCardProps {
  delivery: Delivery;
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

export function DeliveryCard({ delivery }: DeliveryCardProps) {
  return (
    <div className="rounded-lg border border-cardCB bg-bgPrimary/40 p-4 space-y-4">
      {/* Header with date */}
      <div>
        <p className="text-xs text-textNd mb-1">
          {formatDate(delivery.created_at)}
        </p>
      </div>

      {/* Message */}
      {delivery.message && (
        <div>
          <p className="text-sm text-textNc leading-relaxed whitespace-pre-wrap">
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
    </div>
  );
}
