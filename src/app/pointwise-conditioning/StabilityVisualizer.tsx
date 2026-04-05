"use client";

import React, { useState } from "react";

import { BlockMath, InlineMath } from "react-katex";
import Scene3D from "./Scene3D";

export default function StabilityVisualizer() {
  const [phiDeg, setPhiDeg] = useState(45);

  const phiRad = (phiDeg * Math.PI) / 180;

  // Domain x = (cos phi, sin phi)
  const x1 = Math.cos(phiRad);
  const x2 = Math.sin(phiRad);

  // A has singular values sigma_1 = 2, sigma_2 = 0.5.
  // Assuming A = U \Sigma V^T, let v_1 = e_1, v_2 = e_2 in R^2.
  // Then A x = 2 x_1 u_1 + 0.5 x_2 u_2.
  // The length of Ax is sqrt((2 x_1)^2 + (0.5 x_2)^2).
  const ax1 = 2 * x1;
  const ax2 = 0.5 * x2;
  const axLength = Math.sqrt(ax1*ax1 + ax2*ax2);

  const sigma1 = 2.0;
  // kappa(x) = ||A|| ||x|| / ||Ax|| = sigma_1 * 1 / ||Ax|| = 2 / ||Ax||
  const kappaX = sigma1 / axLength;

  const isWorstInput = phiDeg === 90 || phiDeg === 270;

  return (
    <div className="flex h-full flex-col xl:flex-row overflow-hidden">
      {/* Sidebar Info Panel */}
      <div className="w-full xl:w-[400px] flex-shrink-0 border-b xl:border-b-0 xl:border-r bg-white p-6 overflow-y-auto z-10 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">Conditioning of Matrix I</h1>
          <p className="text-sm text-slate-500">Geometry of the image ellipse</p>
        </div>

        <div className="space-y-6">
          {/* Mathematical Formulation */}
          <section className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            <div className="text-sm overflow-x-auto">
              <BlockMath math="\kappa(\mathbf{x})_{\mathbf{x} \mapsto A\mathbf{x}} = \frac{||A|| \cdot ||\mathbf{x}||}{||A\mathbf{x}||}" />
              <BlockMath math="\le \kappa(A) = ||A|| \cdot ||A^{-1}||" />
            </div>
          </section>

          {/* Core Idea */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Core Idea</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              The unit circle in the domain <InlineMath math="\mathbb{R}^2" /> maps to an ellipse lying inside the plane <span className="font-mono text-xs font-semibold bg-slate-100 px-1 py-0.5 rounded">Span(A)</span> in <InlineMath math="\mathbb{R}^3" />.
            </p>
            <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li>The worst-case perturbation <InlineMath math="A\delta\mathbf{x}" /> always aligns with the long axis of the ellipse.</li>
              <li>When <InlineMath math="A\mathbf{x}" /> is near the short axis, <InlineMath math="||A\mathbf{x}||" /> is small, so <InlineMath math="\kappa(\mathbf{x})" /> is large.</li>
              <li>Pointwise conditioning depends on both the input location <InlineMath math="\mathbf{x}" /> and the worst-case perturbation amplification.</li>
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
                <p className="text-xs text-slate-500 leading-snug">Position of <span className="font-mono">x</span> on the unit circle in the domain.</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setPhiDeg(90)}
                  className="w-full py-2 px-4 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded-md border border-red-200 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  Set to Worst-Case Input
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 3D Visualization Area */}
      <div className="flex-1 relative bg-slate-50 h-[500px] xl:h-auto min-h-0">
        <Scene3D phiRad={phiRad} />

        {/* Domain Inset (2D) */}
        <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg p-3 pointer-events-none">
          <div className="text-[10px] uppercase font-semibold text-slate-600 mb-2 tracking-wider text-center">Domain (R²)</div>
          <svg width="120" height="120" viewBox="-1.2 -1.2 2.4 2.4" className="overflow-visible">
            {/* Axes */}
            <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="#cbd5e1" strokeWidth="0.02" />
            <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="#cbd5e1" strokeWidth="0.02" />
            {/* Unit circle */}
            <circle cx="0" cy="0" r="1" fill="none" stroke="#94a3b8" strokeWidth="0.02" strokeDasharray="0.05 0.05" />
            {/* Vector x */}
            {/* Note: SVG y-axis is down, so we negate y coordinate to match standard math coords visually */}
            <line x1="0" y1="0" x2={x1} y2={-x2} stroke={isWorstInput ? "#ef4444" : "#3b82f6"} strokeWidth="0.04" />
            <circle cx={x1} cy={-x2} r="0.06" fill={isWorstInput ? "#ef4444" : "#3b82f6"} />
            {/* Label */}
            <text x={x1 * 1.2} y={-x2 * 1.2} fontSize={isWorstInput ? "0.15" : "0.2"} fill={isWorstInput ? "#ef4444" : "#3b82f6"} textAnchor="middle" dominantBaseline="middle" className="font-mono font-bold">
              {isWorstInput ? "worst-case x" : "x"}
            </text>
          </svg>
          <div className="mt-2 text-center text-xs font-mono text-slate-500">
            x = ({x1.toFixed(2)}, {x2.toFixed(2)})
          </div>
        </div>

        {/* Overlay Metrics */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none">
          <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg p-3 w-48 text-center">
            <div className="text-[10px] uppercase font-semibold text-emerald-600 mb-1 tracking-wider">||Ax||</div>
            <div className="font-mono text-lg font-medium text-slate-800">{axLength.toFixed(3)}</div>
          </div>
          <div className={`bg-white/90 backdrop-blur border shadow-sm rounded-lg p-3 w-48 text-center transition-colors ${kappaX > 1.8 ? "border-red-200 bg-red-50/90" : "border-slate-200"}`}>
            <div className={`text-[10px] uppercase font-semibold mb-1 tracking-wider ${kappaX > 1.8 ? "text-red-600" : "text-orange-600"}`}>κ(x)</div>
            <div className="font-mono text-lg font-medium text-slate-800">{kappaX.toFixed(3)}</div>
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
