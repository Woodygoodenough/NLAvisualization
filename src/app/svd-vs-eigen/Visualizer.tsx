"use client";

import React, { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import Scene2D from "./Scene2D";

export default function Visualizer() {
  const [viewMode, setViewMode] = useState<"svd" | "eigen">("svd");
  const [angleDeg, setAngleDeg] = useState(45);

  const angleRad = (angleDeg * Math.PI) / 180;

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] w-full">
      {/* Left Sidebar */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SVD vs Eigenvalue</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Comparing two fundamental matrix perspectives</p>
        </div>

        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            {viewMode === "svd" ? (
              <div className="text-sm overflow-x-auto space-y-2">
                <BlockMath math="A = U \Sigma V^*" />
                <BlockMath math="A\mathbf{v}_i = \sigma_i \mathbf{u}_i" />
                <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                  The SVD views the matrix as mapping a vector from a <strong>domain</strong> space to a <strong>codomain</strong> space. It identifies an orthogonal basis <InlineMath math="V" /> in the domain that maps exactly to an orthogonal basis <InlineMath math="U" /> in the codomain, scaled by <InlineMath math="\Sigma" />.
                </p>
              </div>
            ) : (
              <div className="text-sm overflow-x-auto space-y-2">
                <BlockMath math="A = P \Lambda P^{-1}" />
                <BlockMath math="A\mathbf{p}_i = \lambda_i \mathbf{p}_i" />
                <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                  The eigenvalue decomposition views the matrix as a transformation acting strictly <strong>within the same space</strong>. It identifies a set of specific directions (the non-orthogonal eigenvectors <InlineMath math="P" />) that are purely scaled by <InlineMath math="\Lambda" /> without being rotated.
                </p>
              </div>
            )}
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Geometric Model</h2>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
              <BlockMath math="A = \begin{bmatrix} 2 & 1 \\ 0 & 1 \end{bmatrix}" />
              <p className="text-xs text-slate-500 mt-2 text-center">A non-symmetric 2x2 matrix</p>
            </div>

            <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              {viewMode === "svd" ? (
                <>
                  <li>The domain is drawn as an inset circle.</li>
                  <li>Orthogonal vectors <InlineMath math="\mathbf{v}_1, \mathbf{v}_2" /> form a clean grid in the domain.</li>
                  <li>They map to orthogonal vectors <InlineMath math="\sigma_1\mathbf{u}_1, \sigma_2\mathbf{u}_2" /> which form the major/minor axes of the resulting ellipse.</li>
                </>
              ) : (
                <>
                  <li>The transformation operates on a single unified grid.</li>
                  <li>The eigenvectors <InlineMath math="\mathbf{p}_1, \mathbf{p}_2" /> define a <strong>skewed coordinate system</strong>.</li>
                  <li>The entire space is simply stretched along these two skewed axes.</li>
                </>
              )}
            </ul>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Controls</h2>

            <div className="space-y-6">
              <div className="flex space-x-2 p-1 bg-slate-100 rounded-lg">
                <button
                  onClick={() => setViewMode("svd")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === "svd" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  SVD Perspective
                </button>
                <button
                  onClick={() => setViewMode("eigen")}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${viewMode === "eigen" ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  Eigen Perspective
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className="font-mono text-xs">θ</span>
                    Input Vector <InlineMath math="\mathbf{x}" />
                  </label>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{angleDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={angleDeg}
                  onChange={(e) => setAngleDeg(parseFloat(e.target.value))}
                  className="w-full accent-slate-800"
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-50">
        <Scene2D viewMode={viewMode} angleRad={angleRad} />
      </div>
    </div>
  );
}
