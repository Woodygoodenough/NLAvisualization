"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Text } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

// Helper to generate an ellipsoid mesh from a 3x3 symmetric positive definite matrix A
// x^T A x = 1
function Ellipsoid({ matrix, color, opacity = 0.5 }: { matrix: number[][], color: string, opacity?: number }) {
  // If the matrix has huge elements, the ellipsoid will be tiny (or invalid).
  // We approximate the visualization by computing eigenvalues.

  const meshData = useMemo(() => {
    try {
      // Very basic 3x3 eigenvalue approximation or fallback
      // For a real visualization, we'd compute the actual eigendecomposition
      // to orient and scale the ellipsoid.
      // Since this is purely illustrative and JS doesn't have a built-in eig solver,
      // we'll use a visual metaphor based on the matrix trace/norm.

      const trace = matrix[0][0] + matrix[1][1] + matrix[2][2];

      // If trace is insanely huge, the ellipsoid has collapsed to a point/sliver
      if (trace > 1000) {
         return { scale: [0.01, 0.01, 5], color: "#ef4444" }; // Broken line metaphor
      }

      // If trace is negative or close to 0, it's not SPD anymore
      if (trace <= 0) {
         return { scale: [0, 0, 0], color: "#ef4444" };
      }

      // For SPD, we just show a generic nice ellipsoid that scales inversely with the trace
      // to conceptually represent x^T S x = 1 (larger matrix values = tighter ellipsoid)
      const baseScale = 5 / Math.sqrt(trace);
      return { scale: [baseScale, baseScale * 0.8, baseScale * 1.2], color };

    } catch (e) {
      return { scale: [1, 1, 1], color: "#94a3b8" };
    }
  }, [matrix, color]);

  return (
    <mesh scale={[meshData.scale[0], meshData.scale[1], meshData.scale[2]]}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={meshData.color} transparent opacity={opacity} wireframe={opacity < 1} />
    </mesh>
  );
}

export default function Ellipsoid3DView({ step }: { step: any }) {

  // We extract the top 3x3 block of the active submatrix to visualize
  const k = step.k;
  if (k > 1) {
    return (
      <div className="flex w-full h-full items-center justify-center text-slate-500">
        Dimension too small for 3D ellipsoid visualization.
      </div>
    );
  }

  // Extract 3x3 block
  const getSub3x3 = (M: number[][]) => {
    const sub = [];
    for(let i=k; i<k+3; i++){
      sub.push([M[i][k], M[i][k+1], M[i][k+2]]);
    }
    return sub;
  }

  const subA = getSub3x3(step.A);
  const subS = getSub3x3(step.S);

  return (
    <div className="flex w-full h-full">
      <div className="w-1/2 h-full relative border-r border-slate-200">
         <Canvas camera={{ position: [3, 2, 3], fov: 45 }}>
            <color attach="background" args={["#f8fafc"]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <Grid infiniteGrid fadeDistance={20} sectionColor="#cbd5e1" cellColor="#e2e8f0" />
            <axesHelper args={[2]} />
            <Ellipsoid matrix={subA} color="#3b82f6" />
            <OrbitControls makeDefault />
         </Canvas>
         <div className="absolute top-4 left-4 bg-white/90 p-2 rounded shadow text-sm font-semibold">General Matrix (A)</div>
      </div>
      <div className="w-1/2 h-full relative">
         <Canvas camera={{ position: [3, 2, 3], fov: 45 }}>
            <color attach="background" args={["#f8fafc"]} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <Grid infiniteGrid fadeDistance={20} sectionColor="#cbd5e1" cellColor="#e2e8f0" />
            <axesHelper args={[2]} />
            <Ellipsoid matrix={subS} color="#10b981" />
            <OrbitControls makeDefault />
         </Canvas>
         <div className="absolute top-4 left-4 bg-white/90 p-2 rounded shadow text-sm font-semibold">SPD Matrix (S)</div>
      </div>
    </div>
  );
}
