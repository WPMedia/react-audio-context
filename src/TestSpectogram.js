import React, {
	useState,
	useEffect,
	useRef,
	Suspense,
	useMemo,
	useCallback,
} from 'react';
import {
	fragmentShader,
	vertexShader,
	generateIndices,
	generateVertices,
	generateColorLookup,
} from './SpectogramUtils';
import * as THREE from 'three';

import { Canvas, extend, useFrame, useLoader } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import glsl from 'babel-plugin-glsl/macro';

let lut = generateColorLookup();

const SpectrogramShaderMaterial = shaderMaterial(
	{
		vLut: lut,
		uTime: 0,
		vColor: new THREE.Color(1.0, 0.0, 0.0),
	},
	glsl`
	attribute float displacement;
    uniform vec3 vLut[256];
    varying vec3 vColor;

    void main()
    {    
		int index = int(displacement);
		vColor = vLut[index];
		vec3 newPosition = position + normal * displacement/25.5;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1);
    }
	`,
	glsl`	
	varying vec3 vColor;
    void main()
    {
        gl_FragColor = vec4(vColor, 1);
    }`
);

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
			float noiseFreq = 2.0;
			float noiseAmp = 1.0;
			vec3 noisePos = vec3(pos.x * noiseFreq + uTime, pos.y, pos.z);
			pos.z += snoise3(noisePos) * noiseAmp;
			vWave = pos.z;

			gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
		}
	`,
	// fragment shader
	glsl`
	precision mediump float;

	uniform vec3 uColor;
	uniform float uTime;
	// uniform sampler2D uTexture;
	varying vec2 vUv;
	varying float vWave;

	void main() {
		float wave = vWave * .3;
		// vec3 texture = texture2D(uTexture, vUv + wave).rgb;
		gl_FragColor = vec4(sin(vUv.y + uTime) * uColor, 1.0);
		// gl_FragColor = vec4(texture * uColor, vUv + wave);
		// gl_FragColor = vec4(texture, 1.0);

	}	
	`
);

extend({ SpectrogramShaderMaterial });

const TestSpectogram = ({ audio, paused }) => {
	return (
		<div
			style={{ width: '80vw', height: '100vh', margin: '0 auto', padding: 0 }}
		>
			<Scene paused={paused} audio={audio} />
		</div>
	);
};

const Scene = ({ paused, audio }) => {
	return (
		<Canvas camera={{ fov: 10 }}>
			<Suspense fallback={null}>
				<Wave paused={paused} audio={audio} />
			</Suspense>
		</Canvas>
	);
};

const Wave = ({ paused, audio }) => {
	const ref = useRef();

	const analyzer = useRef();
	// const [isPaused, setIsPaused] = useState(true);

	const frequency_samples = 512;
	const time_samples = 400;
	const n_vertices = (frequency_samples + 1) * (time_samples + 1);
	const xsegments = time_samples;
	const ysegments = frequency_samples;
	const xsize = 40;

	const ysize = 20;
	const xhalfSize = xsize / 2;
	const yhalfSize = ysize / 2;
	const xsegmentSize = xsize / xsegments;
	const ysegmentSize = ysize / ysegments;

	let vertices = [];
	let indices = [];
	let heightsArray = [];
	const heights = useRef(new Uint8Array(heightsArray));

	useEffect(() => {
		let frequency_samples = 512;

		let audioContext = new (window.AudioContext || window.webkitAudioContext)();

		analyzer.current = audioContext.createAnalyser();
		analyzer.current.backgroundColor = [0.25, 0.12, 0.47, 1.0];
		analyzer.current.fftSize = 4 * frequency_samples;
		analyzer.current.smoothingTimeConstant = 0.5;

		let source = audioContext.createMediaStreamSource(audio);
		source.connect(analyzer.current);
	}, [audio]);

	generateVertices(
		xsegments,
		xsegmentSize,
		xhalfSize,
		yhalfSize,
		ysegments,
		ysegmentSize,
		vertices,
		heightsArray
	);

	// useEffect(() => {
	// 	let arr = new Uint8Array([]);
	// 	if (analyzer.current) {
	// 		let dataArray = new Uint8Array(analyzer.current.frequencyBinCount);
	// 		analyzer.current.getByteFrequencyData(dataArray);
	// 		let start_val = frequency_samples + 1;
	// 		let end_val = n_vertices - start_val;

	// 		heights.current.copyWithin(0, start_val, n_vertices + 1);
	// 		heights.current.set(dataArray, end_val - start_val);
	// 	}
	// }, [heights, n_vertices]);

	generateIndices(xsegments, ysegments, indices);

	useFrame(({ clock }) => {
		if (!paused) {
			let dataArray = new Uint8Array(analyzer.current.frequencyBinCount);
			analyzer.current.getByteFrequencyData(dataArray);
			let start_val = frequency_samples + 1;
			let end_val = n_vertices - start_val;

			console.log('data array', dataArray, start_val, end_val);

			// heights.current.copyWithin(0, start_val, n_vertices + 1);
			// heights.current.set(dataArray, end_val - start_val);
			return (ref.current.uTime = clock.getElapsedTime());
		}
	});

	const geometry = useCallback(() => {
		let g = new THREE.BufferGeometry();
		g.setIndex(indices);

		g.setAttribute(
			'displacement',
			new THREE.Uint8BufferAttribute(heights.current, 1)
		);

		g.setIndex(indices);
		g.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

		g.computeVertexNormals();
		// geometry.computeFaceNormals();

		// g.setFromPoints(points);
		g.computeVertexNormals();
		return g;
	}, [heights, indices, vertices]);

	// const [image] = useLoader(THREE.TextureLoader, [
	// 	process.env.PUBLIC_URL + '/cat.jpg',
	// ]);

	return (
		<mesh geometry={geometry}>
			<planeBufferGeometry args={[0.4, 0.6, 200, 200]} />
			<spectrogramShaderMaterial ref={ref} vColor={(1.0, 0.0, 0.0)} />
			{/* <waveShaderMaterial ref={ref} uColor={'purple'} /> */}
		</mesh>
	);
};

const V = ({ audio }) => {
	const mount = useRef(null);
	const analyzer = useRef();
	// const [isPaused, setIsPaused] = useState(true);

	const frequency_samples = 512;
	const time_samples = 800;
	const n_vertices = (frequency_samples + 1) * (time_samples + 1);
	const xsegments = time_samples;
	const ysegments = frequency_samples;
	const xsize = 40;

	const ysize = 20;
	const xhalfSize = xsize / 2;
	const yhalfSize = ysize / 2;
	const xsegmentSize = xsize / xsegments;
	const ysegmentSize = ysize / ysegments;

	const vertices = [];
	const indices = [];
	const heightsArray = [];
	let heights = [];

	useEffect(() => {
		let frequency_samples = 512;

		let audioContext = new (window.AudioContext || window.webkitAudioContext)();

		analyzer.current = audioContext.createAnalyser();
		analyzer.current.backgroundColor = [0.25, 0.12, 0.47, 1.0];
		analyzer.current.fftSize = 4 * frequency_samples;
		analyzer.current.smoothingTimeConstant = 0.5;

		let source = audioContext.createMediaStreamSource(audio);
		source.connect(analyzer.current);
	}, [audio]);

	let width = mount.current.clientWidth;
	let height = mount.current.clientHeight;
	let frameId;

	const color2 = new THREE.Color(0xff0000);

	let backgroundColor = [0.25, 0.12, 0.47, 1.0];

	// renderer.setClearColor(0xffffff, 0);

	generateVertices(
		xsegments,
		xsegmentSize,
		xhalfSize,
		yhalfSize,
		ysegments,
		ysegmentSize,
		vertices,
		heights
	);

	useEffect(() => {
		if (analyzer.current) {
			let dataArray = new Uint8Array(analyzer.current.frequencyBinCount);
			analyzer.current.getByteFrequencyData(dataArray);
			let start_val = frequency_samples + 1;
			let end_val = n_vertices - start_val;
			heights.copyWithin(0, start_val, n_vertices + 1);
			heights.set(dataArray, end_val - start_val);
			// mesh.geometry.setAttribute(
			// 	'displacement',
			// 	new THREE.Uint8BufferAttribute(heights, 1)
			// );
		}
	}, []);

	generateIndices(xsegments, ysegments, indices);

	if (audio) {
		return (
			<div
				className='vis'
				style={{ width: '100vw', height: '100vh' }}
				ref={mount}
			/>
		);
	} else {
		return null;
	}
};

export default TestSpectogram;
