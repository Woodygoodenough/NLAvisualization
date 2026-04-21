import MatrixHeatmap from "@/components/MatrixHeatmap";

export default function SideBySideView({ step }: { step: any }) {
  return (
    <div className="flex w-full h-full gap-8 p-4 items-center justify-center">
      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Explicit QR</h3>
        <MatrixHeatmap matrix={step.matrix_exp} highlights={step.highlight_exp} />
      </div>

      <div className="flex flex-col justify-center items-center px-4 text-slate-400">
        <div className="text-4xl">≈</div>
        <div className="text-sm mt-2 text-center max-w-[120px]">Mathematically Equivalent</div>
      </div>

      <div className="flex flex-col items-center">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">Implicit QR (Bulge Chasing)</h3>
        <MatrixHeatmap matrix={step.matrix_imp} highlights={step.highlight_imp} bulge={step.bulge_imp} />
      </div>
    </div>
  );
}
