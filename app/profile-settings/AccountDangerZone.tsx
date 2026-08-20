"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { FiAlertTriangle, FiX, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Button, Input } from "@/components/ui";

export default function AccountDangerZone() {
  const router = useRouter();
  const { isLoading, deactivateUserAccount, deleteUserAccount } = useProfile();
  const [deactivateConfirm, setDeactivateConfirm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeactivate = async () => {
    try {
      setIsDeactivating(true);
      await deactivateUserAccount();
      toast.success("Account deactivated. Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      toast.error("Failed to deactivate account");
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== "DELETE FOREVER") {
      toast.error('Please type "DELETE FOREVER" to confirm');
      return;
    }

    try {
      setIsDeleting(true);
      await deleteUserAccount();
      toast.success("Account deleted. Redirecting...");
      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      toast.error("Failed to delete account");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Deactivate Account */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/15">
            <FiAlertTriangle size={24} className="text-warning" />
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-bold text-foreground">
              Deactivate Account
            </h2>
            <p className="text-sm text-muted-foreground">
              Temporarily disable your account. You can reactivate it anytime by
              logging in again. Your data will be preserved.
            </p>
          </div>
        </div>

        {deactivateConfirm ? (
          <div className="space-y-4 rounded-xl border border-border bg-muted p-6">
            <div className="flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/10 p-4">
              <FiAlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-warning"
              />
              <div>
                <h3 className="mb-1 font-semibold text-foreground">
                  Confirm Deactivation
                </h3>
                <p className="text-sm text-muted-foreground">
                  Your account will be deactivated but can be reactivated later.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => setDeactivateConfirm(false)}
                icon={<FiX size={18} />}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeactivate}
                loading={isDeactivating}
                disabled={isLoading}
                className="flex-1 bg-warning text-warning-foreground hover:bg-warning/90"
              >
                Deactivate
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setDeactivateConfirm(true)}
            className="w-full border-warning/30 bg-warning/10 text-warning hover:bg-warning/20"
          >
            Deactivate Account
          </Button>
        )}
      </div>

      {/* Delete Account */}
      <div className="rounded-2xl border border-destructive/30 bg-card p-8 shadow-soft-sm">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/15">
            <FiAlertTriangle size={24} className="text-destructive" />
          </div>
          <div className="flex-1">
            <h2 className="mb-2 text-xl font-bold text-foreground">
              Permanently Delete Account
            </h2>
            <p className="text-sm text-muted-foreground">
              This action is permanent and cannot be undone. All your data,
              posts, and information will be permanently deleted from our
              servers.
            </p>
          </div>
        </div>

        {deleteConfirm ? (
          <div className="space-y-4 rounded-xl border border-border bg-muted p-6">
            <div className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4">
              <FiAlertTriangle
                size={20}
                className="mt-0.5 shrink-0 text-destructive"
              />
              <div>
                <h3 className="mb-1 font-semibold text-foreground">
                  This action cannot be undone
                </h3>
                <p className="text-sm text-muted-foreground">
                  All your account data will be permanently deleted. Type
                  &quot;DELETE FOREVER&quot; below to confirm.
                </p>
              </div>
            </div>

            <Input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Type "DELETE FOREVER" to confirm'
              error
              className="font-medium"
            />

            <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-foreground">
              <p className="mb-2 font-semibold text-foreground">
                After deletion:
              </p>
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>• Your account and all data will be removed</li>
                <li>• Your posts, comments, and messages will be deleted</li>
                <li>• This action is irreversible</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                icon={<FiX size={18} />}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteConfirmText !== "DELETE FOREVER" || isLoading}
                loading={isDeleting}
                className="flex-1"
              >
                Delete Forever
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => setDeleteConfirm(true)}
            className="w-full border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20"
          >
            Delete Account Permanently
          </Button>
        )}
      </div>

      {/* Support Info */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
        <h3 className="mb-2 font-semibold text-foreground">Need Help?</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          If you have concerns about your account or need assistance, please
          contact our support team before taking action.
        </p>
        <button className="flex items-center gap-1 font-medium text-primary transition-colors hover:text-primary-hover cursor-pointer">
          Contact Support <FiArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
