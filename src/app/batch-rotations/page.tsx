import ClientVisualizer from "./ClientVisualizer";
import data from "./data.json";

export const metadata = {
  title: "Batch QR Iteration - NLA Visualizations",
  description: "Explicit Batch QR Iteration step-by-step.",
};

export default function BatchRotationsPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <ClientVisualizer data={data} />
    </div>
  );
}
