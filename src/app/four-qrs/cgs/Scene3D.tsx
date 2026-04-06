"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html, Grid } from "@react-three/drei";
import * as THREE from "three";

interface Scene3DProps {
  step: number;
}

const VectorArrow = ({ start, end, color, label, showLabel = true, labelOffset = 0.05, dash = false, lineWidth = 1.5, opacity = 1.0 }: { start: THREE.Vector3, end: THREE.Vector3, color: string, label: string, showLabel?: boolean, labelOffset?: number, dash?: boolean, lineWidth?: number, opacity?: number }) => {
  const dir = end.clone().sub(start);
  const length = dir.length();

  if (length < 0.001) return null;

  dir.normalize();

  const midPoint = start.clone().lerp(end, 0.5);
  // Optional offset for label to avoid intersecting the line
  const up = new THREE.Vector3(0, 1, 0);
  midPoint.add(up.clone().multiplyScalar(labelOffset));

  const hexColor = typeof color === 'string' ? parseInt(color.replace('#', '0x'), 16) : color;

  return (
    <group>
      {!dash && (
        <group>
          {/* We use a custom mesh for arrows to support opacity reliably */}
          <mesh position={start.clone().add(dir.clone().multiplyScalar(length / 2))} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)}>
            <cylinderGeometry args={[lineWidth * 0.005, lineWidth * 0.005, length - Math.min(length * 0.2, 0.15), 8]} />
            <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} />
          </mesh>
          <mesh position={end.clone().sub(dir.clone().multiplyScalar(Math.min(length * 0.2, 0.15) / 2))} quaternion={new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)}>
            <coneGeometry args={[lineWidth * 0.015, Math.min(length * 0.2, 0.15), 8]} />
            <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} />
          </mesh>
        </group>
      )}
      {dash && (
        <Line points={[start, end]} color={color} lineWidth={lineWidth * 0.5} dashed dashScale={5} dashSize={0.1} gapSize={0.05} transparent={opacity < 1} opacity={opacity} />
      )}
      {showLabel && opacity > 0.1 && (
        <Html position={midPoint} center style={{ pointerEvents: 'none' }}>
          <div
            className="font-mono text-[10px] font-bold px-1 py-0.5 rounded bg-white/80 backdrop-blur-sm shadow-sm whitespace-nowrap"
            style={{
              color,
              border: `1px solid ${color}40`,
              opacity: opacity
            }}
          >
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

export default function Scene3D({ step }: Scene3DProps) {
  // Define fixed, non-degenerate, non-orthogonal 3x3 matrix A = [a1, a2, a3]
  const { a1, a2, a3 } = useMemo(() => {
    return {
      a1: new THREE.Vector3(2.0, 1.0, 0.4),
      a2: new THREE.Vector3(1.0, 2.4, 0.6),
      a3: new THREE.Vector3(0.4, 0.8, 3.0)
    };
  }, []);

  // Compute Classical Gram-Schmidt
  const { q1, q2, q3, p21, p31, p32, u2, u3 } = useMemo(() => {
    // Step 1: q1
    const u1 = a1.clone();
    const q1 = u1.clone().normalize();

    // Step 2: q2
    // proj of a2 onto q1
    const r12 = q1.dot(a2);
    const p21 = q1.clone().multiplyScalar(r12); // projection vector
    const u2 = a2.clone().sub(p21);
    const q2 = u2.clone().normalize();

    // Step 3: q3
    // proj of a3 onto q1
    const r13 = q1.dot(a3);
    const p31 = q1.clone().multiplyScalar(r13);
    // proj of a3 onto q2
    const r23 = q2.dot(a3);
    const p32 = q2.clone().multiplyScalar(r23);

    const u3 = a3.clone().sub(p31).sub(p32);
    const q3 = u3.clone().normalize();

    return { q1, q2, q3, p21, p31, p32, u2, u3 };
  }, [a1, a2, a3]);

  const origin = new THREE.Vector3(0, 0, 0);

  // Colors
  const aColor = "#64748b"; // slate-500
  const q1Color = "#ef4444"; // red-500
  const q2Color = "#3b82f6"; // blue-500
  const q3Color = "#10b981"; // emerald-500
  const projColor = "#f59e0b"; // amber-500
  const uColor = "#94a3b8"; // slate-400 (faint)

  // Opacities for a vectors based on step
  const aOpacity = step === 0 ? 1.0 : 0.25;

  return (
    <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
      <color attach="background" args={['#f8fafc']} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.2} />

      <OrbitControls makeDefault />

      <group>
        <Grid
          infiniteGrid
          fadeDistance={15}
          sectionColor="#cbd5e1"
          cellColor="#e2e8f0"
          cellSize={0.5}
          sectionSize={1}
        />
      </group>

      {/* Core Geometry */}
      <group>
        <mesh>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#334155" />
        </mesh>

        {/* Original vectors A */}
        <VectorArrow start={origin} end={a1} color={aColor} label="a₁" opacity={aOpacity} lineWidth={1} />
        <VectorArrow start={origin} end={a2} color={aColor} label="a₂" opacity={aOpacity} lineWidth={1} />
        <VectorArrow start={origin} end={a3} color={aColor} label="a₃" opacity={aOpacity} lineWidth={1} />

        {/* Step 1: q1 */}
        {step >= 1 && (
          <VectorArrow start={origin} end={q1} color={q1Color} label="q₁" lineWidth={2} />
        )}

        {/* Step 2: projection of a2 onto q1 */}
        {step === 2 && (
          <group>
            {/* Project onto q1 */}
            <VectorArrow start={origin} end={p21} color={projColor} label="proj_{q1}(a₂)" dash lineWidth={2} showLabel={false} />
            {/* Faint dotted line connecting a2 to projection */}
            <Line points={[a2, p21]} color={projColor} lineWidth={1} dashed dashScale={10} dashSize={0.05} gapSize={0.05} />
          </group>
        )}

        {/* Step 3: q2 and intermediate u2 */}
        {step >= 3 && (
          <group>
            {/* Show u2 (subtraction result) briefly or faintly */}
            {step === 3 && (
               <VectorArrow start={p21} end={a2} color={uColor} label="u₂ = a₂ - proj" dash lineWidth={2} labelOffset={0.15} />
            )}
            <VectorArrow start={origin} end={q2} color={q2Color} label="q₂" lineWidth={2} />
          </group>
        )}

        {/* Step 4: projection of a3 onto q1, q2 */}
        {step === 4 && (
          <group>
            {/* Project onto q1 */}
            <VectorArrow start={origin} end={p31} color={projColor} label="proj_{q1}(a₃)" dash lineWidth={2} showLabel={false} />
            {/* Project onto q2 */}
            <VectorArrow start={origin} end={p32} color={projColor} label="proj_{q2}(a₃)" dash lineWidth={2} showLabel={false} />

            {/* Sum of projections (in the q1-q2 plane) */}
            <VectorArrow start={origin} end={p31.clone().add(p32)} color={projColor} label="Σ proj(a₃)" dash lineWidth={2} showLabel={false} />

            {/* Dotted lines for visual clarity */}
            <Line points={[a3, p31.clone().add(p32)]} color={projColor} lineWidth={1} dashed dashScale={10} dashSize={0.05} gapSize={0.05} />
          </group>
        )}

        {/* Step 5: q3 and intermediate u3 */}
        {step >= 5 && (
          <group>
             {/* Show u3 faintly */}
             {step === 5 && (
               <VectorArrow start={p31.clone().add(p32)} end={a3} color={uColor} label="u₃" dash lineWidth={2} labelOffset={0.15} />
             )}
            <VectorArrow start={origin} end={q3} color={q3Color} label="q₃" lineWidth={2} />
          </group>
        )}

      </group>
    </Canvas>
  );
}
