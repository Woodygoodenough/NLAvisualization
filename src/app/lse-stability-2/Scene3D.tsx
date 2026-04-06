"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html, Grid } from "@react-three/drei";
import * as THREE from "three";

interface Scene3DProps {
  thetaRad: number;
  phiRad: number;
  epsilon: number;
  deltaMinorRatio: number;
}

const VectorArrow = ({ start, end, color, label, labelOffset = 0.05, dashed = false }: { start: THREE.Vector3, end: THREE.Vector3, color: string, label: string, labelOffset?: number, dashed?: boolean }) => {
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();

  if (length < 0.001) return null;

  const normalizedDir = dir.clone().normalize();
  const hex = new THREE.Color(color).getHex();
  const labelPos = end.clone().add(normalizedDir.clone().multiplyScalar(labelOffset));

  return (
    <group>
      {dashed ? (
        <Line points={[start, end]} color={color} lineWidth={2} dashed dashScale={10} dashSize={0.05} gapSize={0.05} />
      ) : (
        <arrowHelper args={[normalizedDir, start, length, hex, Math.min(0.2, length * 0.2), Math.min(0.1, length * 0.1)]} />
      )}
      <Html position={labelPos} center style={{ pointerEvents: 'none' }}>
        <div className="font-mono text-sm font-bold px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm" style={{ color }}>
          {label}
        </div>
      </Html>
    </group>
  );
};

