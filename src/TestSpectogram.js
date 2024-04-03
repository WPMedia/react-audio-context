import React, {
	useState,
	useEffect,
	useRef,
	Suspense,
	useMemo,
	useCallback,
} from 'react';
import { generateColorLookup } from './SpectogramUtils';
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

extend({ SpectrogramShaderMaterial });

const generateIndices = (xsegments, ysegments, indices) => {
	// generate indices (data for element array buffer)
	for (let i = 0; i < xsegments; i++) {
		for (let j = 0; j < ysegments; j++) {
			let a = i * (ysegments + 1) + (j + 1);
			let b = i * (ysegments + 1) + j;
			let c = (i + 1) * (ysegments + 1) + j;
			let d = (i + 1) * (ysegments + 1) + (j + 1);
			// generate two faces (triangles) per iteration
			indices.push(a, b, d); // face one
			indices.push(b, c, d); // face two
		}
	}
};

const generateVertices = (
	xsegments,
	xsegmentSize,
	xhalfSize,
	yhalfSize,
	ysegments,
	ysegmentSize,
	vertices,
	heightsArray
) => {
	// generate vertices and color data for a simple grid geometry
	for (let i = 0; i <= xsegments; i++) {
		let x = i * xsegmentSize - xhalfSize;
		for (let j = 0; j <= ysegments; j++) {
			let y = j * ysegmentSize - yhalfSize;
			vertices.push(x, y, 0);
			heightsArray.push(0);
		}
	}
};

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
			// let start_val = frequency_samples + 1;
			// let end_val = n_vertices - start_val;

			let start_val = 513;
			let end_val = 410400;

			console.log('data array', dataArray, start_val, end_val);

			heights.current.copyWithin(0, start_val, n_vertices + 1);
			heights.current.set(dataArray);
			ref.current.uTime = clock.getElapsedTime();
		}
	});

	const geometry = useCallback(() => {
		let g = new THREE.BufferGeometry();

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
			{/* <planeBufferGeometry args={[0.4, 0.6, 200, 200]} /> */}
			<spectrogramShaderMaterial ref={ref} vColor={(1.0, 0.0, 0.0)} />
			{/* <waveShaderMaterial ref={ref} uColor={'purple'} /> */}
		</mesh>
	);
};

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

const MeshAnim = ({ position, rotation, grid: { width, height, sep } }) => {
	let { vertices, heightsArray } = useMemo(() => {
		let vertices = [];
		let heightsArray = [];
		for (let i = 0; i <= xsegments; i++) {
			let x = i * xsegmentSize - xhalfSize;
			for (let j = 0; j <= ysegments; j++) {
				let y = j * ysegmentSize - yhalfSize;
				vertices.push(x, y, 0);
				heightsArray.push(0);
			}
		}

		return {
			vertices: new THREE.Float32BufferAttribute(vertices),
			heightsArray: new Uint8Array(heightsArray),
		};
	}, []);

	let indices = useMemo(() => {
		let indices = [];
		for (let i = 0; i < xsegments; i++) {
			for (let j = 0; j < ysegments; j++) {
				let a = i * (ysegments + 1) + (j + 1);
				let b = i * (ysegments + 1) + j;
				let c = (i + 1) * (ysegments + 1) + j;
				let d = (i + 1) * (ysegments + 1) + (j + 1);
				// generate two faces (triangles) per iteration
				indices.push(a, b, d); // face one
				indices.push(b, c, d); // face two
			}
		}

		return new Uint16Array(indices);
	}, []);

	return (
		<mesh>
			<bufferGeometry>
				<bufferAttribute
					attachObject={['attributes', 'position']}
					array={vertices}
					itemSize={3}
					count={vertices.length / 3}
				/>
				<bufferAttribute
					attachObject={['attributes', 'displacement']}
					array={heightsArray}
					itemSize={3}
					count={heightsArray.length / 3}
				/>
			</bufferGeometry>
		</mesh>
	);
};

export default TestSpectogram;
