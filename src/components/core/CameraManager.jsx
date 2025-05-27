import {CameraControls} from "@react-three/drei";
import {useEffect, useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {useScene} from "../../state/sceneStore.jsx";

export const CameraManager = () => {
    const ref = useRef()
    const { transformMode, selectedIds } = useScene();

    useEffect(() => {
        window.cam = ref.current

        ref.current.moveTo(-0.0, 0.0, 0.0, true)
        ref.current.rotateTo(0.3, 1.2, 0, true)
        ref.current.dollyTo(9, true)
    }, [])

    useFrame(() => {
        // TEMPORARILY DISABLED - Testing if auto-rotation causes camera reset
        // Only rotate when not actively transforming objects
        // if (!transformMode || selectedIds.length === 0) {
        //     ref.current.rotate(0.002, 0, true)
        // }
    })

    return (
        <CameraControls makeDefault ref={ref} />
    )
}
