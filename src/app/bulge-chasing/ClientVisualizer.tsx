"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MatrixHeatmap from "@/components/MatrixHeatmap";
import { cn } from "@/lib/utils";

export default function ClientVisualizer({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState<"implicit" | "explicit">("implicit");
  const [majorStepIdx, setMajorStepIdx] = useState(0);
  const [subStepIdx, setSubStepIdx] = useState(0);

  const currentData = data[activeTab];
  const safeMajorStepIdx = Math.min(majorStepIdx, currentData.length - 1);
  const majorStep = currentData[safeMajorStepIdx];
  const safeSubStepIdx = Math.min(subStepIdx, majorStep.sub_steps.length - 1);
  const currentSubStep = majorStep.sub_steps[safeSubStepIdx];

  // Reset sub-step when major step changes
  useEffect(() => {
    setSubStepIdx(0);
  }, [safeMajorStepIdx]);

  const handlePrevMajor = () => {
    setMajorStepIdx((prev) => Math.max(0, prev - 1));
  };

  const handleNextMajor = () => {
    setMajorStepIdx((prev) => Math.min(currentData.length - 1, prev + 1));
  };

  const handleKeyboard = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") handlePrevMajor();
    if (e.key === "ArrowRight") handleNextMajor();
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [majorStepIdx, activeTab]);

  if (!currentSubStep) return null;

  return (
    <div className="flex w-full h-full">
      {/* Left Sidebar */}
      <div className="w-1/3 min-w-[320px] max-w-[400px] border-r bg-white p-6 overflow-y-auto flex flex-col shadow-sm z-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Bulge Chasing</h1>
          <p className="text-sm text-slate-500 mt-1">Implicit vs Explicit QR Iteration</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg mb-8">
          <button
            onClick={() => {
              setActiveTab("implicit");
              setMajorStepIdx(0);
              setSubStepIdx(0);
            }}
            className={cn(
              "flex-1 text-sm font-medium py-1.5 rounded-md transition-colors",
              activeTab === "implicit" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Implicit (Bulge Chase)
          </button>
          <button
            onClick={() => {
              setActiveTab("explicit");
              setMajorStepIdx(0);
              setSubStepIdx(0);
            }}
            className={cn(
              "flex-1 text-sm font-medium py-1.5 rounded-md transition-colors",
              activeTab === "explicit" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
            )}
          >
            Explicit (Batch)
          </button>
        </div>

        {/* Major Step Controls */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={handlePrevMajor}
              disabled={safeMajorStepIdx === 0}
              className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 border border-slate-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <div className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                Step {safeMajorStepIdx + 1} of {currentData.length}
              </div>
              <div className="font-semibold text-slate-800">{majorStep.title}</div>
            </div>
            <button
              onClick={handleNextMajor}
              disabled={safeMajorStepIdx === currentData.length - 1}
              className="p-2 rounded-md hover:bg-slate-100 disabled:opacity-50 border border-slate-200"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-400 text-center">Use Left/Right arrow keys to navigate steps</p>
        </div>

        {/* Sub Step Controls */}
        {majorStep.sub_steps.length > 1 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-slate-700">Sub-steps</label>
              <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded">
                {safeSubStepIdx + 1} / {majorStep.sub_steps.length}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max={majorStep.sub_steps.length - 1}
              value={safeSubStepIdx}
              onChange={(e) => setSubStepIdx(parseInt(e.target.value))}
              className="w-full accent-slate-800"
            />
          </div>
        )}

        {/* Description Panel */}
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <p className="text-sm text-slate-700 leading-relaxed">
            {currentSubStep.description}
          </p>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 relative bg-slate-50/50 flex flex-col items-center justify-center p-8 overflow-y-auto">
        <MatrixHeatmap
          matrix={currentSubStep.matrix}
          highlights={currentSubStep.highlight}
          bulge={currentSubStep.bulge}
        />

        {/* Legend */}
        <div className="absolute bottom-8 right-8 bg-white p-4 rounded-xl shadow-md border border-slate-200 flex flex-col gap-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-[2px] ring-red-500 bg-red-50"></div>
            <span>Active Bulge</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded ring-2 ring-amber-500 bg-amber-50"></div>
            <span>Rotation Target</span>
          </div>
        </div>
      </div>
    </div>
  );
}
