"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html, Grid, Center, Plane } from "@react-three/drei";
import * as THREE from "three";

interface Scene3DProps {
  thetaRad: number;
  phiRad: number;
}

const VectorArrow = ({ start, end, color, label, showLabel = true }: { start: THREE.Vector3, end: THREE.Vector3, color: string, label: string, showLabel?: boolean }) => {
  const dir = end.clone().sub(start);
  const length = dir.length();

  if (length < 0.001) return null;

  dir.normalize();

  // Position label at the midpoint of the vector, slightly shifted "up" so it rests cleanly on top of the line
  const midPoint = start.clone().lerp(end, 0.5);
  // Add a tiny vertical offset so the label doesn't intersect the line exactly
  midPoint.y += 0.05;

  return (
    <group>
      <arrowHelper args={[dir, start, length, color, Math.min(length * 0.2, 0.1), Math.min(length * 0.2, 0.1) * 0.5]} />
      {showLabel && (
        <Html position={midPoint} center style={{ pointerEvents: 'none' }}>
          <div className="font-mono text-[10px] font-bold px-1 py-0.5 rounded bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm" style={{ color }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

export default function Scene3D({ thetaRad, phiRad }: Scene3DProps) {
  // Define geometric entities
  const bLength = 1.0;
  const yLength = Math.cos(thetaRad);
  const projDist = Math.sin(thetaRad); // distance from tip of b to tip of y

  // The plane defined by A is the XZ plane for simplicity (y=0 in 3D coords).

  // Keep b and y fixed in orientation (e.g., along the X-axis) so the scene doesn't spin.
  const yX = yLength;
  const yZ = 0;
  const y = useMemo(() => new THREE.Vector3(yX, 0, yZ), [yX, yZ]);

  // b vector
  // Starts at origin. Projection onto XZ plane is y.
  // The orthogonal component is along the Y axis.
  const b = useMemo(() => new THREE.Vector3(yX, projDist, yZ), [yX, projDist, yZ]);

  const bDir = b.clone().normalize();
  const yDir = y.lengthSq() > 0.001 ? y.clone().normalize() : new THREE.Vector3(1, 0, 0);

  // Delta vectors for perturbations
  const deltaFactor = 0.15; // length of delta_b

  // delta_b is parallel to the plane Span(A) to maximize the condition number ratio.
  // We use phiRad to rotate delta_b entirely within the XZ plane.
  // Since it rests entirely in Span(A), its projection delta_y is always perfectly equal to delta_b.
  const deltaB = new THREE.Vector3(
    Math.cos(phiRad) * deltaFactor,
    0,
    Math.sin(phiRad) * deltaFactor
  );

  const b_perturbed = b.clone().add(deltaB);
  // delta_y is the projection of delta_b onto the XZ plane, which is exactly delta_b since delta_b is in the XZ plane.
  const deltaY = deltaB.clone();
  const y_perturbed = y.clone().add(deltaY);

  return (
    <Canvas camera={{ position: [2, 1.5, 2], fov: 45 }}>
      <color attach="background" args={['#f8fafc']} />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.2} />

      {/* Orbit Controls */}
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.2} enablePan={false} />

      {/* Grid serving as Span(A) */}
      <group>
        <Grid
          infiniteGrid
          fadeDistance={15}
          sectionColor="#cbd5e1"
          cellColor="#e2e8f0"
          cellSize={0.5}
          sectionSize={1}
        />

        {/* Subspace label */}
        <Html position={[1.5, 0, -1.5]} style={{ pointerEvents: 'none' }}>
          <div className="text-xs font-mono text-sky-600 bg-white/50 px-1 rounded backdrop-blur whitespace-nowrap opacity-60">Span(A)</div>
        </Html>
      </group>

      {/* Core Geometry */}
      <group>
        {/* Origin marker */}
        <mesh>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="#334155" />
        </mesh>

        {/* b vector */}
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={b} color="#3b82f6" label="b" />

        {/* y vector (projection) */}
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={y} color="#10b981" label="ŷ" />

        {/* Orthogonal projection segment */}
        <Line
          points={[b, y]}
          color="#94a3b8"
          lineWidth={1.5}
          dashed
          dashScale={10}
          dashSize={0.1}
        />

        {/* Theta Arc */}
        {(() => {
            const arcRadius = 0.2;
            const arcPoints = [];
            const segments = 20;
            for(let i=0; i<=segments; i++) {
              const t = i / segments; // 0 to 1
              // spherical interpolation
              const p = new THREE.Vector3().copy(yDir).lerp(bDir, t).normalize().multiplyScalar(arcRadius);
              arcPoints.push(p);
            }
            return (
              <group>
                <Line points={arcPoints} color="#64748b" lineWidth={2} />
                {/* Theta Label positioned in the middle of the arc */}
                <Html position={new THREE.Vector3().copy(yDir).lerp(bDir, 0.5).normalize().multiplyScalar(arcRadius + 0.08)} center style={{ pointerEvents: 'none' }}>
                  <span className="font-serif italic font-bold text-slate-600 text-sm">θ</span>
                </Html>
              </group>
            );
        })()}

        {/* Perturbations (Delta vectors) */}
        <group>
          {/* delta_b vector starting at tip of b */}
          <VectorArrow start={b} end={b_perturbed} color="#ef4444" label="δb" />

          {/* delta_y vector starting at tip of y */}
          <VectorArrow start={y} end={y_perturbed} color="#f59e0b" label="δŷ" />

          {/* New projected connection to show the perturbed projection */}
          <Line
            points={[b_perturbed, y_perturbed]}
            color="#cbd5e1"
            lineWidth={1}
            dashed
            dashScale={10}
          />

          {/* Perturbed y vector from origin (faint) */}
          <Line
              points={[new THREE.Vector3(0,0,0), y_perturbed]}
              color="#fcd34d"
              lineWidth={1}
          />
        </group>

      </group>
    </Canvas>
  );
}
