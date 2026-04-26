"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MatrixRaw from "@/components/MatrixRaw";
import { InlineMath } from "react-katex";

export default function ClientVisualizer({ data }: { data: any }) {
  const [stepIdx, setStepIdx] = useState(0);

  const currentData = data;
  const safeStepIdx = Math.min(stepIdx, currentData.length - 1);
  const currentStep = currentData[safeStepIdx];

  const handlePrev = () => {
    setStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStepIdx((prev) => Math.min(currentData.length - 1, prev + 1));
  };

  const handleKeyboard = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrev();
    if (e.key === "ArrowRight") handleNext();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [stepIdx]);

  if (!currentStep) return null;

  return (
    <div className="flex w-full h-full">
      {/* Left Sidebar */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Arnoldi Iteration</h1>
          <p className="text-sm text-slate-500 mt-1">Expanding the Krylov Subspace</p>
        </div>

        {/* Math Equation */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-8 text-center">
          <span className="text-lg text-slate-800">
            <InlineMath math="A Q_k = Q_{k+1} \tilde{H}_k" />
          </span>
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
            <div className="text-center">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                Step {safeStepIdx + 1} of {currentData.length}
              </div>
              <div className="font-semibold text-slate-800">{currentStep.title}</div>
            </div>
            <button
              onClick={handleNext}
              disabled={safeStepIdx === currentData.length - 1}
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
              max={currentData.length - 1}
              value={safeStepIdx}
              onChange={(e) => setStepIdx(parseInt(e.target.value))}
              className="w-full accent-slate-800"
            />
          </div>
        </div>

        {/* Description Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {currentStep.description}
          </p>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 relative bg-slate-50 flex flex-col items-center justify-center p-8 overflow-y-auto">

        <div className="flex flex-col items-center gap-6 transform scale-90 lg:scale-100">

          {/* Top Row: A * Q_k */}
          <div className="flex items-center gap-6">
            <MatrixRaw matrix={currentStep.A} label={<InlineMath math="A" />} />
            <div className="text-2xl text-slate-400">×</div>
            <MatrixRaw matrix={currentStep.Q_k} label={<InlineMath math="Q_k" />} />
          </div>

          {/* Equals Sign */}
          <div className="text-4xl text-slate-400 my-2">=</div>

          {/* Bottom Row: Q_{k+1} * \tilde{H}_k */}
          <div className="flex items-center gap-6">
            <MatrixRaw matrix={currentStep.Q_k1} label={<InlineMath math="Q_{k+1}" />} />
            <div className="text-2xl text-slate-400">×</div>
            <MatrixRaw
              matrix={currentStep.H_k}
              label={<InlineMath math="\tilde{H}_k" />}
              highlightBlock={{ rows: currentStep.k, cols: currentStep.k, label: "H_k" }}
            />
          </div>

        </div>

      </div>
    </div>
  );
}
