"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfilePictureSection from "./ProfilePictureSection";
import EditProfileForm from "./EditProfileForm";
import AccountDangerZone from "./AccountDangerZone";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Button, Tabs } from "@/components/ui";

const tabs = [
  { value: "general" as const, label: "General" },
  { value: "security" as const, label: "Security" },
  { value: "danger" as const, label: "Account" },
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useProfile();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "danger">(
    "general",
  );

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-background pt-20 pb-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex h-96 items-center justify-center">
            <div className="text-center">
              <FiLoader
                size={48}
                className="mx-auto mb-4 animate-spin text-muted-foreground"
              />
              <p className="font-medium text-muted-foreground">
                Loading your settings...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background pt-20 pb-20">
        <div className="max-w-md text-center">
          <h1 className="mb-3 text-3xl font-bold text-foreground">
            Sign In Required
          </h1>
          <p className="mb-8 text-muted-foreground">
            You need to be logged in to access profile settings
          </p>
          <Button onClick={() => router.push("/auth/login")}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground cursor-pointer"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-foreground">Settings</h1>
            <p className="mt-1 font-medium text-muted-foreground">
              Manage your profile and account
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs items={tabs} value={activeTab} onChange={setActiveTab} className="mb-8" />

        {/* Content */}
        <div className="space-y-8">
          {activeTab === "general" && (
            <>
              <ProfilePictureSection />
              <EditProfileForm />
            </>
          )}

          {activeTab === "security" && (
            <div className="rounded-2xl border border-border bg-muted p-8">
              <h2 className="mb-4 text-2xl font-bold text-foreground">
                Password &amp; Security
              </h2>
              <p className="mb-6 text-muted-foreground">
                Additional security options coming soon
              </p>
              <Button disabled variant="secondary">
                Change Password (Coming Soon)
              </Button>
            </div>
          )}

          {activeTab === "danger" && <AccountDangerZone />}
        </div>
      </div>
    </div>
  );
}
