"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, Html, OrthographicCamera, Grid, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { InlineMath } from "react-katex";

interface Scene2DProps {
  mode: "solution" | "error";
  currentVec: [number, number];
  x_true: number[];
  iteration: number;
}

const VectorArrow2D = ({ start, end, color, mathLabel, showLabel = true, labelOffset = 0.3, dashed = false, lineWidth = 2 }: { start: THREE.Vector3, end: THREE.Vector3, color: string, mathLabel?: string, showLabel?: boolean, labelOffset?: number, dashed?: boolean, lineWidth?: number }) => {
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
      {showLabel && mathLabel && (
        <Html position={labelPos} center style={{ pointerEvents: 'none' }}>
          <div className="text-sm font-bold px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm whitespace-nowrap" style={{ color }}>
            <InlineMath math={mathLabel} />
          </div>
        </Html>
      )}
    </group>
  );
};

export default function Scene2D({ mode, currentVec, x_true, iteration }: Scene2DProps) {
  const g11 = 0.8, g12 = 2.0;
  const g21 = 0, g22 = 0.5;

  const xVec = useMemo(() => new THREE.Vector3(currentVec[0], currentVec[1], 0), [currentVec]);
  const xtrueVec = useMemo(() => new THREE.Vector3(x_true[0], x_true[1], 0), [x_true]);
  const errorVec = useMemo(() => new THREE.Vector3().subVectors(xVec, xtrueVec), [xVec, xtrueVec]);

  // Eigenvalue Decomposition of G
  // G = [0.8 2.0; 0 0.5]
  // L1 = 0.8. Eigenvector p1: [0 2.0; 0 -0.3]p1 = 0 => p1 = (1, 0)
  // L2 = 0.5. Eigenvector p2: [0.3 2.0; 0 0]p2 = 0 => 0.3x + 2y = 0 => x = -20/3 y. Let y=3, x=-20. p2 ~ (-20, 3)
  const p1 = new THREE.Vector3(1, 0, 0).normalize();
  const p2Raw = new THREE.Vector3(-20, 3, 0).normalize();

  // Actually let's scale p1, p2 for visualization basis vectors
  const p1Vis = p1.clone().multiplyScalar(2);
  const p2Vis = p2Raw.clone().multiplyScalar(2);

  // Decompose errorVec into p1, p2 basis
  // e = c1*p1 + c2*p2
  // e.y = c2 * p2.y => c2 = e.y / p2.y
  // e.x = c1 * p1.x + c2 * p2.x => c1 = (e.x - c2 * p2.x) / p1.x
  const c2_e = errorVec.y / p2Raw.y;
  const c1_e = (errorVec.x - c2_e * p2Raw.x) / p1.x;

  const c1p1_e = p1.clone().multiplyScalar(c1_e);
  const c2p2_e = p2Raw.clone().multiplyScalar(c2_e);

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded border border-slate-200 shadow-sm text-sm font-semibold text-slate-700">
        {mode === "solution" ? "Solution Space (x)" : "Error Space (e)"}
      </div>
      <Canvas>
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={60} near={0.1} far={100} />
        <OrbitControls enableRotate={false} enablePan={true} enableZoom={true} />
        <color attach="background" args={["#f8fafc"]} />

        <group>
          {/* Base Grid */}
          <Grid args={[40, 40]} cellSize={1} cellThickness={1} cellColor="#e2e8f0" sectionSize={1} sectionThickness={1.5} sectionColor="#cbd5e1" position={[0, 0, -1]} rotation={[Math.PI/2, 0, 0]} />

          {mode === "solution" && (
            <>
              {/* Plot x_true */}
              <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={xtrueVec} color="#10b981" mathLabel="\mathbf{x}" />

              {/* Plot x^(k) */}
              <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={xVec} color="#64748b" mathLabel={`\\mathbf{x}^{(${iteration > 0 ? iteration : "0"})}`} />

              {/* Draw dashed line from x^(k) to x_true representing error */}
              <Line points={[xtrueVec, xVec]} color="#f43f5e" lineWidth={2} dashed dashScale={10} dashSize={0.1} gapSize={0.1} />
            </>
          )}

          {mode === "error" && (
            <>
              {/* Skewed Eigen Grid */}
              <Line points={[p1.clone().multiplyScalar(-20), p1.clone().multiplyScalar(20)]} color="#fca5a5" lineWidth={1.5} dashed dashScale={10} dashSize={0.2} gapSize={0.2} />
              <Line points={[p2Raw.clone().multiplyScalar(-20), p2Raw.clone().multiplyScalar(20)]} color="#fca5a5" lineWidth={1.5} dashed dashScale={10} dashSize={0.2} gapSize={0.2} />

              {/* Basis Vectors */}
              <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={p1Vis} color="#ef4444" mathLabel="p_1" />
              <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={p2Vis} color="#ef4444" mathLabel="p_2" />

              {/* Error vector decomposed */}
              <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={c1p1_e} color="#fbbf24" dashed />
              <VectorArrow2D start={c1p1_e} end={errorVec} color="#fbbf24" dashed />
              <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={c2p2_e} color="#fbbf24" dashed />
              <VectorArrow2D start={c2p2_e} end={errorVec} color="#fbbf24" dashed />

              <VectorArrow2D start={new THREE.Vector3(0,0,0)} end={errorVec} color="#f43f5e" mathLabel={`\\mathbf{e}^{(${iteration > 0 ? iteration : "0"})}`} />
            </>
          )}
        </group>
      </Canvas>
    </div>
  );
}
