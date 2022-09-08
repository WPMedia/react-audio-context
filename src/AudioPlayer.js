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
        console.log(audioStream)
        setAudio(audioStream);

        setTimeout(() => {
          audioDiv.current.play();
        }, 4000)

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
            <audio ref={audioDiv} src={process.env.PUBLIC_URL + '/bird-song-looped.mp3'} controls></audio>
            <button onClick={toggleAudio}>
              click
            </button>
          </div>
          {audio ? <TestSpectogram audio={audio} /> : ''}
        </div>
      );
  }

export default AudioPlayer;
