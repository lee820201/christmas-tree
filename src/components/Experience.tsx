import { Environment, OrbitControls, PerspectiveCamera, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Noise, Vignette } from '@react-three/postprocessing';
import { LuxuryElements } from './LuxuryElements';
import { SoundManagerRef } from './SoundManager';
import React from 'react';

export function Experience({ isTreeMode, soundRef }: { isTreeMode: boolean, soundRef: React.RefObject<SoundManagerRef | null> }) {
  // 🔥 新增：检测是否为移动设备
  // 如果是手机/平板，返回 true
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 20]} fov={45} />

      <OrbitControls
        enablePan={false}
        target={[0, -1, 0]}
        maxPolarAngle={Math.PI / 1.9}
        minPolarAngle={Math.PI / 3}
        autoRotate
        autoRotateSpeed={0.8}
      />

      {/* --- 灯光调整：更深邃，对比度更高 --- */}
      {/* 降低环境光，让暗部更暗 */}
      <Environment preset="city" environmentIntensity={0.8} />
      {/* 大幅降低底光，制造层次感 */}
      <ambientLight intensity={0.3} color="#0a2a1a" />

      <spotLight
        position={[10, 15, 10]}
        angle={0.2}
        penumbra={0.5}
        intensity={250}
        castShadow
        shadow-bias={-0.0001}
        color="#FFD700"
      />

      <pointLight position={[-5, -2, -5]} intensity={60} color="#00FF44" distance={20} />

      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.1}>
        <group position={[0, 0, 0]}>
          <LuxuryElements isTreeMode={isTreeMode} soundRef={soundRef} />
        </group>
      </Float>

      {/* 🔥 性能优化：仅在非移动端（电脑）开启后期特效 */}
      {/* 手机 GPU 通常无法承受 Bloom 和 Noise 的叠加，容易导致黑屏或闪退 */}
      {!isMobile && (
        <EffectComposer disableNormalPass>
          {/* 🔻 辉光极致克制：只允许极亮的高光点产生微弱光晕 */}
          <Bloom
            luminanceThreshold={1.5} // 阈值极高，普通材质不再发光
            luminanceSmoothing={0.1}
            mipmapBlur
            intensity={0.4} // 强度极低
            radius={0.5}
          />
          <Noise opacity={0.05} />
          <Vignette eskil={false} offset={0.05} darkness={1.3} />
        </EffectComposer>
      )}
    </>
  );
}