"use client";
import {useState} from 'react'
import Wave from "react-wavify"
import './waves.css'

const WaveWrap = (p) => (
  <Wave
    className="wave"
    style={{ zIndex: p.z, opacity: 0.7 }}
    options={p.options}
    fill="#FE914E"
  />
);

const Waves = () => {
  const [active, setActive] = useState(false);
  setTimeout(() => setActive(!active), 3000);
  return (
      <>
      <WaveWrap style={{position : 'fixed'}} z={0} active={active} options={{ height: 40 , amplitude :100 , points : 3 }} />
      <WaveWrap
        style={{position : 'fixed'}}
        z={0}
        active={active}
        options={{ height: 80, amplitude:10, speed: 0.4, points: 4 }}
      />
      </>

  )
}

export default Waves
