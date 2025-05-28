import { Grid, Instances, Instance } from "@react-three/drei";
import { useEffect, useRef, useMemo, useState } from "react";
import { getPatternArrayData, getMondrian } from "bitmon";
import { useSceneActions } from "../state/sceneStore.jsx";
import * as THREE from "three";

export const GridFloor = () => {
    const ref = useRef();
    const { clearSelection } = useSceneActions();
    
    // Get list of available bitmon IDs
    const ids = useMemo(() => {
        try {
            return getPatternArrayData() || [];
        } catch (error) {
            console.warn('Error getting pattern array data:', error);
            return [];
        }
    }, []);
    
    // Use state to track bitmon controls from sidebar
    const [bitmonControls, setBitmonControls] = useState({
        showBitmon: false,
        bitmonIndex: 0,
        bitmonOpacity: 0.7,
        bitmonExtrusion: 0.1,
        bitmonScale: 1.0
    });

    // Track individual parcel extrusions
    const [parcelExtrusions, setParcelExtrusions] = useState({});
    const [selectedParcels, setSelectedParcels] = useState(new Set());
    
    // Drag state for extrusion
    const [dragState, setDragState] = useState({
        isDragging: false,
        dragStartY: 0,
        dragStartHeight: 0,
        dragParcelId: null,
        currentDragHeight: 0
    });

    // Listen for updates from BitmonTools component
    useEffect(() => {
        const checkForControls = () => {
            if (window.bitmonControls) {
                setBitmonControls(window.bitmonControls);
            }
        };
        
        const interval = setInterval(checkForControls, 100);
        return () => clearInterval(interval);
    }, []);

    const { 
        showBitmon, 
        bitmonIndex, 
        bitmonOpacity, 
        bitmonExtrusion,
        bitmonScale 
    } = bitmonControls;

    // Get selected bitmon ID and compute layout
    const selectedId = bitmonControls.currentId;
    const layout = useMemo(() => {
        if (!showBitmon || !selectedId) {
            console.log('No bitmon layout - showBitmon:', showBitmon, 'selectedId:', selectedId);
            return null;
        }
        try {
            console.log('Getting Mondrian layout for ID:', selectedId);
            const mondrian = getMondrian(selectedId);
            console.log('Mondrian layout created:', mondrian?.slots?.length || 0, 'slots');
            return mondrian;
        } catch (error) {
            console.warn('Error getting Mondrian layout for ID', selectedId, ':', error);
            return null;
        }
    }, [selectedId, showBitmon]);

    useEffect(() => {
        window.gridFloor = ref.current;
    }, []);

    const margin = 0.1; // Small margin between bitmon slots

    // Handle parcel mouse interactions
    const handleParcelMouseDown = (parcelId, event) => {
        // Only stop propagation if bitmon is actually being shown and user is interacting with it
        if (bitmonControls.showBitmon) {
            event.stopPropagation();
        }
        
        // Start potential drag operation
        const currentHeight = parcelExtrusions[parcelId] || bitmonExtrusion;
        const initialDragState = {
            isDragging: false,
            dragStartY: event.clientY,
            dragStartHeight: currentHeight,
            dragParcelId: parcelId,
            currentDragHeight: currentHeight
        };
        
        setDragState(initialDragState);
        
        // Add global mouse event listeners
        const handleMouseMove = (e) => {
            const deltaY = initialDragState.dragStartY - e.clientY; // Inverted for natural drag feeling
            const heightChange = deltaY * 0.01; // Sensitivity factor
            const newHeight = Math.max(0.05, initialDragState.dragStartHeight + heightChange);
            
            // If mouse moved enough, start dragging
            if (!initialDragState.isDragging && Math.abs(deltaY) > 5) {
                initialDragState.isDragging = true;
                setDragState(prev => ({ ...prev, isDragging: true }));
                document.body.style.cursor = 'ns-resize';
            }
            
            if (initialDragState.isDragging || Math.abs(deltaY) > 5) {
                setDragState(prev => ({ 
                    ...prev, 
                    isDragging: true,
                    currentDragHeight: newHeight 
                }));
                
                // Update parcel height in real-time
                setParcelExtrusions(prev => ({
                    ...prev,
                    [parcelId]: newHeight
                }));
            }
        };
        
        const handleMouseUp = (e) => {
            if (!initialDragState.isDragging) {
                // It was a click, not a drag - handle selection
                setSelectedParcels(prev => {
                    const newSelected = new Set(prev);
                    if (newSelected.has(parcelId)) {
                        newSelected.delete(parcelId);
                    } else {
                        newSelected.add(parcelId);
                    }
                    return newSelected;
                });
            }
            
            // Clean up drag state
            setDragState({
                isDragging: false,
                dragStartY: 0,
                dragStartHeight: 0,
                dragParcelId: null,
                currentDragHeight: 0
            });
            document.body.style.cursor = 'auto';
            
            // Remove event listeners
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Extrude all parcels
    const extrudeAllParcels = () => {
        if (!layout || !layout.slots) return;
        
        const newExtrusions = {};
        layout.slots.forEach((_, index) => {
            const parcelId = `${selectedId}-${index}`;
            newExtrusions[parcelId] = (parcelExtrusions[parcelId] || bitmonExtrusion) + 0.5;
        });
        setParcelExtrusions(prev => ({
            ...prev,
            ...newExtrusions
        }));
    };

    // Reset all extrusions
    const resetAllExtrusions = () => {
        setParcelExtrusions({});
        setSelectedParcels(new Set());
    };

    // Make extrude functions available globally
    useEffect(() => {
        window.bitmonExtrudeAll = extrudeAllParcels;
        window.bitmonResetAll = resetAllExtrusions;
        window.bitmonSelectedParcels = selectedParcels;
        window.bitmonParcelExtrusions = parcelExtrusions; // Expose parcel extrusions
        window.bitmonClearSelection = () => setSelectedParcels(new Set());
        window.bitmonUpdateSelectedHeight = (height) => {
            const newExtrusions = {};
            selectedParcels.forEach(parcelId => {
                newExtrusions[parcelId] = height;
            });
            if (selectedParcels.size > 0) {
                setParcelExtrusions(prev => ({
                    ...prev,
                    ...newExtrusions
                }));
            }
        };
    }, [layout, selectedId, parcelExtrusions, bitmonExtrusion, selectedParcels]);

    return (
        <group>
            {/* Invisible plane to capture clicks on empty grid space for deselection */}
            <mesh 
                position={[0, -0.51, 0]} 
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => {
                    // Only clear selection if we're not interacting with bitmon parcels
                    if (!bitmonControls.showBitmon) {
                        clearSelection();
                    }
                }}
                visible={false}
            >
                <planeGeometry args={[200, 200]} />
                <meshBasicMaterial transparent opacity={0} />
            </mesh>
            
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
                <group>
                    {layout.slots.map((slot, i) => {
                        const parcelId = `${selectedId}-${i}`;
                        const x = (slot.position.x + slot.size / 2) * bitmonScale;
                        const z = (slot.position.y + slot.size / 2) * bitmonScale;
                        const slotSize = (slot.size - margin) * bitmonScale;
                        
                        // Get individual extrusion height for this parcel
                        const extrusionHeight = parcelExtrusions[parcelId] || bitmonExtrusion;
                        const isSelected = selectedParcels.has(parcelId);
                        
                        // Position on the same plane as grid (-0.5) but raise by half the extrusion height
                        const yPosition = -0.5 + (extrusionHeight / 2);
                        
                        return (
                            <group key={i}>
                                <mesh
                                    position={[x, yPosition, z]}
                                    scale={[slotSize, extrusionHeight, slotSize]}
                                    onPointerDown={(e) => handleParcelMouseDown(parcelId, e)}
                                    onPointerEnter={(e) => {
                                        if (!dragState.isDragging) {
                                            e.object.material.emissiveIntensity = 0.4;
                                            document.body.style.cursor = 'pointer';
                                        }
                                    }}
                                    onPointerLeave={(e) => {
                                        if (!dragState.isDragging) {
                                            e.object.material.emissiveIntensity = isSelected ? 0.3 : 0.2;
                                            document.body.style.cursor = 'auto';
                                        }
                                    }}
                                >
                                    <boxGeometry args={[1, 1, 1]} />
                                    <meshStandardMaterial 
                                        color={isSelected ? "#ff6600" : "#4a90e2"} 
                                        transparent 
                                        opacity={bitmonOpacity}
                                        emissive={isSelected ? "#ff3300" : "#1a4480"}
                                        emissiveIntensity={isSelected ? 0.3 : 0.2}
                                    />
                                </mesh>
                                
                                {/* Height indicator during drag */}
                                {dragState.isDragging && dragState.dragParcelId === parcelId && (
                                    <group position={[x, yPosition + extrusionHeight/2 + 0.3, z]}>
                                        <mesh>
                                            <planeGeometry args={[0.5, 0.2]} />
                                            <meshBasicMaterial 
                                                color="#ffffff" 
                                                transparent 
                                                opacity={0.9}
                                                side={THREE.DoubleSide}
                                            />
                                        </mesh>
                                        {/* Height text would be rendered here in a real implementation */}
                                    </group>
                                )}
                            </group>
                        );
                    })}
                </group>
            )}
        </group>
    );
};
