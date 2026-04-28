import ClientVisualizer from "./ClientVisualizer";
import data from "./data.json";

export const metadata = {
  title: "Cholesky Stability - NLA Visualizations",
  description: "Visualizing why Cholesky Factorization is stable without pivoting.",
};

export default function CholeskyStabilityPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <ClientVisualizer data={data} />
    </div>
  );
}
