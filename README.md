# NLA Visualization

A Next.js application providing interactive, geometry-first explorable explanations for Numerical Linear Algebra.

## Features

- **Conditioning of Matrix I & II:** Visualize the pointwise condition number of a matrix and the effects of rank-1 perturbations on the matrix domain.
- **Conditioning of LSE I & II:** Explore the sensitivity of the least squares solution to perturbations in the right-hand side vector b and the matrix A.
- **Four QRs:** Step-by-step 3D visualizations of four standard QR factorization algorithms:
  - Classical Gram-Schmidt
  - Modified Gram-Schmidt
  - Householder Reflections
  - Givens Rotations

## Tech Stack

- React
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Three.js (`@react-three/fiber`, `@react-three/drei`)
- React Spring (`@react-spring/three`)
- KaTeX (`react-katex`)

## Development

Install dependencies:

`npm install`

Start the local development server:

`npm run dev`

Open [http://localhost:3000](http://localhost:3000) in your browser.
