"use client";

import React, { useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import ProfilePictureSection from "./ProfilePictureSection";
import EditProfileForm from "./EditProfileForm";
import AccountDangerZone from "./AccountDangerZone";
import { FiArrowLeft } from "react-icons/fi";
import { useRouter } from "next/navigation";

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, isLoading } = useProfile();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "danger">(
    "general",
  );

  if (isLoading && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border-2 border-black p-8 h-64 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-black mb-4">Please Sign In</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to access profile settings
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-8 py-3 bg-black text-white font-bold border-2 border-transparent rounded-lg hover:bg-white hover:text-black hover:border-black transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors border-2 border-black"
          >
            <FiArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-black">Settings</h1>
            <p className="text-gray-600 mt-1">
              Manage your profile and account
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-black pb-4">
          {[
            { id: "general", label: "General" },
            { id: "security", label: "Security" },
            { id: "danger", label: "Danger Zone" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 font-bold border-2 border-black rounded-lg transition-all ${
                activeTab === tab.id
                  ? "bg-black text-white"
                  : "bg-white text-black hover:bg-gray-100"
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
            <div className="bg-white rounded-2xl border-2 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-bold mb-6">Password & Security</h2>
              <button
                disabled
                className="px-6 py-3 bg-gray-300 text-gray-700 font-bold border-2 border-black rounded-lg cursor-not-allowed"
              >
                Coming Soon: Change Password
              </button>
            </div>
          )}

          {activeTab === "danger" && <AccountDangerZone />}
        </div>
      </div>
    </div>
  );
}
