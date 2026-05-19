"use client";

import React from "react";
import { Feed } from "@/components/social";
import FeedSidebar from "@/components/social/FeedSidebar";

export default function ShardaSocial() {
  return (
    <div className="min-h-screen" style={{ background: "var(--paper-bg)" }}>
      {/* Outer container — centers everything and sets max width */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 items-start">

          {/* Left sidebar — sticky so it stays while feed scrolls */}
          <div className="sticky top-20 self-start">
            <FeedSidebar />
          </div>

          {/* Feed — takes remaining width, capped so it doesn't stretch too wide */}
          <div className="flex-1 min-w-0 max-w-2xl">
            <Feed />
          </div>

        </div>
      </div>
    </div>
  );
}
