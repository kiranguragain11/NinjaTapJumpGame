export default class Ninja {
  static render(
    ctx: CanvasRenderingContext2D,
    ninja: {
      x: number;
      y: number;
      width: number;
      height: number;
      velocityY: number;
      isGrounded: boolean;
      animationFrame: number;
      jumpFrame?: number;
    },
    camera: { x: number }
  ) {
    const screenX = ninja.x - camera.x;
    
    // Don't render if off screen
    if (screenX < -ninja.width || screenX > ctx.canvas.width + ninja.width) {
      return;
    }
    
    ctx.save();
    
    // Animation variables
    const runCycle = ninja.animationFrame * 0.5;
    const bobOffset = ninja.isGrounded ? Math.sin(runCycle) * 1 : 0;
    const armSwing = ninja.isGrounded ? Math.sin(runCycle) * 3 : 0;
    const legMove = ninja.isGrounded ? Math.sin(runCycle) * 4 : 0;
    
    // Jump animation
    const jumpFrame = ninja.jumpFrame || 0;
    const jumpScale = ninja.isGrounded ? 1 : 1 + Math.sin(jumpFrame * 0.5) * 0.1;
    
    // Shadow
    if (ninja.isGrounded) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(screenX + 2, ninja.y + ninja.height + 2, ninja.width - 4, 4);
    }
    
    // Ninja body (dark blue/black ninja outfit)
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(screenX + 6, ninja.y + 8 + bobOffset, 20, 20);
    
    // Ninja face (visible area around eyes)
    ctx.fillStyle = '#f4c2a1';
    ctx.fillRect(screenX + 10, ninja.y + 6 + bobOffset, 12, 8);
    
    // Ninja eyes (glowing white dots)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(screenX + 11, ninja.y + 8 + bobOffset, 3, 2);
    ctx.fillRect(screenX + 18, ninja.y + 8 + bobOffset, 3, 2);
    
    // Ninja mask/hood
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(screenX + 4, ninja.y + 4 + bobOffset, 24, 6);
    ctx.fillRect(screenX + 8, ninja.y + 12 + bobOffset, 16, 4);
    
    // Arms with animation
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(screenX + 2 + armSwing, ninja.y + 10 + bobOffset, 6, 14);
    ctx.fillRect(screenX + 24 - armSwing, ninja.y + 10 + bobOffset, 6, 14);
    
    // Legs with running animation
    ctx.fillStyle = '#1a1a2e';
    if (ninja.isGrounded) {
      // Animated running legs
      ctx.fillRect(screenX + 8 + legMove, ninja.y + 22 + bobOffset, 6, 10);
      ctx.fillRect(screenX + 18 - legMove, ninja.y + 22 + bobOffset, 6, 10);
    } else {
      // Static jumping pose
      ctx.fillRect(screenX + 8, ninja.y + 22, 6, 10);
      ctx.fillRect(screenX + 18, ninja.y + 22, 6, 10);
    }
    
    // Ninja weapons/tools on belt
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(screenX + 12, ninja.y + 18 + bobOffset, 8, 2);
    
    // Shuriken on belt (small details)
    ctx.fillStyle = '#c0c0c0';
    ctx.fillRect(screenX + 14, ninja.y + 17 + bobOffset, 2, 2);
    ctx.fillRect(screenX + 18, ninja.y + 17 + bobOffset, 2, 2);
    
    // Jump effect (energy trail)
    if (!ninja.isGrounded && ninja.velocityY < 0) {
      ctx.fillStyle = 'rgba(100, 200, 255, 0.4)';
      ctx.fillRect(screenX - 2, ninja.y + ninja.height, ninja.width + 4, 6);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.fillRect(screenX + 4, ninja.y + ninja.height + 2, ninja.width - 8, 2);
    }
    
    // Speed lines when running fast
    if (ninja.isGrounded) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(screenX - 10 - i * 8, ninja.y + 10 + i * 4);
        ctx.lineTo(screenX - 20 - i * 8, ninja.y + 12 + i * 4);
        ctx.stroke();
      }
    }
    
    ctx.restore();
  }
}
