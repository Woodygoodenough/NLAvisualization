"use client";

import React, { useState } from "react";
import "katex/dist/katex.min.css";
import { BlockMath } from "react-katex";
import Scene3D from "./Scene3D";

export default function StabilityVisualizer() {
  const [thetaDeg, setThetaDeg] = useState(45);
  const [kappa, setKappa] = useState(10);
  const [epsilonScale, setEpsilonScale] = useState(5); // UI scale 1-10
  const [phiDeg, setPhiDeg] = useState(0); // Optional rotation of perturbation

  // Derive mathematical properties
  const thetaRad = (thetaDeg * Math.PI) / 180;
  const cosTheta = Math.cos(thetaRad);
  const sinTheta = Math.sin(thetaRad);

  // Real epsilon derived from slider
  const epsilon = epsilonScale * 0.005;

  // eta is ||y|| / (||A|| ||x||). For simplicity, let's treat eta = 1, or something constant.
  const eta = 1.0;

  const tanTheta = Math.tan(thetaRad);
  const predictedSensitivity = kappa + (kappa * kappa * tanTheta) / eta;

  // For the actual scene, we pass the real tilt
  const tiltRad = epsilon * kappa;

  // We will compute relative change delta Y / Y over in the Scene, or we can compute it here.
  // The tilt rotates the plane. If the plane rotates by `tiltRad` towards `b`,
  // the new normal is `[-sin(tilt), cos(tilt), 0]`.
  // `b = [cos(theta), sin(theta), 0]`
  // The old projection y is `[cos(theta), 0, 0]`.
  // The new projection y' is b - (b . n') n'
  const bX = cosTheta;
  const bY = sinTheta;
  const bZ = 0;

  // Apply phi rotation to the tilt axis to make it 3D
  const phiRad = (phiDeg * Math.PI) / 180;

  // n' is tilted away from Y axis.
  const nX = -Math.sin(tiltRad) * Math.cos(phiRad);
  const nY = Math.cos(tiltRad);
  const nZ = -Math.sin(tiltRad) * Math.sin(phiRad);

  const bDotN = bX * nX + bY * nY + bZ * nZ;

  const yPrimeX = bX - bDotN * nX;
  const yPrimeY = bY - bDotN * nY;
  const yPrimeZ = bZ - bDotN * nZ;

  const deltaYX = yPrimeX - bX; // wait, old y is [bX, 0, 0]
  const oldYX = bX;
  const oldYY = 0;
  const oldYZ = 0;

  const dX = yPrimeX - oldYX;
  const dY = yPrimeY - oldYY;
  const dZ = yPrimeZ - oldYZ;

  const deltaYLength = Math.sqrt(dX*dX + dY*dY + dZ*dZ);
  const yLength = Math.sqrt(oldYX*oldYX + oldYY*oldYY + oldYZ*oldYZ);
  const relativeChange = deltaYLength / (yLength + 0.0001); // avoid div zero

  return (
    <div className="flex h-full flex-col xl:flex-row overflow-hidden">
      {/* Sidebar Info Panel */}
      <div className="w-full xl:w-[400px] flex-shrink-0 border-b xl:border-b-0 xl:border-r bg-white p-6 overflow-y-auto z-10 shadow-[0_0_15px_rgba(0,0,0,0.05)]">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1 text-slate-900">LSE Stability II</h1>
          <p className="text-sm text-slate-500">Sensitivity of the projection ŷ to perturbations in A</p>
        </div>

        <div className="space-y-6">
          {/* Mathematical Formulation */}
          <section className="bg-slate-50 rounded-lg p-4 border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            <div className="text-sm overflow-x-auto">
              <BlockMath math="A\mathbf{x} \approx \mathbf{b}" />
              <BlockMath math="\mathbf{\hat{y}} = \mathcal{P}_{\text{Span}(A)}\mathbf{b}" />
              <BlockMath math="\mathbf{\hat{y}}' = \mathcal{P}_{\text{Span}(A+\delta A)}\mathbf{b}" />
              <div className="my-2 border-t border-slate-200"></div>
              <BlockMath math="\kappa_{A \to \hat{y}} \approx \kappa(A) + \frac{\kappa(A)^2 \tan(\theta)}{\eta}" />
            </div>
          </section>

          {/* Core Idea */}
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Core Idea</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              When the matrix <span className="font-mono text-xs font-semibold bg-slate-100 px-1 py-0.5 rounded">A</span> is perturbed, its column space wobbles. This visualization shows how this perturbation shifts the projection from <span className="font-mono text-xs font-semibold bg-slate-100 px-1 py-0.5 rounded">ŷ</span> to <span className="font-mono text-xs font-semibold bg-slate-100 px-1 py-0.5 rounded">ŷ′</span>.
            </p>
            <ul className="mt-3 text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li><span className="font-mono text-xs">b</span> stays fixed.</li>
              <li>When <span className="font-mono text-xs">A</span> is well-conditioned, the plane is stable.</li>
              <li>When <span className="font-mono text-xs">A</span> is ill-conditioned, a tiny perturbation <span className="font-mono text-xs">ε</span> rotates the plane significantly.</li>
              <li>This causes the projection <span className="font-mono text-xs">ŷ</span> to shift considerably to <span className="font-mono text-xs">ŷ′</span>.</li>
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
                  min={5}
                  max={85}
                  step={1}
                  onChange={(e) => setThetaDeg(parseInt(e.target.value))}
                  className="w-full accent-slate-800"
                />
                <p className="text-xs text-slate-500 leading-snug">Angle between <span className="font-mono">b</span> and its projection.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <span className="font-mono mr-1">κ(A)</span>
                  </label>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{kappa}</span>
                </div>
                <input
                  type="range"
                  value={kappa}
                  min={1}
                  max={50}
                  step={1}
                  onChange={(e) => setKappa(parseInt(e.target.value))}
                  className="w-full accent-slate-800"
                />
                <p className="text-xs text-slate-500 leading-snug">Condition number. Amplifies the perturbation's effect on the plane.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <span className="font-mono mr-1">ε</span> (epsilon)
                  </label>
                  <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{epsilonScale}</span>
                </div>
                <input
                  type="range"
                  value={epsilonScale}
                  min={0}
                  max={10}
                  step={1}
                  onChange={(e) => setEpsilonScale(parseInt(e.target.value))}
                  className="w-full accent-slate-800"
                />
                <p className="text-xs text-slate-500 leading-snug">Base perturbation magnitude.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center">
                    <span className="font-mono mr-1">φ</span> (azimuth)
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
                <p className="text-xs text-slate-500 leading-snug">Direction of the plane's tilt.</p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* 3D Visualization Area */}
      <div className="flex-1 relative bg-slate-50 h-[500px] xl:h-auto min-h-0">
        <Scene3D thetaRad={thetaRad} tiltRad={tiltRad} phiRad={phiRad} />

        {/* Overlay Metrics */}
        <div className="absolute top-6 right-6 flex flex-col gap-3 pointer-events-none">
          <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg p-3 w-56 text-center">
            <div className="text-[10px] uppercase font-semibold text-blue-600 mb-1 tracking-wider">||δŷ|| / ||ŷ||</div>
            <div className="font-mono text-lg font-medium text-slate-800">{relativeChange.toFixed(4)}</div>
          </div>
          <div className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg p-3 w-56 text-center">
            <div className="text-[10px] uppercase font-semibold text-slate-600 mb-1 tracking-wider">Sensitivity Score</div>
            <div className="font-mono text-lg font-medium text-slate-800">{predictedSensitivity.toFixed(2)}</div>
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
