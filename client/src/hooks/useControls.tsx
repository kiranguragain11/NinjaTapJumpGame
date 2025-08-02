import { useEffect, useState } from 'react';

interface Controls {
  jump: boolean;
  restart: boolean;
}

export function useControls() {
  const [controls, setControls] = useState<Controls>({
    jump: false,
    restart: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          setControls(prev => ({ ...prev, jump: true }));
          break;
        case 'KeyR':
          setControls(prev => ({ ...prev, restart: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'Space':
          setControls(prev => ({ ...prev, jump: false }));
          break;
        case 'KeyR':
          setControls(prev => ({ ...prev, restart: false }));
          break;
      }
    };

    const handleTouch = () => {
      setControls(prev => ({ ...prev, jump: true }));
      setTimeout(() => {
        setControls(prev => ({ ...prev, jump: false }));
      }, 100);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('touchstart', handleTouch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('touchstart', handleTouch);
    };
  }, []);

  return controls;
}
