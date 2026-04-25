import React from "react";
import { cn } from "@/lib/utils";

interface MatrixRawProps {
  matrix: (number | null)[][];
  className?: string;
  label?: string;
}

export default function MatrixRaw({ matrix, className, label }: MatrixRawProps) {
  const rows = matrix.length;
  const cols = matrix[0]?.length || 0;

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {label && <div className="text-sm font-semibold text-slate-600 mb-2">{label}</div>}
      <div className="relative flex">
        {/* Left bracket */}
        <div className="w-3 border-y-2 border-l-2 border-slate-800 rounded-l-md" />

        <div
          className="grid gap-2 py-2 px-1"
          style={{
            gridTemplateColumns: `repeat(${cols}, min-content)`,
          }}
        >
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
