import { useRef, useEffect, useState, useCallback } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { useControls } from '../hooks/useControls';
import Ninja from './Ninja';
import Platform from './Platform';
import Background from './Background';
import Particles from './Particles';
import GameUI from './GameUI';
import Coin from './Coin';
import { checkCollision } from '../utils/collision';
import { applyGravity, updateVelocity } from '../utils/physics';
import { useGame } from '../lib/stores/useGame';
import { useAudio } from '../lib/stores/useAudio';

interface PlatformData {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
}

interface CoinData {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
  collected: boolean;
}

interface GameState {
  ninja: {
    x: number;
    y: number;
    velocityY: number;
    width: number;
    height: number;
    isGrounded: boolean;
    canDoubleJump: boolean;
    animationFrame: number;
    jumpFrame: number;
  };
  platforms: PlatformData[];
  coins: CoinData[];
  camera: {
    x: number;
  };
  score: number;
  gameSpeed: number;
  platformIdCounter: number;
  coinIdCounter: number;
  platformsJumped: number;
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
      canDoubleJump: true,
      animationFrame: 0,
      jumpFrame: 0
    },
    platforms: [],
    coins: [],
    camera: { x: 0 },
    score: 0,
    gameSpeed: 3,
    platformIdCounter: 0,
    coinIdCounter: 0,
    platformsJumped: 0
  });

  const { phase, ready, start, end, restart } = useGame();
  const { playHit, playSuccess, backgroundMusic, isMuted } = useAudio();
  
  // Track score changes for sound effects
  const [lastScore, setLastScore] = useState(0);
  
  useEffect(() => {
    if (gameState.score > lastScore && phase === 'playing') {
      const scoreDiff = gameState.score - lastScore;
      if (scoreDiff >= 5) {
        // Coin collected (5 points)
        playSuccess();
      } else if (scoreDiff === 1) {
        // Platform jump (1 point)
        playSuccess();
      }
      setLastScore(gameState.score);
    }
  }, [gameState.score, lastScore, phase, playSuccess]);
  
  const controls = useControls();

  // Initialize platforms for endless runner
  useEffect(() => {
    const initialPlatforms: PlatformData[] = [];
    let platformId = 0;
    
    // First platform where ninja starts
    initialPlatforms.push({
      x: 0,
      y: 350,
      width: 200,
      height: 30,
      id: platformId++
    });
    
    // Generate initial set of platforms with coins
    for (let i = 1; i < 10; i++) {
      const prevPlatform = initialPlatforms[i - 1];
      const gap = 120 + Math.random() * 100; // Random gap between 120-220px
      const heightVariation = (Math.random() - 0.5) * 80; // Height can vary by ±40px
      
      initialPlatforms.push({
        x: prevPlatform.x + prevPlatform.width + gap,
        y: Math.max(200, Math.min(400, prevPlatform.y + heightVariation)),
        width: 120 + Math.random() * 80, // Platform width varies
        height: 30,
        id: platformId++
      });
    }
    
    // Add coins to some platforms
    const initialCoins: CoinData[] = [];
    let coinId = 0;
    initialPlatforms.forEach((platform, index) => {
      if (index > 0 && Math.random() < 0.4) { // 40% chance for coin
        initialCoins.push({
          x: platform.x + platform.width / 2 - 10,
          y: platform.y - 25,
          width: 20,
          height: 20,
          id: coinId++,
          collected: false
        });
      }
    });
    
    setGameState(prev => ({ 
      ...prev, 
      platforms: initialPlatforms,
      coins: initialCoins,
      platformIdCounter: platformId,
      coinIdCounter: coinId
    }));
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
        if (phase === 'start') {
          ready();
        } else if (phase === 'ready') {
          start();
        } else if (phase === 'playing') {
          handleJump();
        }
      }
      if (e.code === 'KeyR' && phase === 'ended') {
        restart();
      }
    };

    const handleTouch = (e: TouchEvent) => {
      e.preventDefault();
      if (phase === 'start') {
        ready();
      } else if (phase === 'ready') {
        start();
      } else if (phase === 'playing') {
        handleJump();
      } else if (phase === 'ended') {
        restart();
      }
    };

    const handleClick = (e: MouseEvent) => {
      e.preventDefault();
      if (phase === 'start') {
        ready();
      } else if (phase === 'ready') {
        start();
      } else if (phase === 'playing') {
        handleJump();
      } else if (phase === 'ended') {
        restart();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('touchend', handleTouch, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchend', handleTouch);
    };
  }, [handleJump, phase, ready, start, restart]);

  const gameLoop = useCallback(() => {
    if (phase !== 'playing') return;

    setGameState(prev => {
      const newState = { ...prev };
      let wasGrounded = newState.ninja.isGrounded;
      
      // Apply gravity to ninja
      newState.ninja = applyGravity(newState.ninja);
      
      // Update ninja animation frames
      newState.ninja.animationFrame = (newState.ninja.animationFrame + 1) % 8;
      if (!newState.ninja.isGrounded) {
        newState.ninja.jumpFrame = (newState.ninja.jumpFrame + 1) % 4;
      }
      
      // Move all platforms and coins to the left to simulate ninja running forward
      newState.platforms = newState.platforms.map(platform => ({
        ...platform,
        x: platform.x - newState.gameSpeed
      }));
      
      newState.coins = newState.coins.map(coin => ({
        ...coin,
        x: coin.x - newState.gameSpeed
      }));
      
      // Update score based on time (distance traveled)
      newState.score += Math.floor(newState.gameSpeed / 10);
      
      // Increase difficulty over time (speed increases gradually)
      newState.gameSpeed = Math.min(3 + newState.score * 0.001, 10);
      
      // Check platform collisions and award points for successful jumps
      let onPlatform = false;
      newState.ninja.isGrounded = false;
      
      newState.platforms.forEach(platform => {
        if (checkCollision(newState.ninja, platform)) {
          // Landing on top of platform
          if (newState.ninja.velocityY >= 0 && 
              newState.ninja.y + newState.ninja.height - 10 <= platform.y) {
            newState.ninja.y = platform.y - newState.ninja.height;
            newState.ninja.velocityY = 0;
            newState.ninja.isGrounded = true;
            newState.ninja.canDoubleJump = true;
            onPlatform = true;
            
            // Award point for successful platform jump
            if (!wasGrounded) {
              newState.platformsJumped++;
              newState.score += 1;
            }
          }
        }
      });
      
      // Check coin collisions
      newState.coins.forEach(coin => {
        if (!coin.collected && checkCollision(newState.ninja, coin)) {
          coin.collected = true;
          newState.score += 5; // Bonus points for coins
        }
      });
      
      // Check if ninja fell below screen
      if (newState.ninja.y > 600) {
        playHit();
        end();
        return newState;
      }
      
      // Generate new platforms on the right side
      const rightmostPlatform = newState.platforms.reduce((rightmost, platform) => 
        platform.x > rightmost.x ? platform : rightmost, 
        { x: -1000, y: 0, width: 0, height: 0, id: -1 }
      );
      
      // Add new platforms when needed
      if (rightmostPlatform.x < 1200) {
        const gap = 120 + Math.random() * 120; // Random gap between 120-240px
        const heightVariation = (Math.random() - 0.5) * 100; // Height varies ±50px
        const baseHeight = 350; // Base platform height
        
        const newPlatform: PlatformData = {
          x: rightmostPlatform.x + rightmostPlatform.width + gap,
          y: Math.max(200, Math.min(450, baseHeight + heightVariation)),
          width: 100 + Math.random() * 100, // Width varies 100-200px
          height: 30,
          id: newState.platformIdCounter++
        };
        
        newState.platforms.push(newPlatform);
        
        // Add coin to some new platforms
        if (Math.random() < 0.4) { // 40% chance for coin
          newState.coins.push({
            x: newPlatform.x + newPlatform.width / 2 - 10,
            y: newPlatform.y - 25,
            width: 20,
            height: 20,
            id: newState.coinIdCounter++,
            collected: false
          });
        }
      }
      
      // Remove platforms and coins that have moved off screen (left side)
      newState.platforms = newState.platforms.filter(
        platform => platform.x + platform.width > -100
      );
      newState.coins = newState.coins.filter(
        coin => coin.x + coin.width > -100
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
    
    // Calculate background camera position (slower parallax effect)
    const backgroundCamera = { 
      x: gameState.score * 0.5 // Background moves much slower than platforms
    };
    
    // Render background with parallax effect
    Background.render(ctx, backgroundCamera, canvas.width, canvas.height);
    
    // Render platforms (no camera offset since they move themselves)
    gameState.platforms.forEach(platform => {
      Platform.render(ctx, platform, { x: 0 }); // No camera offset needed
    });
    
    // Render coins
    gameState.coins.forEach(coin => {
      if (!coin.collected) {
        Coin.render(ctx, coin, { x: 0 });
      }
    });
    
    // Render ninja (stationary in screen space)
    Ninja.render(ctx, gameState.ninja, { x: 0 }); // No camera offset needed
    
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
          canDoubleJump: true,
          animationFrame: 0,
          jumpFrame: 0
        },
        camera: { x: 0 },
        score: 0,
        gameSpeed: 3,
        platformsJumped: 0
      }));
      setLastScore(0);
    }
  }, [phase]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          background: 'linear-gradient(180deg, #ff6b6b 0%, #ffa500 50%, #ff69b4 100%)',
          touchAction: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
          WebkitTouchCallout: 'none',
          WebkitTapHighlightColor: 'transparent'
        }}
      />
      <Particles />
      <GameUI 
        score={gameState.score}
        phase={phase}
        onRestart={restart}
        onStart={start}
        onReady={ready}
      />
    </div>
  );
}
