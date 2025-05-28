import {CameraControls, OrthographicCamera, PerspectiveCamera} from "@react-three/drei";
import {useEffect, useRef} from "react";
import {useFrame, useThree} from "@react-three/fiber";
import {useScene} from "../../state/sceneStore.jsx";
import * as THREE from 'three';

export const CameraManager = ({ forceViewMode = null }) => {
    const ref = useRef()
    const { transformMode, selectedIds, viewMode, view2DMode = 'front' } = useScene();
    const { size } = useThree();
    
    // Use forced view mode if provided (for split views), otherwise use global view mode
    const activeViewMode = forceViewMode || viewMode;

    // Get camera plane constraints based on 2D view mode
    const getCameraConstraints = (view2DMode) => {
        switch (view2DMode) {
            case 'front':
            case 'back':
                return {
                    lockAxis: 'z',
                    minDistance: 5,
                    maxDistance: 50,
                    panConstraint: { x: true, y: true, z: false }
                };
            case 'right':
            case 'left':
                return {
                    lockAxis: 'x',
                    minDistance: 5,
                    maxDistance: 50,
                    panConstraint: { x: false, y: true, z: true }
                };
            case 'top':
            case 'bottom':
                return {
                    lockAxis: 'y',
                    minDistance: 5,
                    maxDistance: 50,
                    panConstraint: { x: true, y: false, z: true }
                };
            default:
                return {
                    lockAxis: null,
                    minDistance: 1,
                    maxDistance: 100,
                    panConstraint: { x: true, y: true, z: true }
                };
        }
    };

    useEffect(() => {
        window.cam = ref.current

        if (activeViewMode === '3d') {
            // 3D perspective setup
            if (ref.current?.moveTo) {
                ref.current.moveTo(-0.0, 0.0, 0.0, true)
                ref.current.rotateTo(0.3, 1.2, 0, true)
                ref.current.dollyTo(9, true)
            }
        } else if (activeViewMode === '2d') {
            // Orthographic 2D setup based on view mode
            const constraints = getCameraConstraints(view2DMode);
            
            // Set camera position and target for each orthographic view
            if (ref.current?.setPosition) {
                switch (view2DMode) {
                    case 'front':
                        ref.current.setPosition(0, 0, 10, true);
                        ref.current.setTarget(0, 0, 0, true);
                        break;
                    case 'back':
                        ref.current.setPosition(0, 0, -10, true);
                        ref.current.setTarget(0, 0, 0, true);
                        break;
                    case 'right':
                        ref.current.setPosition(10, 0, 0, true);
                        ref.current.setTarget(0, 0, 0, true);
                        break;
                    case 'left':
                        ref.current.setPosition(-10, 0, 0, true);
                        ref.current.setTarget(0, 0, 0, true);
                        break;
                    case 'top':
                        ref.current.setPosition(0, 10, 0, true);
                        ref.current.setTarget(0, 0, 0, true);
                        break;
                    case 'bottom':
                        ref.current.setPosition(0, -10, 0, true);
                        ref.current.setTarget(0, 0, 0, true);
                        break;
                }

                // Apply distance constraints for 2D mode
                if (ref.current) {
                    ref.current.minDistance = constraints.minDistance;
                    ref.current.maxDistance = constraints.maxDistance;
                }
            }
        }
    }, [activeViewMode, view2DMode])

    useFrame(() => {
        // Enforce camera plane constraints in 2D mode
        if (activeViewMode === '2d' && ref.current?.camera) {
            const constraints = getCameraConstraints(view2DMode);
            const camera = ref.current.camera;
            const position = camera.position;
            
            // Get current target safely
            let target;
            try {
                target = ref.current.getTarget(new THREE.Vector3());
            } catch (e) {
                target = new THREE.Vector3(0, 0, 0);
            }

            // Lock camera to specific planes based on view mode
            switch (view2DMode) {
                case 'front':
                case 'back':
                    // Lock Z position, allow X/Y movement
                    if (view2DMode === 'front' && position.z < 5) {
                        position.z = Math.max(5, position.z);
                    }
                    if (view2DMode === 'back' && position.z > -5) {
                        position.z = Math.min(-5, position.z);
                    }
                    // Keep target Z at 0
                    target.z = 0;
                    break;
                    
                case 'right':
                case 'left':
                    // Lock X position, allow Y/Z movement
                    if (view2DMode === 'right' && position.x < 5) {
                        position.x = Math.max(5, position.x);
                    }
                    if (view2DMode === 'left' && position.x > -5) {
                        position.x = Math.min(-5, position.x);
                    }
                    // Keep target X at 0
                    target.x = 0;
                    break;
                    
                case 'top':
                case 'bottom':
                    // Lock Y position, allow X/Z movement
                    if (view2DMode === 'top' && position.y < 5) {
                        position.y = Math.max(5, position.y);
                    }
                    if (view2DMode === 'bottom' && position.y > -5) {
                        position.y = Math.min(-5, position.y);
                    }
                    // Keep target Y at 0
                    target.y = 0;
                    break;
            }

            // Update camera target to maintain plane alignment
            if (ref.current?.setTarget) {
                ref.current.setTarget(target.x, target.y, target.z, false);
            }
        }
    })

    // Use orthographic camera for 2D mode, perspective for 3D
    if (viewMode === '2d') {
        const zoom = 50;
        const aspect = size.width / size.height;
        const constraints = getCameraConstraints(view2DMode);
        
        return (
            <>
                <OrthographicCamera 
                    makeDefault
                    left={-zoom * aspect} 
                    right={zoom * aspect} 
                    top={zoom} 
                    bottom={-zoom}
                    near={0.1}
                    far={1000}
                />
                <CameraControls 
                    ref={ref}
                    enableRotate={false} // Completely disable rotation in 2D mode
                    enableZoom={true}
                    enablePan={true}
                    minDistance={constraints.minDistance}
                    maxDistance={constraints.maxDistance}
                    // Lock 2D plane navigation
                    minPolarAngle={Math.PI / 2} // Lock to horizontal
                    maxPolarAngle={Math.PI / 2} // Lock to horizontal
                    minAzimuthAngle={0} // Lock azimuth
                    maxAzimuthAngle={0} // Lock azimuth
                    // Disable orbit controls during drawing
                    mouseButtons={{
                        left: 0, // Disable left click (for drawing)
                        middle: 2, // Zoom with middle mouse
                        right: 1, // Pan with right mouse
                        wheel: 2, // Zoom with wheel
                    }}
                    touches={{
                        one: 0, // Disable single touch (for drawing)
                        two: 2, // Zoom with two fingers
                        three: 1, // Pan with three fingers
                    }}
                />
            </>
        );
    }

    return (
        <CameraControls makeDefault ref={ref} />
    )
}
