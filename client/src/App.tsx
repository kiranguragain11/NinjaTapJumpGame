import React, { useEffect, useState } from "react";
import Game from "./components/GameOptimized";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const { setBackgroundMusic, setHitSound, setSuccessSound } = useAudio();

  // Load audio assets
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const backgroundMusic = new Audio('/sounds/background.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
        setBackgroundMusic(backgroundMusic);

        const hitSound = new Audio('/sounds/hit.mp3');
        hitSound.volume = 0.5;
        setHitSound(hitSound);

        const successSound = new Audio('/sounds/success.mp3');
        successSound.volume = 0.4;
        setSuccessSound(successSound);
      } catch (error) {
        console.error("Failed to load audio:", error);
      }
    };

    loadAudio();
  }, [setBackgroundMusic, setHitSound, setSuccessSound]);

  if (!gameStarted) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #4a90e2 0%, #f5a623 30%, #d0021b 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Orbitron", sans-serif',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: window.innerWidth < 768 ? '2.5rem' : '4rem',
          marginBottom: '1rem',
          textShadow: '0 4px 8px rgba(0,0,0,0.5)',
          color: 'white',
          fontWeight: '900'
        }}>
          kiranGuragain Game
        </h1>
        <p style={{
          fontSize: window.innerWidth < 768 ? '1.2rem' : '1.5rem',
          marginBottom: '3rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
          color: '#ffeb3b',
          fontWeight: '400',
          opacity: 0.9,
          padding: window.innerWidth < 768 ? '0 20px' : '0'
        }}>
          An anime-style rooftop ninja runner.
        </p>
        <button
          onClick={() => setGameStarted(true)}
          style={{
            fontSize: window.innerWidth < 768 ? '1.2rem' : '1.5rem',
            padding: window.innerWidth < 768 ? '15px 30px' : '20px 40px',
            background: 'linear-gradient(45deg, #ff4081, #3f51b5)',
            border: 'none',
            borderRadius: '10px',
            color: 'white',
            cursor: 'pointer',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            fontFamily: '"Orbitron", sans-serif',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          onTouchStart={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          Start Game
        </button>
      </div>
    );
  }

  return <Game 
    onGameOver={() => setGameStarted(false)} 
    onReturnToMenu={() => setGameStarted(false)}
  />;
}

export default App;
