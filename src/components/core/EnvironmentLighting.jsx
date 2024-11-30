import {Environment} from "@react-three/drei";

export const EnvironmentLighting = () => {

    return (
        <Environment environmentIntensity={0.75}
            files={'/content/8c4ea8f9fafef081345ba8a72c08efed2373d0ba33ac92aca5f043071fc42909i0?.hdr'}
        />
    )
}
