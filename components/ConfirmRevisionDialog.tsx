import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RevisionActionDialogProps {
  action: "reject" | "accept";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm?: () => void | Promise<void>;
  loading?: boolean;
  error?: string | null;
}

const copy = {
  reject: {
    title: "Reject revision request?",
    description:
      "Rejecting this revision will mark the delivery as disputed and send it back into review.",
    note: "Use this only when the client’s request is unreasonable, unclear, or conflicts with the submitted work.",
    buttonText: "Reject Request",
    icon: ShieldAlert,
    accent: "text-red-500",
    buttonClass: "bg-red-600 hover:bg-red-700",
  },
  accept: {
    title: "Accept revision request?",
    description:
      "Accepting this request means you agree to make the changes and submit a new delivery.",
    note: "This keeps the process moving and gives the client a revised version to review again.",
    buttonText: "Accept Request",
    icon: CheckCircle2,
    accent: "text-green-500",
    buttonClass: "bg-green-600 hover:bg-green-700",
  },
};

const ConfirmRevisionDialog = ({
  action,
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  error,
}: RevisionActionDialogProps) => {
  const content = copy[action];
  const Icon = content.icon;
  const isDisabled = loading;

  return (
    <Dialog open={open} onOpenChange={(v) => !isDisabled && onOpenChange(v)}>
      <DialogContent className="sm:max-w-[520px] border border-cardCB bg-cardC text-textNa">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <Icon className={content.accent} size={20} />
            <DialogTitle>{content.title}</DialogTitle>
          </div>
          <DialogDescription className="text-textNd">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-cardCB bg-black/20 p-4">
          <p className="text-sm text-textNb">{content.note}</p>
        </div>

        {error ? <p className="text-sm text-red-500">{error}</p> : null}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-cardCB text-textNb"
            disabled={isDisabled}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isDisabled}
            className={content.buttonClass}
          >
            {loading ? "Processing..." : content.buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmRevisionDialog;
