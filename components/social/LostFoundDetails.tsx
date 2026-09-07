"use client";

import React from "react";
import { FiMapPin, FiCalendar, FiMessageCircle, FiCheck } from "react-icons/fi";
import type { LostFoundDetails as LostFoundDetailsType } from "@/lib/api/social/social.api";
import { Badge } from "@/components/ui";
import { lostFoundKindMeta, resolveLostFoundCategory } from "./postMeta";

interface LostFoundDetailsProps {
  details: LostFoundDetailsType;
}

const formatDay = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

function DetailRow({
  Icon,
  label,
  value,
}: {
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
      <p className="min-w-0 text-sm text-foreground">
        <span className="text-muted-foreground">{label} </span>
        <span className="font-medium break-words">{value}</span>
      </p>
    </div>
  );
}

/**
 * The structured summary that sits above a lost & found post's free-text
 * body — the "what / where / when / how to reach me" a reader scanning the
 * board needs before they read the description at all.
 */
export default function LostFoundDetails({ details }: LostFoundDetailsProps) {
  const kindMeta = lostFoundKindMeta[details.kind] ?? lostFoundKindMeta.lost;
  const category = resolveLostFoundCategory(details.category);
  const CategoryIcon = category.Icon;
  const isResolved = details.status === "resolved";
  const occurredOn = details.dateOccurred
    ? formatDay(details.dateOccurred)
    : null;

  return (
    <div className="mx-5 mt-4 rounded-xl border border-border bg-muted/40 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Badge variant={isResolved ? "default" : kindMeta.badgeVariant}>
          {kindMeta.label}
        </Badge>
        <Badge variant="outline" icon={<CategoryIcon size={12} />}>
          {category.label}
        </Badge>
        {isResolved && (
          <Badge variant="success" icon={<FiCheck size={12} />}>
            Resolved
          </Badge>
        )}
      </div>

      <h3 className="mb-3 text-base leading-snug font-bold break-words text-foreground">
        {details.itemName}
      </h3>

      <div className="space-y-2">
        {details.location && (
          <DetailRow
            Icon={FiMapPin}
            label={details.kind === "lost" ? "Last seen around" : "Found at"}
            value={details.location}
          />
        )}
        {occurredOn && (
          <DetailRow
            Icon={FiCalendar}
            label={details.kind === "lost" ? "Lost on" : "Found on"}
            value={occurredOn}
          />
        )}
        {details.contactInfo && (
          <DetailRow
            Icon={FiMessageCircle}
            label="Reach out via"
            value={details.contactInfo}
          />
        )}
      </div>
    </div>
  );
}
