import {Grid} from "@react-three/drei";
import {useEffect, useRef} from "react";
import {useScene} from "../state/sceneStore.jsx";

export const GridFloor = () => {
    const { showGrid, gridSize } = useScene();
    const ref = useRef();

    console.log('GridFloor render - showGrid:', showGrid, 'gridSize:', gridSize);

    useEffect(() => {
        window.gridFloor = ref.current;
    }, []);

    if (!showGrid) {
        console.log('GridFloor not showing because showGrid is false');
        return null;
    }

    console.log('GridFloor rendering grid');
    return (
        <Grid {...{
            gridSize: [1, 1],
            cellSize: gridSize || 0.1,
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
    );
};
