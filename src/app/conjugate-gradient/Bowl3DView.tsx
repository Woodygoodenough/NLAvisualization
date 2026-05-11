"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { useMemo } from "react";

export default function Bowl3DView({ data, currentStepIdx }: { data: any, currentStepIdx: number }) {

  // Create a mesh for the quadratic bowl: f(x) = 0.5 * x^T A x - b^T x
  const A = data.A;
  const b = data.b;

  const f = (x: number, y: number) => {
    return 0.5 * (A[0][0]*x*x + A[0][1]*x*y + A[1][0]*y*x + A[1][1]*y*y) - (b[0]*x + b[1]*y);
  };

  const bowlGeometry = useMemo(() => {
    const size = 20;
    const segments = 40;
    const geo = new THREE.PlaneGeometry(size, size, segments, segments);
    geo.rotateX(-Math.PI / 2); // Lay flat on XZ plane

    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = f(x, z);
      pos.setY(i, y);
    }

    geo.computeVertexNormals();
    return geo;
  }, [data]);

  // Extract paths up to current step
  const gdPath = data.path_gd_full.slice(0, currentStepIdx + 1).map((p: any) => new THREE.Vector3(p[0], p[1] + 0.5, p[2]));
  const cgPath = data.path_cg_full.slice(0, currentStepIdx + 1).map((p: any) => new THREE.Vector3(p[0], p[1] + 0.5, p[2]));

  // Minimum point
  const x_star = new THREE.Vector3(data.x_star[0], data.x_star[1], data.x_star[2]);

  return (
    <div className="w-full h-full relative bg-slate-900">
      <Canvas camera={{ position: [10, 15, 10], fov: 50 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} />
        <pointLight position={[-10, -10, -10]} intensity={0.5} />

        {/* The Bowl Surface */}
        <mesh geometry={bowlGeometry}>
          <meshStandardMaterial
            color="#334155"
            wireframe={true}
            transparent
            opacity={0.3}
            side={THREE.DoubleSide}
          />
        </mesh>

        <mesh geometry={bowlGeometry}>
          <meshStandardMaterial
            color="#0f172a"
            transparent
            opacity={0.8}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Global Minimum */}
        <mesh position={x_star}>
          <sphereGeometry args={[0.3]} />
          <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.5} />
        </mesh>
        <Html position={[x_star.x, x_star.y - 1, x_star.z]}>
           <div className="text-amber-400 font-bold whitespace-nowrap text-sm drop-shadow-md">Global Min</div>
        </Html>

        {/* Gradient Descent Path */}
        {gdPath.length > 1 && (
          <Line
            points={gdPath}
            color="#3b82f6"
            lineWidth={4}
          />
        )}
        {gdPath.map((p: any, i: number) => (
          <mesh key={`gd-${i}`} position={p}>
            <sphereGeometry args={[i === currentStepIdx ? 0.3 : 0.15]} />
            <meshStandardMaterial color="#3b82f6" />
          </mesh>
        ))}

        {/* Conjugate Gradient Path */}
        {cgPath.length > 1 && (
          <Line
            points={cgPath}
            color="#ef4444"
            lineWidth={6}
          />
        )}
        {cgPath.map((p: any, i: number) => (
           // Only show unique CG points (since it pads to match GD steps)
           (i === 0 || cgPath[i].distanceTo(cgPath[i-1]) > 0.001) && (
            <mesh key={`cg-${i}`} position={p}>
              <sphereGeometry args={[i === Math.min(currentStepIdx, 2) ? 0.4 : 0.2]} />
              <meshStandardMaterial color="#ef4444" />
            </mesh>
           )
        ))}

        <OrbitControls makeDefault target={[0, 0, 0]} maxPolarAngle={Math.PI/2 - 0.1} />
      </Canvas>

      <div className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white text-sm">
         <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Gradient Descent (Zig-Zag)</span>
         </div>
         <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-red-500"></div>
            <span>Conjugate Gradient (A-orthogonal)</span>
         </div>
      </div>
    </div>
  );
}
