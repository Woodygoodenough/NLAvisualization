import ClientVisualizer from "./ClientVisualizer";
import data from "./data.json";

export const metadata = {
  title: "Implicit Q Theorem - NLA Visualizations",
  description: "Visualizing why Bulge Chasing is mathematically equivalent to Explicit QR.",
};

export default function ImplicitQTheoremPage() {
  return (
    <div className="w-full h-[calc(100vh-4rem)]">
      <ClientVisualizer data={data} />
    </div>
  );
}
