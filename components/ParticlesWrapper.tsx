"use client"

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the Particles component to avoid SSR issues
const WebGLParticleSystem = dynamic(() => import('./Particles'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 opacity-0" />
});

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
