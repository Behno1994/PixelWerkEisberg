"use client";

import { useRef } from "react";
import { Canvas, useFrame, type ThreeElements } from "@react-three/fiber";
import { Environment, Lightformer, Float } from "@react-three/drei";
import type { Group } from "three";

/**
 * Der Diamant als Geometrie.
 *
 * Aufgebaut aus zwei Grundkörpern – wie ein echter Brillantschliff:
 *  - Krone: abgeflachter Kegelstumpf mit acht Facetten (die „Tafel“ oben),
 *  - Pavillon: achtseitiger Kegel, der nach unten auf die Kalette zuläuft.
 *
 * `flatShading` ist entscheidend: Ohne sie interpoliert Three.js die Normalen
 * und der Stein sieht aus wie eine weiche Knolle statt wie geschliffenes Glas.
 */
function DiamondMesh(props: ThreeElements["group"]) {
  const group = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!group.current) return;

    // Langsame Eigenrotation …
    group.current.rotation.y += delta * 0.35;

    // … plus eine sanfte Neigung zum Mauszeiger.
    const { x, y } = state.pointer;
    group.current.rotation.x += (y * 0.25 - group.current.rotation.x) * 0.05;
    group.current.rotation.z += (-x * 0.15 - group.current.rotation.z) * 0.05;
  });

  return (
    <group ref={group} {...props}>
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.62, 1.1, 0.5, 8, 1]} />
        <DiamondMaterial />
      </mesh>
      <mesh position={[0, -0.35, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[1.1, 1.65, 8, 1]} />
        <DiamondMaterial />
      </mesh>
    </group>
  );
}

/**
 * Glasmaterial für den Stein.
 *
 * Bewusst `meshPhysicalMaterial` mit `transmission` statt drei's
 * `MeshTransmissionMaterial`: Letzteres rendert die Szene pro Frame in einen
 * zusätzlichen Buffer – für ein dekoratives Hero-Element im Hintergrund ist
 * das Rechenzeit ohne sichtbaren Gegenwert.
 */
function DiamondMaterial() {
  return (
    <meshPhysicalMaterial
      color="#bfeeff"
      transmission={0.94}
      thickness={1.6}
      roughness={0.06}
      metalness={0.08}
      ior={2.2}
      // Streuung an den Kanten – erzeugt den typischen Regenbogensaum.
      iridescence={0.6}
      iridescenceIOR={1.5}
      clearcoat={1}
      clearcoatRoughness={0.08}
      attenuationColor="#2fb6e0"
      attenuationDistance={2.4}
      flatShading
    />
  );
}

/**
 * 3D-Diamant für die Hero-Sektion.
 *
 * Die Umgebungsbeleuchtung wird aus `Lightformer`-Flächen selbst gebaut statt
 * über ein HDR-Preset geladen – kein externer CDN-Request, keine zusätzlichen
 * Megabyte, und die Lichtstimmung passt exakt zur Eisberg-Farbwelt.
 *
 * Wird ausschliesslich clientseitig gerendert (siehe `hero-diamond.tsx`).
 */
export default function DiamondScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5.4], fov: 42 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      // `demand`: Neu gerendert wird nur, wenn sich etwas ändert – der
      // `useFrame`-Loop oben fordert das automatisch an.
      frameloop="always"
    >
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 4]} intensity={1.6} color="#e8faff" />
      <pointLight position={[-4, -2, -3]} intensity={12} color="#22d3ee" />
      <pointLight position={[3, -3, 2]} intensity={6} color="#0e7490" />

      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.6}>
        <DiamondMesh scale={1.15} />
      </Float>

      <Environment resolution={256}>
        <Lightformer intensity={3} position={[0, 4, -2]} scale={[8, 4, 1]} color="#dff6ff" />
        <Lightformer intensity={2} position={[-4, 0, 2]} scale={[4, 8, 1]} color="#22d3ee" />
        <Lightformer intensity={1.4} position={[4, -2, 1]} scale={[4, 6, 1]} color="#0a2740" />
      </Environment>
    </Canvas>
  );
}
