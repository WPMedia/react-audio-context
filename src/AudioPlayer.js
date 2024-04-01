import React, { useState, useEffect, useRef, useMemo } from 'react';
import AudioAnalyzer from './AudioAnalyzer.js';
import TestSpectogram from './TestSpectogram.js';

const AudioPlayer = () => {
	const [audio, setAudio] = useState(null);
	const [isPaused, setIsPaused] = useState(false);
	const audioDiv = useRef(null);
	const playButton = useRef(null);
	const pauseButton = useRef(null);

	useEffect(() => {
		// setAudio(audioDiv.current.captureStream());
		// audioDiv.current.play();
	}, []);

	// useEffect(() => {
	// 	audioDiv.current.currentTime = 30;
	// });

	// useEffect(() => {
	// 	if (!audio) return;
	// 	if (audio.duration > 0 && !audio.paused) {
	// 		//Its playing...do your job
	// 		console.log('playing');
	// 	} else {
	// 		//Not playing...maybe paused, stopped or never played.
	// 		console.log('paused');
	// 	}
	// }, []);

	const playAudio = (el) => {
		audioDiv.current.play();
		setIsPaused(false);
		if (!audio) {
			setAudio(audioDiv.current.captureStream());
		}
	};

	const pauseAudio = (el) => {
		audioDiv.current.pause();
		setIsPaused(true);
	};

	// const stopAudio = () => {
	// 	audio.getTracks().forEach((track) => track.stop());
	// 	setAudio(null);
	// };

	// const playAudio = () => {
	// 	audio.play();
	// };

	// const loadAudio = () => {
	// 	const audioStream = audioDiv.current.captureStream();
	// 	setAudio(audioStream);
	// 	audio.play();
	// };

	// useEffect(() => {
	// 	loadAudio();
	// }, []);

	// useEffect(() => {
	// 	if (!audio) return;
	// 	if (audio.paused) {
	// 		stopAudio();
	// 	} else {
	// 		playAudio();
	// 	}
	// }, [audio, playAudio, stopAudio]);

	// function toggleAudio() {
	// 	if (audio) {
	// 		stopAudio();
	// 	} else {
	// 		loadAudio();
	// 	}
	// }

	return (
		<div className='top-level-audio'>
			<div className='controls'>
				<audio
					ref={audioDiv}
					src={process.env.PUBLIC_URL + '/CaroleEarth.mp3'}
				></audio>
				<button ref={playButton} onClick={() => playAudio()}>
					play
				</button>
				<button ref={pauseButton} onClick={() => pauseAudio()}>
					pause
				</button>
			</div>
			{audio && <TestSpectogram paused={isPaused} audio={audio} />}
		</div>
	);
};

export default AudioPlayer;
