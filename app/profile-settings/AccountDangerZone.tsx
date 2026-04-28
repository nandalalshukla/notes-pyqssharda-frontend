"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { FiAlertTriangle, FiX } from "react-icons/fi";
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
      <div className="bg-yellow-50 border-3 border-yellow-500 rounded-2xl p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start gap-4 mb-6">
          <FiAlertTriangle
            size={32}
            className="text-yellow-600 flex-shrink-0 mt-1"
          />
          <div>
            <h2 className="text-2xl font-black text-yellow-900 mb-2">
              Deactivate Account
            </h2>
            <p className="text-yellow-800 font-semibold">
              Temporarily disable your account. You can reactivate it anytime by
              logging in again. Your data will be preserved.
            </p>
          </div>
        </div>

        {deactivateConfirm ? (
          <div className="bg-white border-2 border-yellow-500 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4">
              <FiAlertTriangle
                size={24}
                className="text-yellow-700 flex-shrink-0"
              />
              <div>
                <h3 className="font-bold text-yellow-900 mb-1">
                  Are you sure?
                </h3>
                <p className="text-sm text-yellow-800">
                  Your account will be deactivated but can be reactivated later.
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setDeactivateConfirm(false)}
                className="flex-1 py-3 px-4 bg-gray-200 text-black font-bold border-2 border-black rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
              >
                <FiX size={18} />
                Cancel
              </button>
              <button
                onClick={handleDeactivate}
                disabled={isDeactivating || isLoading}
                className="flex-1 py-3 px-4 bg-yellow-600 text-white font-bold border-2 border-black rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {isDeactivating ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setDeactivateConfirm(true)}
            className="w-full py-3 px-4 bg-yellow-500 text-yellow-900 font-bold border-2 border-black rounded-lg hover:bg-yellow-600 hover:text-white transition-all"
          >
            Deactivate Account
          </button>
        )}
      </div>

      {/* Delete Account */}
      <div className="bg-red-50 border-3 border-red-500 rounded-2xl p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-start gap-4 mb-6">
          <FiAlertTriangle
            size={32}
            className="text-red-600 flex-shrink-0 mt-1"
          />
          <div>
            <h2 className="text-2xl font-black text-red-900 mb-2">
              Permanently Delete Account
            </h2>
            <p className="text-red-800 font-semibold">
              This action is permanent and cannot be undone. All your data,
              posts, and information will be permanently deleted from our
              servers.
            </p>
          </div>
        </div>

        {deleteConfirm ? (
          <div className="bg-white border-2 border-red-500 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3 bg-red-100 border-2 border-red-400 rounded-lg p-4">
              <FiAlertTriangle
                size={24}
                className="text-red-700 flex-shrink-0"
              />
              <div>
                <h3 className="font-bold text-red-900 mb-1">
                  ⚠️ This cannot be undone
                </h3>
                <p className="text-sm text-red-800">
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
              className="w-full p-3 border-2 border-red-500 rounded-lg font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
            />

            <div className="text-xs text-red-700 font-semibold bg-red-100 p-3 rounded-lg">
              After deletion:
              <ul className="mt-2 space-y-1 list-disc list-inside">
                <li>Your account and all data will be removed</li>
                <li>Your posts, comments, and messages will be deleted</li>
                <li>This action is irreversible</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setDeleteConfirm(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1 py-3 px-4 bg-gray-200 text-black font-bold border-2 border-black rounded-lg hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
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
                className="flex-1 py-3 px-4 bg-red-600 text-white font-bold border-2 border-black rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete Forever"}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setDeleteConfirm(true)}
            className="w-full py-3 px-4 bg-red-500 text-white font-bold border-2 border-black rounded-lg hover:bg-red-600 transition-all"
          >
            Delete Account Permanently
          </button>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-500 rounded-xl p-6">
        <h3 className="font-bold text-blue-900 mb-3">Need Help?</h3>
        <p className="text-sm text-blue-800 mb-4">
          If you have concerns about your account or need assistance, please
          contact our support team before taking action.
        </p>
        <button className="text-blue-600 font-bold hover:underline">
          Contact Support →
        </button>
      </div>
    </div>
  );
}
