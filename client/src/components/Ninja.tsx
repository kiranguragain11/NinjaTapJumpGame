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
    },
    camera: { x: number }
  ) {
    const screenX = ninja.x - camera.x;
    
    // Don't render if off screen
    if (screenX < -ninja.width || screenX > ctx.canvas.width + ninja.width) {
      return;
    }
    
    ctx.save();
    
    // Ninja body (simple colored rectangle for now)
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(screenX, ninja.y, ninja.width, ninja.height);
    
    // Ninja face
    ctx.fillStyle = '#f4c2a1';
    ctx.fillRect(screenX + 8, ninja.y + 6, 16, 12);
    
    // Ninja eyes
    ctx.fillStyle = '#000';
    ctx.fillRect(screenX + 10, ninja.y + 8, 2, 2);
    ctx.fillRect(screenX + 20, ninja.y + 8, 2, 2);
    
    // Ninja mask
    ctx.fillStyle = '#34495e';
    ctx.fillRect(screenX + 6, ninja.y + 12, 20, 8);
    
    // Arms
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(screenX - 4, ninja.y + 12, 8, 12);
    ctx.fillRect(screenX + 28, ninja.y + 12, 8, 12);
    
    // Legs
    ctx.fillRect(screenX + 6, ninja.y + 24, 8, 12);
    ctx.fillRect(screenX + 18, ninja.y + 24, 8, 12);
    
    // Add running animation effect
    if (ninja.isGrounded) {
      const runCycle = Date.now() * 0.01;
      ctx.fillStyle = '#95a5a6';
      // Simple leg movement effect
      ctx.fillRect(screenX + 6 + Math.sin(runCycle) * 2, ninja.y + 30, 4, 6);
      ctx.fillRect(screenX + 18 + Math.sin(runCycle + Math.PI) * 2, ninja.y + 30, 4, 6);
    }
    
    // Add jump effect
    if (!ninja.isGrounded && ninja.velocityY < 0) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(screenX - 2, ninja.y - 2, ninja.width + 4, ninja.height + 4);
    }
    
    ctx.restore();
  }
}
