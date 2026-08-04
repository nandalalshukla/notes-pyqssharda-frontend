"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  ShieldAlert,
  Trash2,
  X,
} from "lucide-react";
import { UserProfileLink } from "@/components/shared/UserProfileLink";
import type {
  ReportAction,
  ReportListItem,
} from "@/lib/api/mod/mod.api";

interface ReportTargetModalProps {
  report: ReportListItem | null;
  isOpen: boolean;
  pendingAction?: ReportAction;
  onAction: (action: ReportAction) => void;
  onClose: () => void;
}

const actionButtonClass =
  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export default function ReportTargetModal({
  report,
  isOpen,
  pendingAction,
  onAction,
  onClose,
}: ReportTargetModalProps) {
  if (!report) return null;

  const target = report.targetEntity;
  const isPending = report.status === "pending";
  const isWorking = Boolean(pendingAction);
  const targetOwner =
    report.targetType === "user" && target
      ? {
          _id: target._id,
          username: target.username,
          profilePic: target.profilePic,
        }
      : report.targetOwner;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
                  <div>
                    <Dialog.Title className="text-lg font-semibold text-slate-900">
                      Reported {report.targetType}
                    </Dialog.Title>
                    <p className="mt-1 text-sm text-slate-500">
                      Review the target and choose the appropriate moderation action.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                    aria-label="Close reported target preview"
                  >
                    <X size={22} />
                  </button>
                </div>

                <div className="space-y-5 p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                    <span className="rounded-full bg-blue-100 px-3 py-1 capitalize text-blue-700">
                      {report.targetType}
                    </span>
                    <span className="rounded-full bg-amber-100 px-3 py-1 capitalize text-amber-700">
                      {report.status}
                    </span>
                  </div>

                  <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    {target ? (
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                            {report.targetType === "user" ? "Reported profile" : "Content owner"}
                          </p>
                          <div className="mt-2">
                            <UserProfileLink
                              userId={targetOwner?._id}
                              username={targetOwner?.username || "Unknown user"}
                              profilePic={targetOwner?.profilePic}
                            />
                          </div>
                        </div>

                        {report.targetType !== "user" && (
                          <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-800">
                            {target.content || "This content has no text."}
                          </p>
                        )}

                        {report.targetType === "user" && (
                          <div className="space-y-3 text-sm text-slate-700">
                            {target.bio && (
                              <p className="whitespace-pre-wrap">{target.bio}</p>
                            )}
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full bg-white px-3 py-1 capitalize">
                                Role: {target.role || "user"}
                              </span>
                              <span className="rounded-full bg-white px-3 py-1">
                                Status: {target.isActive === false ? "Suspended" : "Active"}
                              </span>
                              {target.course && (
                                <span className="rounded-full bg-white px-3 py-1">
                                  Course: {target.course}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500">
                              {target.followersCount || 0} followers |{" "}
                              {target.followingCount || 0} following
                            </p>
                          </div>
                        )}

                        {report.targetType === "post" && Boolean(target.media?.length) && (
                          <div className="grid grid-cols-2 gap-3">
                            {target.media?.map((media, index) =>
                              media.url ? (
                                <Image
                                  key={`${media.url}-${index}`}
                                  src={media.url}
                                  alt={`Reported post media ${index + 1}`}
                                  width={640}
                                  height={360}
                                  unoptimized
                                  className="max-h-64 w-full rounded-lg object-cover"
                                />
                              ) : null,
                            )}
                          </div>
                        )}

                        {target.createdAt && (
                          <p className="text-xs text-slate-500">
                            Created {new Date(target.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-600">
                        This target is no longer available. It may already have been removed.
                      </p>
                    )}
                  </section>

                  <section className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Reported by
                      </p>
                      <div className="mt-2">
                        <UserProfileLink
                          userId={report.reporter?._id}
                          username={report.reporter?.username || "Unknown user"}
                          profilePic={report.reporter?.profilePic}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Reason
                      </p>
                      <p className="mt-2 text-sm capitalize text-slate-700">
                        {report.reason.replace(/_/g, " ")}
                      </p>
                    </div>
                    {report.message && (
                      <div className="sm:col-span-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                          Reporter message
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                          {report.message}
                        </p>
                      </div>
                    )}
                  </section>
                </div>

                <div className="flex flex-wrap gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4">
                  {isPending ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onAction("resolve")}
                        disabled={isWorking}
                        className={`${actionButtonClass} bg-emerald-100 text-emerald-700 hover:bg-emerald-200`}
                      >
                        <CheckCircle size={16} /> Resolve
                      </button>
                      <button
                        type="button"
                        onClick={() => onAction("reject")}
                        disabled={isWorking}
                        className={`${actionButtonClass} bg-slate-200 text-slate-700 hover:bg-slate-300`}
                      >
                        <X size={16} /> Dismiss
                      </button>
                      {report.targetType === "post" && (
                        <button
                          type="button"
                          onClick={() => onAction("delete_post")}
                          disabled={isWorking || !target}
                          className={`${actionButtonClass} bg-red-100 text-red-700 hover:bg-red-200`}
                        >
                          <Trash2 size={16} /> Delete post
                        </button>
                      )}
                      {report.targetType === "comment" && (
                        <button
                          type="button"
                          onClick={() => onAction("delete_comment")}
                          disabled={isWorking || !target}
                          className={`${actionButtonClass} bg-red-100 text-red-700 hover:bg-red-200`}
                        >
                          <Trash2 size={16} /> Delete comment
                        </button>
                      )}
                      {report.targetType === "user" && (
                        <>
                          <button
                            type="button"
                            onClick={() => onAction("warn_user")}
                            disabled={isWorking || !target}
                            className={`${actionButtonClass} bg-amber-100 text-amber-700 hover:bg-amber-200`}
                          >
                            <AlertTriangle size={16} /> Warn user
                          </button>
                          <button
                            type="button"
                            onClick={() => onAction("suspend_user")}
                            disabled={isWorking || !target}
                            className={`${actionButtonClass} bg-orange-100 text-orange-700 hover:bg-orange-200`}
                          >
                            <Ban size={16} /> Suspend user
                          </button>
                          <button
                            type="button"
                            onClick={() => onAction("delete_user")}
                            disabled={isWorking || !target}
                            className={`${actionButtonClass} bg-red-100 text-red-700 hover:bg-red-200`}
                          >
                            <Trash2 size={16} /> Delete user
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <p className="flex items-center gap-2 text-sm text-slate-600">
                      <ShieldAlert size={16} /> This report has already been reviewed.
                    </p>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
