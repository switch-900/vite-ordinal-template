import { Grid, Instances, Instance } from "@react-three/drei";
import { useEffect, useRef, useMemo } from "react";
import { useControls } from 'leva';
import { getPatternArrayData, getMondrian } from 'bitmon';

export const GridFloor = () => {
    const ref = useRef();
    
    // Get list of available bitmon IDs
    const ids = getPatternArrayData();
    
    // Leva controls for bitmon selection and display options
    const { 
        showBitmon, 
        bitmonIndex, 
        bitmonOpacity, 
        bitmonExtrusion,
        bitmonScale 
    } = useControls('Grid & Bitmon', {
        showBitmon: { value: false, label: 'Show Bitmon Guide' },
        bitmonIndex: { 
            value: 0, 
            min: 0, 
            max: Math.max(0, ids.length - 1), 
            step: 1,
            label: 'Bitmon Pattern'
        },
        bitmonOpacity: { 
            value: 0.7, 
            min: 0.1, 
            max: 1.0, 
            step: 0.1,
            label: 'Pattern Opacity'
        },
        bitmonExtrusion: { 
            value: 0.1, 
            min: 0.05, 
            max: 2.0, 
            step: 0.05,
            label: 'Extrusion Height'
        },
        bitmonScale: { 
            value: 1.0, 
            min: 0.5, 
            max: 3.0, 
            step: 0.1,
            label: 'Pattern Scale'
        }
    });

    // Get selected bitmon ID and compute layout
    const selectedId = ids[bitmonIndex];
    const layout = useMemo(() => {
        if (!showBitmon || !selectedId) return null;
        return getMondrian(selectedId);
    }, [selectedId, showBitmon]);

    useEffect(() => {
        window.gridFloor = ref.current;
    }, []);

    const margin = 0.1; // Small margin between bitmon slots

    return (
        <group>
            {/* Original Grid Floor */}
            <Grid 
                {...{
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
                }} 
                position={[0, -0.5, 0.0]} 
                ref={ref}
                // Ensure grid doesn't interfere with drag operations
                raycast={() => null}
            />
            
            {/* Bitmon Pattern Overlay */}
            {showBitmon && layout && layout.slots && (
                <Instances limit={Math.max(layout.slots.length, 1000)}>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial 
                        color="#4a90e2" 
                        transparent 
                        opacity={bitmonOpacity}
                        emissive="#1a4480"
                        emissiveIntensity={0.2}
                    />
                    {layout.slots.map((slot, i) => {
                        const x = (slot.position.x + slot.size / 2) * bitmonScale;
                        const z = (slot.position.y + slot.size / 2) * bitmonScale;
                        const slotSize = (slot.size - margin) * bitmonScale;
                        
                        // Position on the same plane as grid (-0.5) but raise by half the extrusion height
                        const yPosition = -0.5 + (bitmonExtrusion / 2);
                        
                        return (
                            <Instance
                                key={i}
                                position={[x, yPosition, z]}
                                scale={[slotSize, bitmonExtrusion, slotSize]}
                            />
                        );
                    })}
                </Instances>
            )}
        </group>
    );
};
