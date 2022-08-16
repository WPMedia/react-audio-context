import React, { useState, useEffect, useRef, Component } from 'react'

const Canvas = ( {draw, height, width, audioData} ) => {
    const canvas = useRef();

    useEffect(() => {                             
      const context = canvas.current.getContext('2d'); 
      draw(context, width, height, audioData);
    });

    return (
      <canvas
        ref={canvas}
        width={width}  
        height={height}
      />
    )
  }

  const draw = (context, width, height, audioData) => {

    console.log(audioData)

    let x = 0;
    const sliceWidth = (width * 1.0) / audioData.length;

    // context.lineWidth = 2;
    // context.strokeStyle = '#000000';
    // context.fillStyle = "#000";
    context.lineWidth = 2;
    context.strokeStyle = "#000";
    context.clearRect(0, 0, width, height);
    // ctx.fillRect(0, 0, WIDTH, HEIGHT);

    context.beginPath();
    context.moveTo(0, height / 2);
    for (const item of audioData) {
      const y = (item / 255.0) * height;
      context.lineTo(x, y);
      x += sliceWidth;
    }
    context.lineTo(x, height / 2);
    context.stroke();
  };


  function AudioVisualizer(props) {
    const { audioData } = props;

    return (
      <Canvas draw={draw} height={window.innerHeight} width={window.innerWidth} audioData={audioData} />
    );
  }


  export default AudioVisualizer;