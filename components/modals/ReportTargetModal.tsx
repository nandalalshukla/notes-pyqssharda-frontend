"use client";

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
import { Modal, Badge, Button } from "@/components/ui";

interface ReportTargetModalProps {
  report: ReportListItem | null;
  isOpen: boolean;
  pendingAction?: ReportAction;
  onAction: (action: ReportAction) => void;
  onClose: () => void;
}

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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={`Reported ${report.targetType}`}
      description="Review the target and choose the appropriate moderation action."
      footer={
        isPending ? (
          <div className="flex w-full flex-wrap gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onAction("resolve")}
              disabled={isWorking}
              icon={<CheckCircle size={16} />}
              className="!bg-success/15 !text-success hover:!bg-success/25"
            >
              Resolve
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => onAction("reject")}
              disabled={isWorking}
              icon={<X size={16} />}
            >
              Dismiss
            </Button>
            {report.targetType === "post" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onAction("delete_post")}
                disabled={isWorking || !target}
                icon={<Trash2 size={16} />}
              >
                Delete post
              </Button>
            )}
            {report.targetType === "comment" && (
              <Button
                size="sm"
                variant="destructive"
                onClick={() => onAction("delete_comment")}
                disabled={isWorking || !target}
                icon={<Trash2 size={16} />}
              >
                Delete comment
              </Button>
            )}
            {report.targetType === "user" && (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onAction("warn_user")}
                  disabled={isWorking || !target}
                  icon={<AlertTriangle size={16} />}
                  className="!bg-warning/15 !text-warning hover:!bg-warning/25"
                >
                  Warn user
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onAction("suspend_user")}
                  disabled={isWorking || !target}
                  icon={<Ban size={16} />}
                  className="!bg-accent-coral/25 !text-accent-coral-foreground hover:!bg-accent-coral/35"
                >
                  Suspend user
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onAction("delete_user")}
                  disabled={isWorking || !target}
                  icon={<Trash2 size={16} />}
                >
                  Delete user
                </Button>
              </>
            )}
          </div>
        ) : (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <ShieldAlert size={16} /> This report has already been reviewed.
          </p>
        )
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="primary" className="capitalize">
            {report.targetType}
          </Badge>
          <Badge variant="warning" className="capitalize">
            {report.status}
          </Badge>
        </div>

        <section className="rounded-xl border border-border bg-muted p-4">
          {target ? (
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
                <p className="text-sm leading-6 text-foreground whitespace-pre-wrap break-words">
                  {target.content || "This content has no text."}
                </p>
              )}

              {report.targetType === "user" && (
                <div className="space-y-3 text-sm text-foreground">
                  {target.bio && <p className="whitespace-pre-wrap">{target.bio}</p>}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      Role: {target.role || "user"}
                    </Badge>
                    <Badge variant="outline">
                      Status: {target.isActive === false ? "Suspended" : "Active"}
                    </Badge>
                    {target.course && <Badge variant="outline">Course: {target.course}</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
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
                <p className="text-xs text-muted-foreground">
                  Created {new Date(target.createdAt).toLocaleString()}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              This target is no longer available. It may already have been removed.
            </p>
          )}
        </section>

        <section className="grid gap-3 rounded-xl border border-border p-4 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Reason
            </p>
            <p className="mt-2 text-sm text-foreground capitalize">
              {report.reason.replace(/_/g, " ")}
            </p>
          </div>
          {report.message && (
            <div className="sm:col-span-2">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Reporter message
              </p>
              <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{report.message}</p>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}
