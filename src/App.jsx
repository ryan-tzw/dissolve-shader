import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'

export default function App() {
    return (
        <Canvas shadows="soft" camera={{ zoom: 1.5, position: [1.5, 0, 4] }}>
            <Experience />
        </Canvas>
    )
}
