import { useEffect } from 'react';

declare global {
  interface Window {
    particlesJS: any;
  }
}

export default function Particles() {
  useEffect(() => {
    if (window.particlesJS) {
      window.particlesJS('particles-js', {
        particles: {
          number: {
            value: 120,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: ['#ffb3d9', '#ff69b4', '#ffc0cb', '#ffd1dc', '#ff91a4']
          },
          shape: {
            type: 'circle',
            stroke: {
              width: 1,
              color: '#ffb3d9'
            }
          },
          opacity: {
            value: 0.8,
            random: true,
            anim: {
              enable: true,
              speed: 1.5,
              opacity_min: 0.3,
              sync: false
            }
          },
          size: {
            value: 8,
            random: true,
            anim: {
              enable: true,
              speed: 3,
              size_min: 2,
              sync: false
            }
          },
          line_linked: {
            enable: false
          },
          move: {
            enable: true,
            speed: 1.5,
            direction: 'bottom',
            random: true,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: false,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: false
            },
            onclick: {
              enable: false
            },
            resize: true
          }
        },
        retina_detect: true
      });
    }
  }, []);

  return (
    <div
      id="particles-js"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1
      }}
    />
  );
}
