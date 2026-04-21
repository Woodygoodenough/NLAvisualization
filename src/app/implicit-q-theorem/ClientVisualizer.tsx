"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, SplitSquareHorizontal, Box, Ghost } from "lucide-react";
import { cn } from "@/lib/utils";
import SideBySideView from "./SideBySideView";
import Subspace3DView from "./Subspace3DView";
import GhostOverlayView from "./GhostOverlayView";

export default function ClientVisualizer({ data }: { data: any }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [activeView, setActiveView] = useState<"side-by-side" | "subspace" | "ghost">("side-by-side");

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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Implicit Q Theorem</h1>
          <p className="text-sm text-slate-500 mt-1">Why Bulge Chasing = Explicit QR</p>
        </div>

        {/* View Switcher */}
        <div className="flex flex-col gap-2 bg-slate-50 p-2 rounded-lg mb-8 border border-slate-100">
          <button
            onClick={() => setActiveView("side-by-side")}
            className={cn(
              "flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-md transition-colors",
              activeView === "side-by-side" ? "bg-white shadow-sm text-slate-900 border border-slate-200" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <SplitSquareHorizontal size={16} /> Side-by-Side Shadow
          </button>
          <button
            onClick={() => setActiveView("subspace")}
            className={cn(
              "flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-md transition-colors",
              activeView === "subspace" ? "bg-white shadow-sm text-slate-900 border border-slate-200" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <Box size={16} /> 3D Subspace Lock
          </button>
          <button
            onClick={() => setActiveView("ghost")}
            className={cn(
              "flex items-center gap-2 text-sm font-medium py-2 px-3 rounded-md transition-colors",
              activeView === "ghost" ? "bg-white shadow-sm text-slate-900 border border-slate-200" : "text-slate-500 hover:bg-slate-100"
            )}
          >
            <Ghost size={16} /> Ghost Unrolling Matrix
          </button>
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
                Step {safeStepIdx + 1} of {currentData.length}
              </div>
              <div className="font-semibold text-slate-800 text-sm">{currentStep.title}</div>
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

      {/* Right Content Area */}
      <div className="flex-1 relative bg-slate-50/50 flex flex-col items-center justify-center overflow-hidden">
        {activeView === "side-by-side" && <SideBySideView step={currentStep} />}
        {activeView === "subspace" && <Subspace3DView step={currentStep} />}
        {activeView === "ghost" && <GhostOverlayView step={currentStep} />}
      </div>
    </div>
  );
}
