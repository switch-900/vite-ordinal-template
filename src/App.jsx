import {Canvas} from "@react-three/fiber";
import {Suspense, useState} from "react";
import {useScene, useSceneActions} from "./state/sceneStore.jsx";
import {useKeyboardShortcuts} from "./hooks/useKeyboardShortcuts.js";

import {GridFloor} from "./components/GridFloor.jsx";
import {SketchCanvas} from "./components/tools/SketchCanvas.jsx";
import {SketchToolbar} from "./components/tools/SketchToolbar.jsx";
import {SceneRenderer} from "./components/core/SceneRenderer.jsx";
import {Leva} from "leva";
import {BoxelInfo} from "./components/ui/BoxelInfo.jsx";
import {LevaInterface} from "./components/ui/LevaInterface.jsx";
import {DebugInfo} from "./components/DebugInfo.jsx";
import {ViewerApp} from "./ViewerApp.jsx";
import {CameraControls} from "@react-three/drei";

export function App() {
    const [appMode, setAppMode] = useState('builder');
    const [viewerSceneData, setViewerSceneData] = useState(null);

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    const Scene = () => {
        const { viewMode, setSceneState } = useScene();
        const { addObject } = useSceneActions();

        const testAddObject = () => {
            console.log('Test button clicked - adding object');
            const testObj = {
                id: `test_${Date.now()}`,
                name: `Test Object`,
                type: 'mesh',
                geometry: 'box',
                geometryArgs: [1, 1, 1],
                material: {
                    type: 'standard',
                    color: '#00ff00',
                    metalness: 0.1,
                    roughness: 0.7,
                },
                position: [0, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                visible: true,
                locked: false,
                layerId: 'default'
            };
            console.log('Adding test object:', testObj);
            addObject(testObj);
        };

        const testAddSphere = () => {
            console.log('Adding sphere test');
            const sphereObj = {
                id: `sphere_${Date.now()}`,
                name: `Test Sphere`,
                type: 'mesh',
                geometry: 'sphere',
                geometryArgs: [0.5, 16, 16],
                material: {
                    type: 'standard',
                    color: '#ff0000',
                    metalness: 0.1,
                    roughness: 0.7,
                },
                position: [1, 0, 0],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                visible: true,
                locked: false,
                layerId: 'default'
            };
            console.log('Adding sphere object:', sphereObj);
            addObject(sphereObj);
        };

        return (
            <>
                {/* UI Controls */}
                {viewMode === '2d' && <SketchToolbar />}
                
                {/* Test button to add objects */}
                <button 
                    onClick={testAddObject}
                    className="absolute top-20 left-2 z-10 px-4 py-2 bg-green-600 text-white rounded"
                >
                    Add Test Cube
                </button>
                
                <button 
                    onClick={testAddSphere}
                    className="absolute top-28 left-2 z-10 px-4 py-2 bg-red-600 text-white rounded"
                >
                    Add Test Sphere
                </button>
                
                {/* Leva Interface */}
                <LevaInterface onLoadInViewer={(data) => {
                    setViewerSceneData(data);
                    setAppMode('viewer');
                }} />
                
                <DebugInfo />
                
                {/* View mode buttons */}
                <div className="absolute top-2 left-2 z-10 flex space-x-2">
                    <button 
                        onClick={() => setSceneState({ viewMode: '2d' })} 
                        className={`px-2 py-1 rounded ${viewMode === '2d' ? 'bg-blue-600' : 'bg-gray-800'} text-white`}
                    >
                        2D
                    </button>
                    <button 
                        onClick={() => setSceneState({ viewMode: '3d' })} 
                        className={`px-2 py-1 rounded ${viewMode === '3d' ? 'bg-blue-600' : 'bg-gray-800'} text-white`}
                    >
                        3D
                    </button>
                </div>

                {/* 3D Canvas */}
                <Canvas camera={{ position: [5, 5, 5], fov: 45 }}>
                    <color attach="background" args={[0.02, 0.02, 0.022]} />
                    <ambientLight intensity={0.5} />
                    <directionalLight position={[10, 10, 5]} intensity={1} />
                    
                    <Suspense fallback={null}>
                        {viewMode === '2d' ? (
                            <SketchCanvas />
                        ) : (
                            <>
                                {/* Test cubes to verify rendering works */}
                                <mesh position={[3, 0, 0]}>
                                    <boxGeometry args={[0.5, 0.5, 0.5]} />
                                    <meshStandardMaterial color="red" />
                                </mesh>
                                <mesh position={[3, 0, 2]}>
                                    <sphereGeometry args={[0.3]} />
                                    <meshStandardMaterial color="blue" />
                                </mesh>
                                
                                {/* Scene objects */}
                                <SceneRenderer />
                                <GridFloor />
                                
                                {/* Camera controls for 3D mode */}
                                <CameraControls makeDefault />
                            </>
                        )}
                    </Suspense>
                </Canvas>
            </>
        );
    };

    if (appMode === 'viewer') {
        return <ViewerApp 
            sceneData={viewerSceneData} 
            onBackToBuilder={() => setAppMode('builder')}
        />;
    }

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-20 flex space-x-2">
                <button 
                    onClick={() => setAppMode('builder')} 
                    className={`px-3 py-1 rounded ${appMode === 'builder' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                >
                    Builder
                </button>
                <button 
                    onClick={() => setAppMode('viewer')} 
                    className={`px-3 py-1 rounded ${appMode === 'viewer' ? 'bg-orange-600 text-white' : 'bg-gray-800 text-gray-300'}`}
                >
                    Viewer
                </button>
            </div>
            <Scene />
            <Leva hidden={window.innerWidth < 300} />
            <BoxelInfo />
        </div>
    );
}

export default App
