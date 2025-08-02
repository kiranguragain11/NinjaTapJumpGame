export default class Platform {
  static render(
    ctx: CanvasRenderingContext2D,
    platform: {
      x: number;
      y: number;
      width: number;
      height: number;
    },
    camera: { x: number }
  ) {
    const screenX = platform.x - camera.x;
    
    // Don't render if off screen
    if (screenX < -platform.width || screenX > ctx.canvas.width + platform.width) {
      return;
    }
    
    ctx.save();
    
    // Platform base (rooftop)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(screenX, platform.y, platform.width, platform.height);
    
    // Rooftop tiles pattern
    ctx.fillStyle = '#a0522d';
    for (let i = 0; i < platform.width; i += 20) {
      ctx.fillRect(screenX + i, platform.y, 18, 4);
    }
    
    // Platform shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(screenX + 2, platform.y + platform.height, platform.width, 4);
    
    // Japanese roof details
    ctx.fillStyle = '#654321';
    ctx.fillRect(screenX - 5, platform.y - 5, platform.width + 10, 8);
    
    // Roof edge decoration
    ctx.fillStyle = '#8b4513';
    for (let i = 0; i < platform.width + 10; i += 15) {
      ctx.fillRect(screenX - 5 + i, platform.y - 3, 2, 4);
    }
    
    ctx.restore();
  }
}
