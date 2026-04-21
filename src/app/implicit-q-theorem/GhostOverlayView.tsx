import MatrixHeatmap from "@/components/MatrixHeatmap";

export default function GhostOverlayView({ step }: { step: any }) {
  // If there's no bulge, just show the matrix normally
  if (!step.bulge_imp) {
    return (
      <div className="flex w-full h-full items-center justify-center">
        <MatrixHeatmap matrix={step.matrix_imp} highlights={step.highlight_imp} />
      </div>
    );
  }

  // Find the target subdiagonal cell from the explicit highlights
  // The explicit highlights include the two rows involved in the rotation.
  // The subdiagonal cell being cancelled is the leftmost cell of the bottom row.
  const targetRow = step.highlight_exp[step.highlight_exp.length / 2][0];
  const targetCol = step.highlight_exp[step.highlight_exp.length / 2][1];

  const bulgeRow = step.bulge_imp[0];
  const bulgeCol = step.bulge_imp[1];

  return (
    <div className="relative flex w-full h-full items-center justify-center p-8">
      <div className="relative">
        <MatrixHeatmap matrix={step.matrix_imp} highlights={step.highlight_imp} bulge={step.bulge_imp} />

        {/* SVG Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ overflow: 'visible' }}>
          {/* We know the cells are 48x48 (w-12 h-12 in Tailwind) and gap is 4px (gap-1).
              Padding of the container is roughly 16px (p-4).
              Let's do a rough estimation to draw the ghost box.
              Since this is highly dependent on CSS rendering, a simpler approach is
              just rendering a second "ghost" heatmap on top with opacity, or just descriptive text.
          */}
        </svg>

        <div className="absolute -right-64 top-1/2 -translate-y-1/2 bg-white p-4 rounded-xl shadow-md border border-slate-200 w-56">
          <p className="text-sm text-slate-700">
            <strong>Ghost Unrolling:</strong> By zeroing the bulge at <span className="text-red-500 font-mono">({bulgeRow}, {bulgeCol})</span>, we are applying the <em>exact same Givens rotation</em> that would have zeroed the subdiagonal at <span className="text-blue-500 font-mono">({targetRow}, {targetCol})</span> in the explicit QR factorization!
          </p>
        </div>
      </div>
    </div>
  );
}
