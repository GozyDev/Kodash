"use client";

import { useEffect } from "react";
import { Delivery, markDeliveryAsInReview } from "@/action/deliveries";
import { DeliveryCard } from "./DeliveryCard";

interface DeliveriesSectionProps {
  deliveries: Delivery[];
  userRole?: string;
  taskId?: string;

  onApprove?: (deliveryId: string, taskId: string) => Promise<void>;
  onRequestRevision?: (deliveryId: string, reason: string) => Promise<void>;
  onResubmit?: () => void;
  loading?: boolean;
}

export function DeliveriesSection({
  deliveries,
  userRole,
  taskId,

  onApprove,
  onRequestRevision,
  onResubmit,
  loading = false,
}: DeliveriesSectionProps) {
  // Mark deliveries as in_review when CLIENT views them
  useEffect(() => {
    if (
      userRole?.toUpperCase() === "CLIENT" &&
      deliveries.length > 0 &&
      taskId
    ) {
      deliveries.forEach((delivery) => {
        if (delivery.status === "pending") {
          // Call server action but don't await - let it update in background
          markDeliveryAsInReview(delivery.id).catch((err) =>
            console.error("Failed to mark as in review:", err)
          );
        }
      });
    }
  }, [deliveries, userRole, taskId]);

  // Silent empty state - render nothing if no deliveries
  if (!deliveries || deliveries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6 bg-cardC p-3 rounded  border border-cardCB relative">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-textNb mb-4">
          Deliverables ({deliveries.length})
        </h2>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {deliveries.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            userRole={userRole}
            onApprove={onApprove}
            onRequestRevision={onRequestRevision}
            onResubmit={onResubmit}
          />
        ))}
      </div>
    </div>
  );
}
