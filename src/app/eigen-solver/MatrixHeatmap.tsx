"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface MatrixHeatmapProps {
  matrix: number[][];
  highlights: number[][];
  eigenvalues?: string[];
}

export default function MatrixHeatmap({ matrix, highlights, eigenvalues }: MatrixHeatmapProps) {
  const n = matrix.length;

  // Flatten to find max magnitude for color scaling
  const maxMag = useMemo(() => {
    let max = 0;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        max = Math.max(max, Math.abs(matrix[i][j]));
      }
    }
    return max > 0 ? max : 1;
  }, [matrix, n]);

  const getColor = (val: number) => {
    if (Math.abs(val) < 1e-10) return "rgba(0, 0, 0, 0.02)"; // Almost transparent for zero

    // Diverging colormap: blue for positive, red for negative
    const intensity = Math.min(1, Math.abs(val) / maxMag);
    const alpha = 0.1 + intensity * 0.9;

    if (val > 0) {
      return `rgba(59, 130, 246, ${alpha})`; // Tailwind blue-500
    } else {
      return `rgba(239, 68, 68, ${alpha})`; // Tailwind red-500
    }
  };

  const isHighlighted = (r: number, c: number) => {
    return highlights.some(h => h[0] === r && h[1] === c);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        className="grid gap-1 p-2 bg-white rounded-xl shadow-lg border border-slate-200"
        style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      >
        {matrix.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={cn(
                "w-12 h-12 flex items-center justify-center text-[10px] font-mono rounded transition-all duration-300",
                isHighlighted(r, c) ? "ring-2 ring-amber-500 ring-offset-1 z-10 scale-105 shadow-sm" : ""
              )}
              style={{
                backgroundColor: getColor(val),
                color: Math.abs(val) > 1e-10 ? "rgb(15, 23, 42)" : "rgb(148, 163, 184)", // Dark text for non-zero, light for zero
                fontWeight: Math.abs(val) > 1e-10 ? 600 : 400
              }}
            >
              {Math.abs(val) < 1e-10 ? "0" : val.toFixed(2)}
            </div>
          ))
        )}
      </div>

      {eigenvalues && eigenvalues.length > 0 && (
        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 text-center max-w-lg">
          <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Extracted Eigenvalues</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {eigenvalues.map((ev, i) => (
              <div key={i} className="px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md font-mono text-sm">
                λ<sub className="text-[10px]">{i+1}</sub> = {ev}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
