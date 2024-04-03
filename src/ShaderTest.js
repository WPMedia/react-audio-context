import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';
import * as THREE from 'three';
import React, { useRef, Suspense } from 'react';

const WaveShaderMaterial = shaderMaterial(
	// uniforms
	{
		uTime: 0,
		uColor: new THREE.Color(1.0, 0.0, 0.0),
		uTexture: new THREE.Texture(),
	},
	// vertex shader
	glsl` 
	    //varying type allows us to send data from vertex -> fragment shader
		precision mediump float;
		varying float vWave;
		varying vec2 vUv;
		uniform float uTime;

		#pragma glslify: snoise3 = require(glsl-noise/simplex/3d);

		void main() {
			vUv = uv;

			vec3 pos = position;
			float noiseFreq = 2.5;
			float noiseAmp = 0.55;
			vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
			pos.z += snoise3(noisePos) * noiseAmp;
			vWave = pos.z;

			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	// fragment shader
	glsl`
	precision mediump float;

	uniform vec3 uColor;
	uniform float uTime;
	uniform sampler2D uTexture;
	varying vec2 vUv;
	varying float vWave;

	void main() {
		float wave = vWave * .1;
		vec3 texture = texture2D(uTexture, vUv + wave).rgb;
		// gl_FragColor = vec4(vUv, 1, 1);
		gl_FragColor = vec4(texture * uColor, 1);

	}	
	`
);

extend({ WaveShaderMaterial });

const Wave = () => {
	const ref = useRef();

	useFrame(({ clock }) => {
		return (ref.current.uTime = clock.getElapsedTime());
	});

	const [image] = useLoader(THREE.TextureLoader, [
		process.env.PUBLIC_URL + '/cat.jpg',
	]);

	return (
		<mesh>
			<planeBufferGeometry args={[0.4, 0.6, 1000, 1000]} />
			<waveShaderMaterial
				ref={ref}
				uColor={'magenta'}
				uTexture={image}
				wireframe
			/>
		</mesh>
	);
};

const Scene = () => {
	return (
		<Canvas camera={{ fov: 5 }}>
			<Suspense fallback={null}>
				<Wave />
			</Suspense>
		</Canvas>
	);
};

const ShaderTest = () => {
	return (
		<div
			style={{ width: '100vw', height: '100vh', margin: '0', padding: 0 }}
			className={'shaderContainer'}
		>
			<Scene />
		</div>
	);
};

export default ShaderTest;
