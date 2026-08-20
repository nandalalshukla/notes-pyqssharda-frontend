"use client";

import React, { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number | string;
}

interface DashboardLayoutProps {
  children: ReactNode;
  navItems: NavItem[];
  title: string;
  subtitle?: string;
  userRole: string;
  activeNavId?: string;
  onNavChange?: (navId: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  navItems,
  title,
  subtitle,
  userRole,
  activeNavId = navItems[0]?.id || "overview",
  onNavChange,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsedMobile, setCollapsedMobile] = useState(false);

  const handleNavClick = (navId: string) => {
    onNavChange?.(navId);
    // Close mobile sidebar after navigation
    setCollapsedMobile(false);
  };

  return (
    <div className="flex min-h-dvh overflow-hidden bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 border-r border-border bg-card shadow-soft-sm transition-all duration-300 ease-in-out md:sticky md:top-0 md:h-dvh",
          sidebarOpen ? "w-64" : "w-20",
          collapsedMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between border-b border-border bg-gradient-to-r from-primary/10 to-transparent px-4">
          {sidebarOpen && (
            <div>
              <h2 className="text-lg font-bold text-foreground">Dashboard</h2>
              <p className="truncate text-xs font-medium text-muted-foreground">{userRole}</p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden shrink-0 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary md:block cursor-pointer"
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => {
            const isActive = item.id === activeNavId;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-soft-sm"
                    : "text-foreground hover:bg-secondary",
                )}
              >
                <div className="shrink-0">{item.icon}</div>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          "shrink-0 rounded-full px-2 py-0.5 text-xs font-bold",
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-destructive/15 text-destructive",
                        )}
                      >
                        {typeof item.badge === "number"
                          ? item.badge > 9
                            ? "9+"
                            : item.badge
                          : item.badge}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && item.badge !== undefined && (
                  <div
                    className={cn(
                      "absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold",
                      isActive
                        ? "bg-primary-foreground/20 text-primary-foreground"
                        : "bg-destructive text-destructive-foreground",
                    )}
                  >
                    {typeof item.badge === "number"
                      ? item.badge > 9
                        ? "9+"
                        : item.badge
                      : item.badge}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-background">
        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-border bg-card shadow-soft-sm">
          <div className="px-4 py-4 sm:px-6 sm:py-5 md:px-8 lg:py-6">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setCollapsedMobile(!collapsedMobile)}
                className="mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-soft-sm transition-colors hover:bg-secondary md:hidden cursor-pointer"
                title="Toggle menu"
              >
                {collapsedMobile ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm text-muted-foreground sm:text-base">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {collapsedMobile && (
        <div
          className="fixed inset-0 z-30 bg-ink/20 md:hidden"
          onClick={() => setCollapsedMobile(false)}
        />
      )}
    </div>
  );
};
