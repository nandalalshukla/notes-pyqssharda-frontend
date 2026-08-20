"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Modal, Button, Textarea } from "@/components/ui";

interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  itemType: "note" | "pyq" | "syllabus";
  itemTitle: string;
  isSubmitting?: boolean;
}

export default function RejectionModal({
  isOpen,
  onClose,
  onSubmit,
  itemType,
  itemTitle,
  isSubmitting = false,
}: RejectionModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!rejectionReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    if (rejectionReason.trim().length < 10) {
      setError("Rejection reason must be at least 10 characters");
      return;
    }

    onSubmit(rejectionReason.trim());
    setRejectionReason("");
    setError("");
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setRejectionReason("");
      setError("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="sm"
      hideCloseButton
      footer={
        <div className="grid w-full grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="rejection-form"
            variant="destructive"
            loading={isSubmitting}
            disabled={!rejectionReason.trim()}
          >
            Confirm Reject
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex flex-col items-center text-center">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
          <X size={22} />
        </span>
        <h2 className="mb-1 text-xl font-bold text-foreground">
          Reject {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
        </h2>
        <p className="text-sm text-muted-foreground">
          Please provide a specific reason for rejection
        </p>
      </div>

      <form id="rejection-form" onSubmit={handleSubmit}>
        <div className="mb-4 rounded-xl border border-dashed border-border bg-muted p-3 text-center">
          <p className="mb-1 text-xs font-bold tracking-wide text-muted-foreground uppercase">
            Rejecting item
          </p>
          <p className="line-clamp-1 text-sm font-bold text-foreground" title={itemTitle}>
            {itemTitle}
          </p>
        </div>

        <div>
          <label
            htmlFor="rejectionReason"
            className="mb-1 block text-left text-sm font-bold text-foreground"
          >
            Rejection Reason <span className="text-destructive">*</span>
          </label>
          <Textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              setError("");
            }}
            placeholder="e.g. The file is blurry, Incorrect course code..."
            rows={4}
            disabled={isSubmitting}
            maxLength={500}
            error={Boolean(error)}
            className="resize-none"
          />

          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs font-bold ${error ? "text-destructive" : "text-muted-foreground"}`}
            >
              {error || "Min 10 characters"}
            </span>
            <span className="text-xs font-bold text-muted-foreground">
              {rejectionReason.length}/500
            </span>
          </div>
        </div>
      </form>
    </Modal>
  );
}
