import { useEffect, useState } from "react";
import Game from "./components/Game";
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

  const handleStartGame = () => {
    setGameStarted(true);
  };

  if (!gameStarted) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(180deg, #ff6b6b 0%, #ffa500 50%, #ff69b4 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Sawarabi Mincho", serif',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '4rem',
          marginBottom: '1rem',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
          background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          タップ忍者
        </h1>
        <h2 style={{
          fontSize: '2.5rem',
          marginBottom: '2rem',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)'
        }}>
          Sakura Run
        </h2>
        <p style={{
          fontSize: '1.2rem',
          marginBottom: '3rem',
          maxWidth: '600px',
          lineHeight: '1.6'
        }}>
          Jump across Japanese rooftops in this endless runner! 
          Tap SPACE to jump, double-tap for double jump. 
          Don't fall into the gaps!
        </p>
        <button
          onClick={handleStartGame}
          style={{
            fontSize: '1.5rem',
            padding: '15px 40px',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            border: 'none',
            borderRadius: '50px',
            color: 'white',
            cursor: 'pointer',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s',
            fontFamily: '"Sawarabi Mincho", serif'
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          始める (Start)
        </button>
      </div>
    );
  }

  return <Game />;
}

export default App;
