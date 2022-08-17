import React, { useState, useEffect, useRef, Component } from 'react'
import AudioAnalyzer from './AudioAnalyzer.js';
import TestSpectogram from './TestSpectogram.js';

const AudioPlayer = () => {
    const [audio, setAudio] = useState(null)
    const audioDiv = useRef(null);
  
    function stopAudio() {
      audio.getTracks().forEach(track => track.stop());
      setAudio(null);
    }

    function loadAudio() {
        const audioStream = audioDiv.current.captureStream();
        audioDiv.current.play();
        console.log(audioStream)
        setAudio(audioStream);
    }
  
    function toggleAudio() {
      if (audio) {
        stopAudio();
      } else {
        loadAudio();
      }
    }
    return (
        <div className="top-level-audio">
          <div className="controls">
            <audio ref={audioDiv} src={process.env.PUBLIC_URL + '/stream.mp3'} controls></audio>
            <button onClick={loadAudio}> Load audio </button>
            <button onClick={toggleAudio}>
              {audio ? 'Stop microphone' : 'Get microphone input'}
            </button>
          </div>
          {audio ? <TestSpectogram audio={audio} /> : ''}
        </div>
      );
  }

export default AudioPlayer;
