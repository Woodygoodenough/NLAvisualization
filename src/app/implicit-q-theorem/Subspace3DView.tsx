"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export default function Subspace3DView({ step }: { step: any }) {
  if (!step.vector_exp || step.vector_exp.length === 0) {
    return (
      <div className="flex w-full h-full items-center justify-center text-slate-500">
        Move to the next step to see the subspace lock.
      </div>
    );
  }

  // Use the first 3 components to visualize in 3D
  const v_exp = new THREE.Vector3(step.vector_exp[0], step.vector_exp[1], step.vector_exp[2]).multiplyScalar(3);
  const v_imp = new THREE.Vector3(step.vector_imp[0], step.vector_imp[1], step.vector_imp[2]).multiplyScalar(3);

  return (
    <div className="w-full h-full relative bg-slate-50">
      <Canvas camera={{ position: [5, 4, 5], fov: 45 }}>
        <color attach="background" args={["#f8fafc"]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} />

        <Grid infiniteGrid fadeDistance={20} sectionColor="#cbd5e1" cellColor="#e2e8f0" />
        <axesHelper args={[2]} />

        {/* Explicit Vector (Blue) */}
        <group>
          <Line points={[[0,0,0], [v_exp.x, v_exp.y, v_exp.z]]} color="#3b82f6" lineWidth={3} />
          <mesh position={[v_exp.x, v_exp.y, v_exp.z]}>
            <sphereGeometry args={[0.1]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
          <Html position={[v_exp.x, v_exp.y, v_exp.z]}>
            <div className="text-blue-600 font-bold -translate-x-1/2 translate-y-2 whitespace-nowrap bg-white/80 px-1 rounded">
              q1 (Explicit)
            </div>
          </Html>
        </group>

        {/* Implicit Vector (Red) */}
        <group>
          <Line points={[[0,0,0], [v_imp.x, v_imp.y, v_imp.z]]} color="#ef4444" lineWidth={5} dashed dashScale={2} dashSize={0.2} gapSize={0.1} />
          <mesh position={[v_imp.x, v_imp.y, v_imp.z]}>
            <sphereGeometry args={[0.15]} />
            <meshStandardMaterial color="#ef4444" />
          </mesh>
          <Html position={[v_imp.x, v_imp.y, v_imp.z]}>
            <div className="text-red-600 font-bold -translate-x-1/2 -translate-y-6 whitespace-nowrap bg-white/80 px-1 rounded">
              q1 (Implicit)
            </div>
          </Html>
        </group>

        <OrbitControls makeDefault />
      </Canvas>
      <div className="absolute top-4 left-4 bg-white/90 p-4 rounded-md shadow text-sm max-w-sm">
        <h3 className="font-bold text-slate-800 mb-2">The Subspace Lock</h3>
        <p className="text-slate-600">
          The first column of the orthogonal matrix Q (q1) is exactly the same whether calculated explicitly or implicitly. Because H is unreduced, this single vector uniquely determines the rest of the transformation!
        </p>
      </div>
    </div>
  );
}
