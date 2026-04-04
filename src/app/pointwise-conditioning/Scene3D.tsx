"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html, Grid, Plane } from "@react-three/drei";
import * as THREE from "three";

interface Scene3DProps {
  phiRad: number;
}

const VectorArrow = ({ start, end, color, label, showLabel = true, labelOffset = 0.05, dash = false, lineWidth = 1.5 }: { start: THREE.Vector3, end: THREE.Vector3, color: string, label: string, showLabel?: boolean, labelOffset?: number, dash?: boolean, lineWidth?: number }) => {
  const dir = end.clone().sub(start);
  const length = dir.length();

  if (length < 0.001) return null;

  dir.normalize();

  const midPoint = start.clone().lerp(end, 0.5);
  // Optional offset for label to avoid intersecting the line
  const up = new THREE.Vector3(0, 1, 0);
  const right = new THREE.Vector3().crossVectors(dir, up).normalize();
  midPoint.add(up.clone().multiplyScalar(labelOffset));

  return (
    <group>
      {!dash && <arrowHelper args={[dir, start, length, color, Math.min(length * 0.2, 0.2), Math.min(length * 0.2, 0.2) * 0.5]} />}
      {dash && (
        <Line points={[start, end]} color={color} lineWidth={lineWidth} dashed dashScale={5} dashSize={0.05} />
      )}
      {showLabel && (
        <Html position={midPoint} center style={{ pointerEvents: 'none' }}>
          <div className="font-mono text-[10px] font-bold px-1 py-0.5 rounded bg-white/80 backdrop-blur-sm border border-white/60 shadow-sm whitespace-nowrap" style={{ color }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

export default function Scene3D({ phiRad }: Scene3DProps) {
  const sigma1 = 2.0;
  const sigma2 = 1.0;

  // Let span(A) be a tilted plane in 3D so it's clearly visible.
  // Basis for span(A): u1, u2.
  // We'll align u1 with X axis, and u2 tilted in the YZ plane.
  const tiltAngle = Math.PI / 6; // 30 degrees tilt
  const u1 = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const u2 = useMemo(() => new THREE.Vector3(0, Math.cos(tiltAngle), Math.sin(tiltAngle)), [tiltAngle]);

  // Normal to the plane
  const n = useMemo(() => new THREE.Vector3().crossVectors(u1, u2).normalize(), [u1, u2]);

  // Plane rotation quaternion
  const planeQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    return q;
  }, [n]);

  // x in domain
  const x1 = Math.cos(phiRad);
  const x2 = Math.sin(phiRad);

  // Ax = sigma1 * x1 * u1 + sigma2 * x2 * u2
  const ax = useMemo(() => {
    const term1 = u1.clone().multiplyScalar(sigma1 * x1);
    const term2 = u2.clone().multiplyScalar(sigma2 * x2);
    return term1.add(term2);
  }, [x1, x2, u1, u2]);

  // Worst-case perturbation direction A(delta x) points in u1 direction (long axis).
  // We attach it to the tip of Ax.
  const aDeltaXLength = 0.5; // Fixed visual length
  const aDeltaX = useMemo(() => ax.clone().add(u1.clone().multiplyScalar(aDeltaXLength)), [ax, u1]);

  // Create the ellipse points
  const ellipsePoints = useMemo(() => {
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const t1 = u1.clone().multiplyScalar(sigma1 * Math.cos(theta));
      const t2 = u2.clone().multiplyScalar(sigma2 * Math.sin(theta));
      points.push(t1.add(t2));
    }
    return points;
  }, [u1, u2]);

  return (
    <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
      <color attach="background" args={['#f8fafc']} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.2} />

      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.2} />

      {/* Grid */}
      <group>
        <Grid
          infiniteGrid
          fadeDistance={15}
          sectionColor="#cbd5e1"
          cellColor="#e2e8f0"
          cellSize={0.5}
          sectionSize={1}
        />

        {/* Plane Span(A) */}
        <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} quaternion={planeQuat}>
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </Plane>

        <Html position={[u1.x * 2.5 + u2.x * 2.5, u1.y * 2.5 + u2.y * 2.5, u1.z * 2.5 + u2.z * 2.5]} style={{ pointerEvents: 'none' }}>
          <div className="text-xs font-mono text-sky-600 bg-white/50 px-1 rounded backdrop-blur whitespace-nowrap opacity-60">Span(A)</div>
        </Html>
      </group>

      {/* 3D Coordinate Frame at Origin */}
      <axesHelper args={[1]} />

      {/* Core Geometry */}
      <group>
        <mesh>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#334155" />
        </mesh>

        {/* Ellipse */}
        <Line points={ellipsePoints} color="#94a3b8" lineWidth={2} />

        {/* Principal Axes (optional guides) */}
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={u1.clone().multiplyScalar(sigma1)} color="#cbd5e1" label="σ1" dash={true} showLabel={true} />
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={u2.clone().multiplyScalar(sigma2)} color="#cbd5e1" label="σ2" dash={true} showLabel={true} />

        {/* Negative directions just for the lines */}
        <Line points={[new THREE.Vector3(0,0,0), u1.clone().multiplyScalar(-sigma1)]} color="#cbd5e1" lineWidth={1} dashed dashScale={5} dashSize={0.05} />
        <Line points={[new THREE.Vector3(0,0,0), u2.clone().multiplyScalar(-sigma2)]} color="#cbd5e1" lineWidth={1} dashed dashScale={5} dashSize={0.05} />

        {/* Vector Ax */}
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={ax} color="#10b981" label="Ax" labelOffset={0.1} />

        {/* Worst-case perturbation A(delta x) */}
        <VectorArrow start={ax} end={aDeltaX} color="#ef4444" label="worst-case Aδx" labelOffset={0.1} />

      </group>
    </Canvas>
  );
}
