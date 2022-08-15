import React, { useState, useEffect, useRef, Component } from 'react'
import AudioAnalyzer from './AudioAnalyzer.js';


const AudioPlayer = () => {
    const [audio, setAudio] = useState(null)
    const audioDiv = useRef(null);

    const sampleTrack = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/Yodel_Sound_Effect.mp3';
  
    async function getMicrophone() {
      const input = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false
      });

      setAudio(input);
    }
  
    function stopMicrophone() {
      audio.getTracks().forEach(track => track.stop());
      setAudio(null);
    }

    function loadAudio() {
        const audioStream = audioDiv.current.captureStream();
        audioDiv.current.play();
        console.log(audioStream)
        setAudio(audioStream);
    }
  
    function toggleMicrophone() {
      if (audio) {
        stopMicrophone();
      } else {
        getMicrophone();
      }
    }
    return (
        <div className="top-level-audio">
          <div className="controls">
            <audio ref={audioDiv} src={process.env.PUBLIC_URL + '/wine_glass.mp3'} controls></audio>
            <button onClick={loadAudio}> Load audio </button>
            <button onClick={toggleMicrophone}>
              {audio ? 'Stop microphone' : 'Get microphone input'}
            </button>
          </div>
          {audio ? <AudioAnalyzer audio={audio} /> : ''}
        </div>
      );
  }

export default AudioPlayer;
