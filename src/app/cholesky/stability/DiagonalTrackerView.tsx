export default function DiagonalTrackerView({ step }: { step: any }) {
  const formatNum = (num: number) => {
    if (num > 1000) return num.toExponential(2);
    return num.toFixed(2);
  };

  const a_diag = step.stats_A.max_diag;
  const a_off = step.stats_A.max_off;

  const s_diag = step.stats_S.max_diag;
  const s_off = step.stats_S.max_off;

  // Calculate widths for the bars (max 100%)
  const max_A = Math.max(a_diag, a_off, 1);
  const max_S = Math.max(s_diag, s_off, 1);

  const w_a_diag = Math.min((a_diag / max_A) * 100, 100);
  const w_a_off = Math.min((a_off / max_A) * 100, 100);

  const w_s_diag = Math.min((s_diag / max_S) * 100, 100);
  const w_s_off = Math.min((s_off / max_S) * 100, 100);

  return (
    <div className="flex flex-col w-full h-full items-center justify-center p-8 gap-12 bg-slate-50">

      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold mb-6 text-slate-800">General Matrix (A)</h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-600">Max Diagonal Element</span>
            <span className="font-mono text-slate-800">{formatNum(a_diag)}</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded overflow-hidden">
            <div className="bg-blue-400 h-full transition-all duration-300" style={{ width: `${w_a_diag}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-600">Max Off-Diagonal Element</span>
            <span className="font-mono text-red-600 font-bold">{formatNum(a_off)}</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded overflow-hidden">
            <div className="bg-red-500 h-full transition-all duration-300" style={{ width: `${w_a_off}%` }}></div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-2xl bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-semibold mb-6 text-slate-800">SPD Matrix (S)</h3>

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-600">Max Diagonal Element</span>
            <span className="font-mono text-emerald-600 font-bold">{formatNum(s_diag)}</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${w_s_diag}%` }}></div>
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-slate-600">Max Off-Diagonal Element</span>
            <span className="font-mono text-slate-800">{formatNum(s_off)}</span>
          </div>
          <div className="w-full bg-slate-100 h-4 rounded overflow-hidden">
            <div className="bg-emerald-300 h-full transition-all duration-300" style={{ width: `${w_s_off}%` }}></div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl text-center text-sm text-slate-500 mt-4 bg-slate-100 p-4 rounded-lg">
        <strong>Cholesky Stability Guarantee:</strong> For any SPD matrix, the maximum element in the active submatrix is strictly guaranteed to be on the diagonal. Thus, off-diagonal elements cannot explode, making pivoting unnecessary!
      </div>

    </div>
  );
}
