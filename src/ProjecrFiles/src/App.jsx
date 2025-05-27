import {Canvas} from "@react-three/fiber";
import {Suspense} from "react";
import {Perf} from "r3f-perf";

import {EnvironmentLighting} from "./components/core/EnvironmentLighting.jsx";
import {Cam} from "./components/core/Cam.jsx";
import {TestBoxel} from "./components/TestBoxel.jsx";
import {GridFloor} from "./components/GridFloor.jsx";
import {Leva} from "leva";
import {BoxelInfo} from "./components/ui/BoxelInfo.jsx";

const Scene = () => {

    return (
        <Canvas
            dpr={1}
            camera={{
                fov: 21,
                position: [-4, 2, 2]
            }}
        >
            <color attach="background" args={[0.02, 0.02, 0.022]} />
            <Suspense>
                <EnvironmentLighting/>
                <Cam/>

                <TestBoxel />
                <GridFloor />

                {window.innerWidth < 300 ? null : <Perf position={'bottom-left'} />}
            </Suspense>
        </Canvas>
    )
}

export function App() {

    return (
        <div className="w-full h-full flex flex-col overflow-hidden">
            <Scene/>
            <Leva hidden={window.innerWidth < 300} />
            <BoxelInfo />
        </div>
    )
}

export default App