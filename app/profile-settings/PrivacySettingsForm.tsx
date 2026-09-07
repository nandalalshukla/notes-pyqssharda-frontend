"use client";

import React, { useMemo, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { defaultPrivacySettings } from "@/lib/api/user/user.api";
import type { PrivacySettings } from "@/lib/api/user/user.api";
import {
  FiSave,
  FiMail,
  FiPhone,
  FiBook,
  FiEye,
  FiEyeOff,
  FiShield,
} from "react-icons/fi";
import toast from "react-hot-toast";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

type PrivacyKey = keyof PrivacySettings;

const controls: {
  key: PrivacyKey;
  label: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; className?: string }>;
  /** Which profile field this flag governs, so the row can preview it. */
  field: "email" | "contactNo" | "course";
}[] = [
  {
    key: "showEmail",
    label: "Email address",
    description:
      "Your university email, shown on your profile, in the contributors list and in the likes list.",
    Icon: FiMail,
    field: "email",
  },
  {
    key: "showContactNo",
    label: "Contact number",
    description: "The phone number saved on your profile.",
    Icon: FiPhone,
    field: "contactNo",
  },
  {
    key: "showCourse",
    label: "Course / programme",
    description: "The degree programme shown under your name.",
    Icon: FiBook,
    field: "course",
  },
];

/**
 * Lets a student choose which contact details other people can see on
 * their profile.
 *
 * The switches only *record* the choice — the server is what actually
 * withholds the values from other people's requests, so a hidden field
 * never reaches another user's browser in the first place.
 */
export default function PrivacySettingsForm() {
  const { user, isLoading, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

  const savedSettings = useMemo<PrivacySettings>(
    () => ({ ...defaultPrivacySettings, ...(user?.privacy ?? {}) }),
    [user?.privacy],
  );

  // `null` means "untouched — follow whatever is saved". Holding the draft
  // this way (rather than copying `savedSettings` into state and re-syncing
  // it from an effect) means the switches can never sit on a stale snapshot
  // after the profile loads or a save lands: with no local edit pending,
  // the saved values ARE what renders.
  const [draft, setDraft] = useState<PrivacySettings | null>(null);
  const settings = draft ?? savedSettings;

  const isDirty =
    draft !== null &&
    controls.some(({ key }) => settings[key] !== savedSettings[key]);

  const fieldValue = (field: "email" | "contactNo" | "course") => {
    if (field === "email") return user?.email;
    if (field === "contactNo") return user?.contactNo;
    return user?.course;
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile(settings);
      // Hand control back to the saved values, which the store has just
      // refreshed from the server's response.
      setDraft(null);
      toast.success("Privacy settings updated");
    } catch {
      toast.error("Failed to update privacy settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-8 shadow-soft-sm">
      <div className="mb-2 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15">
          <FiShield size={20} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Privacy</h2>
      </div>
      <p className="mb-8 text-sm text-muted-foreground">
        Choose what other students can see on your profile. Anything you turn
        off is withheld by the server — it never reaches anyone else&apos;s
        browser. You always see your own details.
      </p>

      <div className="space-y-3">
        {controls.map(({ key, label, description, Icon, field }) => {
          const isVisible = settings[key];
          const value = fieldValue(field);

          return (
            <label
              key={key}
              className={cn(
                "flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-colors",
                isVisible
                  ? "border-border bg-card hover:bg-secondary"
                  : "border-border bg-muted/60",
              )}
            >
              <div
                className={cn(
                  "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  isVisible
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icon size={17} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {label}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      isVisible
                        ? "bg-success/15 text-success"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {isVisible ? <FiEye size={11} /> : <FiEyeOff size={11} />}
                    {isVisible ? "Visible" : "Hidden"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {description}
                </p>
                <p className="mt-1.5 truncate text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {value || "Not set"}
                  </span>
                </p>
              </div>

              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...(prev ?? savedSettings),
                    [key]: e.target.checked,
                  }))
                }
                className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-primary"
                aria-label={`Show my ${label.toLowerCase()} on my profile`}
              />
            </label>
          );
        })}
      </div>

      <div className="mt-8 border-t border-border pt-6">
        <Button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || isLoading || isSaving}
          loading={isSaving}
          icon={<FiSave size={20} />}
          className="w-full"
        >
          Save Privacy Settings
        </Button>
        {!isDirty && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            No changes made
          </p>
        )}
      </div>
    </div>
  );
}
