import {Grid} from "@react-three/drei";
import {useEffect, useRef} from "react";

export const GridFloor = () => {

    const ref = useRef()

    useEffect(() => {
        window.gridFloor = ref.current
    }, [])

    return (
        <Grid {...{
            gridSize: [1, 1],
            cellSize: 0.1,
            cellThickness: 1,
            cellColor: '#6f6f6f',
            sectionSize: 1,
            sectionThickness: 1.5,
            sectionColor: '#ff6600',
            fadeDistance: 200,
            fadeStrength: 50,
            followCamera: true,
            infiniteGrid: true,
        }} position={[0, -0.5, 0.0]} ref={ref} />
    )
}
