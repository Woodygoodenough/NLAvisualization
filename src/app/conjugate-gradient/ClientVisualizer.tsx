"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { InlineMath, BlockMath } from "react-katex";
import Bowl3DView from "./Bowl3DView";

export default function ClientVisualizer({ data }: { data: any }) {
  const [stepIdx, setStepIdx] = useState(0);

  const safeStepIdx = Math.min(stepIdx, data.steps.length - 1);
  const currentStep = data.steps[safeStepIdx];

  const handlePrev = () => {
    setStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStepIdx((prev) => Math.min(data.steps.length - 1, prev + 1));
  };

  const handleKeyboard = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [stepIdx]);

  return (
    <div className="flex w-full h-full">
      {/* Left Sidebar */}
      <div className="w-1/3 min-w-[350px] max-w-[450px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Conjugate Gradient</h1>
          <p className="text-sm text-slate-500 mt-1">vs Gradient Descent on SPD matrix</p>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 text-sm text-slate-700">
           <p className="mb-2">Solving <InlineMath math="Ax = b" /> where <InlineMath math="A" /> is SPD is equivalent to minimizing the quadratic form:</p>
           <BlockMath math="f(x) = \frac{1}{2}x^T A x - b^T x" />
        </div>

        {/* Step Controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrev}
              disabled={safeStepIdx === 0}
              className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 border border-slate-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center px-2">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                Iteration {safeStepIdx}
              </div>
            </div>
            <button
              onClick={handleNext}
              disabled={safeStepIdx === data.steps.length - 1}
              className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 border border-slate-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center mb-6">Use Left/Right arrow keys to navigate steps</p>

          {/* Slider */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max={data.steps.length - 1}
              value={safeStepIdx}
              onChange={(e) => setStepIdx(parseInt(e.target.value))}
              className="w-full accent-slate-800"
            />
          </div>
        </div>

        {/* Description Panel */}
        <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-1 text-sm">Gradient Descent (Blue)</h4>
              <p className="text-sm text-blue-900/80 leading-relaxed">
                Moves strictly in the direction of the local negative gradient. Because the "bowl" is skewed (ill-conditioned <InlineMath math="A" />), the path zig-zags back and forth, taking many steps to reach the bottom.
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-bold text-red-800 mb-1 text-sm">Conjugate Gradient (Red)</h4>
              <p className="text-sm text-red-900/80 leading-relaxed">
                Chooses search directions that are <InlineMath math="A" />-orthogonal (conjugate) to all previous directions. For an <InlineMath math="n \times n" /> matrix, it perfectly reaches the minimum in exactly <InlineMath math="n" /> steps. Here (<InlineMath math="n=2" />), it reaches the center in exactly 2 steps!
              </p>
            </div>
        </div>
      </div>

      {/* Right Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <Bowl3DView data={data} currentStepIdx={safeStepIdx} />
      </div>
    </div>
  );
}
