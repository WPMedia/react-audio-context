import React, { useState, useEffect, useRef, Component } from 'react'
import AudioAnalyzer from './AudioAnalyzer.js';


const AudioPlayer = () => {
    const [audio, setAudio] = useState(null)
    const audioDiv = useRef();

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
        audio.src = URL.createObjectURL('../public/wine_glass.mp3');
        audio.load();
        audio.play();
        audio.style.display = "block";
        setAudio(sampleTrack)

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
            <audio ref={audioDiv} controls></audio>
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

    // // Local File //
    // var fbtn = document.getElementById("file");
    // fbtn.addEventListener("click", function () {
    //     var file = document.createElement("input");
    //     file.type = "file";
    //     file.accept = "audio/*";
    //     file.click();
    //     file.onchange = function () {
    //         var files = this.files;

    //         audio.src = URL.createObjectURL(files[0]);
    //         audio.load();
    //         audio.play();
    //         audio.style.display = "block";
    //         visualize(0, audio);
    //     };
    // });