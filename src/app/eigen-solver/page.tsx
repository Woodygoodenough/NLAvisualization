import ClientVisualizer from "./ClientVisualizer";
import solverData from "./data.json";

export default function EigenSolverPage() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <ClientVisualizer data={solverData} />
    </div>
  );
}
