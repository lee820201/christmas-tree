import { useState, useRef, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Loader } from '@react-three/drei';
import { Experience } from './components/Experience';
import { SoundManager, SoundManagerRef } from './components/SoundManager';
import { UI } from './components/UI';
import * as THREE from 'three';

export default function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [isTreeMode, setTreeMode] = useState(false);
  const soundRef = useRef<SoundManagerRef>(null);

  const handleStart = () => {
    // 显式唤醒 Three.js 的音频上下文，解决 iOS/Safari 卡死问题
    const audioContext = THREE.AudioContext.getContext();
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }
    setHasStarted(true);
    // 延迟一点自动聚合
    setTimeout(() => {
      setTreeMode(true);
      soundRef.current?.playMorphSound(true);
    }, 800);
  };

  const handleToggle = () => {
    const nextState = !isTreeMode;
    setTreeMode(nextState);
    soundRef.current?.playMorphSound(nextState);
  };

  return (
    <>
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: false }}>
        <SoundManager ref={soundRef} ready={hasStarted} />
        <Suspense fallback={null}>
          <Experience isTreeMode={isTreeMode} soundRef={soundRef} />
        </Suspense>
      </Canvas>

      <UI
        hasStarted={hasStarted}
        isTreeMode={isTreeMode}
        onStart={handleStart}
        onToggle={handleToggle}
      />

      <Loader
        containerStyles={{ background: '#000502' }}
        barStyles={{ background: '#D4AF37', height: '2px' }}
        dataStyles={{ color: '#D4AF37', fontFamily: 'serif' }}
      />
    </>
  );
}