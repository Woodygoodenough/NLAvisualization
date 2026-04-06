import StabilityVisualizer from "./StabilityVisualizer";

export const metadata = {
  title: "Conditioning of Matrix II - NLA Visualization",
  description: "Visualize matrix perturbation geometry and deduced worst-case amplification.",
};

export default function Page() {
  return (
    <div className="h-[calc(100vh-3.5rem)] xl:h-screen w-full">
      <StabilityVisualizer />
    </div>
  );
}
