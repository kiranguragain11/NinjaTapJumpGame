import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useControls } from '../hooks/useControls';
import Ninja from './Ninja';
import Platform from './Platform';
import Background from './Background';
import Particles from './Particles';
import GameUI from './GameUI';
import { checkCollision } from '../utils/collision';
import { applyGravity, updateVelocity } from '../utils/physics';
import { useGame } from '../lib/stores/useGame';
import { useAudio } from '../lib/stores/useAudio';

interface GameState {
  ninja: {
    x: number;
    y: number;
    velocityY: number;
    width: number;
    height: number;
    isGrounded: boolean;
    canDoubleJump: boolean;
  };
  platforms: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
  }>;
  camera: {
    x: number;
  };
  score: number;
  gameSpeed: number;
}

export default function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    ninja: {
      x: 100,
      y: 300,
      velocityY: 0,
      width: 32,
      height: 32,
      isGrounded: false,
      canDoubleJump: true
    },
    platforms: [],
    camera: { x: 0 },
    score: 0,
    gameSpeed: 2
  });

  const { phase, start, end, restart } = useGame();
  const { playHit, playSuccess, backgroundMusic, isMuted } = useAudio();
  const controls = useControls();

  // Initialize platforms
  useEffect(() => {
    const initialPlatforms = [];
    for (let i = 0; i < 20; i++) {
      initialPlatforms.push({
        x: i * 150 + (Math.random() * 50 - 25),
        y: 400 + Math.sin(i * 0.5) * 50,
        width: 120,
        height: 20
      });
    }
    setGameState(prev => ({ ...prev, platforms: initialPlatforms }));
  }, []);

  // Start background music
  useEffect(() => {
    if (phase === 'playing' && backgroundMusic && !isMuted) {
      backgroundMusic.play().catch(console.error);
    }
    return () => {
      if (backgroundMusic) {
        backgroundMusic.pause();
      }
    };
  }, [phase, backgroundMusic, isMuted]);

  const handleJump = useCallback(() => {
    if (phase !== 'playing') return;
    
    setGameState(prev => {
      const ninja = { ...prev.ninja };
      
      if (ninja.isGrounded) {
        ninja.velocityY = -12;
        ninja.isGrounded = false;
        ninja.canDoubleJump = true;
        playSuccess();
      } else if (ninja.canDoubleJump) {
        ninja.velocityY = -10;
        ninja.canDoubleJump = false;
        playSuccess();
      }
      
      return { ...prev, ninja };
    });
  }, [phase, playSuccess]);

  // Handle controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (phase === 'ready') {
          start();
        } else {
          handleJump();
        }
      }
      if (e.code === 'KeyR' && phase === 'ended') {
        restart();
      }
    };

    const handleClick = () => {
      if (phase === 'ready') {
        start();
      } else {
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleClick);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleClick);
    };
  }, [handleJump, phase, start, restart]);

  const gameLoop = useCallback(() => {
    if (phase !== 'playing') return;

    setGameState(prev => {
      const newState = { ...prev };
      
      // Apply gravity to ninja
      newState.ninja = applyGravity(newState.ninja);
      
      // Move camera forward
      newState.camera.x += newState.gameSpeed;
      
      // Update score
      newState.score = Math.floor(newState.camera.x / 10);
      
      // Increase difficulty over time
      newState.gameSpeed = Math.min(2 + newState.score * 0.001, 8);
      
      // Check platform collisions
      let onPlatform = false;
      newState.platforms.forEach(platform => {
        if (checkCollision(newState.ninja, platform)) {
          if (newState.ninja.velocityY > 0 && 
              newState.ninja.y < platform.y) {
            newState.ninja.y = platform.y - newState.ninja.height;
            newState.ninja.velocityY = 0;
            newState.ninja.isGrounded = true;
            newState.ninja.canDoubleJump = true;
            onPlatform = true;
          }
        }
      });
      
      // Check if ninja fell
      if (newState.ninja.y > 600) {
        playHit();
        end();
        return newState;
      }
      
      // Generate new platforms
      const lastPlatform = newState.platforms[newState.platforms.length - 1];
      if (lastPlatform && lastPlatform.x < newState.camera.x + 1200) {
        const newPlatform = {
          x: lastPlatform.x + 150 + Math.random() * 100,
          y: 400 + Math.sin(newState.platforms.length * 0.5) * 80,
          width: 120 + Math.random() * 60,
          height: 20
        };
        newState.platforms.push(newPlatform);
      }
      
      // Remove old platforms
      newState.platforms = newState.platforms.filter(
        platform => platform.x > newState.camera.x - 200
      );
      
      return newState;
    });
  }, [phase, playHit, end]);

  useGameLoop(gameLoop);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Render background
    Background.render(ctx, gameState.camera, canvas.width, canvas.height);
    
    // Render platforms
    gameState.platforms.forEach(platform => {
      Platform.render(ctx, platform, gameState.camera);
    });
    
    // Render ninja
    Ninja.render(ctx, gameState.ninja, gameState.camera);
    
  }, [gameState]);

  useGameLoop(render);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Reset game state when restarting
  useEffect(() => {
    if (phase === 'ready') {
      setGameState(prev => ({
        ...prev,
        ninja: {
          x: 100,
          y: 300,
          velocityY: 0,
          width: 32,
          height: 32,
          isGrounded: false,
          canDoubleJump: true
        },
        camera: { x: 0 },
        score: 0,
        gameSpeed: 2
      }));
    }
  }, [phase]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          background: 'linear-gradient(180deg, #ff6b6b 0%, #ffa500 50%, #ff69b4 100%)',
          touchAction: 'none'
        }}
      />
      <Particles />
      <GameUI 
        score={gameState.score}
        phase={phase}
        onRestart={restart}
        onStart={start}
      />
    </div>
  );
}
