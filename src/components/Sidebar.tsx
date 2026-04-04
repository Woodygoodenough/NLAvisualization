"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Home, ActivitySquare, Compass, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "LSE Stability I", href: "/lse-stability", icon: ActivitySquare },
  { name: "Pointwise Conditioning", href: "/pointwise-conditioning", icon: ActivitySquare },
  { name: "LSE Sensitivity I (coming soon)", href: "#", icon: ActivitySquare, disabled: true },
  { name: "LSE Sensitivity II (coming soon)", href: "#", icon: ActivitySquare, disabled: true },
  { name: "Condition Number of A (coming soon)", href: "#", icon: Compass, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.disabled ? "#" : item.href}
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
