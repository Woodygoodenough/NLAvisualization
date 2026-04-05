"use client";

import React, { useState } from "react";
import Scene3D from "./Scene3D";
import { InlineMath, BlockMath } from "react-katex";

export default function HouseholderVisualizer() {
  const [step, setStep] = useState(0);
  const maxStep = 4;

  const renderRMatrix = () => {
    // We recreate the numeric matrix states corresponding to Scene3D exactly.
    // Initial Matrix
    const a1_0 = [1, 1, 1];
    const a2_0 = [1, 2, 0];
    const a3_0 = [0, 1, 2];

    // Helper math functions matching Scene3D
    const dot = (a: number[], b: number[]) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
    const norm = (a: number[]) => Math.sqrt(dot(a, a));
    const sub = (a: number[], b: number[]) => [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
    const add = (a: number[], b: number[]) => [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
    const scale = (a: number[], s: number) => [a[0]*s, a[1]*s, a[2]*s];

    const applyH = (A: number[][], v: number[]) => {
      const vNormSq = dot(v, v);
      if (vNormSq < 1e-10) return A.map(col => [...col]);
      return A.map(col => {
        const proj = scale(v, 2 * dot(col, v) / vNormSq);
        return sub(col, proj);
      });
    };

    const A0 = [a1_0, a2_0, a3_0];

    const x1 = A0[0];
    const sign1 = x1[0] >= 0 ? 1 : -1;
    const v1 = add(x1, scale([1, 0, 0], sign1 * norm(x1)));
    const A1 = applyH(A0, v1);

    const x2 = [...A1[1]];
    x2[0] = 0;
    const sign2 = x2[1] >= 0 ? 1 : -1;
    const v2 = add(x2, scale([0, 1, 0], sign2 * norm(x2)));
    const A2 = applyH(A1, v2);

    let currentA = A0;
    if (step >= 4) {
      currentA = A2;
    } else if (step >= 2) {
      currentA = A1;
    }

    const fmt = (val: number, isZero: boolean) => {
      if (isZero) return "\\hphantom{0.00}\\llap{0}";
      const s = val.toFixed(2);
      // Optional: hide negative zero
      return s === "-0.00" ? "0.00" : s;
    };

    // Determine what should be exactly zeroed
    const z21 = step >= 2;
    const z31 = step >= 2;
    const z32 = step >= 4;

    const row1 = `${fmt(currentA[0][0], false)} & ${fmt(currentA[1][0], false)} & ${fmt(currentA[2][0], false)}`;
    const row2 = `${fmt(currentA[0][1], z21)} & ${fmt(currentA[1][1], false)} & ${fmt(currentA[2][1], false)}`;
    const row3 = `${fmt(currentA[0][2], z31)} & ${fmt(currentA[1][2], z32)} & ${fmt(currentA[2][2], false)}`;

    return `\\begin{bmatrix} ${row1} \\\\[0.5em] ${row2} \\\\[0.5em] ${row3} \\end{bmatrix}`;
  };

  const getStepDescription = (s: number) => {
    switch (s) {
      case 0: return "Initial matrix $A$. The columns are shown as vectors.";
      case 1: return "Construct the normal vector $v_1 = a_1 - \\|a_1\\| e_1$. The plane of reflection is orthogonal to $v_1$.";
      case 2: return "Apply $H_1 = I - 2 \\frac{v_1 v_1^T}{\\|v_1\\|^2}$ to all columns. The first column aligns with $e_1$.";
      case 3: return "Construct $v_2 = a_2^{(2)} - \\|a_2^{(2)}\\| e_2$ in the subspace orthogonal to $e_1$.";
      case 4: return "Apply $H_2$ to all columns. The second column moves into the $e_1$-$e_2$ plane, and the matrix becomes upper triangular $R$.";
      default: return "";
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] w-full">
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Householder QR</h1>
          <p className="text-sm text-slate-500 mt-1">Orthogonal transformations via reflections</p>
        </div>

        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mb-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Algorithm</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              We apply a sequence of orthogonal reflection matrices <InlineMath math="H_k" /> to transform <InlineMath math="A" /> into an upper triangular matrix <InlineMath math="R" />. Each reflection acts on all columns simultaneously, aligning the <InlineMath math="k" />-th column with the coordinate axis <InlineMath math="e_k" /> while leaving previous columns invariant.
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
