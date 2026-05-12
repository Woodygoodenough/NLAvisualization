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
  const a11 = 0.8, a12 = 0.3;
  const a21 = 0, a22 = 0.5;

  const handleNext = () => {
    if (iteration >= 30) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    const lastVec = vectorHistory.length > 0 ? vectorHistory[vectorHistory.length - 1] : currentVec;

    // Calculate Ax
    let ax = a11 * lastVec[0] + a12 * lastVec[1];
    let ay = a21 * lastVec[0] + a22 * lastVec[1];

    if (angleDeg === 135 || angleDeg === 315) {
      // Degenerate case for this new matrix
      // A = [0.8 0.3; 0 0.5]
      // L1 = 0.8, L2 = 0.5
      // p1 = (1, 0)
      // p2 => (0.8-0.5)x + 0.3y = 0 => 0.3x + 0.3y = 0 => x = -y. So p2 = (-1/sqrt(2), 1/sqrt(2))
      // Same exact eigenvectors, just different eigenvalues!
      const dot = (-ax + ay) / 2;
      ax = -dot;
      ay = dot;
    }

    setVectorHistory([...vectorHistory, [ax, ay]]);
    setSubStep("Ax"); // Always just show Ax shrinking
    setIteration(iteration + 1);
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
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">2. Power Iteration — Spectral Decay</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Visualizing vector decay when spectral radius ρ(A) &lt; 1</p>
        </div>

        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            <div className="text-sm overflow-x-auto space-y-2">
              <BlockMath math="x_{k+1} = A x_k" />
              <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                When all eigenvalues of <InlineMath math="A" /> have absolute value less than 1 (i.e. spectral radius <InlineMath math="\\rho(A) < 1" />), repeatedly multiplying by <InlineMath math="A" /> causes the vector to decay toward the origin.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Geometric Model</h2>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
              <BlockMath math="A = \begin{bmatrix} 0.8 & 0.3 \\ 0 & 0.5 \end{bmatrix}" />
              <p className="text-xs text-slate-500 mt-2 text-center">Eigenvalues: <InlineMath math="\\lambda_1 = 0.8, \lambda_2 = 0.5" /></p>
            </div>

            <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li>Eigenvector <InlineMath math="p_1" /> (red) corresponds to <InlineMath math="\\lambda_1 = 0.8" />.</li>
              <li>Eigenvector <InlineMath math="p_2" /> (red) corresponds to <InlineMath math="\\lambda_2 = 0.5" />.</li>
              <li>Notice how both components decay, but the component along <InlineMath math="p_2" /> decays much faster, meaning the vector trajectory curls into the <InlineMath math="p_1" /> axis as it shrinks to zero.</li>
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
                    Next (Multiply A)
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
