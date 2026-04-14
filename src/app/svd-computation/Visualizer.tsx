"use client";

import React, { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import ComputationView from "./ComputationView";

export default function Visualizer() {
  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] w-full">
      {/* Left Sidebar */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SVD Computation</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Understanding the elementwise construction of <InlineMath math="y = U \Sigma V^* x" /></p>
        </div>

        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            <div className="text-sm overflow-x-auto space-y-2">
              <BlockMath math="y = U \Sigma V^* x" />
              <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                By breaking down the matrix multiplication into its core components, we can see exactly how the Singular Value Decomposition maps the input vector <InlineMath math="x" /> to the output vector <InlineMath math="y" />.
              </p>
              <BlockMath math="y_i = \sum_{j} U_{ij} \sigma_j (V^*_{j,:} \cdot x)" />
              <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                Notice that each entry <InlineMath math="y_i" /> is constructed by taking the dot product of the input with the rows of <InlineMath math="V^*" />, scaling by the singular values <InlineMath math="\sigma" />, and recombining using the columns (or rows) of <InlineMath math="U" />.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Instructions</h2>
            <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li>Hover over or click the elements in the grid to see how they interact.</li>
              <li>Select an output index <InlineMath math="i" /> to see how <InlineMath math="y_i" /> is computed.</li>
              <li>Select a component index <InlineMath math="j" /> to isolate one singular value path.</li>
            </ul>
          </section>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-50 overflow-auto">
        <ComputationView />
      </div>
    </div>
  );
}
