import React, { useState, useEffect, useRef, Component } from 'react';
import AudioVisualizer from './AudioVisualizer.js';
import Spectogram3D from './Spectogram3D.js';

const AudioAnalyzer = ({ audio }) => {
	const [audioData, setAudioData] = useState(new Uint8Array(0));
	const [audioAnalyzer, setAudioAnalyzer] = useState(null);
	const analyzer = useRef();
	const rafId = useRef();

	const tick = () => {
		if (analyzer.current) {
			// let dataArray = new Uint8Array(analyzer.current.frequencyBinCount);
			// analyzer.current.getByteTimeDomainData(dataArray);
			// setAudioData(dataArray);
			setAudioAnalyzer(analyzer.current);
			rafId.current = requestAnimationFrame(tick);
		}
	};

	useEffect(() => {
		const audioContext = new window.AudioContext();
		const source = audioContext.createMediaStreamSource(audio);
		const listen = audioContext.createGain();

		analyzer.current = audioContext.createAnalyser();

		source.connect(analyzer.current);
		listen.connect(analyzer.current);

		// setAudioData(dataArray);
		setAudioAnalyzer(analyzer.current);

		// tick();

		rafId.current = requestAnimationFrame(tick);

		return () => {
			if (audioContext) {
				audioContext.close();
			}

			// cancelAnimationFrame(rafId.current);
			// analyzer.current.disconnect();
			source.disconnect();
		};
	}, []);

	return (
		<Spectogram3D
			audioData={audioData}
			audioAnalyzer={audioAnalyzer}
			tick={tick}
		/>
	);
};

export default AudioAnalyzer;
