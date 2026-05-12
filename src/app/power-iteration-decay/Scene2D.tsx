"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, Html, OrthographicCamera, Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { InlineMath } from "react-katex";

interface Scene2DProps {
  currentVec: [number, number];
  subStep: "x" | "Ax";
  iteration: number;
  angleDeg: number;
}

const VectorArrow2D = ({ start, end, color, label, showLabel = true, labelOffset = 0.05, dashed = false, lineWidth = 2 }: { start: THREE.Vector3, end: THREE.Vector3, color: string, label: string, showLabel?: boolean, labelOffset?: number, dashed?: boolean, lineWidth?: number }) => {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();

  if (length < 0.001) return null;

  const normalizedDir = dir.clone().normalize();
  const hex = new THREE.Color(color).getHex();
  const labelPos = end.clone().add(normalizedDir.clone().multiplyScalar(labelOffset + 0.2));

  return (
    <group>
      {dashed ? (
        <Line points={[start, end]} color={color} lineWidth={lineWidth} dashed dashScale={10} dashSize={0.05} gapSize={0.05} />
      ) : (
        <arrowHelper args={[normalizedDir, start, length, hex, Math.min(0.2, length * 0.2), Math.min(0.1, length * 0.1)]} />
      )}
      {showLabel && label !== "" && (
        <Html position={labelPos} center style={{ pointerEvents: 'none' }}>
          <div className="font-mono text-sm font-bold px-1 py-0.5 rounded bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm whitespace-nowrap" style={{ color }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

export default function Scene2D({ currentVec, subStep, iteration, angleDeg }: Scene2DProps) {
  // Matrix A = [2 1; 0 1]
  const a11 = 0.8, a12 = 0.3;
  const a21 = 0, a22 = 0.5;

  // The base vector
  const xVec = useMemo(() => new THREE.Vector3(currentVec[0], currentVec[1], 0), [currentVec]);

  // The multiplied vector
  let axVec = useMemo(() => new THREE.Vector3(a11 * xVec.x + a12 * xVec.y, a21 * xVec.x + a22 * xVec.y, 0), [xVec]);

  // For the degenerate case, make sure Ax strictly aligns with p2 to avoid drifting in the visual representation too
  if (angleDeg === 135 || angleDeg === 315) {
    const dot = (-axVec.x + axVec.y) / 2;
    axVec = new THREE.Vector3(-dot, dot, 0);
  }

  // Eigenvalue Decomposition
  // A = [2 1; 0 1]. Triangular, so eigenvalues are diagonal entries: 2 and 1.
  // L1_e = 2. Eigenvector p1: (1, 0)
  // L2_e = 1. Eigenvector p2: (-1/sqrt(2), 1/sqrt(2))
  const p1 = new THREE.Vector3(1, 0, 0);
  const p2 = new THREE.Vector3(-1, 1, 0).normalize();
  const lambda1 = 0.8;
  const lambda2 = 0.5;

  // Decompose xVec into p1, p2 basis
  // x = c1*p1 + c2*p2 => x = c1*(1,0) + c2*(-1/sqrt(2), 1/sqrt(2))
  // c2 = x.y * sqrt(2)
  // c1 = x.x + c2/sqrt(2) = x.x + x.y
  const c2_x = xVec.y * Math.sqrt(2);
  const c1_x = xVec.x + xVec.y;

  const c1p1_x = p1.clone().multiplyScalar(c1_x);
  const c2p2_x = p2.clone().multiplyScalar(c2_x);

  // Decompose axVec into p1, p2 basis
  const c2_ax = axVec.y * Math.sqrt(2);
  const c1_ax = axVec.x + axVec.y;

  const c1p1_ax = p1.clone().multiplyScalar(c1_ax);
  const c2p2_ax = p2.clone().multiplyScalar(c2_ax);

  return (
    <div className="w-full h-full relative">
      {(angleDeg === 135 || angleDeg === 315) && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-[400px] shadow-md bg-orange-50/95 backdrop-blur-sm border border-orange-200 rounded-md p-3">
          <div className="text-xs font-semibold text-orange-800 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            Unstable Equilibrium
          </div>
          <p className="text-xs text-orange-700 leading-relaxed">
            The vector is perfectly aligned with the weaker eigenvector <InlineMath math="p_2" />.
            Staying on this path is <strong>numerically impossible</strong> in real computing due to floating-point errors, but we enforce it here for demonstration.
          </p>
        </div>
      )}
      <Canvas>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={80} near={0.1} far={100} />
      <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />
      <color attach="background" args={["#f8fafc"]} />

      <group>
        {/* Same Space Grid */}
        <Grid args={[40, 40]} cellSize={1} cellThickness={1} cellColor="#e2e8f0" sectionSize={1} sectionThickness={1.5} sectionColor="#cbd5e1" position={[0, 0, -1]} rotation={[Math.PI/2, 0, 0]} />

        {/* Skewed Eigen Grid */}
        <Line points={[p1.clone().multiplyScalar(-20), p1.clone().multiplyScalar(20)]} color="#fca5a5" lineWidth={1.5} dashed dashScale={10} dashSize={0.2} gapSize={0.2} />
        <Line points={[p2.clone().multiplyScalar(-20), p2.clone().multiplyScalar(20)]} color="#fca5a5" lineWidth={1.5} dashed dashScale={10} dashSize={0.2} gapSize={0.2} />

        {/* Unit circle for reference */}
        <Line
          points={Array.from({length: 65}, (_, i) => new THREE.Vector3(Math.cos(i/64*Math.PI*2), Math.sin(i/64*Math.PI*2), 0))}
          color="#94a3b8"
          lineWidth={1}
          dashed dashScale={10} dashSize={0.1} gapSize={0.1}
        />

        {/* Basis Vectors */}
        <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={p1} color="#ef4444" label="p₁" />
        <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={p2} color="#ef4444" label="p₂" />

        {/* Show current vector x_k */}
        <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={c1p1_x} color="#9ca3af" label="" dashed />
        <VectorArrow2D start={c1p1_x} end={xVec} color="#9ca3af" label="" dashed />
        <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={c2p2_x} color="#9ca3af" label="" dashed />
        <VectorArrow2D start={c2p2_x} end={xVec} color="#9ca3af" label="" dashed />
        <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={xVec} color="#64748b" label={`x${iteration > 0 ? `_${iteration}` : '_0'}`} />

        {/* Show Ax_k if in Ax substep */}
        {subStep === "Ax" && (
          <>
            <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={c1p1_ax} color="#fbbf24" label="" dashed />
            <VectorArrow2D start={c1p1_ax} end={axVec} color="#fbbf24" label="" dashed />
            <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={c2p2_ax} color="#fbbf24" label="" dashed />
            <VectorArrow2D start={c2p2_ax} end={axVec} color="#fbbf24" label="" dashed />
            <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={axVec} color="#eab308" label={`Ax${iteration > 0 ? `_${iteration}` : '_0'}`} />
          </>
        )}
      </group>
    </Canvas>
    </div>
  );
}
