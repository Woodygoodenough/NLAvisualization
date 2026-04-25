import ClientVisualizer from "./ClientVisualizer";
import data from "./data.json";

export const metadata = {
  title: "Arnoldi Iteration - NLA Visualizations",
  description: "Visualizing the expansion of the Krylov subspace in the Arnoldi Iteration.",
};

export default function ArnoldiIterationPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <ClientVisualizer data={data} />
    </div>
  );
}
