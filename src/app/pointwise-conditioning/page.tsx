import StabilityVisualizer from "./StabilityVisualizer";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pointwise Conditioning | NLA Visualizations",
  description: "Pointwise Condition Number of A - Geometry of the image ellipse",
};

export default function PointwiseConditioningPage() {
  return <StabilityVisualizer />;
}
