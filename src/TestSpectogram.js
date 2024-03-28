import React, { useState, useEffect, useRef, useMemo, memo } from 'react';
import {
	fragmentShader,
	vertexShader,
	generateIndices,
	generateVertices,
	generateColorLookup,
} from './SpectogramUtils';
import * as THREE from 'three';

const TestSpectogram = ({ audio }) => {
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

	useEffect(() => {
		console.log('audio', audio);
		let frequency_samples = 512;

		let audioContext = new (window.AudioContext || window.webkitAudioContext)();

		analyzer.current = audioContext.createAnalyser();
		analyzer.current.backgroundColor = [0.25, 0.12, 0.47, 1.0];
		analyzer.current.fftSize = 4 * frequency_samples;
		analyzer.current.smoothingTimeConstant = 0.5;

		let source = audioContext.createMediaStreamSource(audio);
		source.connect(analyzer.current);
	}, [audio]);

	useEffect(() => {
		const updateGeometry = () => {
			if (analyzer.current) {
				let dataArray = new Uint8Array(analyzer.current.frequencyBinCount);
				analyzer.current.getByteFrequencyData(dataArray);
				let start_val = frequency_samples + 1;
				let end_val = n_vertices - start_val;
				heights.copyWithin(0, start_val, n_vertices + 1);
				heights.set(dataArray, end_val - start_val);
				mesh.geometry.setAttribute(
					'displacement',
					new THREE.Uint8BufferAttribute(heights, 1)
				);
			}
		};

		const renderScene = () => {
			updateGeometry();
			renderer.render(scene, camera);
		};

		const handleResize = () => {
			width = mount.current.clientWidth;
			height = mount.current.clientHeight;
			renderer.setSize(width, height);
			camera.aspect = width / height;
			camera.updateProjectionMatrix();
			renderScene();
		};

		const animate = () => {
			renderScene();
			frameId = window.requestAnimationFrame(animate);
		};

		const start = () => {
			if (!frameId) {
				frameId = requestAnimationFrame(animate);
			}
		};

		const stop = () => {
			cancelAnimationFrame(frameId);
			frameId = null;
		};

		let width = mount.current.clientWidth;
		let height = mount.current.clientHeight;
		let frameId;

		const color2 = new THREE.Color(0xff0000);

		const scene = new THREE.Scene();

		let backgroundColor = [0.25, 0.12, 0.47, 1.0];

		const camera = new THREE.PerspectiveCamera(27, 10 / 3, 1, 1000);
		const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		// renderer.setClearColor(0xffffff, 0);
		renderer.clearColor(
			backgroundColor[0],
			backgroundColor[1],
			backgroundColor[2],
			backgroundColor[3]
		);
		let geometry = new THREE.BufferGeometry();

		camera.position.z = 64;

		renderer.setPixelRatio(window.devicePixelRatio);

		renderer.setSize(width, height);

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

		generateIndices(xsegments, ysegments, indices);

		let lut = generateColorLookup();

		let heights = new Uint8Array(heightsArray);

		geometry.setIndex(indices);
		geometry.setAttribute(
			'position',
			new THREE.Float32BufferAttribute(vertices, 3)
		);
		geometry.setAttribute(
			'displacement',
			new THREE.Uint8BufferAttribute(heights, 1)
		);

		geometry.computeVertexNormals();
		// geometry.computeFaceNormals();

		var uniforms = {
			vLut: { type: 'v3v', value: lut },
		};

		let material = new THREE.ShaderMaterial({
			uniforms: uniforms,
			vertexShader: vertexShader,
			fragmentShader: fragmentShader,
			transparent: true,

			// blending: THREE.AdditiveBlending,
		});

		let mesh = new THREE.Mesh(geometry, material);
		scene.add(mesh);

		material.background = new THREE.Color(0xf0f0f0); // UPDATED

		mesh.background = new THREE.Color(0xf0f0f0); // UPDATED

		mount.current.appendChild(renderer.domElement);

		window.addEventListener('resize', handleResize);
		start();

		return () => {
			stop();
			window.removeEventListener('resize', handleResize);
			mount.current.removeChild(renderer.domElement);

			scene.remove(mesh);
			geometry.dispose();
			material.dispose();
		};
	}, [
		heightsArray,
		indices,
		n_vertices,
		vertices,
		xhalfSize,
		xsegmentSize,
		xsegments,
		yhalfSize,
		ysegmentSize,
		ysegments,
	]);

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

export default memo(TestSpectogram);
