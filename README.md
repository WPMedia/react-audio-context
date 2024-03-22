# React Audio Experiments

This is an experimental repo dedicated to visualizing audio with the Web Audio API and React. The repo is currently setup in a way that produces a heavy 3D spectrogram using shaders; but eventually the goal will be to separate out concerns such that any audio input should be able to produce any custom visual output. See a variation on how it currently works by checking out the branch `2d-waveform`, which should render a 2d wave output of an mp3.


`AudioPlayer.js`

This functions as the controller component. It loads tracks, pauses them on load, and lets the child components know when the audio data is ready to be parsed.


`AudioAnalyzer.js`

This component handles the parsing of audio data, and may work differently based on the exact requirements of different visualizations. This component creates a new Audio Context, connects the audio track as a Stream, and kicks off the RequestAnimationFrame().


`AudioVisualizer.js`

This component should only handle the visual details and the canvas rendering lifecycle.
