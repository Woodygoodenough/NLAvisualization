"use client";

import React, { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid, Html } from "@react-three/drei";
import * as THREE from "three";
import { useSpring, animated } from "@react-spring/three";

function AnimatedVector({ endpoint, color, label }: { endpoint: [number, number, number], color: string, label: string }) {
  const groupRef = useRef<THREE.Group>(null);
  const textRef = useRef<THREE.Group>(null);
  const cylinderRef = useRef<THREE.Mesh>(null);
  const coneRef = useRef<THREE.Mesh>(null);

  const { end } = useSpring({
    end: endpoint,
    config: { mass: 1, tension: 30, friction: 14 }
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

function RotationPlane({ i, j, visible }: { i: number, j: number, visible: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);

  const { opacity, scale } = useSpring({
    opacity: visible ? 0.3 : 0,
    scale: visible ? 1 : 0,
    config: { mass: 1, tension: 120, friction: 14 }
  });

  useFrame(() => {
    if (!meshRef.current) return;

    // Plane is between axes i and j
    // i, j are 0, 1, 2 for x, y, z
    const axes = [new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,1)];
    const v1 = axes[i];
    const v2 = axes[j];

    // Normal to the rotation plane
    const n = new THREE.Vector3().crossVectors(v1, v2).normalize();
    const up = new THREE.Vector3(0, 0, 1);
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, n);
    meshRef.current.quaternion.copy(quaternion);
  });

  return (
    <animated.mesh ref={meshRef} scale={scale}>
      <planeGeometry args={[8, 8]} />
      <animated.meshStandardMaterial
        color="#fbbf24"
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
  const a1_0 = new THREE.Vector3(1, 1, 1);
  const a2_0 = new THREE.Vector3(1, 2, 0);
  const a3_0 = new THREE.Vector3(0, 1, 2);

  const A0 = [a1_0, a2_0, a3_0];

  // Helper to apply Givens rotation to a matrix
  const applyGivens = (A: THREE.Vector3[], i: number, j: number, theta: number) => {
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    return A.map(a => {
      const arr = [a.x, a.y, a.z];
      const vi = arr[i];
      const vj = arr[j];

      arr[i] = c * vi - s * vj;
      arr[j] = s * vi + c * vj;

      return new THREE.Vector3(arr[0], arr[1], arr[2]);
    });
  };

  // Determine the rotation angle to zero out the j-th element of a vector using the i-th and j-th elements.
  const getGivensAngle = (x_i: number, x_j: number) => {
    if (x_j === 0) return 0;
    const r = Math.hypot(x_i, x_j);
    const c = x_i / r;
    const s = -x_j / r;
    return Math.atan2(s, c);
  };

  // Step 2: Zero out a31 using rotation in (0,2) plane (bottom-up)
  const theta1 = getGivensAngle(A0[0].x, A0[0].z);
  const A1 = applyGivens(A0, 0, 2, theta1);

  // Step 4: Zero out a21 using rotation in (0,1) plane
  const theta2 = getGivensAngle(A1[0].x, A1[0].y);
  const A2 = applyGivens(A1, 0, 1, theta2);

  // Step 6: Zero out a32 using rotation in (1,2) plane
  const theta3 = getGivensAngle(A2[1].y, A2[1].z);
  const A3 = applyGivens(A2, 1, 2, theta3);

  let currentA = A0;
  let activePlane: [number, number] | null = null;
  let showPlane = false;

  if (step === 0) {
    currentA = A0;
  } else if (step === 1) {
    currentA = A0;
    activePlane = [0, 2];
    showPlane = true;
  } else if (step === 2) {
    currentA = A1;
    activePlane = [0, 2];
    showPlane = true;
  } else if (step === 3) {
    currentA = A1;
    activePlane = [0, 1];
    showPlane = true;
  } else if (step === 4) {
    currentA = A2;
    activePlane = [0, 1];
    showPlane = true;
  } else if (step === 5) {
    currentA = A2;
    activePlane = [1, 2];
    showPlane = true;
  } else if (step === 6) {
    currentA = A3;
    activePlane = [1, 2];
    showPlane = true;
  }

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

      <AnimatedVector endpoint={[currentA[0].x, currentA[0].y, currentA[0].z]} color="#ef4444" label="a1" />
      <AnimatedVector endpoint={[currentA[1].x, currentA[1].y, currentA[1].z]} color="#3b82f6" label="a2" />
      <AnimatedVector endpoint={[currentA[2].x, currentA[2].y, currentA[2].z]} color="#10b981" label="a3" />

      {activePlane && (
        <RotationPlane i={activePlane[0]} j={activePlane[1]} visible={showPlane} />
      )}

      <OrbitControls makeDefault />
    </Canvas>
  );
}
