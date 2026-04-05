"use client";

import React, { useState } from "react";
import Scene3D from "./Scene3D";
import { InlineMath, BlockMath } from "react-katex";

export default function GivensVisualizer() {
  const [step, setStep] = useState(0);
  const maxStep = 6;

  const renderRMatrix = () => {
    const a1_0 = [1, 1, 1];
    const a2_0 = [1, 2, 0];
    const a3_0 = [0, 1, 2];

    const A0 = [a1_0, a2_0, a3_0];

    const applyG = (A: number[][], i: number, j: number, theta: number) => {
      const c = Math.cos(theta);
      const s = Math.sin(theta);
      return A.map(col => {
        const arr = [...col];
        const vi = arr[i];
        const vj = arr[j];
        arr[i] = c * vi - s * vj;
        arr[j] = s * vi + c * vj;
        return arr;
      });
    };

    const getGTheta = (xi: number, xj: number) => {
      if (xj === 0) return 0;
      const r = Math.hypot(xi, xj);
      const c = xi / r;
      const s = -xj / r;
      return Math.atan2(s, c);
    };

    const t1 = getGTheta(A0[0][0], A0[0][1]);
    const A1 = applyG(A0, 0, 1, t1);

    const t2 = getGTheta(A1[0][0], A1[0][2]);
    const A2 = applyG(A1, 0, 2, t2);

    const t3 = getGTheta(A2[1][1], A2[1][2]);
    const A3 = applyG(A2, 1, 2, t3);

    let currentA = A0;
    if (step >= 6) {
      currentA = A3;
    } else if (step >= 4) {
      currentA = A2;
    } else if (step >= 2) {
      currentA = A1;
    }

    const fmt = (val: number, isZero: boolean) => {
      if (isZero) return "\\hphantom{0.00}\\llap{0}";
      const s = val.toFixed(2);
      return s === "-0.00" ? "0.00" : s;
    };

    const z21 = step >= 2;
    const z31 = step >= 4;
    const z32 = step >= 6;

    const row1 = `${fmt(currentA[0][0], false)} & ${fmt(currentA[1][0], false)} & ${fmt(currentA[2][0], false)}`;
    const row2 = `${fmt(currentA[0][1], z21)} & ${fmt(currentA[1][1], false)} & ${fmt(currentA[2][1], false)}`;
    const row3 = `${fmt(currentA[0][2], z31)} & ${fmt(currentA[1][2], z32)} & ${fmt(currentA[2][2], false)}`;

    return `\\begin{bmatrix} ${row1} \\\\[0.5em] ${row2} \\\\[0.5em] ${row3} \\end{bmatrix}`;
  };

  const getStepDescription = (s: number) => {
    switch (s) {
      case 0: return "Initial matrix $A$. The columns are shown as vectors.";
      case 1: return "Determine Givens rotation $G(1,2,\\theta)$ in the $e_1$-$e_2$ plane to zero out $a_{21}$.";
      case 2: return "Apply $G(1,2,\\theta)$ to all columns. The first column rotates within the $e_1$-$e_2$ plane to align with $e_1$.";
      case 3: return "Determine rotation $G(1,3,\\theta)$ in the $e_1$-$e_3$ plane to zero out $a_{31}$.";
      case 4: return "Apply $G(1,3,\\theta)$ to all columns. The first column is fully aligned with $e_1$.";
      case 5: return "Determine rotation $G(2,3,\\theta)$ in the $e_2$-$e_3$ plane to zero out $a_{32}$.";
      case 6: return "Apply $G(2,3,\\theta)$ to all columns. Matrix $A$ is now upper triangular $R$.";
      default: return "";
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] w-full">
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Givens Rotations</h1>
          <p className="text-sm text-slate-500 mt-1">Orthogonal transformations via planar rotations</p>
        </div>

        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mb-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Algorithm</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              We apply a sequence of planar rotations <InlineMath math="G(i,j,\theta)" />. Each rotation acts on two rows of the matrix simultaneously to introduce a single zero below the diagonal, gradually transforming <InlineMath math="A" /> into an upper triangular matrix <InlineMath math="R" />.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Step-by-Step Transform</h3>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Step {step} of {maxStep}</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                  className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Prev
                </button>
                <button
                  onClick={() => setStep(Math.min(maxStep, step + 1))}
                  disabled={step === maxStep}
                  className="px-2 py-1 text-xs font-medium text-slate-600 bg-slate-100 rounded hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={maxStep}
              step="1"
              value={step}
              onChange={(e) => setStep(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1 px-1">
              <span>Start</span>
              <span>Finish</span>
            </div>
          </div>

          <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg text-sm text-indigo-900 min-h-[80px] flex items-center">
            <span>
              {getStepDescription(step).split('$').map((part, index) =>
                index % 2 === 1 ? <InlineMath key={index} math={part} /> : part
              )}
            </span>
          </div>
        </div>

        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mt-auto flex-shrink-0">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Matrix Evolution</h3>
          <div className="flex justify-center text-xl my-4 text-slate-800 w-full overflow-x-auto min-h-[100px] items-center py-2">
             <BlockMath math={`A \\rightarrow ${renderRMatrix()}`} />
          </div>
        </div>

      </div>

      <div className="flex-1 relative bg-slate-50">
        <Scene3D step={step} />

        <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 shadow-sm pointer-events-none">
          <p className="text-xs text-slate-500">Click & drag to rotate camera</p>
        </div>
      </div>
    </div>
  );
}
