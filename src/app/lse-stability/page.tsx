import { Metadata } from "next";
import StabilityVisualizer from "./StabilityVisualizer";

export const metadata: Metadata = {
  title: "LSE Stability I | NLA Visualization",
};

export default function LSEStabilityPage() {
  return (
    <div className="flex flex-col h-full bg-slate-50">
      <StabilityVisualizer />
    </div>
  );
}
