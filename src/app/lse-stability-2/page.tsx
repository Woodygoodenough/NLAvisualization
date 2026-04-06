import StabilityVisualizer from "./StabilityVisualizer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "LSE Stability II | NLA Visualizations",
  description: "Geometry of the Normal Equations - Sensitivity to A",
};

export default function LSEStability2Page() {
  return <StabilityVisualizer />;
}
