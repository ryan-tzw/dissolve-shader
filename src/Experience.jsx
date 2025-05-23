import * as THREE from 'three'
import { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, OrbitControls } from '@react-three/drei'
import CustomShaderMaterial from 'three-custom-shader-material'
import { folder, useControls } from 'leva'
import vertexShader from './shaders/dissolve/vertex.glsl'
import fragmentShader from './shaders/dissolve/fragment.glsl'
import dissolvePatchmap from './shaders/dissolve/patchmap.glsl'
import { SelectiveBloom } from '@react-three/postprocessing'

const patchmap = {
    csm_Dissolve: {
        '#include <colorspace_fragment>': dissolvePatchmap,
    },
}

const COLOR_PRESETS = {
    default: {
        edgeColor: '#eb5a39',
        middleColor: '#f2c7b4',
    },
    red: {
        edgeColor: '#ff2b2b',
        middleColor: '#ff8989',
    },
    green: {
        edgeColor: '#00ff00',
        middleColor: '#7feba2',
    },
    blue: {
        edgeColor: '#1427d5',
        middleColor: '#80c6ff',
    },
    purple: {
        edgeColor: '#800080',
        middleColor: '#d994f8',
    },
    orange: {
        edgeColor: '#ff7e30',
        middleColor: '#f2b285',
    },
    pink: {
        edgeColor: '#ff338f',
        middleColor: '#ffa7dc',
    },
    custom: null,
}

// Utility to check if 2 colors are part of a preset
function getMatchingPreset(edgeColor, middleColor) {
    for (const [preset, colors] of Object.entries(COLOR_PRESETS)) {
        if (preset === 'custom') continue
        if (
            colors.edgeColor.toLowerCase() === edgeColor.toLowerCase() &&
            colors.middleColor.toLowerCase() === middleColor.toLowerCase()
        ) {
            return preset
        }
    }
    return 'custom'
}

export default function Experience() {
    // References
    const sphereRef = useRef(null)
    const shaderMaterialRef = useRef(null)
    const depthMaterialRef = useRef(null)
    const planeRef = useRef(null)

    /**
     * Custom controls for the shader
     */
    // Effect controls
    const effectControls = useControls('Effect', {
        animationSpeed: { value: 1.2, min: 0, max: 3, step: 0.01 },
        noiseFrequency: { value: 1.6, min: 0.5, max: 4, step: 0.01 },
    })
    // Update the shader uniforms when the effect controls change
    useEffect(() => {
        if (shaderMaterialRef.current) {
            const shaderUniforms = shaderMaterialRef.current.uniforms
            shaderUniforms.uAnimationSpeed.value = effectControls.animationSpeed
            shaderUniforms.uNoiseFrequency.value = effectControls.noiseFrequency
        }
    }, [effectControls])

    // Color controls
    const [customColors, setCustomColors] = useState({
        edgeColor: COLOR_PRESETS.default.edgeColor,
        middleColor: COLOR_PRESETS.default.middleColor,
    })

    // Use leva controls to update the colors state
    const [colorControls, setColorControls] = useControls(() => ({
        Colors: folder({
            preset: {
                options: Object.keys(COLOR_PRESETS),
                value: 'default',
                onChange: (preset) => {
                    if (preset === 'custom') return
                    const { edgeColor, middleColor } = COLOR_PRESETS[preset]
                    setColorControls({ edgeColor, middleColor })
                },
            },
            edgeColor: {
                value: customColors.edgeColor,
                onChange: (color) => {
                    setCustomColors((prev) => ({ ...prev, edgeColor: color }))
                    setColorControls({ preset: getMatchingPreset(color, customColors.middleColor) })
                },
            },
            middleColor: {
                value: customColors.middleColor,
                onChange: (color) => {
                    setCustomColors((prev) => ({ ...prev, middleColor: color }))
                    setColorControls({ preset: getMatchingPreset(customColors.edgeColor, color) })
                },
            },
        }),
    }))

    // Update the shader uniforms when color controls change
    useEffect(() => {
        if (shaderMaterialRef.current) {
            const shaderUniforms = shaderMaterialRef.current.uniforms
            shaderUniforms.uEdgeColor.value.set(customColors.edgeColor)
            shaderUniforms.uMiddleColor.value.set(customColors.middleColor)
        }
    }, [customColors])

    /**
     * Custom dissolve shader material
     */
    const uniforms = {
        uTime: { value: 0 },
        uEdgeColor: { value: new THREE.Color(colorControls.edgeColor) },
        uMiddleColor: { value: new THREE.Color(colorControls.middleColor) },
        uAnimationSpeed: { value: effectControls.animationSpeed },
        uNoiseFrequency: { value: effectControls.noiseFrequency },
    }

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
