"use client";

import React, { useState } from "react";
import { BlockMath } from "react-katex";
import { cn } from "@/lib/utils";

const U_MATRIX = [
  ["U_{11}", "U_{12}", "U_{13}"],
  ["U_{21}", "U_{22}", "U_{23}"],
  ["U_{31}", "U_{32}", "U_{33}"],
];

const SIGMA_MATRIX = [
  ["\\sigma_1", "0", "0"],
  ["0", "\\sigma_2", "0"],
  ["0", "0", "\\sigma_3"],
];

const V_STAR_MATRIX = [
  ["V^*_{11}", "V^*_{12}", "V^*_{13}"],
  ["V^*_{21}", "V^*_{22}", "V^*_{23}"],
  ["V^*_{31}", "V^*_{32}", "V^*_{33}"],
];

const X_VECTOR = ["x_1", "x_2", "x_3"];
const Y_VECTOR = ["y_1", "y_2", "y_3"];

export default function ComputationView() {
  const [hoverRowI, setHoverRowI] = useState<number | null>(null);
  const [hoverColJ, setHoverColJ] = useState<number | null>(null);

  const isActiveU = (r: number, c: number) => {
    if (hoverRowI !== null && hoverColJ !== null) return r === hoverRowI && c === hoverColJ;
    if (hoverRowI !== null) return r === hoverRowI;
    if (hoverColJ !== null) return c === hoverColJ;
    return false;
  };

  const isActiveSigma = (r: number, c: number) => {
    if (r !== c) return false;
    if (hoverColJ !== null) return r === hoverColJ;
    return true; // if no column specified, all sigmas can be conceptually active for the row
  };

  const isActiveVStar = (r: number, c: number) => {
    if (hoverColJ !== null) return r === hoverColJ;
    return true; // if no column specified, all V* rows are used to form y_i
  };

  const isActiveX = () => true; // x is always fully used in the dot product

  const isActiveY = (r: number) => hoverRowI === null || r === hoverRowI;

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 w-full">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 overflow-x-auto w-full max-w-5xl">

        {/* Controls */}
        <div className="flex justify-center space-x-8 mb-12">
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target Output Element (<span className="font-mono text-indigo-600">i</span>)</span>
            <div className="flex space-x-2">
              <button onClick={() => setHoverRowI(null)} className={cn("px-3 py-1 rounded text-sm font-medium transition-colors", hoverRowI === null ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>All</button>
              {[0, 1, 2].map((i) => (
                <button key={i} onClick={() => setHoverRowI(i)} className={cn("px-3 py-1 rounded text-sm font-medium transition-colors", hoverRowI === i ? "bg-indigo-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>y_{i+1}</button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Singular Value Path (<span className="font-mono text-emerald-600">j</span>)</span>
            <div className="flex space-x-2">
              <button onClick={() => setHoverColJ(null)} className={cn("px-3 py-1 rounded text-sm font-medium transition-colors", hoverColJ === null ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>Sum All</button>
              {[0, 1, 2].map((j) => (
                <button key={j} onClick={() => setHoverColJ(j)} className={cn("px-3 py-1 rounded text-sm font-medium transition-colors", hoverColJ === j ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>σ_{j+1}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Matrix Visualization */}
        <div className="flex items-center justify-center space-x-4 mb-12 flex-nowrap min-w-max">

          {/* Y Vector */}
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-slate-500 mb-2">y</div>
            <div className="flex flex-col border-l-2 border-r-2 border-slate-800 px-1 py-1 space-y-1 rounded-sm">
              {Y_VECTOR.map((val, r) => (
                <div key={r} className={cn("w-12 h-10 flex items-center justify-center rounded font-mono text-sm transition-colors", isActiveY(r) ? "bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-sm font-bold" : "text-slate-400")}>
                  <BlockMath math={val} />
                </div>
              ))}
            </div>
          </div>

          <div className="text-2xl font-bold text-slate-400 mx-2">=</div>

          {/* U Matrix */}
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-slate-500 mb-2">U</div>
            <div className="flex space-x-1 border-l-2 border-r-2 border-slate-800 px-1 py-1 rounded-sm">
              {/* Render U column by column to show how U_j is selected when i is null */}
              {[0, 1, 2].map((c) => (
                <div key={c} className={cn("flex flex-col space-y-1 rounded p-0.5 transition-colors", hoverRowI === null && isActiveU(0, c) ? "bg-indigo-50 border border-indigo-200" : "border border-transparent")}>
                  {[0, 1, 2].map((r) => (
                    <div key={r} className={cn("w-12 h-10 flex items-center justify-center rounded font-mono text-sm transition-colors", isActiveU(r, c) ? "bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold" : "text-slate-400")}>
                      <BlockMath math={U_MATRIX[r][c]} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Sigma Matrix */}
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-slate-500 mb-2">Σ</div>
            <div className="flex flex-col border-l-2 border-r-2 border-slate-800 px-1 py-1 space-y-1 rounded-sm">
              {SIGMA_MATRIX.map((row, r) => (
                <div key={r} className="flex space-x-1">
                  {row.map((val, c) => (
                    <div key={c} className={cn("w-12 h-10 flex items-center justify-center rounded font-mono text-sm transition-colors", r === c && isActiveSigma(r, c) ? "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold" : "text-slate-300", r !== c && "opacity-40")}>
                      <BlockMath math={val} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* V* Matrix */}
          <div className="flex flex-col items-center">
            <div className="text-sm font-semibold text-slate-500 mb-2">V*</div>
            <div className="flex flex-col border-l-2 border-r-2 border-slate-800 px-1 py-1 space-y-1 rounded-sm">
              {V_STAR_MATRIX.map((row, r) => (
                <div key={r} className={cn("flex space-x-1 rounded p-0.5 transition-colors", isActiveVStar(r, 0) ? "bg-amber-50 border border-amber-200" : "border border-transparent")}>
                  {row.map((val, c) => (
                    <div key={c} className={cn("w-12 h-10 flex items-center justify-center rounded font-mono text-sm transition-colors", isActiveVStar(r, c) ? "text-amber-900 font-bold" : "text-slate-400")}>
                      <BlockMath math={val} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* X Vector */}
          <div className="flex flex-col items-center ml-2">
            <div className="text-sm font-semibold text-slate-500 mb-2">x</div>
            <div className="flex flex-col border-l-2 border-r-2 border-slate-800 px-1 py-1 space-y-1 rounded-sm bg-amber-50 border border-amber-200">
              {X_VECTOR.map((val, r) => (
                <div key={r} className={cn("w-12 h-10 flex items-center justify-center rounded font-mono text-sm text-amber-900 font-bold")}>
                  <BlockMath math={val} />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Dynamic Formula Display */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center min-h-[120px]">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Active Computation</div>

          <div className="text-lg">
            {hoverRowI !== null && hoverColJ !== null && (
              <BlockMath math={`y_${hoverRowI+1} \\leftarrow y_${hoverRowI+1} + \\underbrace{U_{${hoverRowI+1}${hoverColJ+1}}}_{\\text{weight}} \\cdot \\underbrace{\\sigma_${hoverColJ+1}}_{\\text{scale}} \\cdot \\underbrace{(V^*_{${hoverColJ+1},:} \\cdot x)}_{\\text{projection}}`} />
            )}

            {hoverRowI !== null && hoverColJ === null && (
              <BlockMath math={`y_${hoverRowI+1} = \\sum_{j=1}^3 U_{${hoverRowI+1}j} \\sigma_j (V^*_{j,:} \\cdot x)`} />
            )}

            {hoverRowI === null && hoverColJ !== null && (
              <BlockMath math={`y += \\underbrace{\\begin{bmatrix} U_{1${hoverColJ+1}} \\\\ U_{2${hoverColJ+1}} \\\\ U_{3${hoverColJ+1}} \\end{bmatrix}}_{u_${hoverColJ+1}} \\sigma_${hoverColJ+1} (V^*_{${hoverColJ+1},:} \\cdot x)`} />
            )}

            {hoverRowI === null && hoverColJ === null && (
              <BlockMath math={`y = \\sum_{j=1}^3 \\mathbf{u}_j \\sigma_j (\\mathbf{v}_j^* x)`} />
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
