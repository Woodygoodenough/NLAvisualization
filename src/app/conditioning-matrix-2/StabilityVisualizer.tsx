"use client";

import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";
import Scene3D from "./Scene3D";

export default function StabilityVisualizer() {
  const [phiDeg, setPhiDeg] = useState(45);
  const [psiDeg, setPsiDeg] = useState(45);
  const [deltaMinorRatio, setDeltaMinorRatio] = useState(0.0);

  const phiRad = (phiDeg * Math.PI) / 180;
  const psiRad = (psiDeg * Math.PI) / 180;

  // Domain x = (cos phi, sin phi)
  const x1 = Math.cos(phiRad);
  const x2 = Math.sin(phiRad);

  // A has singular values sigma_1 = 2, sigma_2 = 0.5.
  const ax1 = 2 * x1;
  const ax2 = 0.5 * x2;
  const axLength = Math.sqrt(ax1*ax1 + ax2*ax2);

  // delta A has norm epsilon, we'll use a fixed epsilon for visualization scale
  const epsilon = 0.4;

  // delta A * x = epsilon * u (where u is a unit vector determined by psi)
  // This achieves the upper bound ||delta A * x|| <= ||delta A|| ||x|| = epsilon * 1
  const deltaAxLength = epsilon;

  // Condition number calculation
  const sigma1 = 2.0;
  // kappa_{A \to Ax} = ||A|| ||x|| / ||Ax|| = sigma_1 / ||Ax||
  const kappaA = sigma1 / axLength;

  return (
    <div className="flex h-full flex-col xl:flex-row overflow-hidden">
      {/* Sidebar Info Panel */}
      <div className="w-full xl:w-[400px] flex-shrink-0 border-b xl:border-b-0 xl:border-r bg-white p-6 overflow-y-auto z-10 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">Conditioning of Matrix II</h1>
          <p className="text-sm text-slate-500">Geometry of matrix perturbations</p>
        </div>

        <div className="space-y-6">
          {/* Mathematical Formulation */}
          <section className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            <div className="text-sm overflow-x-auto">
              <BlockMath math="\kappa(\mathbf{x})_{A \mapsto A\mathbf{x}} = \frac{||A|| \cdot ||\mathbf{x}||}{||A\mathbf{x}||}" />
              <BlockMath math="\le \kappa(A) = ||A|| \cdot ||A^{-1}||" />
            </div>
          </section>

          {/* Core Idea */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Core Idea</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              We fix <InlineMath math="\mathbf{x}" /> and explore perturbations to the matrix itself: <InlineMath math="A \to A + \delta A" />.
            </p>
            <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li>We can visualize <InlineMath math="\delta A" /> as its own small ellipse centered at the tip of <InlineMath math="A\mathbf{x}" />.</li>
              <li>The equality condition holds when the major axis of <InlineMath math="\delta A" /> aligns with <InlineMath math="A\mathbf{x}" />.</li>
              <li>A rank-1 perturbation is simply the case where the <InlineMath math="\delta A" /> ellipse collapses to one dimension.</li>
            </ul>
          </section>

          {/* Controls */}
          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Geometric Controls</h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <span className="font-mono mr-1">φ</span> (phi)
                  </label>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{phiDeg}°</span>
                </div>
                <input
                  type="range"
                  value={phiDeg}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(e) => setPhiDeg(parseInt(e.target.value))}
                  className="w-full accent-slate-800"
                />
                <p className="text-xs text-slate-500 leading-snug">Fixes the input vector <InlineMath math="\mathbf{x}" /> in the domain.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <span className="font-mono mr-1">ψ</span> (psi)
                  </label>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{psiDeg}°</span>
                </div>
                <input
                  type="range"
                  value={psiDeg}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(e) => setPsiDeg(parseInt(e.target.value))}
                  className="w-full accent-slate-800"
                />
                <p className="text-xs text-slate-500 leading-snug">Direction of the major axis for <InlineMath math="\delta A" />.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    Rank-1 Collapse
                  </label>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{deltaMinorRatio.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  value={deltaMinorRatio * 100}
                  min={0}
                  max={100}
                  step={1}
                  onChange={(e) => setDeltaMinorRatio(parseInt(e.target.value) / 100)}
                  className="w-full accent-slate-800"
                />
                <p className="text-xs text-slate-500 leading-snug">Minor axis ratio of <InlineMath math="\delta A" />. At <InlineMath math="0" />, it is a rank-1 perturbation.</p>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setPhiDeg(90)}
                  className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-md border border-red-200 transition-colors shadow-sm"
                >
                  Worst-Case Input
                </button>
                <button
                  onClick={() => {
                    const axAngle = Math.atan2(ax2, ax1);
                    const psiWorst = (axAngle + Math.PI) * 180 / Math.PI;
                    setPsiDeg(Math.round((psiWorst + 360) % 360));
                  }}
                  className="flex-1 py-2 px-3 bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-medium rounded-md border border-orange-200 transition-colors shadow-sm"
                >
                  Worst-Case Perturb
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 3D Visualization Area */}
      <div className="flex-1 relative bg-slate-50 h-[500px] xl:h-auto min-h-0">
        <Scene3D phiRad={phiRad} psiRad={psiRad} epsilon={epsilon} deltaMinorRatio={deltaMinorRatio} />

        {/* Overlay Metrics */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none">
          <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg p-3 w-48 text-center">
            <div className="text-[10px] uppercase font-semibold text-emerald-600 mb-1 tracking-wider">||Ax||</div>
            <div className="font-mono text-lg font-medium text-slate-800">{axLength.toFixed(3)}</div>
          </div>
          <div className={`bg-white/90 backdrop-blur border shadow-sm rounded-lg p-3 w-48 text-center transition-colors ${kappaA > 1.8 ? "border-red-200 bg-red-50/90" : "border-slate-200"}`}>
            <div className={`text-[10px] uppercase font-semibold mb-1 tracking-wider ${kappaA > 1.8 ? "text-red-600" : "text-orange-600"}`}>κ_{'{A \u21A6 Ax}'}(x)</div>
            <div className="font-mono text-lg font-medium text-slate-800">{kappaA.toFixed(3)}</div>
          </div>
        </div>

        {/* Helper overlay */}
        <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur text-xs text-slate-500 px-3 py-2 rounded shadow-sm border border-slate-100 pointer-events-none">
          Click & drag to rotate camera
        </div>
      </div>
    </div>
  );
}
