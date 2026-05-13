"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { FiAlertTriangle, FiX, FiArrowRight } from "react-icons/fi";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

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
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <FiAlertTriangle size={24} className="text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Deactivate Account
            </h2>
            <p className="text-slate-600 text-sm">
              Temporarily disable your account. You can reactivate it anytime by
              logging in again. Your data will be preserved.
            </p>
          </div>
        </div>

        {deactivateConfirm ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <FiAlertTriangle
                size={20}
                className="text-amber-700 flex-shrink-0 mt-0.5"
              />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  Confirm Deactivation
                </h3>
                <p className="text-sm text-slate-600">
                  Your account will be deactivated but can be reactivated later.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setDeactivateConfirm(false)}
                className="flex-1 py-2 px-4 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <FiX size={18} />
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={isDeactivating || isLoading}
                className="flex-1 py-2 px-4 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeactivating ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setDeactivateConfirm(true)}
            className="w-full py-2 px-4 bg-amber-50 text-amber-700 font-medium rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
          >
            Deactivate Account
          </button>
        )}
      </div>

      {/* Delete Account */}
      <div className="bg-white border border-red-200 rounded-xl p-8 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
            <FiAlertTriangle size={24} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Permanently Delete Account
            </h2>
            <p className="text-slate-600 text-sm">
              This action is permanent and cannot be undone. All your data,
              posts, and information will be permanently deleted from our
              servers.
            </p>
          </div>
        </div>

        {deleteConfirm ? (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 space-y-4">
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <FiAlertTriangle
                size={20}
                className="text-red-600 flex-shrink-0 mt-0.5"
              />
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">
                  This action cannot be undone
                </h3>
                <p className="text-sm text-slate-600">
                  All your account data will be permanently deleted. Type
                  "DELETE FOREVER" below to confirm.
                </p>
              </div>
            </div>

            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder='Type "DELETE FOREVER" to confirm'
              className="w-full px-4 py-3 border border-red-200 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-slate-900 placeholder-slate-400"
            />

            <div className="text-sm text-slate-700 bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="font-semibold text-slate-900 mb-2">
                After deletion:
              </p>
              <ul className="space-y-1 text-xs text-slate-600">
                <li>• Your account and all data will be removed</li>
                <li>• Your posts, comments, and messages will be deleted</li>
                <li>• This action is irreversible</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 py-2 px-4 bg-slate-100 text-slate-900 font-medium rounded-lg hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
              >
                <FiX size={18} />
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={
                  deleteConfirmText !== "DELETE FOREVER" ||
                  isDeleting ||
                  isLoading
                }
                className="flex-1 py-2 px-4 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="w-full py-2 px-4 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 transition-colors border border-red-200"
          >
            Delete Account Permanently
          </button>
        )}
      </div>

      {/* Support Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
        <p className="text-sm text-slate-600 mb-4">
          If you have concerns about your account or need assistance, please
          contact our support team before taking action.
        </p>
        <button className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-1">
          Contact Support <FiArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
