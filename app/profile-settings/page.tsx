"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfilePictureSection from "./ProfilePictureSection";
import EditProfileForm from "./EditProfileForm";
import AccountDangerZone from "./AccountDangerZone";
import { FiArrowLeft, FiLoader } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useProfile();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "danger">(
    "general",
  );

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-white pt-20 pb-20">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <FiLoader
                size={48}
                className="animate-spin mx-auto text-slate-400 mb-4"
              />
              <p className="text-slate-600 font-medium">
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
      <div className="min-h-screen bg-white flex items-center justify-center pt-20 pb-20">
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Sign In Required
          </h1>
          <p className="text-slate-600 mb-8">
            You need to be logged in to access profile settings
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600 hover:text-slate-900"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
            <p className="text-slate-500 mt-1 font-medium">
              Manage your profile and account
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-slate-200">
          {[
            { id: "general", label: "General" },
            { id: "security", label: "Security" },
            { id: "danger", label: "Account" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 font-medium transition-all border-b-2 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === "general" && (
            <>
              <ProfilePictureSection />
              <EditProfileForm />
            </>
          )}

          {activeTab === "security" && (
            <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">
                Password & Security
              </h2>
              <p className="text-slate-600 mb-6">
                Additional security options coming soon
              </p>
              <button
                disabled
                className="px-6 py-3 bg-slate-200 text-slate-500 font-medium rounded-lg cursor-not-allowed"
              >
                Change Password (Coming Soon)
              </button>
            </div>
          )}

          {activeTab === "danger" && <AccountDangerZone />}
        </div>
      </div>
    </div>
  );
}
