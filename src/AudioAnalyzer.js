import React, { useState, useEffect, useRef, Component } from 'react'
import AudioVisualizer from './AudioVisualizer.js';




// const AudioAnalyzer = ({audio}) => {
//     const [audioData, setAudioData] = useState(new Uint8Array(0));
//     // const [analyzer, setAnalyzer] = useState();
//     const analyzer = useRef();
//     const dataArray = useRef();
//     const rafId = useRef(null)
//     // const analyser = useRef(null)


//     const tick = () => {
//         console.log('tick', audioData, analyzer.current)
//         analyzer.current.getByteTimeDomainData(dataArray.current);
//         setAudioData(dataArray.current);
//         rafId.current = requestAnimationFrame(tick);
//     }

//     useEffect(() => {
//         const audioContext = new window.AudioContext();

//         analyzer.current = audioContext.createAnalyser();

//         console.log('in use effect', analyzer.current)

//         dataArray.current = new Uint8Array(analyzer.current.frequencyBinCount);

//         const source = audioContext.createMediaStreamSource(audio);
//         const listen = audioContext.createGain();

//         source.connect(analyzer.current);
//         listen.connect(analyzer.current);

//         rafId.current = requestAnimationFrame(tick);

//         return() => {
//             cancelAnimationFrame(rafId.current);
//             analyzer.current.disconnect();
//             source.disconnect();
//         }

//     }, [])

//     return <AudioVisualizer audioData={audioData} />;

// }





// /** This needs to be refactored with hooks
// currently the useEffect doesn't seem to be updating
// */
class AudioAnalyzer extends Component {
    constructor(props) {
      super(props);
      this.state = { audioData: new Uint8Array(0) };
      this.tick = this.tick.bind(this);
    }
    
    componentDidMount() {
      this.audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.smoothingTimeConstant = 0.5;

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);


      this.source = this.audioContext.createMediaStreamSource(this.props.audio);
      this.listen = this.audioContext.createGain();

      this.source.connect(this.analyser);
      this.listen.connect(this.analyser);

      this.rafId = requestAnimationFrame(this.tick);
    }
  
    tick() {
      this.analyser.getByteTimeDomainData(this.dataArray);
      this.setState({ audioData: this.dataArray });
      this.rafId = requestAnimationFrame(this.tick);
    }
  
    componentWillUnmount() {
      cancelAnimationFrame(this.rafId);
      this.analyser.disconnect();
      this.source.disconnect();
    }
  
    render() {
      return <AudioVisualizer audioData={this.state.audioData} />;
    }
  }

  export default AudioAnalyzer;