"use client";

import React, { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import Scene3D from "./Scene3D";

export default function StabilityVisualizer() {
  // Vector b controls
  const [thetaDeg, setThetaDeg] = useState(45);
  const [phiDeg, setPhiDeg] = useState(45);

  // Matrix perturbation controls
  const [deltaMinorRatio, setDeltaMinorRatio] = useState(0.4);

  // Fixed epsilon for scaling delta A
  const epsilon = 0.3;

  const thetaRad = (thetaDeg * Math.PI) / 180;
  const phiRad = (phiDeg * Math.PI) / 180;

  // LSE condition number for matrix perturbation is roughly proportional to ||r|| / cos(theta) ...
  // Actually kappa_{A->y} approx 1/cos(theta) + ||r||/cos(theta) ... wait, we visualize the geometry directly.
  const cosTheta = Math.cos(thetaRad);
  const sensitivity = 1 / (cosTheta === 0 ? 1e-10 : cosTheta);

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] w-full">
      {/* Left Sidebar */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Conditioning of LSE II</h1>
          <p className="text-sm text-slate-500 mt-1">Sensitivity to matrix perturbations <InlineMath math="\delta A" /></p>
        </div>

        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            <div className="text-sm overflow-x-auto space-y-2">
              <BlockMath math="A\mathbf{x} \approx \mathbf{b}" />
              <BlockMath math="\mathbf{\hat{y}} = A(A^*A)^{-1}A^*\mathbf{b}" />
              <BlockMath math="\kappa_{A \mapsto \mathbf{\hat{y}}} \sim \frac{\|\mathbf{r}\|}{\cos \theta}" />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Core Idea</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-3">
              We fix <InlineMath math="\mathbf{b}" /> and explore perturbations to the matrix: <InlineMath math="A \to A + \delta A" />.
            </p>
            <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li>The most damaging perturbation <InlineMath math="\delta A" /> expands along the residual <InlineMath math="\mathbf{r} = \mathbf{b} - \mathbf{\hat{y}}" />.</li>
              <li>This tilts the column space <InlineMath math="\text{Span}(A)" /> towards <InlineMath math="\mathbf{b}" />, drastically shifting the orthogonal projection <InlineMath math="\mathbf{\hat{y}}" /> to <InlineMath math="\mathbf{\hat{y}}'" />.</li>
              <li>The solid yellow ellipse represents the perturbed column space.</li>
            </ul>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Geometric Controls</h2>

            <div className="space-y-6">
              {/* Theta Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className="font-mono text-xs">θ</span>
                    Tilt Angle
                  </label>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{thetaDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="89"
                  step="1"
                  value={thetaDeg}
                  onChange={(e) => setThetaDeg(parseFloat(e.target.value))}
                  className="w-full accent-slate-800"
                />
              </div>

              {/* Phi Control */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className="font-mono text-xs">φ</span>
                    Rotation
                  </label>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{phiDeg}°</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={phiDeg}
                  onChange={(e) => setPhiDeg(parseFloat(e.target.value))}
                  className="w-full accent-slate-800"
                />
                <div className="pt-1 flex gap-2">
                  <button
                    onClick={() => setPhiDeg(90)}
                    className="flex-1 py-1.5 px-3 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-md border border-red-200 transition-colors shadow-sm"
                  >
                    Worst-Case Direction
                  </button>
                </div>
              </div>

              {/* Sigma_2(delta A) Control */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className="font-mono text-xs">σ₂(δA)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDeltaMinorRatio(0)}
                      disabled={deltaMinorRatio === 0}
                      className="px-2 py-1 text-[10px] uppercase tracking-wider font-semibold text-slate-600 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Rank-1 perturb
                    </button>
                    <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded min-w-[3rem] text-center">
                      {deltaMinorRatio.toFixed(2)}
                    </span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={deltaMinorRatio}
                  onChange={(e) => setDeltaMinorRatio(parseFloat(e.target.value))}
                  className="w-full accent-slate-800"
                />
                <div className="flex justify-between text-xs text-slate-400 font-mono">
                  <span>0 (Rank-1)</span>
                  <span>0.5 (Full)</span>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-50">
        <Scene3D thetaRad={thetaRad} phiRad={phiRad} epsilon={epsilon} deltaMinorRatio={deltaMinorRatio} />

        {/* Overlay Metrics */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none">
          <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg p-3 w-48 text-center">
            <div className="text-[10px] uppercase font-semibold text-emerald-600 mb-1 tracking-wider">||ŷ||</div>
            <div className="font-mono text-lg font-medium text-slate-800">
              {(1.0 / Math.sqrt((Math.cos(phiRad)*Math.cos(phiRad))/4.0 + (Math.sin(phiRad)*Math.sin(phiRad)))).toFixed(3)}
            </div>
          </div>
          <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg p-3 w-48 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-600 mb-1 tracking-wider">||r||</div>
            <div className="font-mono text-lg font-medium text-slate-800">
              {((1.0 / Math.sqrt((Math.cos(phiRad)*Math.cos(phiRad))/4.0 + (Math.sin(phiRad)*Math.sin(phiRad)))) * Math.tan(thetaRad)).toFixed(3)}
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur text-xs text-slate-500 px-3 py-2 rounded shadow-sm border border-slate-100 pointer-events-none">
          Click & drag to rotate camera
        </div>
      </div>
    </div>
  );
}
