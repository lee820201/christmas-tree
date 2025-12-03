import * as THREE from 'three';
import { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { easing } from 'maath';
import { SoundManagerRef } from './SoundManager';

// --- 配置项 ---
const MAIN_COUNT = 1500;
const ATMOSPHERE_COUNT = 5000;
const TREE_RADIUS_BASE = 4.0;
const TREE_HEIGHT = 11;
const RADIUS = 15;

// --- 🎨 色彩调整：更暖、更醇厚 ---
const COLOR_PALETTE = {
    // 绿色：去除蓝色调，加入一点点黄色调，变成深邃温暖的森林绿/极品祖母绿
    emeraldBase: new THREE.Color('#10A535'),
    emeraldEmissive: new THREE.Color('#052205'),

    // 金色：去除柠檬黄，改为偏橙的琥珀金，更富贵
    goldBase: new THREE.Color('#FFB300'),
    goldEmissive: new THREE.Color('#442200'),

    atmosphere: new THREE.Color('#88AA99'),
};

// --- 工具函数 ---
function createStarGeometry(innerRadius: number, outerRadius: number, thickness: number) {
    const shape = new THREE.Shape();
    const numPoints = 5;
    for (let i = 0; i < numPoints * 2; i++) {
        // 保持星星尖角朝上
        const angle = (i * Math.PI) / numPoints + Math.PI / 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        if (i === 0) shape.moveTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        else shape.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 3 });
}

// --- 子网格通用逻辑 ---
function FilteredInstancedMesh({
    geometry, material, fullData, shapeIndex, t, isTreeMode, soundRef, groupRotationY, time, isAtmosphere = false
}: any) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const subsetIndices = useMemo(() => {
        const indices = [];
        for (let i = 0; i < fullData.count; i++) {
            if (fullData.geomIndices[i] === shapeIndex) indices.push(i);
        }
        return indices;
    }, [fullData, shapeIndex]);

    const count = subsetIndices.length;

    useFrame(() => {
        if (!meshRef.current) return;
        let localAudioScale = 1.0;
        const audioInfluence = isAtmosphere ? 0.2 : 0.5;
        if (isTreeMode && soundRef?.current) {
            const analyzer = soundRef.current.getAnalyzer();
            if (analyzer) localAudioScale = 1 + (analyzer.getAverageFrequency() / 255) * audioInfluence;
        }

        for (let i = 0; i < count; i++) {
            const dataIndex = subsetIndices[i];
            const ix = dataIndex * 3;

            let treeTargetX = fullData.treePos[ix];
            let treeTargetY = fullData.treePos[ix + 1];
            let treeTargetZ = fullData.treePos[ix + 2];
            if (isAtmosphere) {
                treeTargetX += Math.sin(time * 0.5 + dataIndex) * 0.5;
                treeTargetY += Math.cos(time * 0.3 + dataIndex) * 0.5;
                treeTargetZ += Math.sin(time * 0.7 + dataIndex) * 0.5;
            }

            dummy.position.set(
                THREE.MathUtils.lerp(fullData.scatterPos[ix], treeTargetX, t),
                THREE.MathUtils.lerp(fullData.scatterPos[ix + 1], treeTargetY, t),
                THREE.MathUtils.lerp(fullData.scatterPos[ix + 2], treeTargetZ, t)
            );

            const rotSpeed = isAtmosphere ? 0.5 : 0.1;
            const rotTree = dataIndex * 0.1 + time * rotSpeed;
            const rotScatter = dataIndex + time * (rotSpeed * 2);
            dummy.rotation.set(
                THREE.MathUtils.lerp(rotScatter, rotTree, t),
                THREE.MathUtils.lerp(rotScatter, rotTree * 0.8, t),
                THREE.MathUtils.lerp(rotScatter, rotTree * 1.1, t)
            );

            // 氛围粒子保持不变，主体粒子散开缩小
            const scatterScale = isAtmosphere ? 1.0 : 0.7;
            const scaleFactor = THREE.MathUtils.lerp(scatterScale, 1, t);

            dummy.scale.setScalar(fullData.sizes[dataIndex] * scaleFactor * localAudioScale);
            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);
        }
        meshRef.current.rotation.y = groupRotationY;
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (count === 0) return null;
    return <instancedMesh ref={meshRef} args={[geometry, material, count]} castShadow={!isAtmosphere} receiveShadow={!isAtmosphere} />;
}

// --- 🟡 金色主体 ---
function GoldParticles({ geometries, data, ...props }: any) {
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: COLOR_PALETTE.goldBase,
        emissive: COLOR_PALETTE.goldEmissive,
        emissiveIntensity: 0.1,
        metalness: 1.0,
        roughness: 0.15,
        envMapIntensity: 2.5,
        toneMapped: false
    }), []);
    return (
        <group>
            {geometries.map((geom: any, index: number) => (
                <FilteredInstancedMesh key={index} shapeIndex={index} geometry={geom} material={material} fullData={data} {...props} />
            ))}
        </group>
    )
}

// --- 🟢 祖母绿主体 ---
function EmeraldParticles({ geometries, data, ...props }: any) {
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: COLOR_PALETTE.emeraldBase,
        emissive: COLOR_PALETTE.emeraldEmissive,
        emissiveIntensity: 0.2,
        metalness: 0.1,
        roughness: 0.2,
        envMapIntensity: 2.0,
        toneMapped: false,
        transparent: true, opacity: 0.9
    }), []);
    return (
        <group>
            {geometries.map((geom: any, index: number) => (
                <FilteredInstancedMesh key={index} shapeIndex={index} geometry={geom} material={material} fullData={data} {...props} />
            ))}
        </group>
    )
}

