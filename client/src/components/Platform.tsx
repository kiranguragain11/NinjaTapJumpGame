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
    
    // Building structure below platform
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(screenX, platform.y + platform.height, platform.width, 100);
    
    // Building windows
    ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
    for (let x = 10; x < platform.width - 10; x += 20) {
      for (let y = 40; y < 90; y += 25) {
        if (Math.random() > 0.3) {
          ctx.fillRect(screenX + x, platform.y + platform.height + y, 12, 15);
        }
      }
    }
    
    // Platform base (traditional Japanese roof)
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(screenX, platform.y, platform.width, platform.height);
    
    // Traditional Japanese roof tiles pattern
    ctx.fillStyle = '#a0522d';
    for (let i = 0; i < platform.width; i += 16) {
      // Curved tile effect
      ctx.fillRect(screenX + i, platform.y, 14, 6);
      ctx.fillRect(screenX + i + 2, platform.y + 6, 10, 4);
    }
    
    // Roof edge (traditional curved overhang)
    ctx.fillStyle = '#654321';
    ctx.fillRect(screenX - 8, platform.y - 6, platform.width + 16, 10);
    
    // Curved roof details
    ctx.fillStyle = '#7a4a2a';
    ctx.fillRect(screenX - 6, platform.y - 4, platform.width + 12, 6);
    
    // Decorative roof edge elements
    ctx.fillStyle = '#5d4037';
    for (let i = 0; i < platform.width + 12; i += 20) {
      ctx.fillRect(screenX - 6 + i, platform.y - 6, 3, 8);
    }
    
    // Traditional Japanese roof ornaments
    const centerX = screenX + platform.width / 2;
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(centerX - 4, platform.y - 10, 8, 6);
    
    // Lantern (if platform is wide enough)
    if (platform.width > 150) {
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(centerX - 3, platform.y - 18, 6, 12);
      ctx.fillStyle = '#ffeb3b';
      ctx.fillRect(centerX - 2, platform.y - 16, 4, 8);
    }
    
    // Platform shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(screenX + 2, platform.y + platform.height, platform.width, 6);
    
    ctx.restore();
  }
}
