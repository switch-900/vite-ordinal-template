import {CameraControls} from "@react-three/drei";
import {useEffect, useRef} from "react";
import {useFrame} from "@react-three/fiber";

export const Cam = () => {
    const ref = useRef()

    useEffect(() => {
        window.cam = ref.current

        ref.current.moveTo(-0.0, 0.0, 0.0, true)
        ref.current.rotateTo(0.3, 1.2, 0, true)
        ref.current.dollyTo(9, true)
    }, [])

    useFrame(() => {
        ref.current.rotate(0.002, 0, true)
    })

    return (
        <CameraControls makeDefault ref={ref} />
    )
}