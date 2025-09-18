"use client"

import React, { useEffect, useState } from 'react';
import WebGLParticleSystem from './Particles';

interface ParticlesWrapperProps {
  particleCount?: number;
  particleSpread?: number;
  speed?: number;
  particleColors?: string[];
  moveParticlesOnHover?: boolean;
  particleHoverFactor?: number;
  alphaParticles?: boolean;
  particleBaseSize?: number;
  sizeRandomness?: number;
  cameraDistance?: number;
  disableRotation?: boolean;
  className?: string;
}

export default function ParticlesWrapper(props: ParticlesWrapperProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render anything on the server
  if (!isMounted) {
    return <div className={props.className} />;
  }

  return <WebGLParticleSystem {...props} />;
}
