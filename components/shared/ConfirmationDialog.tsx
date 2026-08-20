"use client";

import React from "react";
import { FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";
import { useBodyScroll } from "@/hooks/useBodyScroll";
import { Modal, Button } from "@/components/ui";

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  isDangerous?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading = false,
  isDangerous = false,
}: ConfirmationDialogProps) {
  // Prevent body scroll when dialog is open
  useBodyScroll(isOpen);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      hideCloseButton
      footer={
        <div className="flex w-full gap-3">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            icon={<FiX size={18} />}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={isDangerous ? "destructive" : "primary"}
            onClick={onConfirm}
            loading={isLoading}
            icon={<FiCheck size={18} />}
            className="flex-1"
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="mb-4 flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
            isDangerous ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
          }`}
        >
          <FiAlertTriangle size={24} />
        </div>
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
      </div>

      <p className="text-sm leading-relaxed text-muted-foreground">{message}</p>
    </Modal>
  );
}
