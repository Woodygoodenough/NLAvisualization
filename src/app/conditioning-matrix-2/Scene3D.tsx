"use client";

import React, { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Line, Html, Grid } from "@react-three/drei";
import * as THREE from "three";

interface Scene3DProps {
  phiRad: number;
  epsilon: number;
}

const VectorArrow = ({ start, end, color, label, showLabel = true, labelOffset = 0.05, dash = false, lineWidth = 1.5 }: { start: THREE.Vector3, end: THREE.Vector3, color: string, label: string, showLabel?: boolean, labelOffset?: number, dash?: boolean, lineWidth?: number }) => {
  const dir = end.clone().sub(start);
  const length = dir.length();

  if (length < 0.001) return null;

  dir.normalize();

  const midPoint = start.clone().lerp(end, 0.5);
  // Optional offset for label to avoid intersecting the line
  const up = new THREE.Vector3(0, 1, 0);
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

export default function Scene3D({ phiRad, epsilon }: Scene3DProps) {
  const sigma1 = 2.0;
  const sigma2 = 0.5;

  // Fixed parameters for the worst-case representative ellipse
  const deltaMinorRatio = 0.4; // Fixed 0.4 ratio to look like an ellipse

  const u1 = useMemo(() => new THREE.Vector3(1, 0, 0), []);
  const u2 = useMemo(() => new THREE.Vector3(0, 0, 1), []);

  // x in domain
  const x1 = Math.cos(phiRad);
  const x2 = Math.sin(phiRad);

  // Nominal Ax
  const ax = useMemo(() => {
    const term1 = u1.clone().multiplyScalar(sigma1 * x1);
    const term2 = u2.clone().multiplyScalar(sigma2 * x2);
    return term1.add(term2);
  }, [x1, x2, u1, u2]);

  // Local delta A ellipse
  // We tilt it out of the X-Z plane (Span(A)) to be truly general.
  const { vMaj, vMin } = useMemo(() => {
    const euler = new THREE.Euler(Math.PI / 4, Math.PI / 6, Math.PI / 12, 'XYZ');
    const maj = new THREE.Vector3(1, 0, 0).applyEuler(euler).normalize().multiplyScalar(epsilon);
    const min = new THREE.Vector3(0, 0, 1).applyEuler(euler).normalize().multiplyScalar(epsilon * deltaMinorRatio);
    return { vMaj: maj, vMin: min };
  }, [epsilon, deltaMinorRatio]);

  // delta A x
  // By design, our "worst-case" delta A aligns x with its right singular vector,
  // so delta A x is exactly the major axis vMaj.
  const deltaAx = vMaj;

  const perturbedAx = useMemo(() => ax.clone().add(deltaAx), [ax, deltaAx]);

  // Create the nominal ellipse points A(theta)
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

  // Create the local delta A ellipse centered at the origin, which we will offset to the tip of Ax.
  // delta A maps z(theta) = cos(theta - phi) vMaj + sin(theta - phi) vMin
  const deltaAEllipsePoints = useMemo(() => {
    const points = [];
    const segments = 64;
    for (let i = 0; i <= segments; i++) {
      // theta parameterizes the local ellipse from 0 to 2pi
      const theta = (i / segments) * Math.PI * 2;
      const t1 = vMaj.clone().multiplyScalar(Math.cos(theta));
      const t2 = vMin.clone().multiplyScalar(Math.sin(theta));
      points.push(t1.add(t2));
    }
    return points;
  }, [vMaj, vMin]);

  // Create the perturbed ellipse (A + delta A) centered at the origin.
  // For any angle alpha in the domain, the perturbed mapping is A(alpha) + deltaA(alpha).
  // A(alpha) = sigma1 cos(alpha) u1 + sigma2 sin(alpha) u2
  // deltaA(alpha) = cos(alpha - phi) vMaj + sin(alpha - phi) vMin
  const perturbedEllipsePoints = useMemo(() => {
    const points = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const alpha = (i / segments) * Math.PI * 2;

      const aTerm = u1.clone().multiplyScalar(sigma1 * Math.cos(alpha))
                      .add(u2.clone().multiplyScalar(sigma2 * Math.sin(alpha)));

      const deltaTerm = vMaj.clone().multiplyScalar(Math.cos(alpha - phiRad))
                          .add(vMin.clone().multiplyScalar(Math.sin(alpha - phiRad)));

      points.push(aTerm.add(deltaTerm));
    }
    return points;
  }, [sigma1, sigma2, u1, u2, vMaj, vMin, phiRad]);


  return (
    <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
      <color attach="background" args={['#f8fafc']} />

      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.2} />

      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.2} />

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

        <Html position={[u1.x * 2.5 + u2.x * 2.5, 0, u1.z * 2.5 + u2.z * 2.5]} style={{ pointerEvents: 'none' }}>
          <div className="text-xs font-mono text-sky-600 bg-white/50 px-1 rounded backdrop-blur whitespace-nowrap opacity-60">Span(A)</div>
        </Html>
      </group>

      {/* Core Geometry */}
      <group>
        <mesh>
          <sphereGeometry args={[0.03, 16, 16]} />
          <meshBasicMaterial color="#334155" />
        </mesh>

        {/* Nominal Ellipse */}
        <Line points={ellipsePoints} color="#94a3b8" lineWidth={2} />

        {/* Perturbed Ellipse (A + delta A) */}
        <group>
          <Line points={perturbedEllipsePoints} color="#facc15" lineWidth={2} dashed dashScale={10} dashSize={0.05} gapSize={0.05} />
          {/* Annotation for perturbed ellipse */}
          <Html position={perturbedEllipsePoints[0]} style={{ pointerEvents: 'none' }}>
            <div className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/80 backdrop-blur-sm border border-yellow-200 shadow-sm whitespace-nowrap text-yellow-600 translate-y-3">
              (A+δA) mapped domain
            </div>
          </Html>
        </group>

        {/* Local delta A Ellipse centered at tip of Ax */}
        <group position={ax}>
          <Line points={deltaAEllipsePoints} color="#ef4444" lineWidth={1.5} />
        </group>

        {/* Vector Ax */}
        <VectorArrow start={new THREE.Vector3(0,0,0)} end={ax} color="#10b981" label="Ax" labelOffset={0.1} />

        {/* Perturbation delta A x (Major axis of local ellipse) */}
        <VectorArrow start={ax} end={perturbedAx} color="#ef4444" label="δAx" labelOffset={0.15} />

      </group>
    </Canvas>
  );
}
