import {boxelGeometry} from "boxels-shader";
import {useControls} from "leva";
import CustomShaderMaterial from 'three-custom-shader-material'
import * as THREE from "three";

export const TestBoxel = () => {

    const [{scale, angle}] = useControls('edit boxel', () => {
        return {
            scale: {
                value: 1,
                min: 0.1,
                max: 2,
                step: 0.01,
            },
            angle: {
                value: 0.1,
                min: 0.01,
                max: 0.99,
                step: 0.01
            }
        }
    }, {color: '#ff9900'})


    return (
        <mesh geometry={boxelGeometry} scale={scale}>
            <CustomShaderMaterial
            baseMaterial={THREE.MeshStandardMaterial}
            flatShading={true}
            transparent={true}
            uniforms={{time: {value: 0}}}
                key={angle}
            vertexShader={`
          
            // adjust shape here when instancing
            attribute float angle;
            
            varying vec3 vPos;
            varying vec3 vNormal;

            void main() {
            csm_Position += normal * ${angle-0.2 + 0.01} * 0.5; // test mode
            vPos = csm_Position;
            vNormal = normal;
        }
            `}
            fragmentShader={`
            varying vec3 vPos;
            varying vec3 vNormal;

            uniform float time;

            void main() {
                csm_DiffuseColor = vec4(1.8, 0.5, 0., 1.);
            }
            `} />
        </mesh>
    )
}
