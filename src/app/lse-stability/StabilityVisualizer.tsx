"use client";

import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import { Slider } from "@/components/ui/slider";
import Scene3D from "./Scene3D";

export default function StabilityVisualizer() {
  const [thetaDeg, setThetaDeg] = useState(45);
  const [phiDeg, setPhiDeg] = useState(45);

  // Derive mathematical properties
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const cosTheta = Math.cos(thetaRad);
  const conditionNumber = 1 / cosTheta;

  return (
    <div className="flex h-full flex-col xl:flex-row overflow-hidden">
      {/* Sidebar Info Panel */}
      <div className="w-full xl:w-[400px] flex-shrink-0 border-b xl:border-b-0 xl:border-r bg-white p-6 overflow-y-auto z-10 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">LSE Stability I</h1>
          <p className="text-sm text-slate-500">Geometry of the Normal Equations</p>
        </div>

        <div className="space-y-6">
          {/* Mathematical Formulation */}
          <section className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            <div className="text-sm">
              <BlockMath math="A\mathbf{x}=\mathbf{b}" />
              <BlockMath math="\mathbf{\hat{y}} = A(A^*A)^{-1}A^*\mathbf{b}" />
              <BlockMath math="\kappa_{b \mapsto \hat{y}} = \frac{||\delta \hat{y}|| / ||\hat{y}||}{||\delta b|| / ||b||} = \frac{1}{\cos \theta}" />
            </div>
          </section>

          {/* Core Idea */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Core Idea</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              This visualization shows how <span className="font-mono text-xs font-semibold bg-slate-100 px-1 py-0.5 rounded">b</span> is projected onto the plane defined by <span className="font-mono text-xs font-semibold bg-slate-100 px-1 py-0.5 rounded">A</span>, and why the sensitivity to perturbations scales like <span className="font-mono text-xs font-semibold bg-slate-100 px-1 py-0.5 rounded">1/cos(θ)</span>.
            </p>
            <ul className="mt-3 text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li>Normalize <span className="font-mono text-xs">||b|| = 1</span></li>
              <li>Then <span className="font-mono text-xs">||ŷ|| = cos(θ)</span></li>
              <li>As θ approaches 90°, <span className="font-mono text-xs">cos(θ)</span> becomes small</li>
              <li>So the sensitivity <span className="font-mono text-xs">1/cos(θ)</span> blows up</li>
            </ul>
          </section>

          {/* Controls */}
          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Geometric Controls</h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <span className="font-mono mr-1">θ</span> (theta)
                  </label>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{thetaDeg}°</span>
                </div>
                <input
                  type="range"
                  value={thetaDeg}
                  min={1}
                  max={89}
                  step={1}
                  onChange={(e) => setThetaDeg(parseInt(e.target.value))}
                  className="w-full accent-slate-800"
                />
                <p className="text-xs text-slate-500 leading-snug">Angle between <span className="font-mono">b</span> and its projection <span className="font-mono">ŷ</span>.</p>
              </div>

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
                <p className="text-xs text-slate-500 leading-snug">In-plane rotation of the projection.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 3D Visualization Area */}
      <div className="flex-1 relative bg-slate-50 h-[500px] xl:h-auto min-h-0">
        <Scene3D thetaRad={thetaRad} phiRad={(phiDeg * Math.PI) / 180} />

        {/* Overlay Metrics */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none">
          <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg p-3 w-48 text-center">
            <div className="text-[10px] uppercase font-semibold text-blue-600 mb-1 tracking-wider">||ŷ|| = cos(θ)</div>
            <div className="font-mono text-lg font-medium text-slate-800">{cosTheta.toFixed(4)}</div>
          </div>
          <div className={`bg-white/90 backdrop-blur border shadow-sm rounded-lg p-3 w-48 text-center transition-colors ${conditionNumber > 10 ? "border-red-200 bg-red-50/90" : "border-slate-200"}`}>
            <div className={`text-[10px] uppercase font-semibold mb-1 tracking-wider ${conditionNumber > 10 ? "text-red-600" : "text-orange-600"}`}>Sensitivity = 1/cos(θ)</div>
            <div className="font-mono text-lg font-medium text-slate-800">{conditionNumber.toFixed(4)}</div>
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
