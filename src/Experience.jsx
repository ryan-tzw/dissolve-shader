import * as THREE from 'three'
import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import CustomShaderMaterial from 'three-custom-shader-material'
import { useControls } from 'leva'
import vertexShader from './shaders/dissolve/vertex.glsl'
import fragmentShader from './shaders/dissolve/fragment.glsl'
import dissolvePatchmap from './shaders/dissolve/patchmap.glsl'
import { SelectiveBloom } from '@react-three/postprocessing'

const patchmap = {
    csm_Dissolve: {
        '#include <colorspace_fragment>': dissolvePatchmap,
    },
}

export default function Experience() {
    const sphereRef = useRef(null)
    const shaderMaterialRef = useRef(null)
    const depthMaterialRef = useRef(null)
    const planeRef = useRef(null)

    const debug = useControls({
        edgeColor: '#FFA600',
        middleColor: '#FFFFFF',
        animationSpeed: { value: 1.2, min: 0, max: 3, step: 0.01 },
        noiseFrequency: { value: 1.7, min: 0, max: 10, step: 0.01 },
    })

    /**
     * Custom dissolve shader material
     */
    const uniforms = {
        uTime: { value: 0 },
        uEdgeColor: { value: new THREE.Color(debug.dissolveEdgeColor) },
        uMiddleColor: { value: new THREE.Color(debug.dissolveMiddleColor) },
        uAnimationSpeed: { value: debug.animationSpeed },
        uNoiseFrequency: { value: debug.noiseFrequency },
    }

    useEffect(() => {
        if (shaderMaterialRef.current) {
            shaderMaterialRef.current.uniforms.uEdgeColor.value.set(debug.edgeColor)
            shaderMaterialRef.current.uniforms.uMiddleColor.value.set(debug.middleColor)
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
            <Environment
                preset="night"
                background
                backgroundBlurriness={0.5}
                backgroundIntensity={0.1}
                environmentIntensity={0.8}
            />
            <mesh ref={sphereRef} castShadow receiveShadow>
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
                    envMapIntensity={0.0}
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
                    metalness={0.2}
                    roughness={0.3}
                    envMapIntensity={0.5}
                />
            </mesh>

            <directionalLight
                args={[0xffffff, 0.1]}
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

            {/* <SelectiveBloom
                lights={[]}
                selection={[sphereRef]}
                intensity={intensity}
                luminanceThreshold={threshold}
                luminanceSmoothing={smoothing}
            /> */}
        </>
    )
}
