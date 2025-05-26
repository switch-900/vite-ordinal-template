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
import {SceneRenderer} from "./components/core/SceneRenderer.jsx";
import {Leva} from "leva";
import {BoxelInfo} from "./components/ui/BoxelInfo.jsx";
import {ViewerApp} from "./ViewerApp.jsx";
import {MainLayout} from "./components/layout/MainLayout.jsx";
import {ViewportToolbar} from "./components/layout/ViewportToolbar.jsx";

export function App() {
    const [appMode, setAppMode] = useState('builder'); // 'builder' or 'viewer'
    const [viewerSceneData, setViewerSceneData] = useState(null);

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

    const Scene = () => {
      const { viewMode } = useScene();

        return (
            <>
                {viewMode === '3d' && <ViewportToolbar />}
                <Canvas dpr={1}>
                    <CameraManager />
                    <color attach="background" args={[0.02, 0.02, 0.022]} />
                    <Suspense>
                        {viewMode === '2d' ? (
                          <>
                            <SketchCanvas />
                            <SketchToolbar />
                          </>
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
        <MainLayout onLoadInViewer={(data) => {
            setViewerSceneData(data);
            setAppMode('viewer');
        }}>
            <Scene/>
            <Leva hidden={window.innerWidth < 300} />
            <BoxelInfo />
            <ViewportToolbar />
        </MainLayout>
    )
}

export default App
