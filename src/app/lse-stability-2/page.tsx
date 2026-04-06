import StabilityVisualizer from './StabilityVisualizer';

export const metadata = {
  title: 'Conditioning of LSE II | NLA Visualizations',
  description: 'Interactive explorable explanation of LSE sensitivity to matrix perturbations.',
};

export default function Page() {
  return <StabilityVisualizer />;
}
