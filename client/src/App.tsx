import { useEffect } from "react";
import Game from "./components/Game";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

function App() {
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

  return <Game />;
}

export default App;
