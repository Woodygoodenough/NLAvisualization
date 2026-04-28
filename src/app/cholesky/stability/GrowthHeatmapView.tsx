import MatrixHeatmap from "@/components/MatrixHeatmap";

export default function GrowthHeatmapView({ step }: { step: any }) {
  // Highlight the active submatrix (k to n)
  const n = 4;
  const k = step.k;
  const highlights = [];
  for (let i = k; i < n; i++) {
    for (let j = k; j < n; j++) {
      highlights.push([i, j]);
    }
  }

  return (
    <div className="flex w-full h-full gap-16 p-4 items-center justify-center">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2 text-slate-700">General Matrix A (No Pivoting)</h3>
        <p className="text-sm text-slate-500 mb-6">Prone to element explosion</p>
        <MatrixHeatmap matrix={step.A} highlights={highlights} />
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-2 text-slate-700">SPD Matrix S (Cholesky)</h3>
        <p className="text-sm text-slate-500 mb-6">Bounded Schur complement</p>
        <MatrixHeatmap matrix={step.S} highlights={highlights} />
      </div>
    </div>
  );
}