export default function Scene3D({ thetaRad, phiRad, epsilon, deltaMinorRatio }: Scene3DProps) {
  // A is an implicit 3x2 matrix forming the XZ plane (the grid floor)
  const u1 = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const u2 = useMemo(() => new THREE.Vector3(0, 0, 1), []);
  const u3 = useMemo(() => new THREE.Vector3(0, 1, 0), []);

  // Compute b
  // Fix b so that yhat happens to be exactly at the boundary of Span(A)
  // Since A maps the unit circle to a unit circle, yhat should have length 1
  const yLen = 1.0;
  const rLen = Math.tan(thetaRad);

  const yDir = useMemo(() => {
    return new THREE.Vector3(Math.cos(phiRad), 0, Math.sin(phiRad));
  }, [phiRad]);

  const y = useMemo(() => yDir.clone().multiplyScalar(yLen), [yDir, yLen]);

  // Residual is orthogonal to XZ plane (points up along Y axis)
  const r = useMemo(() => new THREE.Vector3(0, rLen, 0), [rLen]);
  const b = useMemo(() => y.clone().add(r), [y, r]);

  // Define basis for A_nom (mapping the standard 2D basis e1, e2 into 3D)
  // Let a1 be yDir (the direction of y), and a2 be orthogonal to it in the XZ plane.
  // This means A_nom maps the domain unit circle to the XZ unit circle, with (1,0) mapping to yDir.
  const a1 = useMemo(() => new THREE.Vector3(Math.cos(phiRad), 0, Math.sin(phiRad)), [phiRad]);
  const a2 = useMemo(() => new THREE.Vector3(-Math.sin(phiRad), 0, Math.cos(phiRad)), [phiRad]);

  // Define basis for deltaA
  // deltaA maps (1,0) (which is the direction producing yDir) to the residual direction (Y axis), scaled by epsilon.
  // deltaA maps (0,1) to an orthogonal direction in the XZ plane (a2), scaled by epsilon * deltaMinorRatio.
  const d1 = useMemo(() => new THREE.Vector3(0, epsilon, 0), [epsilon]);
  const d2 = useMemo(() => a2.clone().multiplyScalar(epsilon * deltaMinorRatio), [a2, epsilon, deltaMinorRatio]);

  // Define perturbed basis A_pert = A_nom + deltaA
  const ap1 = useMemo(() => a1.clone().add(d1), [a1, d1]);
  const ap2 = useMemo(() => a2.clone().add(d2), [a2, d2]);

  // Delta A mapped circle points
  const deltaACircle = useMemo(() => {
    const pts = [];
    for(let i=0; i<=64; i++) {
      const a = (i/64) * Math.PI * 2;
      // Evaluate deltaA(alpha) = cos(a)*d1 + sin(a)*d2
      pts.push(d1.clone().multiplyScalar(Math.cos(a)).add(d2.clone().multiplyScalar(Math.sin(a))));
    }
    return pts;
  }, [d1, d2]);

  // Perturbed A mapped circle (Span(A + deltaA))
  const { perturbedPlanePoints, perturbedPlaneIndices, perturbedPlaneVertices } = useMemo(() => {
    const pts = [];
    // For solid mesh (triangle fan): center at origin, plus perimeter points
    const verts = [0, 0, 0];
    const indices = [];

    for(let i=0; i<=64; i++) {
      const a = (i/64) * Math.PI * 2;
      // Evaluate A_pert(alpha) = cos(a)*ap1 + sin(a)*ap2
      const p = ap1.clone().multiplyScalar(Math.cos(a)).add(ap2.clone().multiplyScalar(Math.sin(a)));
      pts.push(p);
      verts.push(p.x, p.y, p.z);
    }

    // Create indices for triangle fan
    for (let i = 1; i <= 64; i++) {
      indices.push(0, i, i + 1);
    }

    return {
      perturbedPlanePoints: pts,
      perturbedPlaneVertices: new Float32Array(verts),
      perturbedPlaneIndices: new Uint16Array(indices)
    };
  }, [ap1, ap2]);

  // Calculate y_pert (projection of b onto Span(A + deltaA))
  const y_pert = useMemo(() => {
    // Project b onto span(ap1, ap2)
    // normal vector n = ap1 x ap2
    const n = new THREE.Vector3().crossVectors(ap1, ap2).normalize();

    // y_pert = b - (b dot n) n
    const b_dot_n = b.dot(n);
    return b.clone().sub(n.multiplyScalar(b_dot_n));
  }, [ap1, ap2, b]);


  return (
    <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

      <Grid args={[10, 10]} cellSize={1} cellThickness={1} cellColor="#e2e8f0" sectionSize={1} sectionThickness={1.5} sectionColor="#cbd5e1" fadeDistance={20} infiniteGrid />

      <group>
        {/* Unperturbed Span(A) Circle */}
        <Line points={useMemo(() => {
            const pts = [];
            for(let i=0; i<=64; i++){
                const a = i/64*Math.PI*2;
                pts.push(new THREE.Vector3(Math.cos(a), 0, Math.sin(a)));
            }
            return pts;
        }, [])} color="#94a3b8" lineWidth={2} />

        {/* Perturbed Span(A+deltaA) Ellipse */}
        <mesh>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={perturbedPlaneVertices.length / 3}
              array={perturbedPlaneVertices}
              itemSize={3}
              args={[perturbedPlaneVertices, 3]}
            />
            <bufferAttribute
              attach="index"
              count={perturbedPlaneIndices.length}
              array={perturbedPlaneIndices}
              itemSize={1}
              args={[perturbedPlaneIndices, 1]}
            />
          </bufferGeometry>
          <meshBasicMaterial color="#facc15" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        <Line points={perturbedPlanePoints} color="#ca8a04" lineWidth={2} dashed dashScale={10} dashSize={0.1} gapSize={0.05} />

        {/* Local delta A ellipse at tip of y */}
        <group position={y}>
          <Line points={deltaACircle} color="#ef4444" lineWidth={1.5} dashed dashScale={10} dashSize={0.05} gapSize={0.05} />
          {deltaMinorRatio === 0 && (
            <Html position={new THREE.Vector3(epsilon * 0.5, -0.2, 0)} center style={{ pointerEvents: 'none' }}>
              <div className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm border border-red-200 shadow-sm whitespace-nowrap text-red-600">
                Rank-1 Perturbation
              </div>
            </Html>
          )}
        </group>

        {/* Vectors */}
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={b} color="#3b82f6" label="b" />
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={y} color="#10b981" label="ŷ" />
        <VectorArrow start={y} end={b} color="#64748b" label="r" />

        {/* y_pert */}
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={y_pert} color="#eab308" label="ŷ'" />

        {/* delta y */}
        <VectorArrow start={y} end={y_pert} color="#ef4444" label="δŷ" />

      </group>

      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />
    </Canvas>
  );
}
