"use client";

import React, { useState } from "react";
import { BlockMath, InlineMath } from "react-katex";
import Scene2D from "./Scene2D";

export default function Visualizer() {
  const [angleDeg, setAngleDeg] = useState(45);
  const [hasStarted, setHasStarted] = useState(false);
  const [iteration, setIteration] = useState(0);
  // 'x' means we are showing x_k
  // 'Ax' means we are showing A * x_k
  const [subStep, setSubStep] = useState<"x" | "Ax">("x");

  // Keep track of the actual current vector x
  // We initialize it based on angleDeg only until hasStarted is true
  const initialAngleRad = (angleDeg * Math.PI) / 180;

  // A history array of [x, y] to keep state immutable and simple
  const [vectorHistory, setVectorHistory] = useState<[number, number][]>([]);

  // Derived current vector
  let currentVec: [number, number] = [Math.cos(initialAngleRad), Math.sin(initialAngleRad)];
  if (hasStarted && vectorHistory.length > 0) {
    currentVec = vectorHistory[vectorHistory.length - 1];
  }

  // The matrix A = [2 1; 0 1]
  const a11 = 2, a12 = 1;
  const a21 = 0, a22 = 1;

  const handleNext = () => {
    if (iteration >= 30) return;

    if (!hasStarted) {
      setHasStarted(true);
      // We are at x_0. Next step is Ax_0
      setVectorHistory([[Math.cos(initialAngleRad), Math.sin(initialAngleRad)]]);
      setSubStep("Ax");
      return;
    }

    if (subStep === "x") {
      // Currently showing x_k. Next is Ax_k
      setSubStep("Ax");
    } else {
      // Currently showing Ax_k. Next is x_{k+1} (normalized)
      const lastVec = vectorHistory[vectorHistory.length - 1];

      // Calculate Ax
      let ax = a11 * lastVec[0] + a12 * lastVec[1];
      let ay = a21 * lastVec[0] + a22 * lastVec[1];

      // Degenerate case check: If initial vector was exactly on p2 = (-1/sqrt(2), 1/sqrt(2)),
      // which corresponds to an angle of 135 deg or 315 deg.
      // To prevent floating point drift, if the angle is exactly 135 or 315, we enforce the direction.
      if (angleDeg === 135 || angleDeg === 315) {
        // Project onto p2 direction (-1, 1) strictly
        const dot = (-ax + ay) / 2;
        ax = -dot;
        ay = dot;
      }

      // Normalize
      const len = Math.sqrt(ax * ax + ay * ay);
      let nextVec: [number, number];
      if (len > 0) {
        nextVec = [ax / len, ay / len];
      } else {
        nextVec = [0, 0];
      }

      setVectorHistory([...vectorHistory, nextVec]);
      setSubStep("x");
      setIteration(iteration + 1);
    }
  };

  const handleReset = () => {
    setHasStarted(false);
    setIteration(0);
    setSubStep("x");
    setVectorHistory([]);
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] w-full">
      {/* Left Sidebar */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">1. Power Iteration — Dominant Eigenvector</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Visualizing vector convergence to the dominant eigenvector</p>
        </div>

        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            <div className="text-sm overflow-x-auto space-y-2">
              <BlockMath math="x_{k+1} = \\frac{A x_k}{\\|A x_k\\|}" />
              <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                By repeatedly multiplying a vector by <InlineMath math="A" /> and normalizing, the vector is increasingly dominated by the component along the eigenvector with the largest absolute eigenvalue.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Geometric Model</h2>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
              <BlockMath math="A = \\begin{bmatrix} 2 & 1 \\\\ 0 & 1 \\end{bmatrix}" />
              <p className="text-xs text-slate-500 mt-2 text-center">Eigenvalues: <InlineMath math="\\lambda_1 = 2, \\lambda_2 = 1" /></p>
            </div>

            <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li>Eigenvector <InlineMath math="p_1" /> (red) corresponds to <InlineMath math="\\lambda_1 = 2" />.</li>
              <li>Eigenvector <InlineMath math="p_2" /> (red) corresponds to <InlineMath math="\\lambda_2 = 1" />.</li>
              <li>Notice how the component along <InlineMath math="p_1" /> grows twice as fast as the component along <InlineMath math="p_2" /> at each step.</li>
            </ul>
          </section>

          <section className="pt-4 border-t border-slate-100">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Controls</h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className="font-mono text-xs">θ</span>
                    Initial Vector <InlineMath math="x_0" />
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
                  disabled={hasStarted}
                  className="w-full accent-slate-800 disabled:opacity-50"
                />
              </div>



              <div className="flex items-center justify-between mt-6">
                <div className="text-sm font-semibold text-slate-700">
                  Iteration: {iteration}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                  >
                    Reset
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={iteration >= 30}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors shadow-sm"
                  >
                    Next ({subStep === "x" ? "Multiply A" : "Normalize"})
                  </button>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-50">
        <Scene2D
          currentVec={currentVec}
          subStep={subStep}
          iteration={iteration}
          angleDeg={angleDeg}
        />
      </div>
    </div>
  );
}
