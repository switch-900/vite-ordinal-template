import {Canvas, useThree} from "@react-three/fiber";
import {Suspense, useState} from "react";
import {Perf} from "r3f-perf";
import {CameraManager} from "./components/core/CameraManager.jsx";
import {useScene} from "./state/sceneStore.jsx";
import {useKeyboardShortcuts} from "./hooks/useKeyboardShortcuts.js";

import {EnvironmentLighting} from "./components/core/EnvironmentLighting.jsx";
import {TestBoxel} from "./components/TestBoxel.jsx";
import {GridFloor} from "./components/GridFloor.jsx";
// Tool components
import {SketchCanvas} from "./components/tools/SketchCanvas.jsx";
import {SketchToolbar} from "./components/tools/SketchToolbar.jsx";
import {PrimitiveTools} from "./components/tools/PrimitiveTools.jsx";
import {AdvancedTools} from "./components/tools/AdvancedTools.jsx";
import {BooleanOps} from "./components/tools/BooleanOps.jsx";
import {ExtrudeRevolve} from "./components/tools/ExtrudeRevolve.jsx";
import {SceneRenderer} from "./components/core/SceneRenderer.jsx";
import {Leva} from "leva";
import {BoxelInfo} from "./components/ui/BoxelInfo.jsx";
import {ObjectManager} from "./components/ui/ObjectManager.jsx";
import {ExportPanel} from "./components/ui/ExportPanel.jsx";
import {TransformToolbar} from "./components/ui/TransformToolbar.jsx";
import {MaterialEditor} from "./components/ui/MaterialEditor.jsx";
import {SettingsPanel} from "./components/ui/SettingsPanel.jsx";
import {UndoRedoToolbar} from "./components/ui/UndoRedoToolbar.jsx";
import {LayerManager} from "./components/ui/LayerManager.jsx";
import {GroupManager} from "./components/ui/GroupManager.jsx";
import {PerformancePanel} from "./components/ui/PerformancePanel.jsx";
import {TextureManager} from "./components/ui/TextureManager.jsx";
import {OrdinalsExporter} from "./components/ui/OrdinalsExporter.jsx";
import {ConstraintSystem} from "./components/tools/ConstraintSystem.jsx";
import {AnimationPanel} from "./components/ui/AnimationPanel.jsx";
import {ViewerApp} from "./ViewerApp.jsx";

export function App() {
    const [appMode, setAppMode] = useState('builder'); // 'builder' or 'viewer'
    const [viewerSceneData, setViewerSceneData] = useState(null);

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    const Scene = () => {
      const { viewMode, setSceneState } = useScene();

        return (
            <>
                {viewMode === '2d' && <SketchToolbar />}
                {viewMode === '3d' && <PrimitiveTools />}
                {viewMode === '3d' && <AdvancedTools />}
                {viewMode === '3d' && <BooleanOps />}
                {viewMode === '3d' && <ExtrudeRevolve />}
                {viewMode === '3d' && <ObjectManager />}
                {viewMode === '3d' && <MaterialEditor />}
                {viewMode === '3d' && <TransformToolbar />}
                {viewMode === '3d' && <UndoRedoToolbar />}
                {viewMode === '3d' && <LayerManager />}
                {viewMode === '3d' && <GroupManager />}
                {viewMode === '3d' && <PerformancePanel />}
                {viewMode === '3d' && <TextureManager />}
                {viewMode === '3d' && <OrdinalsExporter />}
                {viewMode === '3d' && <ConstraintSystem />}
                {viewMode === '3d' && <AnimationPanel />}
                {viewMode === '3d' && <ExportPanel onLoadInViewer={(data) => {
                    // Set viewer data and switch to viewer mode
                    setViewerSceneData(data);
                    setAppMode('viewer');
                }} />}
                <SettingsPanel />
                <div className="absolute top-2 left-2 z-10 flex space-x-2">
                    <button onClick={() => setSceneState({ viewMode: '2d' })} className="px-2 py-1 bg-gray-800 text-white rounded">2D</button>
                    <button onClick={() => setSceneState({ viewMode: '3d' })} className="px-2 py-1 bg-gray-800 text-white rounded">3D</button>
                </div>
                <Canvas dpr={1}>
                    <CameraManager />
                    <color attach="background" args={[0.02, 0.02, 0.022]} />
                    <Suspense>
                        {viewMode === '2d' ? (
                          <SketchCanvas />
                        ) : (
                          <>
                            <EnvironmentLighting />
                            <SceneRenderer />
                            <TestBoxel />
                            <GridFloor />
                            {window.innerWidth < 300 ? null : <Perf position={'bottom-left'} />}
                          </>
                        )}
                    </Suspense>
                </Canvas>
            </>
        )
    }

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
            <Scene/>
            <Leva hidden={window.innerWidth < 300} />
            <BoxelInfo />
        </div>
    )
}

export default App
