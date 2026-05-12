"use client";

import React, { useState, useMemo } from "react";
import { BlockMath, InlineMath } from "react-katex";
import Scene2D from "./Scene2D";

export default function Visualizer() {
  const [angleDeg, setAngleDeg] = useState(45);
  const [hasStarted, setHasStarted] = useState(false);
  const [iteration, setIteration] = useState(0);

  // The true solution
  const x_true = [1.5, 1.5];

  // The initial guess based on angle
  const initialAngleRad = (angleDeg * Math.PI) / 180;

  // Vector history stores the approximations x^(k)
  const [vectorHistory, setVectorHistory] = useState<[number, number][]>([]);

  // Derived current vector
  let currentVec: [number, number] = [Math.cos(initialAngleRad) * 3, Math.sin(initialAngleRad) * 3]; // Scale up initial slightly
  if (hasStarted && vectorHistory.length > 0) {
    currentVec = vectorHistory[vectorHistory.length - 1];
  }

  // The Iteration Matrix G = M^{-1}N
  // Let's choose a non-normal G with eigenvalues inside the unit circle but that causes transient error growth.
  // Example: G = [0.8  2.0]
  //              [0    0.5]
  // Eigenvalues are 0.8 and 0.5. Spectral radius = 0.8 < 1.
  // But norm(G) is large due to the '2.0', meaning error can grow initially.
  const g11 = 0.8, g12 = 2.0;
  const g21 = 0, g22 = 0.5;

  // b_hat = M^{-1}b
  // We want x_true to be the fixed point: x_true = G * x_true + b_hat
  // b_hat = x_true - G * x_true = (I - G) * x_true
  const b_hat_x = (1 - g11) * x_true[0] - g12 * x_true[1];
  const b_hat_y = -g21 * x_true[0] + (1 - g22) * x_true[1];

  const handleNext = () => {
    if (iteration >= 30) return;

    if (!hasStarted) {
      setHasStarted(true);
    }

    const lastVec = vectorHistory.length > 0 ? vectorHistory[vectorHistory.length - 1] : currentVec;

    // Calculate x^(k) = G * x^(k-1) + b_hat
    const next_x = g11 * lastVec[0] + g12 * lastVec[1] + b_hat_x;
    const next_y = g21 * lastVec[0] + g22 * lastVec[1] + b_hat_y;

    setVectorHistory([...vectorHistory, [next_x, next_y]]);
    setIteration(iteration + 1);
  };

  const handleReset = () => {
    setHasStarted(false);
    setIteration(0);
    setVectorHistory([]);
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] w-full">
      {/* Left Sidebar */}
      <div className="w-[400px] min-w-[350px] max-w-[450px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">3. Stationary Iterative Methods</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">Visualizing iterative processes and error decomposition</p>
        </div>

        <div className="flex-1 space-y-6">
          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-3">Formulation</h2>
            <div className="text-sm overflow-x-auto space-y-2">
              <p className="text-slate-600 text-xs">To solve <InlineMath math="A\mathbf{x} = \mathbf{b}" />, we split <InlineMath math="A = M - N" />.</p>
              <BlockMath math="\mathbf{x} = M^{-1}N\mathbf{x} + M^{-1}\mathbf{b}" />
              <BlockMath math="\mathbf{x}^{(k)} = M^{-1}N\mathbf{x}^{(k-1)} + M^{-1}\mathbf{b}" />
              <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                We define the iteration matrix <InlineMath math="G = M^{-1}N" />. The error <InlineMath math="\mathbf{e}^{(k)} = \mathbf{x}^{(k)} - \mathbf{x}" /> follows the simple recurrence:
              </p>
              <BlockMath math="\mathbf{e}^{(k)} = G \mathbf{e}^{(k-1)}" />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">Geometric Model</h2>
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 mb-4">
              <BlockMath math="G = \begin{bmatrix} 0.8 & 2.0 \\ 0 & 0.5 \end{bmatrix}" />
              <p className="text-xs text-slate-500 mt-2 text-center">Spectral Radius: <InlineMath math="\rho(G) = 0.8 < 1" /></p>
            </div>

            <ul className="text-sm text-slate-600 space-y-1.5 list-disc pl-4 marker:text-slate-400">
              <li>Even though <InlineMath math="\rho(G) < 1" />, the highly non-normal matrix <InlineMath math="G" /> causes the error norm to <strong>oscillate</strong> and even grow initially before eventually decaying.</li>
              <li>The two eigenvectors of <InlineMath math="G" /> are highly skewed (non-orthogonal).</li>
            </ul>
          </section>

          <section className="pt-4 border-t border-slate-100 mt-auto">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">Controls</h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <span className="font-mono text-xs">θ</span>
                    Initial Guess <InlineMath math="\mathbf{x}^{(0)}" />
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
                    Next Iteration
                  </button>
                </div>
              </div>

            </div>
          </section>
        </div>
      </div>

      <div className="flex-1 relative flex flex-col xl:flex-row bg-slate-50 border-l border-slate-200">
        <div className="flex-1 relative border-b xl:border-b-0 xl:border-r border-slate-200">
           <Scene2D
             mode="solution"
             currentVec={currentVec}
             x_true={x_true}
             iteration={iteration}
           />
        </div>
        <div className="flex-1 relative">
           <Scene2D
             mode="error"
             currentVec={currentVec}
             x_true={x_true}
             iteration={iteration}
           />
        </div>
      </div>
    </div>
  );
}
