import ClientVisualizer from "./ClientVisualizer";
import bulgeData from "./data.json";

export default function BulgeChasingPage() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <ClientVisualizer data={bulgeData} />
    </div>
  );
}
