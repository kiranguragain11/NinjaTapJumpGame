import React, { useEffect } from 'react';
import { getLocalStorage, setLocalStorage } from '../lib/utils';
import { useAudio } from '../lib/stores/useAudio';
import { GamePhase } from '../lib/stores/useGame';

interface GameUIProps {
  score: number;
  phase: GamePhase;
  onRestart: () => void;
  onStart: () => void;
  onReady: () => void;
}

export default function GameUI({ score, phase, onRestart, onStart, onReady }: GameUIProps) {
  const { toggleMute, isMuted } = useAudio();
  
  // Get high score
  const highScore = getLocalStorage('ninja-high-score') || 0;
  
  // Update high score when score changes
  useEffect(() => {
    if (score > highScore) {
      setLocalStorage('ninja-high-score', score);
    }
  }, [score, highScore]);

  const uiStyle = {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none' as const,
    fontFamily: '"Sawarabi Mincho", serif',
    color: 'white',
    zIndex: 10
  };

  const buttonStyle = {
    pointerEvents: 'auto' as const,
    fontSize: '1.2rem',
    padding: '10px 20px',
    background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
    border: 'none',
    borderRadius: '25px',
    color: 'white',
    cursor: 'pointer',
    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s',
    fontFamily: '"Sawarabi Mincho", serif',
    margin: '5px'
  };

  return (
    <div style={uiStyle}>
      {/* Score Display */}
      {phase === 'playing' && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '15px 25px',
          borderRadius: '15px',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
            スコア: {score}
          </div>
          <div style={{ fontSize: '1rem', opacity: 0.8 }}>
            最高: {Math.max(score, highScore)}
          </div>
        </div>
      )}

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        style={{
          ...buttonStyle,
          position: 'absolute',
          top: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem'
        }}
        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      {/* Start Screen */}
      {phase === 'start' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: window.innerWidth < 768 ? '40px 20px' : '60px',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          maxWidth: window.innerWidth < 768 ? '90vw' : 'none'
        }}>
          <h1 style={{ 
            fontSize: window.innerWidth < 768 ? '2.5rem' : '4rem', 
            marginBottom: '1rem',
            color: 'white',
            textShadow: '0 4px 8px rgba(0,0,0,0.5)',
            fontFamily: 'Sawarabi Mincho, serif'
          }}>
            किरण गुरागाईं निन्जा
          </h1>
          <h2 style={{ 
            fontSize: window.innerWidth < 768 ? '1.8rem' : '2.5rem', 
            marginBottom: '2rem',
            color: '#ff69b4',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>
            Sakura Run
          </h2>
          <p style={{ 
            fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem', 
            marginBottom: '2rem', 
            opacity: 0.9,
            padding: window.innerWidth < 768 ? '0 20px' : '0'
          }}>
            Jump across Japanese rooftops in this endless runner!<br/>
            {window.innerWidth < 768 ? 'Tap anywhere to begin!' : 'Click anywhere to begin your ninja adventure!'}
          </p>
        </div>
      )}

      {/* Ready Screen */}
      {phase === 'ready' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.8)',
          padding: window.innerWidth < 768 ? '30px 20px' : '40px',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)',
          maxWidth: window.innerWidth < 768 ? '90vw' : 'none'
        }}>
          <h2 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
            準備完了!
          </h2>
          <p style={{ 
            fontSize: window.innerWidth < 768 ? '1rem' : '1.2rem', 
            marginBottom: '2rem',
            padding: window.innerWidth < 768 ? '0 20px' : '0'
          }}>
            {window.innerWidth < 768 ? 'Tap to jump!' : 'Tap SPACE or Click to jump!'}<br/>
            Double tap for double jump!<br/>
            Collect golden coins for bonus points!
          </p>
          <button
            onClick={onStart}
            style={buttonStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            始める (Start)
          </button>
        </div>
      )}

      {/* Game Over Screen */}
      {phase === 'ended' && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          background: 'rgba(0, 0, 0, 0.9)',
          padding: '40px',
          borderRadius: '20px',
          backdropFilter: 'blur(10px)'
        }}>
          <h2 style={{ 
            fontSize: '3rem', 
            marginBottom: '1rem',
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ゲームオーバー
          </h2>
          <div style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            スコア: {score}
          </div>
          <div style={{ fontSize: '1.2rem', marginBottom: '2rem', opacity: 0.8 }}>
            最高スコア: {Math.max(score, highScore)}
          </div>
          {score > highScore && (
            <div style={{ 
              fontSize: '1.3rem', 
              marginBottom: '2rem',
              color: '#ffff00',
              textShadow: '0 0 10px rgba(255, 255, 0, 0.5)'
            }}>
              🎉 新記録! 🎉
            </div>
          )}
          <button
            onClick={onRestart}
            style={buttonStyle}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            もう一度 (Restart)
          </button>
          <div style={{ 
            marginTop: '1rem', 
            fontSize: '0.9rem', 
            opacity: 0.7,
            display: window.innerWidth < 768 ? 'none' : 'block'
          }}>
            Press R to restart quickly
          </div>
        </div>
      )}

      {/* Instructions for mobile */}
      {phase === 'playing' && window.innerWidth < 768 && (
        <div style={{
          position: 'absolute',
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.7)',
          padding: '10px 20px',
          borderRadius: '20px',
          fontSize: '0.9rem',
          opacity: 0.8,
          textAlign: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          Tap anywhere to jump! 🥷
        </div>
      )}
    </div>
  );
}
