import os
import re

files = [
    'src/app/four-qrs/householder/Scene3D.tsx',
    'src/app/four-qrs/givens/Scene3D.tsx'
]

replacement = """function AnimatedVector({ endpoint, color, label }: { endpoint: [number, number, number], color: string, label: string }) {
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
}"""

# Use regex to replace the old AnimatedVector function
for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the AnimatedVector function block using simple matching
    start_idx = content.find("function AnimatedVector")
    end_idx = content.find("function", start_idx + 1)
    if end_idx == -1: # givens RotationPlane is next, let's find that
        if "ReflectionPlane" in content:
            end_idx = content.find("// Plane visualizer for the reflection plane")
        else:
            end_idx = content.find("// Plane visualizer for the rotation plane")


    if start_idx != -1 and end_idx != -1:
        new_content = content[:start_idx] + replacement + "\n\n" + content[end_idx:]
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")
    else:
        print(f"Could not find block in {filepath}")
