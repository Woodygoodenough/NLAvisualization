"use client";

import React, { useMemo, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Html } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";

// A custom animated vector component
function AnimatedVector({ endpoint, color, label }: { endpoint: [number, number, number], color: string, label: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Group>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);

  const { end } = useSpring({
    end: endpoint,
    config: { mass: 1, tension: 120, friction: 14 }
  });

  useFrame(() => {
    if (!groupRef.current || !cylinderRef.current || !coneRef.current) return;
    const currentEnd = new THREE.Vector3(end.get()[0], end.get()[1], end.get()[2]);
    const length = currentEnd.length();

    if (textRef.current) {
      textRef.current.position.copy(currentEnd).multiplyScalar(1.1);
    }

    const up = new THREE.Vector3(0, 1, 0);

    if (length < 0.001) {
      groupRef.current.scale.set(0, 0, 0);
      return;
    }

    groupRef.current.scale.set(1, 1, 1);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, currentEnd.clone().normalize());
    groupRef.current.quaternion.copy(quaternion);

    cylinderRef.current.position.set(0, length / 2, 0);
    cylinderRef.current.scale.set(1, length, 1);

    coneRef.current.position.set(0, length, 0);
    coneRef.current.scale.set(1, 1, 1);
  });

  return (
    <group>
      <group ref={groupRef}>
        <mesh ref={cylinderRef}>
          <cylinderGeometry args={[0.0075, 0.0075, 1, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh ref={coneRef}>
          <coneGeometry args={[0.02, 0.06, 16]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
      <group ref={textRef}>
        <Html position={[0, 0, 0]} center>
          <div className="font-mono" style={{ color: color, fontSize: '1.2rem', fontWeight: 'bold', textShadow: '1px 1px 2px white, -1px -1px 2px white, 1px -1px 2px white, -1px 1px 2px white', userSelect: 'none' }}>
            {label}
          </div>
        </Html>
      </group>
    </group>
  );
}

function ReflectionPlane({ normal, visible }: { normal: [number, number, number] | null, visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { opacity, scale } = useSpring({
    opacity: visible && normal ? 0.4 : 0,
    scale: visible && normal ? 1 : 0,
    config: { mass: 1, tension: 120, friction: 14 }
  });

  useFrame(() => {
    if (!meshRef.current || !normal) return;
    const n = new THREE.Vector3(normal[0], normal[1], normal[2]).normalize();
    const up = new THREE.Vector3(0, 0, 1); // PlaneGeometry lies in XY plane, so its normal is Z
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, n);
    meshRef.current.quaternion.copy(quaternion);
  });

  return (
    <animated.mesh ref={meshRef} scale={scale}>
      <planeGeometry args={[10, 10]} />
      <animated.meshStandardMaterial
        color="#88ccff"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
      />
    </animated.mesh>
  );
}

interface Scene3DProps {
  step: number;
}

export default function Scene3D({ step }: Scene3DProps) {
  // A = [a1, a2, a3]
  const a1_0 = new THREE.Vector3(1, 1, 1);
  const a2_0 = new THREE.Vector3(1, 2, 0);
  const a3_0 = new THREE.Vector3(0, 1, 2);

  const A0 = [a1_0, a2_0, a3_0];

  // Helper for Householder reflection
  const applyHouseholder = (A: THREE.Vector3[], v: THREE.Vector3) => {
    const vNormSq = v.lengthSq();
    if (vNormSq < 1e-10) return A.map(a => a.clone());
    return A.map(a => {
      const proj = v.clone().multiplyScalar(2 * a.dot(v) / vNormSq);
      return a.clone().sub(proj);
    });
  };

  // Step 1: Householder on column 1
  const x1 = A0[0].clone();
  const e1 = new THREE.Vector3(1, 0, 0);
  const sign1 = x1.x >= 0 ? 1 : -1;
  const v1 = x1.clone().add(e1.clone().multiplyScalar(sign1 * x1.length()));
  const A1 = applyHouseholder(A0, v1);

  // Step 2: Householder on column 2 (restricted to components 2,3)
  const x2 = A1[1].clone();
  x2.x = 0; // zero out the first component
  const e2 = new THREE.Vector3(0, 1, 0);
  const sign2 = x2.y >= 0 ? 1 : -1;
  const v2 = x2.clone().add(e2.clone().multiplyScalar(sign2 * x2.length()));
  const A2 = applyHouseholder(A1, v2);

  // Determine current matrix based on step
  let currentA = A0;
  let currentV: THREE.Vector3 | null = null;
  let showPlane = false;

  if (step === 0) {
    currentA = A0;
  } else if (step === 1) {
    currentA = A0;
    currentV = v1;
    showPlane = true;
  } else if (step === 2) {
    currentA = A1;
    currentV = v1;
    showPlane = true;
  } else if (step === 3) {
    currentA = A1;
    currentV = v2;
    showPlane = true;
  } else if (step === 4) {
    currentA = A2;
    currentV = v2;
    showPlane = true;
  }

  const vArray: [number, number, number] | null = currentV ? [currentV.x, currentV.y, currentV.z] : null;

  return (
    <Canvas camera={{ position: [4, 3, 5], fov: 45 }}>
      <color attach="background" args={["#f8fafc"]} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={0.8} />

      <Grid
        args={[10, 10]}
        cellSize={1}
        cellThickness={1}
        cellColor="#e2e8f0"
        sectionSize={1}
        sectionThickness={1.5}
        sectionColor="#cbd5e1"
        fadeDistance={20}
        infiniteGrid
      />

      {/* The standard basis axes */}
      <AnimatedVector endpoint={[1, 0, 0]} color="#94a3b8" label="e1" />
      <AnimatedVector endpoint={[0, 1, 0]} color="#94a3b8" label="e2" />
      <AnimatedVector endpoint={[0, 0, 1]} color="#94a3b8" label="e3" />

      {/* The 3 column vectors of the matrix */}
      <AnimatedVector endpoint={[currentA[0].x, currentA[0].y, currentA[0].z]} color="#ef4444" label="a1" />
      <AnimatedVector endpoint={[currentA[1].x, currentA[1].y, currentA[1].z]} color="#3b82f6" label="a2" />
      <AnimatedVector endpoint={[currentA[2].x, currentA[2].y, currentA[2].z]} color="#10b981" label="a3" />

      {/* The reflection normal vector (if active) */}
      {currentV && (
        <AnimatedVector endpoint={[currentV.x, currentV.y, currentV.z]} color="#a855f7" label="v" />
      )}

      {/* The reflection plane */}
      <ReflectionPlane normal={vArray} visible={showPlane} />

      <OrbitControls makeDefault />
    </Canvas>
  );
}
