import {Canvas, useThree} from "@react-three/fiber";
import {Suspense, useState} from "react";

import {CameraManager} from "./components/core/CameraManager.jsx";
import {useScene} from "./state/sceneStore.jsx";
import {useKeyboardShortcuts} from "./hooks/useKeyboardShortcuts.js";

import {EnvironmentLighting} from "./components/core/EnvironmentLighting.jsx";
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

// ✅ CRITICAL FIX: Move Scene component outside App to prevent Canvas recreation
// This was the root cause of the scene reset issue - Scene was being recreated
// on every App render, causing the Canvas and all 3D objects to unmount/remount
const Scene = () => {
  const { viewMode } = useScene();

  return (
    <>
      {viewMode === '2d' && <SketchToolbar />}
      {viewMode === '3d' && <ViewportToolbar />}
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
              <GridFloor />
            </>
          )}
        </Suspense>
      </Canvas>
    </>
  )
}

export function App() {
    const [appMode, setAppMode] = useState('builder'); // 'builder' or 'viewer'
    const [viewerSceneData, setViewerSceneData] = useState(null);

    // Enable keyboard shortcuts
    useKeyboardShortcuts();

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
        </MainLayout>
    )
}

export default App
