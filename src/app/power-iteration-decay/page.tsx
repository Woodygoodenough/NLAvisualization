import Visualizer from './Visualizer';

export const metadata = {
  title: '2. Power Iteration — Spectral Decay | NLA Visualizations',
  description: 'Visualizing how a vector shrinks to the origin when spectral radius is less than 1 using Power Iteration.',
};

export default function Page() {
  return <Visualizer />;
}
