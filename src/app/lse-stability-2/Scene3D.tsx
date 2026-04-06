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
  // A is an implicit 3x2 matrix forming the XY plane
  const u1 = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const u2 = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const u3 = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  // Compute b
  // y is in the XY plane
  const yLen = Math.cos(thetaRad);
  const rLen = Math.sin(thetaRad);

  const yDir = useMemo(() => {
    return new THREE.Vector3(Math.cos(phiRad), Math.sin(phiRad), 0);
  }, [phiRad]);

  const y = useMemo(() => yDir.clone().multiplyScalar(yLen), [yDir, yLen]);

  // Residual is orthogonal to XY plane
  const r = useMemo(() => new THREE.Vector3(0, 0, rLen), [rLen]);
  const b = useMemo(() => y.clone().add(r), [y, r]);

  // Construct delta A
  // We want the long axis of delta A to align with the residual r.
  // The domain is the standard 2D circle. Let's map it such that a specific domain vector
  // corresponding to x (where Ax = y) maps to epsilon * (r / ||r||).
  // Actually, we visualize the column space. A maps to the XY circle.
  // delta A maps to an ellipse whose major axis is parallel to Z (r), length epsilon.
  // Minor axis is some vector in XY plane, length epsilon * deltaMinorRatio.

  const vMaj = useMemo(() => new THREE.Vector3(0, 0, 1).multiplyScalar(epsilon), [epsilon]);
  const vMin = useMemo(() => new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0,0,1), phiRad + Math.PI/2).multiplyScalar(epsilon * deltaMinorRatio), [epsilon, deltaMinorRatio, phiRad]);

  // Delta A mapped circle points
  const deltaACircle = useMemo(() => {
    const pts = [];
    for(let i=0; i<=64; i++) {
      const a = (i/64) * Math.PI * 2;
      pts.push(vMaj.clone().multiplyScalar(Math.cos(a)).add(vMin.clone().multiplyScalar(Math.sin(a))));
    }
    return pts;
  }, [vMaj, vMin]);

  // Perturbed A mapped circle (Span(A + deltaA))
  // A maps to (cos a, sin a, 0).
  const { perturbedPlanePoints, perturbedPlaneIndices, perturbedPlaneVertices } = useMemo(() => {
    const pts = [];
    // For solid mesh (triangle fan): center at origin, plus perimeter points
    const verts = [0, 0, 0];
    const indices = [];

    for(let i=0; i<=64; i++) {
      const a = (i/64) * Math.PI * 2;
      const base = new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
      const diff = vMaj.clone().multiplyScalar(Math.cos(a)).add(vMin.clone().multiplyScalar(Math.sin(a)));
      const p = base.add(diff);
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
  }, [vMaj, vMin]);

  // Calculate y_pert (projection of b onto Span(A + deltaA))
  // We have the basis for the perturbed plane:
  // e1_pert = [1, 0, epsilon]
  // e2_pert = [0, 1, 0] (actually rotated by phi and scaled by deltaMinorRatio)
  // Let's compute it rigorously.
  // Let A_nom = [cos(phi) -sin(phi); sin(phi) cos(phi); 0 0]  (so first col is yDir, second is orthogonal)
  // delta A = [0 0; 0 0; epsilon  epsilon*deltaMinorRatio] (in the rotated basis)

  const y_pert = useMemo(() => {
    const c = Math.cos(phiRad);
    const s = Math.sin(phiRad);

    // Construct 3x2 matrix A_pert
    // Col 1 = A_nom_c1 + deltaA_c1 = [c, s, 0] + [0, 0, epsilon] = [c, s, epsilon]
    // Col 2 = A_nom_c2 + deltaA_c2 = [-s, c, 0] + [0, 0, epsilon*minorRatio] (wait, vMin is along -s, c... let's just use explicit vectors)

    // A_nom basis
    const a1 = new THREE.Vector3(c, s, 0);
    const a2 = new THREE.Vector3(-s, c, 0);

    // deltaA basis
    // We want major axis (epsilon*u3) to be hit by domain vector [1, 0].
    // Minor axis (epsilon*minor*a2) to be hit by domain vector [0, 1].
    const d1 = new THREE.Vector3(0, 0, epsilon);
    const d2 = a2.clone().multiplyScalar(epsilon * deltaMinorRatio);

    const ap1 = a1.clone().add(d1);
    const ap2 = a2.clone().add(d2);

    // Project b onto span(ap1, ap2)
    // normal vector n = ap1 x ap2
    const n = new THREE.Vector3().crossVectors(ap1, ap2).normalize();

    // y_pert = b - (b dot n) n
    const b_dot_n = b.dot(n);
    return b.clone().sub(n.multiplyScalar(b_dot_n));
  }, [phiRad, epsilon, deltaMinorRatio, b]);


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
                pts.push(new THREE.Vector3(Math.cos(a), Math.sin(a), 0));
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
