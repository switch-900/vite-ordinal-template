import {Suspense, useState} from "react";
import {useKeyboardShortcuts} from "./hooks/useKeyboardShortcuts.js";

import {Leva} from "leva";
import {BoxelInfo} from "./components/ui/BoxelInfo.jsx";
import {ViewerApp} from "./ViewerApp.jsx";
import {MainLayout} from "./components/layout/MainLayout.jsx";
import {DimensionSystem} from "./components/ui/DimensionSystem.jsx";
import {ViewTransitionHelper} from "./components/ui/ViewTransitionHelper.jsx";
import {ExtrudeRevolve} from "./components/tools/ExtrudeRevolve.jsx";
import {ViewportSplitter} from "./components/ui/ViewportSplitter.jsx";

// Enhanced Scene component with comprehensive CAD workflow
const Scene = () => {
  return (
    <>
      <ViewportSplitter />
      
      {/* Essential CAD workflow components */}
      <ExtrudeRevolve />
      <DimensionSystem />
      <ViewTransitionHelper />
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
