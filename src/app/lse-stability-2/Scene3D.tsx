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

  // Define A_nom dimensions: major axis = 2 (along X), minor axis = 1 (along Z)
  const sigma1 = 2.0;
  const sigma2 = 1.0;

  // Compute b
  // Fix b so that yhat happens to be exactly at the boundary of Span(A)
  // Since A maps the unit circle to an ellipse in the XZ plane, yhat's length depends on its angle phi
  // Equation of ellipse: (x/2)^2 + (z/1)^2 = 1.
  // With x = yLen * cos(phi) and z = yLen * sin(phi):
  // yLen^2 * (cos^2(phi)/4 + sin^2(phi)) = 1 => yLen = 1 / sqrt(cos^2(phi)/4 + sin^2(phi))
  const yLen = useMemo(() => {
    const c = Math.cos(phiRad);
    const s = Math.sin(phiRad);
    return 1.0 / Math.sqrt((c * c) / (sigma1 * sigma1) + (s * s) / (sigma2 * sigma2));
  }, [phiRad]);

  const rLen = yLen * Math.tan(thetaRad);

  const yDir = useMemo(() => {
    return new THREE.Vector3(Math.cos(phiRad), 0, Math.sin(phiRad));
  }, [phiRad]);

  const y = useMemo(() => yDir.clone().multiplyScalar(yLen), [yDir, yLen]);

  // Residual is orthogonal to XZ plane (points up along Y axis)
  const r = useMemo(() => new THREE.Vector3(0, rLen, 0), [rLen]);
  const b = useMemo(() => y.clone().add(r), [y, r]);

  // Find the domain angle alpha that maps to y
  // A_nom(alpha) = (sigma1 * cos(alpha), 0, sigma2 * sin(alpha)) = (y.x, 0, y.z)
  // cos(alpha) = y.x / sigma1, sin(alpha) = y.z / sigma2
  const alpha = useMemo(() => Math.atan2(y.z / sigma2, y.x / sigma1), [y, sigma1, sigma2]);

  // Define basis for A_nom based on the domain vector mapping to y
  // Let a1 be the image of the domain vector (cos(alpha), sin(alpha)), which equals y.
  // Let a2 be the image of the orthogonal domain vector (-sin(alpha), cos(alpha)).
  const a1 = useMemo(() => new THREE.Vector3(sigma1 * Math.cos(alpha), 0, sigma2 * Math.sin(alpha)), [alpha, sigma1, sigma2]);
  const a2 = useMemo(() => new THREE.Vector3(-sigma1 * Math.sin(alpha), 0, sigma2 * Math.cos(alpha)), [alpha, sigma1, sigma2]);

  // Define basis for deltaA
  // deltaA maps the domain vector producing y to the residual direction (Y axis), scaled by epsilon.
  // deltaA maps the orthogonal domain vector to a2, scaled by epsilon * deltaMinorRatio.
  // (We normalize a2 for scaling the minor axis of delta A to keep it proportional to epsilon)
  const d1 = useMemo(() => new THREE.Vector3(0, epsilon, 0), [epsilon]);
  const d2 = useMemo(() => a2.clone().normalize().multiplyScalar(epsilon * deltaMinorRatio), [a2, epsilon, deltaMinorRatio]);

  // Define perturbed basis A_pert = A_nom + deltaA
  const ap1 = useMemo(() => a1.clone().add(d1), [a1, d1]);
  const ap2 = useMemo(() => a2.clone().add(d2), [a2, d2]);

  // Delta A mapped circle points
  const deltaACircle = useMemo(() => {
    const pts = [];
    for(let i=0; i<=64; i++) {
      const a = (i/64) * Math.PI * 2;
      // Evaluate deltaA relative to alpha
      pts.push(d1.clone().multiplyScalar(Math.cos(a)).add(d2.clone().multiplyScalar(Math.sin(a))));
    }
    return pts;
  }, [d1, d2]);

  // Perturbed A mapped circle (Span(A + deltaA))
  const { perturbedPlanePoints, perturbedPlaneIndices, perturbedPlaneVertices } = useMemo(() => {
    const pts = [];
    const verts = [0, 0, 0];
    const indices = [];

    for(let i=0; i<=64; i++) {
      const a = (i/64) * Math.PI * 2;
      // We map the standard domain circle [cos(a), sin(a)]
      // The basis ap1 corresponds to domain [cos(alpha), sin(alpha)]
      // The basis ap2 corresponds to domain [-sin(alpha), cos(alpha)]
      // So domain [cos(a), sin(a)] can be written as cos(a-alpha) * e1' + sin(a-alpha) * e2'
      const relativeAngle = a - alpha;
      const p = ap1.clone().multiplyScalar(Math.cos(relativeAngle)).add(ap2.clone().multiplyScalar(Math.sin(relativeAngle)));
      pts.push(p);
      verts.push(p.x, p.y, p.z);
    }

    for (let i = 1; i <= 64; i++) {
      indices.push(0, i, i + 1);
    }

    return {
      perturbedPlanePoints: pts,
      perturbedPlaneVertices: new Float32Array(verts),
      perturbedPlaneIndices: new Uint16Array(indices)
    };
  }, [ap1, ap2, alpha]);

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
        {/* Unperturbed Span(A) Ellipse */}
        <Line points={useMemo(() => {
            const pts = [];
            for(let i=0; i<=64; i++){
                const a = i/64*Math.PI*2;
                pts.push(new THREE.Vector3(2.0 * Math.cos(a), 0, 1.0 * Math.sin(a)));
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
