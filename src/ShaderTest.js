import { Canvas, extend, useFrame } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';
import * as THREE from 'three';
import React, { useRef, Suspense } from 'react';

const WaveShaderMaterial = shaderMaterial(
	// uniforms
	{ uTime: 0, uColor: new THREE.Color(1.0, 0.0, 0.0) },
	// vertex shader
	glsl` 
	    //varying type allows us to send data from vertex -> fragment shader
		varying vec2 vUv;

		void main() {
			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
		}
	`,
	// fragment shader
	glsl`
	precision mediump float;

	uniform vec3 uColor;
	uniform float uTime;
	varying vec2 vUv;

	void main() {
		// gl_FragColor = vec4(vUv, 1, 1);
		gl_FragColor = vec4(sin(vUv.x + uTime) * uColor, 1);

	}	
	`
);

extend({ WaveShaderMaterial });

const Wave = () => {
	const ref = useRef();

	useFrame(({ clock }) => {
		return (ref.current.uTime = clock.getElapsedTime());
	});

	return (
		<mesh>
			<planeBufferGeometry args={[0.4, 0.6, 200, 200]} />
			<waveShaderMaterial ref={ref} uColor={'magenta'} wireframe />
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
