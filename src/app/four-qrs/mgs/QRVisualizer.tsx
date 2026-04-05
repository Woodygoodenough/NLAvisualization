"use client";

import React, { useState } from "react";
import Scene3D from "./Scene3D";
import { InlineMath, BlockMath } from "react-katex";

export default function MGSVisualizer() {
  const [step, setStep] = useState(0);
  const maxStep = 6;

  // Render the R matrix live based on the current step
  // We use \hphantom so that "0" takes up the same width as "r_{ij}" to prevent layout shifts.
  const renderRMatrix = () => {
    const formatEntry = (show: boolean, val: string) => {
      return show ? val : `\\hphantom{${val}}\\llap{0}`;
    };

    // MGS order: r11(1), r12(2), r13(3), r22(4), r23(5), r33(6)
    const r11 = formatEntry(step >= 1, "r_{11}");
    const r12 = formatEntry(step >= 2, "r_{12}");
    const r13 = formatEntry(step >= 3, "r_{13}");
    const r22 = formatEntry(step >= 4, "r_{22}");
    const r23 = formatEntry(step >= 5, "r_{23}");
    const r33 = formatEntry(step >= 6, "r_{33}");

    const zero21 = formatEntry(false, "r_{21}"); // Use phantom space for zeros as well for alignment
    const zero31 = formatEntry(false, "r_{31}");
    const zero32 = formatEntry(false, "r_{32}");

    // Using an array environment allows spacing out columns evenly
    return `\\begin{bmatrix} ${r11} & ${r12} & ${r13} \\\\[0.5em] ${zero21} & ${r22} & ${r23} \\\\[0.5em] ${zero31} & ${zero32} & ${r33} \\end{bmatrix}`;
  };

  const getStepDescription = (s: number) => {
    switch (s) {
      case 0: return "Initial vectors $v_1=a_1$, $v_2=a_2$, $v_3=a_3$.";
      case 1: return "Normalize $v_1$ to get $q_1$. This gives $r_{11} = \\|v_1\\|$.";
      case 2: return "Project $v_2$ onto $q_1$ and subtract. This gives $r_{12} = q_1^T v_2$, updating $v_2$.";
      case 3: return "Project $v_3$ onto $q_1$ and subtract. This gives $r_{13} = q_1^T v_3$, updating $v_3$.";
      case 4: return "Normalize $v_2$ to get $q_2$. This gives $r_{22} = \\|v_2\\|$.";
      case 5: return "Project $v_3$ onto $q_2$ and subtract. This gives $r_{23} = q_2^T v_3$, updating $v_3$.";
      case 6: return "Normalize $v_3$ to get $q_3$. This gives $r_{33} = \\|v_3\\|$.";
      default: return "";
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] w-full">
      {/* Left Sidebar for Controls & Explanation */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">

        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Modified Gram-Schmidt</h1>
          <p className="text-sm text-slate-500 mt-1">Orthogonalizing by row instead of column</p>
        </div>

        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mb-4 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Algorithm</h3>
            <p className="text-sm text-slate-700 leading-relaxed">
              Instead of processing each original vector <InlineMath math="a_j" /> entirely, MGS computes <InlineMath math="q_i" /> and immediately projects it out of <b>all</b> remaining vectors <InlineMath math="v_j" /> (<InlineMath math="j > i" />). This updating of the remaining pool of vectors improves numerical stability compared to Classical Gram-Schmidt.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 mb-4 shadow-sm">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Step-by-Step Construction</h3>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-slate-700">Step {step} of {maxStep}</span>
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
              {/* Parse the string to render InlineMath appropriately */}
              {getStepDescription(step).split('$').map((part, index) =>
                index % 2 === 1 ? <InlineMath key={index} math={part} /> : part
              )}
            </span>
          </div>
        </div>

        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 mt-auto flex-shrink-0">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">R Matrix Construction</h3>
          <div className="flex justify-center text-xl my-4 text-slate-800 w-full overflow-x-auto min-h-[100px] items-center py-2">
             <BlockMath math={`R = ${renderRMatrix()}`} />
          </div>
          <p className="text-xs text-slate-500 text-center">
             Entries <InlineMath math="r_{ij} = q_i^T v_j^{(i)}" /> and <InlineMath math="r_{ii} = \|v_i^{(i)}\|" />
          </p>
        </div>

      </div>

      {/* Right Content for 3D Scene */}
      <div className="flex-1 relative bg-slate-50">
        <Scene3D step={step} />

        {/* Helper overlay */}
        <div className="absolute bottom-6 right-6 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-200 shadow-sm pointer-events-none">
          <p className="text-xs text-slate-500">Click & drag to rotate camera</p>
        </div>
      </div>
    </div>
  );
}
