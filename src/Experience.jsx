import * as THREE from 'three'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import CustomShaderMaterial from 'three-custom-shader-material'
import vertexShader from './shaders/dissolve/vertex.glsl'
import fragmentShader from './shaders/dissolve/fragment.glsl'
import dissolvePatchmap from './shaders/dissolve/patchmap.glsl'
import { useControls } from 'leva'

const patchmap = {
    csm_Dissolve: {
        '#include <colorspace_fragment>': dissolvePatchmap,
    },
}

export default function Experience() {
    const shaderMaterialRef = useRef(null)
    const depthMaterialRef = useRef(null)
    const planeRef = useRef(null)

    const debug = useControls({
        dissolveEdgeColor: '#FFA600',
        animationSpeed: { value: 1.2, min: 0, max: 3, step: 0.01 },
        noiseFrequency: { value: 1.7, min: 0, max: 10, step: 0.01 },
    })

    /**
     * Custom dissolve shader material
     */
    const uniforms = {
        uTime: { value: 0 },
        uDissolveColor: { value: new THREE.Color(debug.dissolveEdgeColor) },
        uAnimationSpeed: { value: 1.2 },
        uNoiseFrequency: { value: 1.7 },
    }

    useEffect(() => {
        if (shaderMaterialRef.current) {
            shaderMaterialRef.current.uniforms.uDissolveColor.value.set(debug.dissolveEdgeColor)
            shaderMaterialRef.current.uniforms.uAnimationSpeed.value = debug.animationSpeed
            shaderMaterialRef.current.uniforms.uNoiseFrequency.value = debug.noiseFrequency
        }
    }, [debug])

    useLayoutEffect(() => {
        if (planeRef.current) {
            planeRef.current.lookAt(0, 0, 0)
        }
    })

    // Update the uTime uniform
    const { clock } = useThree()
    useFrame(() => {
        if (shaderMaterialRef.current) {
            shaderMaterialRef.current.uniforms.uTime.value = clock.getElapsedTime()
        }
    })

    return (
        <>
            <OrbitControls />
            <Environment preset="sunset" background backgroundBlurriness={0.5} />
            <mesh castShadow receiveShadow>
                <sphereGeometry />
                <CustomShaderMaterial
                    ref={shaderMaterialRef}
                    baseMaterial={THREE.MeshStandardMaterial}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    patchMap={patchmap}
                    metalness={0.5}
                    roughness={0.25}
                    envMapIntensity={0.5}
                    side={THREE.DoubleSide}
                />
                <CustomShaderMaterial
                    attach="customDepthMaterial"
                    ref={depthMaterialRef}
                    baseMaterial={THREE.MeshDepthMaterial}
                    vertexShader={vertexShader}
                    fragmentShader={fragmentShader}
                    uniforms={uniforms}
                    patchMap={patchmap}
                    depthPacking={THREE.RGBADepthPacking}
                />
            </mesh>

            <mesh ref={planeRef} position={[-2, -2, -2]} receiveShadow>
                <planeGeometry args={[10, 10, 10]} />
                <meshStandardMaterial
                    color="#aaaaaa"
                    side={THREE.DoubleSide}
                    metalness={0.5}
                    roughness={0.25}
                    envMapIntensity={0.5}
                />
            </mesh>

            <directionalLight
                args={[0xffffff, 4]}
                position={[6.25, 3, 4]}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-near={0.1}
                shadow-camera-far={30}
                shadow-normalBias={0.05}
                shadow-camera-top={8}
                shadow-camera-right={8}
                shadow-camera-left={-8}
                shadow-camera-bottom={-8}
            />
        </>
    )
}
