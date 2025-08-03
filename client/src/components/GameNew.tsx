import React, { useRef, useEffect, useState, useCallback } from 'react';
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
    isRunning: boolean;
  };
  platforms: PlatformData[];
  coins: CoinData[];
  camera: { x: number };
  score: number;
  gameSpeed: number;
  backgroundX: number;
}

interface GameProps {
  onGameOver: () => void;
}

export default function Game({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [gameState, setGameState] = useState<GameState>({
    ninja: {
      x: 30, // Fixed spawn on left side of first platform
      y: 318, // On top of first platform (350 - 32)
      velocityY: 0,
      width: 32,
      height: 32,
      isGrounded: true,
      canDoubleJump: true,
      isRunning: false
    },
    platforms: [],
    coins: [],
    camera: { x: 0 },
    score: 0,
    gameSpeed: 1.5, // Slower initial speed
    backgroundX: 0
  });

  const { playHit, playSuccess } = useAudio();

  // Initialize platforms
  useEffect(() => {
    const platforms: PlatformData[] = [];
    let platformId = 0;
    
    // First platform - ninja spawn point
    platforms.push({
      x: 0,
      y: 350,
      width: 200,
      height: 30,
      id: platformId++
    });
    
    // Generate endless platforms
    for (let i = 1; i < 20; i++) {
      const prevPlatform = platforms[i - 1];
      const gap = 100 + Math.random() * 80;
      const heightVariation = (Math.random() - 0.5) * 60;
      
      platforms.push({
        x: prevPlatform.x + prevPlatform.width + gap,
        y: Math.max(250, Math.min(400, prevPlatform.y + heightVariation)),
        width: 120 + Math.random() * 60,
        height: 30,
        id: platformId++
      });
    }
    
    // Add coins to random platforms
    const coins: CoinData[] = [];
    let coinId = 0;
    
    for (let i = 2; i < platforms.length; i++) {
      if (Math.random() > 0.6) {
        const platform = platforms[i];
        coins.push({
          x: platform.x + platform.width / 2 - 8,
          y: platform.y - 25,
          width: 16,
          height: 16,
          id: coinId++,
          collected: false
        });
      }
    }
    
    setGameState(prev => ({
      ...prev,
      platforms,
      coins
    }));
  }, []);

  // Handle click/tap to start or jump
  const handleCanvasClick = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameState(prev => ({
        ...prev,
        ninja: { ...prev.ninja, isRunning: true }
      }));
      return;
    }
    
    if (gameOver) {
      return;
    }
    
    // Jump logic
    setGameState(prev => {
      const ninja = { ...prev.ninja };
      
      if (ninja.isGrounded) {
        ninja.velocityY = -12;
        ninja.isGrounded = false;
        ninja.canDoubleJump = true;
        if (playSuccess) playSuccess();
      } else if (ninja.canDoubleJump) {
        ninja.velocityY = -10;
        ninja.canDoubleJump = false;
        if (playSuccess) playSuccess();
      }
      
      return { ...prev, ninja };
    });
  }, [gameStarted, gameOver, playSuccess]);

  // Game loop
  useEffect(() => {
    if (!gameStarted) return;

    const gameLoop = () => {
      setGameState(prev => {
        const newState = { ...prev };
        const ninja = { ...newState.ninja };
        
        // Apply gravity
        if (!ninja.isGrounded) {
          ninja.velocityY += 0.5;
        }
        ninja.y += ninja.velocityY;
        
        // Move camera and background with ninja
        if (ninja.isRunning) {
          ninja.x += newState.gameSpeed;
          newState.camera.x += newState.gameSpeed;
          newState.backgroundX += newState.gameSpeed; // Same speed as foreground
        }
        
        // Platform collision detection
        ninja.isGrounded = false;
        newState.platforms.forEach(platform => {
          if (ninja.x + ninja.width > platform.x &&
              ninja.x < platform.x + platform.width &&
              ninja.y + ninja.height > platform.y &&
              ninja.y + ninja.height < platform.y + platform.height + 10 &&
              ninja.velocityY >= 0) {
            ninja.y = platform.y - ninja.height;
            ninja.velocityY = 0;
            ninja.isGrounded = true;
            ninja.canDoubleJump = true;
          }
        });
        
        // Coin collection
        newState.coins.forEach(coin => {
          if (!coin.collected &&
              ninja.x + ninja.width > coin.x &&
              ninja.x < coin.x + coin.width &&
              ninja.y + ninja.height > coin.y &&
              ninja.y < coin.y + coin.height) {
            coin.collected = true;
            newState.score += 5;
            if (playSuccess) playSuccess();
          }
        });
        
        // Check for successful platform landing (score increase)
        const currentPlatformIndex = newState.platforms.findIndex(platform =>
          ninja.x + ninja.width / 2 > platform.x && ninja.x + ninja.width / 2 < platform.x + platform.width
        );
        
        if (currentPlatformIndex > 0 && ninja.isGrounded) {
          const platformsCleared = Math.floor(ninja.x / 200);
          if (platformsCleared > Math.floor((ninja.x - newState.gameSpeed) / 200)) {
            newState.score += 1;
            // Increase speed slightly with each successful jump
            newState.gameSpeed = Math.min(4, newState.gameSpeed + 0.05);
          }
        }
        
        // Game over check - if ninja falls below screen
        if (ninja.y > 600) {
          setGameOver(true);
          setTimeout(() => onGameOver(), 3000);
          return newState;
        }
        
        // Generate new platforms as needed
        const lastPlatform = newState.platforms[newState.platforms.length - 1];
        if (lastPlatform.x < newState.camera.x + 1200) {
          const gap = 100 + Math.random() * 80;
          const heightVariation = (Math.random() - 0.5) * 60;
          const newPlatform = {
            x: lastPlatform.x + lastPlatform.width + gap,
            y: Math.max(250, Math.min(400, lastPlatform.y + heightVariation)),
            width: 120 + Math.random() * 60,
            height: 30,
            id: Date.now()
          };
          newState.platforms.push(newPlatform);
          
          // Maybe add a coin
          if (Math.random() > 0.6) {
            newState.coins.push({
              x: newPlatform.x + newPlatform.width / 2 - 8,
              y: newPlatform.y - 25,
              width: 16,
              height: 16,
              id: Date.now(),
              collected: false
            });
          }
        }
        
        // Speed increases naturally with successful jumps (handled above)
        
        newState.ninja = ninja;
        return newState;
      });
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, playSuccess, onGameOver]);

  // Render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');  // Sky blue
      gradient.addColorStop(0.7, '#F0E68C'); // Khaki
      gradient.addColorStop(1, '#DDA0DD');   // Plum
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Anime-style Japanese city skyline (moving at same speed as platforms)
      ctx.fillStyle = 'rgba(60, 60, 120, 0.4)';
      for (let i = 0; i < 15; i++) {
        const buildingX = (i * 150) - (gameState.backgroundX) % 2250;
        const buildingHeight = 80 + Math.sin(i * 0.7) * 40;
        
        // Main building
        ctx.fillRect(buildingX, canvas.height - buildingHeight, 120, buildingHeight);
        
        // Building details - windows
        ctx.fillStyle = 'rgba(255, 255, 100, 0.6)';
        for (let w = 0; w < 3; w++) {
          for (let h = 0; h < Math.floor(buildingHeight / 20); h++) {
            if (Math.random() > 0.3) {
              ctx.fillRect(buildingX + 20 + w * 30, canvas.height - buildingHeight + h * 20 + 10, 8, 8);
            }
          }
        }
        
        // Rooftop details
        ctx.fillStyle = 'rgba(80, 80, 140, 0.6)';
        ctx.fillRect(buildingX + 10, canvas.height - buildingHeight - 10, 100, 10);
        
        ctx.fillStyle = 'rgba(60, 60, 120, 0.4)';
      }
      
      ctx.save();
      ctx.translate(-gameState.camera.x, 0);
      
      // Draw rooftop platforms
      gameState.platforms.forEach(platform => {
        // Rooftop base
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        
        // Rooftop surface
        ctx.fillStyle = '#CD853F';
        ctx.fillRect(platform.x, platform.y, platform.width, 8);
        
        // Rooftop edge highlight
        ctx.fillStyle = '#F4A460';
        ctx.fillRect(platform.x, platform.y, platform.width, 3);
        
        // Rooftop tiles pattern
        ctx.fillStyle = '#A0522D';
        for (let i = 0; i < platform.width; i += 20) {
          ctx.fillRect(platform.x + i, platform.y + 3, 1, 5);
        }
      });
      
      // Draw coins
      ctx.fillStyle = '#FFD700';
      gameState.coins.forEach(coin => {
        if (!coin.collected) {
          ctx.beginPath();
          ctx.arc(coin.x + coin.width/2, coin.y + coin.height/2, coin.width/2, 0, Math.PI * 2);
          ctx.fill();
          
          // Coin sparkle
          ctx.fillStyle = '#FFFF00';
          ctx.beginPath();
          ctx.arc(coin.x + coin.width/2 - 3, coin.y + coin.height/2 - 3, 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#FFD700';
        }
      });
      
      // Draw ninja sprite
      const ninja = gameState.ninja;
      
      if (ninja.isGrounded && ninja.isRunning) {
        // Running ninja animation
        ctx.fillStyle = '#2C3E50'; // Dark blue ninja suit
        ctx.fillRect(ninja.x + 4, ninja.y + 4, 24, 24);
        
        // Ninja head
        ctx.fillStyle = '#34495E';
        ctx.fillRect(ninja.x + 8, ninja.y, 16, 12);
        
        // Running legs animation
        const legOffset = Math.sin(Date.now() * 0.015) * 4;
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(ninja.x + 8, ninja.y + 24, 6, 8 + legOffset);
        ctx.fillRect(ninja.x + 18, ninja.y + 24, 6, 8 - legOffset);
        
        // Arms animation
        const armOffset = Math.sin(Date.now() * 0.015 + Math.PI) * 3;
        ctx.fillRect(ninja.x + 2, ninja.y + 8 + armOffset, 4, 12);
        ctx.fillRect(ninja.x + 26, ninja.y + 8 - armOffset, 4, 12);
        
      } else {
        // Jumping ninja
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(ninja.x + 4, ninja.y + 4, 24, 24);
        
        // Head
        ctx.fillStyle = '#34495E';
        ctx.fillRect(ninja.x + 8, ninja.y, 16, 12);
        
        // Extended legs for jumping
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(ninja.x + 10, ninja.y + 24, 5, 8);
        ctx.fillRect(ninja.x + 17, ninja.y + 24, 5, 8);
        
        // Extended arms
        ctx.fillRect(ninja.x + 2, ninja.y + 6, 4, 14);
        ctx.fillRect(ninja.x + 26, ninja.y + 6, 4, 14);
      }
      
      // Ninja eyes (red glow)
      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(ninja.x + 11, ninja.y + 4, 3, 3);
      ctx.fillRect(ninja.x + 18, ninja.y + 4, 3, 3);
      
      // Ninja weapon on back
      ctx.fillStyle = '#95A5A6';
      ctx.fillRect(ninja.x + 26, ninja.y + 8, 2, 12);
      
      ctx.restore();
      
      requestAnimationFrame(render);
    };
    
    render();
  }, [gameState]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        style={{
          display: 'block',
          touchAction: 'none',
          cursor: 'pointer'
        }}
      />
      
      {/* Score display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontSize: '2rem',
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: 'bold',
        color: '#fff',
        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
        zIndex: 10
      }}>
        Score: {gameState.score}
      </div>
      
      {/* Tap to start instructions */}
      {!gameStarted && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: '1.2rem',
          fontFamily: '"Orbitron", sans-serif',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          zIndex: 10,
          animation: 'fadeInOut 2s infinite'
        }}>
          Tap to start
        </div>
      )}
      
      {/* Game over screen */}
      {gameOver && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          color: 'white',
          fontSize: '2rem',
          fontFamily: '"Orbitron", sans-serif',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          zIndex: 10,
          background: 'rgba(0,0,0,0.7)',
          padding: '40px',
          borderRadius: '20px'
        }}>
          <div style={{ marginBottom: '20px', fontSize: '3rem', color: '#ff4444' }}>
            Game Over
          </div>
          <div style={{ marginBottom: '20px' }}>
            Final Score: {gameState.score}
          </div>
          <div style={{ fontSize: '1.2rem' }}>
            Returning to menu...
          </div>
        </div>
      )}
    </div>
  );
}