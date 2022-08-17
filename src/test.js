import { Canvas } from "react-three-fiber";


const Canvas = ( {draw, height, width, audioData} ) => {
    return (
     <Canvas>
         <Scene />
     </Canvas>
    )
  }


  const Scene = () => {
      <mesh>
          <BufferGeometry attach="geometry" />
          <shaderMaterial
            attach="material"
            args={[CrossFadeShader]}
            uniforms-texture-value={texture1}
            uniforms-texture2-value={texture2}
            uniforms-disp-value={dispTexture}
            uniforms-dispFactor-value={0.5} />
      </mesh>
  }


const TestSpectogram = () => {


}