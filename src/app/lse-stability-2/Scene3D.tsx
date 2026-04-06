"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html, Grid, Plane } from "@react-three/drei";
import * as THREE from "three";

interface Scene3DProps {
  thetaRad: number;
  tiltRad: number;
  phiRad: number;
}

const VectorArrow = ({ start, end, color, label, showLabel = true, labelOffset = 0.05, dash = false }: { start: THREE.Vector3, end: THREE.Vector3, color: string, label: string, showLabel?: boolean, labelOffset?: number, dash?: boolean }) => {
  const dir = end.clone().sub(start);
  const length = dir.length();

  if (length < 0.001) return null;

  dir.normalize();

  const midPoint = start.clone().lerp(end, 0.5);
  midPoint.y += labelOffset;

  return (
    <group>
      {!dash && <arrowHelper args={[dir, start, length, color, Math.min(length * 0.2, 0.1), Math.min(length * 0.2, 0.1) * 0.5]} />}
      {dash && (
        <Line points={[start, end]} color={color} lineWidth={1.5} dashed dashScale={5} dashSize={0.05} />
      )}
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

export default function Scene3D({ thetaRad, tiltRad, phiRad }: Scene3DProps) {
  const bLength = 1.0;
  const bX = Math.cos(thetaRad);
  const bY = Math.sin(thetaRad);
  const bZ = 0;

  // Vector b
  const b = useMemo(() => new THREE.Vector3(bX, bY, bZ), [bX, bY, bZ]);

  // Original plane is XZ (normal is Y axis)
  // Original projection
  const y = useMemo(() => new THREE.Vector3(bX, 0, 0), [bX]);

  // Tilt the normal to get perturbed plane Span(A+deltaA)
  // The tilt is along some axis defined by phiRad
  const nX = -Math.sin(tiltRad) * Math.cos(phiRad);
  const nY = Math.cos(tiltRad);
  const nZ = -Math.sin(tiltRad) * Math.sin(phiRad);
  const n = useMemo(() => new THREE.Vector3(nX, nY, nZ).normalize(), [nX, nY, nZ]);

  // New projection y' = b - (b . n) n
  const yPrime = useMemo(() => {
    const bDotN = b.dot(n);
    return b.clone().sub(n.clone().multiplyScalar(bDotN));
  }, [b, n]);

  // Plane rotation quaternion
  const planeQuat = useMemo(() => {
    const q = new THREE.Quaternion();
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
    return q;
  }, [n]);

  return (
    <Canvas camera={{ position: [2.5, 1.5, 2.5], fov: 45 }}>
      <color attach="background" args={['#f8fafc']} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.2} />

      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.2} enablePan={false} />

      {/* Grid */}
      <group>
        <Grid
          infiniteGrid
          fadeDistance={10}
          sectionColor="#cbd5e1"
          cellColor="#e2e8f0"
          cellSize={0.5}
          sectionSize={1}
        />

        {/* Original Plane Span(A) */}
        <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </Plane>

        <Html position={[1.5, 0, -1.5]} style={{ pointerEvents: 'none' }}>
          <div className="text-xs font-mono text-sky-600 bg-white/50 px-1 rounded backdrop-blur whitespace-nowrap opacity-60">Span(A)</div>
        </Html>

        {/* Perturbed Plane Span(A + deltaA) */}
        <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} quaternion={planeQuat}>
          <meshBasicMaterial color="#fed7aa" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </Plane>

        <Html position={[n.x * -1.5 + 1.5, n.y * -1.5 + 1.5, n.z * -1.5 - 1.5]} style={{ pointerEvents: 'none' }}>
           {tiltRad > 0 && <div className="text-xs font-mono text-orange-600 bg-white/50 px-1 rounded backdrop-blur whitespace-nowrap opacity-60">Span(A+δA)</div>}
        </Html>
      </group>

      {/* Core Geometry */}
      <group>
        <mesh>
          <sphereGeometry args={[0.02, 16, 16]} />
          <meshBasicMaterial color="#334155" />
        </mesh>

        <VectorArrow start={new THREE.Vector3(0,0,0)} end={b} color="#3b82f6" label="b" />
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={y} color="#10b981" label="ŷ" />

        {/* Perturbed projection y' */}
        {tiltRad > 0 && (
          <>
            <VectorArrow start={new THREE.Vector3(0,0,0)} end={yPrime} color="#f97316" label="ŷ'" labelOffset={-0.05} />
            <VectorArrow start={y} end={yPrime} color="#ef4444" label="δŷ" labelOffset={0.08} />
          </>
        )}

        {/* Orthogonal projection segments */}
        <Line points={[b, y]} color="#94a3b8" lineWidth={1.5} dashed dashScale={10} dashSize={0.1} />
        {tiltRad > 0 && (
          <Line points={[b, yPrime]} color="#fdba74" lineWidth={1.5} dashed dashScale={10} dashSize={0.1} />
        )}

        {/* Theta Arc */}
        {(() => {
            const arcRadius = 0.2;
            const arcPoints = [];
            const segments = 20;
            const bDir = b.clone().normalize();
            const yDir = y.clone().normalize();
            for(let i=0; i<=segments; i++) {
              const t = i / segments;
              const p = new THREE.Vector3().copy(yDir).lerp(bDir, t).normalize().multiplyScalar(arcRadius);
              arcPoints.push(p);
            }
            return (
              <group>
                <Line points={arcPoints} color="#64748b" lineWidth={2} />
                <Html position={new THREE.Vector3().copy(yDir).lerp(bDir, 0.5).normalize().multiplyScalar(arcRadius + 0.08)} center style={{ pointerEvents: 'none' }}>
                  <span className="font-serif italic font-bold text-slate-600 text-sm">θ</span>
                </Html>
              </group>
            );
        })()}

      </group>
    </Canvas>
  );
}
