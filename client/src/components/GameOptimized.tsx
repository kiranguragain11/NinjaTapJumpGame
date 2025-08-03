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

interface GameProps {
  onGameOver: () => void;
}

// PWA Install component
const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  if (!isInstallable) return null;

  return (
    <button
      onClick={handleInstall}
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'rgba(63, 81, 181, 0.9)',
        border: 'none',
        borderRadius: '50%',
        width: '50px',
        height: '50px',
        color: 'white',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)'
      }}
      onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      title="Install Game"
    >
      ⬇
    </button>
  );
};

export default function Game({ onGameOver }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const scoreUpdateRef = useRef<number>(0);
  
  // Game state - using refs for performance (no React re-renders)
  const gameStateRef = useRef({
    ninja: {
      x: 30,
      y: 318,
      velocityY: 0,
      width: 32,
      height: 32,
      isGrounded: true,
      canDoubleJump: true,
      isRunning: false
    },
    platforms: [] as PlatformData[],
    coins: [] as CoinData[],
    camera: { x: 0 },
    score: 0,
    gameSpeed: 3,
    backgroundX: 0,
    platformIdCounter: 0,
    coinIdCounter: 0
  });

  // React state only for UI updates
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  const { playHit, playSuccess } = useAudio();

  // Initialize platforms once
  const initializePlatforms = useCallback(() => {
    const platforms: PlatformData[] = [];
    let platformId = 0;
    
    // First platform
    platforms.push({
      x: 0,
      y: 350,
      width: 200,
      height: 30,
      id: platformId++
    });
    
    // Generate initial platforms
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
    
    // Add coins
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
    
    gameStateRef.current.platforms = platforms;
    gameStateRef.current.coins = coins;
    gameStateRef.current.platformIdCounter = platformId;
    gameStateRef.current.coinIdCounter = coinId;
  }, []);

  // Handle input
  const handleCanvasClick = useCallback(() => {
    if (!gameStarted) {
      setGameStarted(true);
      gameStateRef.current.ninja.isRunning = true;
      return;
    }
    
    if (gameOver) return;
    
    // Jump logic
    const ninja = gameStateRef.current.ninja;
    
    if (ninja.isGrounded) {
      ninja.velocityY = -15;
      ninja.isGrounded = false;
      ninja.canDoubleJump = true;
      if (playSuccess) playSuccess();
    } else if (ninja.canDoubleJump) {
      ninja.velocityY = -13;
      ninja.canDoubleJump = false;
      if (playSuccess) playSuccess();
    }
  }, [gameStarted, gameOver, playSuccess]);

  // Main game loop - optimized for 60 FPS
  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const gameLoop = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Cap deltaTime to prevent large jumps
      const cappedDelta = Math.min(deltaTime, 16.67); // Max 60 FPS
      const timeMultiplier = cappedDelta / 16.67; // Normalize to 60 FPS
      
      const gameState = gameStateRef.current;
      const ninja = gameState.ninja;
      
      // Apply gravity
      if (!ninja.isGrounded) {
        ninja.velocityY += 0.8 * timeMultiplier;
      }
      ninja.y += ninja.velocityY * timeMultiplier;
      
      // Move ninja and camera
      if (ninja.isRunning) {
        const moveAmount = gameState.gameSpeed * timeMultiplier;
        ninja.x += moveAmount;
        gameState.camera.x += moveAmount;
        gameState.backgroundX += moveAmount;
      }
      
      // Platform collision detection - only check visible platforms
      ninja.isGrounded = false;
      const visiblePlatforms = gameState.platforms.filter(p => 
        p.x + p.width > gameState.camera.x - 100 && p.x < gameState.camera.x + 1300
      );
      
      for (const platform of visiblePlatforms) {
        if (ninja.x + ninja.width > platform.x &&
            ninja.x < platform.x + platform.width &&
            ninja.y + ninja.height > platform.y &&
            ninja.y + ninja.height < platform.y + platform.height + 10 &&
            ninja.velocityY >= 0) {
          ninja.y = platform.y - ninja.height;
          ninja.velocityY = 0;
          ninja.isGrounded = true;
          ninja.canDoubleJump = true;
          break;
        }
      }
      
      // Coin collection - only check visible coins
      const visibleCoins = gameState.coins.filter(c => 
        !c.collected && c.x + c.width > gameState.camera.x - 100 && c.x < gameState.camera.x + 1300
      );
      
      for (const coin of visibleCoins) {
        if (ninja.x + ninja.width > coin.x &&
            ninja.x < coin.x + coin.width &&
            ninja.y + ninja.height > coin.y &&
            ninja.y < coin.y + coin.height) {
          coin.collected = true;
          gameState.score += 5;
          if (playSuccess) playSuccess();
          break;
        }
      }
      
      // Platform scoring
      const currentPlatformIndex = gameState.platforms.findIndex(platform =>
        ninja.x + ninja.width / 2 > platform.x && ninja.x + ninja.width / 2 < platform.x + platform.width
      );
      
      if (currentPlatformIndex > 0 && ninja.isGrounded) {
        const platformsCleared = Math.floor(ninja.x / 200);
        if (platformsCleared > Math.floor((ninja.x - gameState.gameSpeed) / 200)) {
          gameState.score += 1;
          gameState.gameSpeed = Math.min(6, gameState.gameSpeed + 0.1);
        }
      }
      
      // Game over check
      if (ninja.y > 600) {
        setGameOver(true);
        setTimeout(() => onGameOver(), 3000);
        return;
      }
      
      // Generate new platforms/coins when needed
      const lastPlatform = gameState.platforms[gameState.platforms.length - 1];
      if (lastPlatform.x < gameState.camera.x + 1200) {
        const gap = 100 + Math.random() * 80;
        const heightVariation = (Math.random() - 0.5) * 60;
        const newPlatform = {
          x: lastPlatform.x + lastPlatform.width + gap,
          y: Math.max(250, Math.min(400, lastPlatform.y + heightVariation)),
          width: 120 + Math.random() * 60,
          height: 30,
          id: gameState.platformIdCounter++
        };
        gameState.platforms.push(newPlatform);
        
        if (Math.random() > 0.6) {
          gameState.coins.push({
            x: newPlatform.x + newPlatform.width / 2 - 8,
            y: newPlatform.y - 25,
            width: 16,
            height: 16,
            id: gameState.coinIdCounter++,
            collected: false
          });
        }
      }
      
      // Cleanup off-screen objects
      gameState.platforms = gameState.platforms.filter(p => p.x + p.width > gameState.camera.x - 200);
      gameState.coins = gameState.coins.filter(c => c.x + c.width > gameState.camera.x - 200);
      
      // Update score display periodically (not every frame)
      scoreUpdateRef.current += deltaTime;
      if (scoreUpdateRef.current > 200) { // Update every 200ms
        setDisplayScore(gameState.score);
        scoreUpdateRef.current = 0;
      }
      
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };
    
    // Start the game loop
    animationFrameRef.current = requestAnimationFrame(gameLoop);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameStarted, gameOver, playSuccess, onGameOver]);

  // Render function
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const render = () => {
      const gameState = gameStateRef.current;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(0.7, '#F0E68C');
      gradient.addColorStop(1, '#DDA0DD');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Multi-layer city background
      ctx.fillStyle = 'rgba(40, 40, 80, 0.3)';
      for (let i = 0; i < 20; i++) {
        const buildingX = (i * 100) - (gameState.backgroundX * 0.8) % 2000;
        const buildingHeight = 60 + Math.sin(i * 0.5) * 30;
        ctx.fillRect(buildingX, canvas.height - buildingHeight - 100, 80, buildingHeight);
      }
      
      ctx.fillStyle = 'rgba(60, 60, 120, 0.5)';
      for (let i = 0; i < 15; i++) {
        const buildingX = (i * 150) - (gameState.backgroundX) % 2250;
        const buildingHeight = 120 + Math.sin(i * 0.7) * 50;
        
        ctx.fillRect(buildingX, canvas.height - buildingHeight, 120, buildingHeight);
        
        ctx.fillStyle = 'rgba(255, 255, 100, 0.7)';
        for (let w = 0; w < 3; w++) {
          for (let h = 0; h < Math.floor(buildingHeight / 25); h++) {
            if ((w + h + i) % 3 !== 0) {
              ctx.fillRect(buildingX + 20 + w * 30, canvas.height - buildingHeight + h * 25 + 15, 10, 10);
            }
          }
        }
        
        ctx.fillStyle = 'rgba(80, 80, 140, 0.7)';
        ctx.fillRect(buildingX + 5, canvas.height - buildingHeight - 15, 110, 15);
        ctx.fillStyle = 'rgba(60, 60, 120, 0.5)';
      }
      
      ctx.save();
      ctx.translate(-gameState.camera.x, 0);
      
      // Draw platforms
      gameState.platforms.forEach(platform => {
        if (platform.x + platform.width > gameState.camera.x - 100 && platform.x < gameState.camera.x + 1300) {
          ctx.fillStyle = '#8B4513';
          ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
          ctx.fillStyle = '#CD853F';
          ctx.fillRect(platform.x, platform.y, platform.width, 8);
          ctx.fillStyle = '#F4A460';
          ctx.fillRect(platform.x, platform.y, platform.width, 3);
        }
      });
      
      // Draw coins
      gameState.coins.forEach(coin => {
        if (!coin.collected && coin.x + coin.width > gameState.camera.x - 100 && coin.x < gameState.camera.x + 1300) {
          const bounceOffset = Math.sin(Date.now() * 0.008 + coin.id) * 3;
          const spinAngle = (Date.now() * 0.01 + coin.id) % (Math.PI * 2);
          
          ctx.save();
          ctx.translate(coin.x + coin.width/2, coin.y + coin.height/2 + bounceOffset);
          ctx.rotate(spinAngle);
          
          ctx.fillStyle = '#FFD700';
          ctx.fillRect(-coin.width/2, -coin.height/2, coin.width, coin.height);
          ctx.fillStyle = '#FFFF99';
          ctx.fillRect(-coin.width/2 + 2, -coin.height/2 + 2, coin.width - 4, 4);
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(-2, -2, 4, 4);
          
          ctx.restore();
        }
      });
      
      // Draw ninja
      const ninja = gameState.ninja;
      
      if (ninja.isGrounded && ninja.isRunning) {
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(ninja.x + 4, ninja.y + 4, 24, 24);
        ctx.fillStyle = '#34495E';
        ctx.fillRect(ninja.x + 8, ninja.y, 16, 12);
        
        const legOffset = Math.sin(Date.now() * 0.015) * 4;
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(ninja.x + 8, ninja.y + 24, 6, 8 + legOffset);
        ctx.fillRect(ninja.x + 18, ninja.y + 24, 6, 8 - legOffset);
        
        const armOffset = Math.sin(Date.now() * 0.015 + Math.PI) * 3;
        ctx.fillRect(ninja.x + 2, ninja.y + 8 + armOffset, 4, 12);
        ctx.fillRect(ninja.x + 26, ninja.y + 8 - armOffset, 4, 12);
      } else {
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(ninja.x + 4, ninja.y + 4, 24, 24);
        ctx.fillStyle = '#34495E';
        ctx.fillRect(ninja.x + 8, ninja.y, 16, 12);
        ctx.fillStyle = '#2C3E50';
        ctx.fillRect(ninja.x + 10, ninja.y + 24, 5, 8);
        ctx.fillRect(ninja.x + 17, ninja.y + 24, 5, 8);
        ctx.fillRect(ninja.x + 2, ninja.y + 6, 4, 14);
        ctx.fillRect(ninja.x + 26, ninja.y + 6, 4, 14);
      }
      
      ctx.fillStyle = '#E74C3C';
      ctx.fillRect(ninja.x + 11, ninja.y + 4, 3, 3);
      ctx.fillRect(ninja.x + 18, ninja.y + 4, 3, 3);
      ctx.fillStyle = '#95A5A6';
      ctx.fillRect(ninja.x + 26, ninja.y + 8, 2, 12);
      
      ctx.restore();
      
      requestAnimationFrame(render);
    };
    
    render();
  }, []);

  // Initialize game
  useEffect(() => {
    initializePlatforms();
  }, [initializePlatforms]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <PWAInstallButton />
      
      <canvas
        ref={canvasRef}
        width={Math.min(window.innerWidth, 1200)}
        height={Math.min(window.innerHeight, 800)}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        style={{
          display: 'block',
          touchAction: 'none',
          cursor: 'pointer',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: '0 auto',
          backgroundColor: '#000'
        }}
      />
      
      {/* Score display */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontSize: window.innerWidth < 768 ? '1.8rem' : '2.5rem',
        fontFamily: '"Orbitron", sans-serif',
        fontWeight: '900',
        color: '#00FF41',
        textShadow: '0 0 10px rgba(0,255,65,0.8), 2px 2px 4px rgba(0,0,0,0.9)',
        zIndex: 10,
        background: 'rgba(0,0,0,0.3)',
        padding: '10px 20px',
        borderRadius: '10px',
        backdropFilter: 'blur(5px)'
      }}>
        SCORE: {displayScore}
      </div>
      
      {/* Tap to start instructions */}
      {!gameStarted && (
        <div style={{
          position: 'absolute',
          bottom: '50px',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.8)',
          fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem',
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
            Final Score: {displayScore}
          </div>
          <div style={{ fontSize: '1.2rem' }}>
            Returning to menu...
          </div>
        </div>
      )}
    </div>
  );
}