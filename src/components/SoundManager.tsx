import * as THREE from 'three';
import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useThree } from '@react-three/fiber';

export interface SoundManagerRef {
    playMorphSound: (isAssemble: boolean) => void;
    getAnalyzer: () => THREE.AudioAnalyser | null;
}

export const SoundManager = forwardRef<SoundManagerRef, { ready: boolean }>(({ ready }, ref) => {
    const { camera } = useThree();
    const [listener] = useState(() => new THREE.AudioListener());
    const bgmRef = useRef<THREE.Audio>(null!);
    const sfxRef = useRef<THREE.Audio>(null!);
    const analyzerRef = useRef<THREE.AudioAnalyser>(null!);

    useImperativeHandle(ref, () => ({
        getAnalyzer: () => analyzerRef.current,
        playMorphSound: (isAssemble: boolean) => {
            if (sfxRef.current && sfxRef.current.buffer) {
                if (sfxRef.current.isPlaying) sfxRef.current.stop();
                sfxRef.current.setPlaybackRate(isAssemble ? 1.0 : 0.8);
                sfxRef.current.play();
            }
        }
    }));

    useEffect(() => {
        camera.add(listener);
        const bgmSound = new THREE.Audio(listener);
        const sfxSound = new THREE.Audio(listener);
        bgmRef.current = bgmSound;
        sfxRef.current = sfxSound;

        const audioLoader = new THREE.AudioLoader();

        // 加载音频 (请确保文件存在)
        audioLoader.load('/sounds/bgm.mp3', (buffer) => {
            bgmSound.setBuffer(buffer);
            bgmSound.setLoop(true);
            bgmSound.setVolume(0.4);
            analyzerRef.current = new THREE.AudioAnalyser(bgmSound, 32);
        });

        audioLoader.load('/sounds/morph.mp3', (buffer) => {
            sfxSound.setBuffer(buffer);
            sfxSound.setLoop(false);
            sfxSound.setVolume(0.6);
        });

        return () => {
            camera.remove(listener);
            // 清理音频上下文
            if (bgmSound.isPlaying) bgmSound.stop();
        };
    }, [camera, listener]);

    // 用户交互后开始播放
    useEffect(() => {
        if (ready && bgmRef.current && bgmRef.current.buffer && !bgmRef.current.isPlaying) {
            bgmRef.current.play();
        }
    }, [ready]);

    return null;
});