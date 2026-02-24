"use client";

import { Delivery } from "@/action/deliveries";
import { DeliveryCard } from "./DeliveryCard";
import { ReleaseFundsButton } from "./ReleaseFundsButton";

interface DeliveriesSectionProps {
  deliveries: Delivery[];
  userRole?: string;
  onReleaseFunds?: () => Promise<void>;
  loading?: boolean;
}

export function DeliveriesSection({
  deliveries,
  userRole,
  onReleaseFunds,
  loading = false,
}: DeliveriesSectionProps) {
  // Silent empty state - render nothing if no deliveries
  if (!deliveries || deliveries.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div>
        <h2 className="text-xl font-semibold text-textNb mb-4">
          Deliverables ({deliveries.length})
        </h2>
      </div>

      {/* Deliveries List */}
      <div className="space-y-4">
        {deliveries.map((delivery) => (
          <DeliveryCard key={delivery.id} delivery={delivery} />
        ))}
      </div>

      {/* Release Funds Button - Client Only */}
      {onReleaseFunds && (
        <div className="mt-6 pt-4 border-t border-cardCB">
          <ReleaseFundsButton
            userRole={userRole}
            onRelease={onReleaseFunds}
            loading={loading}
          />
        </div>
      )}
    </div>
  );
}
