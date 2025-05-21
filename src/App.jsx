import { Canvas } from '@react-three/fiber'
import Experience from './Experience.jsx'

export default function App() {
    return (
        <Canvas shadows="soft" camera={{ zoom: 2 }}>
            <Experience />
        </Canvas>
    )
}
