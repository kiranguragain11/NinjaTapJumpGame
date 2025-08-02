export default class Coin {
  static render(
    ctx: CanvasRenderingContext2D,
    coin: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
    camera: { x: number }
  ) {
    const screenX = coin.x - camera.x;
    
    // Don't render if off screen
    if (screenX < -coin.width || screenX > ctx.canvas.width + coin.width) {
      return;
    }
    
    ctx.save();
    
    // Animated coin rotation effect
    const time = Date.now() * 0.005;
    const rotation = Math.sin(time) * 0.3;
    const bobOffset = Math.sin(time * 2) * 2;
    
    // Coin glow effect
    ctx.shadowColor = '#ffeb3b';
    ctx.shadowBlur = 10;
    
    // Coin body (golden circle)
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.ellipse(
      screenX + coin.width / 2, 
      coin.y + coin.height / 2 + bobOffset, 
      coin.width / 2, 
      coin.height / 2 * Math.cos(rotation), 
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    
    // Coin inner ring
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.ellipse(
      screenX + coin.width / 2, 
      coin.y + coin.height / 2 + bobOffset, 
      coin.width / 3, 
      coin.height / 3 * Math.cos(rotation), 
      0, 0, 2 * Math.PI
    );
    ctx.fill();
    
    // Coin center symbol (star)
    ctx.fillStyle = '#ff9800';
    ctx.beginPath();
    const centerX = screenX + coin.width / 2;
    const centerY = coin.y + coin.height / 2 + bobOffset;
    const starSize = 4;
    
    for (let i = 0; i < 5; i++) {
      const angle = (i * 2 * Math.PI) / 5;
      const x = centerX + Math.cos(angle) * starSize;
      const y = centerY + Math.sin(angle) * starSize * Math.cos(rotation);
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.closePath();
    ctx.fill();
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    ctx.restore();
  }
}