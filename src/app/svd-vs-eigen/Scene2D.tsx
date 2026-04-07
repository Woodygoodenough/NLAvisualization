"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, Html, OrthographicCamera, Grid } from "@react-three/drei";
import * as THREE from "three";

interface Scene2DProps {
  viewMode: "svd" | "eigen";
  angleRad: number;
}

const VectorArrow2D = ({ start, end, color, label, showLabel = true, labelOffset = 0.05, dashed = false, lineWidth = 2 }: { start: THREE.Vector3, end: THREE.Vector3, color: string, label: string, showLabel?: boolean, labelOffset?: number, dashed?: boolean, lineWidth?: number }) => {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();

  if (length < 0.001) return null;

  const normalizedDir = dir.clone().normalize();
  const hex = new THREE.Color(color).getHex();
  const labelPos = end.clone().add(normalizedDir.clone().multiplyScalar(labelOffset));

  return (
    <group>
      {dashed ? (
        <Line points={[start, end]} color={color} lineWidth={lineWidth} dashed dashScale={10} dashSize={0.05} gapSize={0.05} />
      ) : (
        <arrowHelper args={[normalizedDir, start, length, hex, Math.min(0.2, length * 0.2), Math.min(0.1, length * 0.1)]} />
      )}
      {showLabel && (
        <Html position={labelPos} center style={{ pointerEvents: 'none' }}>
          <div className="font-mono text-sm font-bold px-1 py-0.5 rounded bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm whitespace-nowrap" style={{ color }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

export default function Scene2D({ viewMode, angleRad }: Scene2DProps) {
  // Matrix A = [2 1; 0 1]
  const a11 = 2, a12 = 1;
  const a21 = 0, a22 = 1;

  // Domain vector x
  const x = useMemo(() => new THREE.Vector3(Math.cos(angleRad), Math.sin(angleRad), 0), [angleRad]);

  // Transformed vector Ax
  const ax = useMemo(() => new THREE.Vector3(a11 * x.x + a12 * x.y, a21 * x.x + a22 * x.y, 0), [x]);

  // SVD Decomposition
  // A^T A = [2 0; 1 1] * [2 1; 0 1] = [4 2; 2 2]
  // Char poly: (4-L)(2-L) - 4 = L^2 - 6L + 4 = 0
  // L = (6 +- sqrt(36 - 16)) / 2 = 3 +- sqrt(5)
  // L1 = 3 + sqrt(5) = 5.236
  // L2 = 3 - sqrt(5) = 0.764
  // sigma1 = sqrt(L1) = 2.288
  // sigma2 = sqrt(L2) = 0.874
  const L1 = 3 + Math.sqrt(5);
  const L2 = 3 - Math.sqrt(5);
  const sigma1 = Math.sqrt(L1);
  const sigma2 = Math.sqrt(L2);

  // v1 is eigenvector of A^T A for L1.
  // [4-L1 2; 2 2-L1] v1 = 0
  // (1 - sqrt(5))x + 2y = 0 => v1 ~ (2, sqrt(5)-1)
  const v1Raw = new THREE.Vector3(2, Math.sqrt(5) - 1, 0).normalize();
  const v2Raw = new THREE.Vector3(-v1Raw.y, v1Raw.x, 0).normalize(); // Orthogonal to v1

  const u1Raw = new THREE.Vector3(a11*v1Raw.x + a12*v1Raw.y, a21*v1Raw.x + a22*v1Raw.y, 0).multiplyScalar(1/sigma1);
  const u2Raw = new THREE.Vector3(a11*v2Raw.x + a12*v2Raw.y, a21*v2Raw.x + a22*v2Raw.y, 0).multiplyScalar(1/sigma2);

  // Eigenvalue Decomposition
  // A = [2 1; 0 1]. Triangular, so eigenvalues are diagonal entries: 2 and 1.
  // L1_e = 2. Eigenvector p1: [0 1; 0 -1]p1 = 0 => p1 = (1, 0)
  // L2_e = 1. Eigenvector p2: [1 1; 0 0]p2 = 0 => p2 = (-1, 1) or (-1/sqrt(2), 1/sqrt(2))
  const p1 = new THREE.Vector3(1, 0, 0);
  const p2 = new THREE.Vector3(-1, 1, 0).normalize();
  const lambda1 = 2;
  const lambda2 = 1;

  // Decompose x into p1, p2 basis
  // x = c1*p1 + c2*p2 => x = c1*(1,0) + c2*(-1/sqrt(2), 1/sqrt(2))
  // c2 = x.y * sqrt(2)
  // c1 = x.x + c2/sqrt(2) = x.x + x.y
  const c2 = x.y * Math.sqrt(2);
  const c1 = x.x + x.y;

  // The components of Ax in eigen basis
  const c1p1 = p1.clone().multiplyScalar(c1);
  const c2p2 = p2.clone().multiplyScalar(c2);
  const L1c1p1 = c1p1.clone().multiplyScalar(lambda1);
  const L2c2p2 = c2p2.clone().multiplyScalar(lambda2);

  // Geometric shapes
  const domainCircle = useMemo(() => {
    const pts = [];
    for(let i=0; i<=64; i++){
      pts.push(new THREE.Vector3(Math.cos(i/64*Math.PI*2), Math.sin(i/64*Math.PI*2), 0));
    }
    return pts;
  }, []);

  const codomainEllipse = useMemo(() => {
    const pts = [];
    for(let i=0; i<=64; i++){
      const x = Math.cos(i/64*Math.PI*2);
      const y = Math.sin(i/64*Math.PI*2);
      pts.push(new THREE.Vector3(a11*x + a12*y, a21*x + a22*y, 0));
    }
    return pts;
  }, []);

  // For SVD View, we shift the domain visually to the left or put it in an inset.
  // Actually, keeping the domain as a small inset window makes "output in another space" clear.

  return (
    <Canvas>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={80} near={0.1} far={100} />
      <color attach="background" args={["#f8fafc"]} />

      {viewMode === "eigen" && (
        <group>
          {/* Eigen View: Same Space Grid */}
          <Grid args={[40, 40]} cellSize={1} cellThickness={1} cellColor="#e2e8f0" sectionSize={1} sectionThickness={1.5} sectionColor="#cbd5e1" position={[0, 0, -1]} rotation={[Math.PI/2, 0, 0]} />

          {/* Skewed Eigen Grid */}
          <Line points={[p1.clone().multiplyScalar(-10), p1.clone().multiplyScalar(10)]} color="#fca5a5" lineWidth={1.5} dashed dashScale={10} dashSize={0.2} gapSize={0.2} />
          <Line points={[p2.clone().multiplyScalar(-10), p2.clone().multiplyScalar(10)]} color="#fca5a5" lineWidth={1.5} dashed dashScale={10} dashSize={0.2} gapSize={0.2} />

          <Line points={domainCircle} color="#94a3b8" lineWidth={2} dashed dashScale={10} dashSize={0.1} gapSize={0.1} />
          <Line points={codomainEllipse} color="#3b82f6" lineWidth={2} />

          {/* Basis Vectors */}
          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={p1} color="#ef4444" label="p₁" />
          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={p2} color="#ef4444" label="p₂" />

          {/* Transformed Basis Vectors */}
          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={p1.clone().multiplyScalar(lambda1)} color="#991b1b" label="λ₁p₁" />
          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={p2.clone().multiplyScalar(lambda2)} color="#991b1b" label="λ₂p₂" />

          {/* x vector decomposed */}
          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={c1p1} color="#9ca3af" label="" dashed />
          <VectorArrow2D start={c1p1} end={x} color="#9ca3af" label="" dashed />
          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={x} color="#64748b" label="x" />

          {/* Ax vector decomposed */}
          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={L1c1p1} color="#fbbf24" label="" dashed />
          <VectorArrow2D start={L1c1p1} end={ax} color="#fbbf24" label="" dashed />
          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={ax} color="#eab308" label="Ax" />
        </group>
      )}

      {viewMode === "svd" && (
        <group>
          {/* Main Codomain (U Sigma View) */}
          <Grid args={[40, 40]} cellSize={1} cellThickness={1} cellColor="#e2e8f0" sectionSize={1} sectionThickness={1.5} sectionColor="#cbd5e1" position={[0, 0, -1]} rotation={[Math.PI/2, 0, 0]} />

          <Line points={codomainEllipse} color="#3b82f6" lineWidth={2} />

          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={u1Raw.clone().multiplyScalar(sigma1)} color="#ec4899" label="σ₁u₁" />
          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={u2Raw.clone().multiplyScalar(sigma2)} color="#ec4899" label="σ₂u₂" />

          <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={ax} color="#eab308" label="Ax" />

          {/* Inset Domain (V View) */}
          <group position={[-3.5, 2.5, 0]}>
            {/* Draw a subtle box for the inset */}
            <mesh position={[0, 0, -0.5]}>
              <planeGeometry args={[4, 4]} />
              <meshBasicMaterial color="#ffffff" opacity={0.9} transparent depthWrite={false} />
            </mesh>
            <Line points={[[-2, -2, 0], [2, -2, 0], [2, 2, 0], [-2, 2, 0], [-2, -2, 0]].map(p => new THREE.Vector3(...p))} color="#cbd5e1" lineWidth={1} />
            <Html position={[-1.8, 1.8, 0]} style={{ pointerEvents: 'none' }}>
              <div className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Domain</div>
            </Html>

            <Grid args={[4, 4]} cellSize={0.5} cellThickness={0.5} cellColor="#f1f5f9" sectionSize={1} sectionThickness={1} sectionColor="#e2e8f0" position={[0, 0, -0.4]} rotation={[Math.PI/2, 0, 0]} />

            <Line points={domainCircle} color="#94a3b8" lineWidth={2} />

            <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={v1Raw} color="#10b981" label="v₁" labelOffset={0.1} />
            <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={v2Raw} color="#10b981" label="v₂" labelOffset={0.1} />
            <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={x} color="#64748b" label="x" labelOffset={0.1} />
          </group>
        </group>
      )}

    </Canvas>
  );
}
