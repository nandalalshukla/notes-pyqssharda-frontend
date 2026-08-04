"use client";

import React, { ReactNode, useState } from "react";
import { ChevronLeft, ChevronRight, Menu, X } from "lucide-react";

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
    <div className="flex min-h-dvh bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 md:sticky md:top-0 md:h-dvh
          bg-white border-r border-slate-100 shadow-sm
          transition-all duration-300 ease-in-out
          ${sidebarOpen ? "w-64" : "w-20"}
          ${collapsedMobile ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 bg-linear-to-r from-blue-50 to-white">
          {sidebarOpen && (
            <div>
              <h2 className="text-lg font-bold text-slate-900">Dashboard</h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                {userRole}
              </p>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors hidden md:block text-slate-600 shrink-0"
            title={sidebarOpen ? "Collapse" : "Expand"}
          >
            {sidebarOpen ? (
              <ChevronLeft size={18} />
            ) : (
              <ChevronRight size={18} />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = item.id === activeNavId;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                  transition-all duration-200 relative font-medium text-sm
                  ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100"
                  }
                `}
              >
                <div className="shrink-0">{item.icon}</div>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge !== undefined && (
                      <span
                        className={`
                          px-2 py-0.5 rounded-full text-xs font-bold shrink-0
                          ${
                            isActive
                              ? "bg-blue-400 text-white"
                              : "bg-red-100 text-red-700"
                          }
                        `}
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
                    className={`
                      absolute -top-2 -right-2 w-5 h-5 rounded-full
                      flex items-center justify-center text-xs font-bold
                      ${
                        isActive
                          ? "bg-blue-400 text-white"
                          : "bg-red-500 text-white"
                      }
                    `}
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

      {/* Mobile Menu Button */}
      {/* Main Content */}
      <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-slate-50">
        {/* Header */}
        <div className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
          <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 lg:py-6">
            <div className="flex items-start gap-3">
              <button
                onClick={() => setCollapsedMobile(!collapsedMobile)}
                className="md:hidden mt-1 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
                title="Toggle menu"
              >
                {collapsedMobile ? <X size={20} /> : <Menu size={20} />}
              </button>
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1.5 text-sm text-slate-600 sm:text-base">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          {children}
        </div>
      </main>

      {/* Mobile Overlay */}
      {collapsedMobile && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setCollapsedMobile(false)}
        />
      )}
    </div>
  );
};
