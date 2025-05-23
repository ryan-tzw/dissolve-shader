import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'
import { Bloom, EffectComposer, SelectiveBloom } from '@react-three/postprocessing'
import { useControls } from 'leva'

export default function App() {
    const { threshold, intensity, smoothing } = useControls('Bloom', {
        threshold: { value: 0.1, min: 0, max: 5, step: 0.01 },
        intensity: { value: 1.2, min: 0, max: 3, step: 0.01 },
        smoothing: { value: 0.025, min: 0, max: 0.5, step: 0.001 },
    })
    return (
        <Canvas shadows="soft" camera={{ zoom: 1.5, position: [1.5, 0, 4] }}>
            <Experience />
            <EffectComposer>
                <Bloom
                    luminanceThreshold={threshold}
                    luminanceSmoothing={smoothing}
                    intensity={intensity}
                    mipmapBlur
                />
            </EffectComposer>
        </Canvas>
    )
}
