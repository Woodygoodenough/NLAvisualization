import ClientVisualizer from "./ClientVisualizer";
import data from "./data.json";

export const metadata = {
  title: "Conjugate Gradient vs GD - NLA Visualizations",
  description: "Visualizing the optimization paths of Conjugate Gradient and Gradient Descent.",
};

export default function ConjugateGradientPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <ClientVisualizer data={data} />
    </div>
  );
}
