import React from "react";
import { cn } from "@/lib/utils";

interface MatrixRawProps {
  matrix: (number | null)[][];
  className?: string;
  label?: React.ReactNode;
  highlightBlock?: { rows: number; cols: number; label?: string };
}

export default function MatrixRaw({ matrix, className, label, highlightBlock }: MatrixRawProps) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {label && <div className="text-sm font-semibold text-slate-600 mb-2">{label}</div>}
      <div className="relative flex">
        {/* Left bracket */}
        <div className="w-3 border-y-2 border-l-2 border-slate-800 rounded-l-md" />

        <div
          className="grid gap-2 py-2 px-1 relative"
          style={{
            gridTemplateColumns: `repeat(${cols}, min-content)`,
          }}
        >
          {highlightBlock && (
            <div
              className="absolute border-2 border-blue-500 rounded pointer-events-none transition-all duration-300 z-10"
              style={{
                // calculation:
                // gap is 0.5rem (8px), padding-top/bottom is 0.5rem, padding-left is 0.25rem
                // cell height is 2rem (32px), cell width is 3rem (48px)
                top: "0.5rem", // py-2
                left: "0.25rem", // px-1
                width: `calc(${highlightBlock.cols} * 3rem + ${Math.max(0, highlightBlock.cols - 1)} * 0.5rem)`,
                height: `calc(${highlightBlock.rows} * 2rem + ${Math.max(0, highlightBlock.rows - 1)} * 0.5rem)`,
              }}
            >
              {highlightBlock.label && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-800 text-xs font-bold px-1.5 py-0.5 rounded shadow-sm whitespace-nowrap">
                  {highlightBlock.label}
                </div>
              )}
            </div>
          )}
          {matrix.map((row, i) =>
            row.map((val, j) => (
              <div
                key={`${i}-${j}`}
                className={cn(
                  "flex items-center justify-center w-12 h-8 text-sm font-mono shrink-0 transition-all duration-300 whitespace-nowrap overflow-hidden",
                  val === null ? "opacity-0" : "text-slate-800 bg-slate-50 border border-slate-200 rounded shadow-sm"
                )}
              >
                {val !== null ? val.toFixed(2) : ""}
              </div>
            ))
          )}
        </div>

        {/* Right bracket */}
        <div className="w-3 border-y-2 border-r-2 border-slate-800 rounded-r-md" />
      </div>
    </div>
  );
}
