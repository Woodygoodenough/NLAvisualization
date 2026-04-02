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

  return (
    <group>
      <arrowHelper args={[dir, start, length, color, Math.min(length * 0.2, 0.1), Math.min(length * 0.2, 0.1) * 0.5]} />
      {showLabel && (
        <Html position={end.clone().add(dir.clone().multiplyScalar(0.1))} center style={{ pointerEvents: 'none' }}>
          <div className="font-mono text-xs font-bold px-1 py-0.5 rounded bg-white/70 backdrop-blur-sm border border-white/40 shadow-sm" style={{ color, textShadow: '0 0 2px white' }}>
            {label}
          </div>
        </Html>
      )}
    </group>
  );
};

// Custom Right Angle Marker component
const RightAngleMarker = ({ start, dir1, dir2, size = 0.1, color = "#94a3b8" }: { start: THREE.Vector3, dir1: THREE.Vector3, dir2: THREE.Vector3, size?: number, color?: string }) => {
  // We draw a small L shape from `start` spanning along `dir1` and `dir2`
  const p1 = start.clone().add(dir1.clone().normalize().multiplyScalar(size));
  const p2 = start.clone().add(dir2.clone().normalize().multiplyScalar(size));
  const corner = p1.clone().add(p2.clone().sub(start));

  return (
    <Line
      points={[p1, corner, p2]}
      color={color}
      lineWidth={1.5}
      dashed={false}
    />
  );
};

export default function Scene3D({ thetaRad, phiRad }: Scene3DProps) {
  // Define geometric entities
  const bLength = 1.0;
  const yLength = Math.cos(thetaRad);
  const projDist = Math.sin(thetaRad); // distance from tip of b to tip of y

  // The plane defined by A is the XZ plane for simplicity (y=0 in 3D coords, or z=0 if we use standard XY plane)
  // Let's use the XZ plane as the subspace of A so the projection is straight down/up relative to Y axis.

  // y vector (in the XZ plane)
  const yX = yLength * Math.cos(phiRad);
  const yZ = yLength * Math.sin(phiRad);
  const y = useMemo(() => new THREE.Vector3(yX, 0, yZ), [yX, yZ]);

  // b vector
  // Starts at origin. Projection onto XZ plane is y.
  // The orthogonal component is along the Y axis.
  // Length of orthogonal component = projDist = sin(theta)
  const b = useMemo(() => new THREE.Vector3(yX, projDist, yZ), [yX, projDist, yZ]);

  // Delta vectors for perturbations
  // For clarity, let's create a small perturbation delta_b in 3D
  // and show how it projects to delta_y in the plane.
  const deltaFactor = 0.15; // length of delta_b

  // We want delta_b to be orthogonal to b, pointing mostly "up" to show max perturbation
  const bDir = b.clone().normalize();
  // Find a vector orthogonal to b (let's use cross product with X axis, fallback to Z)
  let ortho = new THREE.Vector3(1, 0, 0).cross(bDir);
  if (ortho.lengthSq() < 0.01) ortho = new THREE.Vector3(0, 0, 1).cross(bDir);
  ortho.normalize();

  // To make it clear that a small delta_b can cause a large relative delta_y when theta is large,
  // we point delta_b mostly along the projection line (vertical/Y-axis) but strictly orthogonal to b.
  // The direction of maximal amplification is when delta_b is in the plane spanned by b and y.
  const yDir = y.lengthSq() > 0.001 ? y.clone().normalize() : new THREE.Vector3(1, 0, 0);
  const planeNormal = bDir.clone().cross(yDir).normalize();
  let maxPerturbDir = bDir.clone().cross(planeNormal).normalize();

  // Ensure maxPerturbDir points "away" from origin in Y
  if (maxPerturbDir.y < 0) maxPerturbDir.negate();

  const deltaB = maxPerturbDir.multiplyScalar(deltaFactor);

  const b_perturbed = b.clone().add(deltaB);
  // delta_y is the projection of delta_b onto the XZ plane
  const deltaY = new THREE.Vector3(deltaB.x, 0, deltaB.z);
  const y_perturbed = y.clone().add(deltaY);

  // Directions for right angle marker at tip of y
  const dirFromYtoB = new THREE.Vector3(0, 1, 0); // Straight up
  const dirFromYtoOrigin = y.clone().negate();

  return (
    <Canvas camera={{ position: [2, 1.5, 2], fov: 45 }}>
      <color attach="background" args={['#f8fafc']} />

      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.2} />

      {/* Orbit Controls */}
      <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2 + 0.2} enablePan={false} />

      {/* Grid and Subspace Plane */}
      <group>
        <Grid
          infiniteGrid
          fadeDistance={10}
          sectionColor="#cbd5e1"
          cellColor="#e2e8f0"
          cellSize={0.5}
          sectionSize={1}
        />
        <Plane args={[10, 10]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.3} side={THREE.DoubleSide} depthWrite={false} />
        </Plane>

        {/* Subspace label */}
        <Html position={[1.5, 0, -1.5]} style={{ pointerEvents: 'none' }}>
          <div className="text-xs font-mono text-sky-600 bg-white/50 px-1 rounded backdrop-blur whitespace-nowrap opacity-60">Span(A)</div>
        </Html>
      </group>

      {/* Core Geometry */}
      <Center>
        <group>
          {/* Origin marker */}
          <mesh>
            <sphereGeometry args={[0.02, 16, 16]} />
            <meshBasicMaterial color="#334155" />
          </mesh>

          {/* b vector */}
          <VectorArrow start={new THREE.Vector3(0,0,0)} end={b} color="#3b82f6" label="b" />

          {/* y vector (projection) */}
          <VectorArrow start={new THREE.Vector3(0,0,0)} end={y} color="#10b981" label="y = b*" />

          {/* Orthogonal projection segment */}
          <Line
            points={[b, y]}
            color="#94a3b8"
            lineWidth={1.5}
            dashed
            dashScale={10}
            dashSize={0.1}
          />

          {/* Right Angle Marker */}
          {y.lengthSq() > 0.01 && (
            <RightAngleMarker start={y} dir1={dirFromYtoB} dir2={dirFromYtoOrigin} />
          )}

          {/* Theta Arc (simplified as a small line segment or arc from b to y) */}
          {/* We'll draw an arc near the origin between yDir and bDir */}
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
          {/* Render them slightly transparent and thinner */}
          <group>
            {/* delta_b vector starting at tip of b */}
            <VectorArrow start={b} end={b_perturbed} color="#ef4444" label="δb" />

            {/* delta_y vector starting at tip of y */}
            <VectorArrow start={y} end={y_perturbed} color="#f59e0b" label="δy" />

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
      </Center>
    </Canvas>
  );
}
