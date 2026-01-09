// Utility functions for converting status between present and past tense
export const presentToPast = (status: string) => {
  switch (status) {
    case "propose":
    case "proposed":
      return "proposed";
    case "deliver":
    case "delivered":
      return "delivered";
    case "complete":
    case "completed":
      return "completed";
    case "cancel":
    case "canceled":
    case "cancelled":
      return "canceled";
    case "draft":
      return "draft";
    case "on-going":
    case "ongoing":
      return "on-going";
    default:
      return status;
  }
};

export const pastToPresent = (status: string) => {
  switch (status) {
    case "proposed":
    case "propose":
      return "propose";
    case "delivered":
    case "deliver":
      return "deliver";
    case "completed":
    case "complete":
      return "complete";
    case "canceled":
    case "cancelled":
    case "cancel":
      return "cancel";
    case "draft":
      return "draft";
    case "on-going":
    case "ongoing":
      return "on-going";
    default:
      return status;
  }
};

// For display in TaskCard: show past tense for supported statuses, leave draft/on-going unchanged
export const displayStatusForTaskCard = (status: string) => {
  return presentToPast(status);
};

// For display/selection in StatusCard: always show present tense
export const displayStatusForStatusCard = (status: string) => {
  return pastToPresent(status);
};
