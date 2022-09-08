import React, { useState, useEffect, useRef } from 'react'
import Spectogram3D from './Spectogram3D.js';
import AudioPlayer from './AudioPlayer.js';
import ScrollTrigger from 'gsap/dist/ScrollTrigger.js';
import { gsap } from "gsap";


const CustomTopper = props => {
  const {
      metadata,
      layout,
      isVercelEnv
  } = props;

  gsap.registerPlugin(ScrollTrigger);

  const tl = useRef();
  const container = useRef()
  const slide1 = useRef();
  const slide2 = useRef();

  const [active, setActive] = useState(false);

  useEffect(() => {
    tl.current = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        pin: true,
        start: "top top",
        end: "+300%",
      
        onUpdate: (self) => {
          let { progress, direction } = self;

          if(progress > .5) {
            if(direction > 0) {
              gsap.to(slide1.current, {
                opacity: 0,
                duration: .3
              })
    
             gsap.to(slide2.current, {
                opacity: 1,
                duration: .3,
                delay: .3,
              })

              setActive(true)

            } else {
    
              gsap.to(slide2.current, {
                opacity: 0,
                duration: .3,
              })

              gsap.to(slide1.current, {
                opacity: 1,
                duration: .3,
                delay: .3
              })

              setActive(false)
    
            }
    
          }
        },
      }
    })

  }, [])


  return (
    <div className={'topper-container'} ref={container}>
       <picture>
        <img src={process.env.PUBLIC_URL + '/topper-mine-image.jpg'} width={'100%'} height={'100%'} />
       </picture>
            <div className={'slide-1'} ref={slide1}> 
                whatever whatever


              </div>
              <div className={'slide-2'} ref={slide2}>
                <AudioPlayer active={active} />
              </div>
    </div>
  )
}

export default CustomTopper
