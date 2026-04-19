"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ChevronDown, Home, ActivitySquare, Compass, MoreHorizontal, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Conditioning of Matrix I", href: "/pointwise-conditioning", icon: ActivitySquare },
  { name: "Conditioning of Matrix II", href: "/conditioning-matrix-2", icon: ActivitySquare },
  { name: "Conditioning of LSE I", href: "/lse-stability", icon: ActivitySquare },
  { name: "Conditioning of LSE II (Under Construction)", href: "/lse-stability-2", icon: ActivitySquare },
  {
    name: "Basics",
    icon: Layers,
    children: [
      { name: "SVD vs Eigenvalue", href: "/svd-vs-eigen", disabled: false },
      { name: "SVD Computation", href: "/svd-computation", disabled: false },
    ]
  },
  {
    name: "Iterative Solver",
    icon: Layers,
    children: [
      { name: "Eigen Solver", href: "/eigen-solver", disabled: false },
    ]
  },
  {
    name: "Four QRs",
    icon: Layers,
    children: [
      { name: "Classical Gram-Schmidt", href: "/four-qrs/cgs", disabled: false },
      { name: "Modified Gram-Schmidt", href: "/four-qrs/mgs", disabled: false },
      { name: "Householder", href: "/four-qrs/householder", disabled: false },
      { name: "Givens", href: "/four-qrs/givens", disabled: false },
    ]
  },
  { name: "Other NLA Topics (coming soon)", href: "#", icon: Compass, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    "Basics": true,
    "Four QRs": true
  });

  const toggleGroup = (name: string) => {
    setExpandedGroups(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div
      className={cn(
        "relative flex flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        {!isCollapsed && <span className="font-semibold truncate">NLA Visualizations</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-md p-1 hover:bg-slate-100 mx-auto"
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.children) {
            const isGroupActive = item.children.some(child => pathname === child.href);
            const isExpanded = expandedGroups[item.name];

            return (
              <div key={item.name} className="space-y-1">
                <button
                  onClick={() => {
                    if (isCollapsed) setIsCollapsed(false);
                    toggleGroup(item.name);
                  }}
                  className={cn(
                    "w-full group flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium transition-colors",
                    isGroupActive ? "text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center">
                    <Icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5")} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded ? "rotate-180" : "")} />
                  )}
                </button>

                {!isCollapsed && isExpanded && (
                  <div className="pl-9 pr-2 space-y-1">
                    {item.children.map(child => {
                      const isChildActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.disabled ? "#" : child.href}
                          className={cn(
                            "group flex items-center rounded-md px-2 py-1.5 text-sm transition-colors",
                            isChildActive
                              ? "bg-slate-100 text-slate-900 font-medium"
                              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                            child.disabled && "cursor-not-allowed opacity-50"
                          )}
                        >
                          <span className="truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.disabled ? "#" : (item.href as string)}
              className={cn(
                "group flex items-center rounded-md px-2 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                item.disabled && "cursor-not-allowed opacity-50",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "mr-3 h-5 w-5")} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