// --- ☁️ 氛围尘埃 (保持不变) ---
function AtmosphereParticles({ geometry, data, ...props }: any) {
    const material = useMemo(() => new THREE.MeshStandardMaterial({
        color: COLOR_PALETTE.atmosphere,
        emissive: new THREE.Color(0x000000),
        emissiveIntensity: 0,
        metalness: 0.0,
        roughness: 0.9,
        transparent: true,
        opacity: 0.5,
        envMapIntensity: 0.5,
        toneMapped: false,
        depthWrite: false,
    }), []);

    return (
        <FilteredInstancedMesh
            shapeIndex={0}
            geometry={geometry}
            material={material}
            fullData={data}
            isAtmosphere={true}
            {...props}
        />
    )
}


// --- 主组件 ---
export function LuxuryElements({ isTreeMode, soundRef }: { isTreeMode: boolean, soundRef: React.RefObject<SoundManagerRef | null> }) {
    const starRef = useRef<THREE.Mesh>(null);
    const animState = useRef({ value: 0 });
    const [time, setTime] = useState(0);
    const groupRotationY = useRef(0);

    const generateData = (type: 'gold' | 'emerald' | 'atmosphere') => {
        const isMain = type !== 'atmosphere';
        const count = isMain ? MAIN_COUNT / 2 : ATMOSPHERE_COUNT;
        const treePos = new Float32Array(count * 3);
        const scatterPos = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const geomIndices = new Uint8Array(count);
        const _vec3 = new THREE.Vector3();

        for (let i = 0; i < count; i++) {
            const t = i / count;

            let baseSize;
            if (isMain) {
                // --- 📐 尺寸大幅提升 (更紧凑) ---
                const sizeRoll = Math.random();
                const baseSizeScale = type === 'gold' ? 1.2 : 0.9;

                // 大幅增加尺寸 (比之前大 50%~80%)，制造堆积感
                if (sizeRoll > 0.92) baseSize = (0.55 + Math.random() * 0.3) * baseSizeScale; // 巨型
                else if (sizeRoll > 0.6) baseSize = (0.30 + Math.random() * 0.2) * baseSizeScale; // 中型
                else baseSize = (0.15 + Math.random() * 0.12) * baseSizeScale; // 小型(填缝)
            } else {
                // 氛围粒子保持微小
                baseSize = 0.04 + Math.random() * 0.04;
            }
            sizes[i] = baseSize * (1 - t * (isMain ? 0.3 : 0.1));

            const offset = type === 'emerald' ? Math.PI : 0;
            const angleTurns = isMain ? 110 : 30;
            const angle = t * Math.PI * angleTurns + offset + Math.random();

            const currentRadius = (1 - t) * TREE_RADIUS_BASE;
            const yTreeBase = (t * TREE_HEIGHT) - (TREE_HEIGHT / 2) - 0.5;

            const radiusJitterScale = isMain ? 1 : 3;
            const radiusJitter = (Math.random() - 0.5) * (0.2 + baseSize) * radiusJitterScale;
            const finalR = Math.max(0, currentRadius + radiusJitter + (isMain ? 0 : Math.random() * 2));

            treePos[i * 3] = Math.cos(angle) * finalR;
            treePos[i * 3 + 1] = yTreeBase + (Math.random() - 0.5) * (isMain ? 0.5 : 4.0);
            treePos[i * 3 + 2] = Math.sin(angle) * finalR;

            const scatterRadius = RADIUS * (isMain ? 1 : 1.1);
            _vec3.randomDirection().multiplyScalar(Math.cbrt(Math.random()) * scatterRadius);
            _vec3.toArray(scatterPos, i * 3);

            geomIndices[i] = isMain ? Math.floor(Math.random() * 4) : 0;
        }
        return { treePos, scatterPos, sizes, geomIndices, count };
    };

    const goldData = useMemo(() => generateData('gold'), []);
    const emeraldData = useMemo(() => generateData('emerald'), []);
    const atmosphereData = useMemo(() => generateData('atmosphere'), []);

    const geometries = useMemo(() => [
        new THREE.IcosahedronGeometry(1, 0),
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.SphereGeometry(0.6, 16, 16),
        new THREE.OctahedronGeometry(0.8, 0)
    ], []);

    const atmosphereGeometry = useMemo(() => new THREE.SphereGeometry(0.5, 8, 8), []);

    const starGeometry = useMemo(() => createStarGeometry(0.3, 0.7, 0.2), []);
    const starMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        color: COLOR_PALETTE.goldBase, metalness: 1.0, roughness: 0.1,
        emissive: COLOR_PALETTE.goldBase, emissiveIntensity: 1.0, toneMapped: false, envMapIntensity: 3.0
    }), []);

    useFrame((state, delta) => {
        setTime(state.clock.elapsedTime);
        groupRotationY.current += delta * 0.05;
        if (starRef.current && isTreeMode) starRef.current.rotation.y = groupRotationY.current;
        easing.damp(animState.current, 'value', isTreeMode ? 1 : 0, 1.5, delta);
    });

    const t = animState.current.value;
    const sharedProps = { t, isTreeMode, soundRef, groupRotationY: groupRotationY.current, time };

    return (
        <>
            <GoldParticles geometries={geometries} data={goldData} {...sharedProps} />
            <EmeraldParticles geometries={geometries} data={emeraldData} {...sharedProps} />
            <AtmosphereParticles geometry={atmosphereGeometry} data={atmosphereData} {...sharedProps} />

            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.1} visible={isTreeMode}>
                <mesh ref={starRef} geometry={starGeometry} material={starMaterial} position={[0, TREE_HEIGHT / 2 + 0.3, 0]} castShadow rotation={[0, 0, 0]} />
            </Float>
        </>
    );
}