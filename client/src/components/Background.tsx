export default class Background {
  static render(
    ctx: CanvasRenderingContext2D,
    camera: { x: number },
    width: number,
    height: number
  ) {
    ctx.save();
    
    // Sky gradient (sunset)
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#ff6b6b'); // Pink sunset
    gradient.addColorStop(0.3, '#ffa500'); // Orange
    gradient.addColorStop(0.7, '#ff69b4'); // Pink
    gradient.addColorStop(1, '#4a0e4e'); // Dark purple
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Mountains (parallax layer 1 - slowest)
    const mountainOffset = (camera.x * 0.1) % (width * 2);
    ctx.fillStyle = 'rgba(75, 0, 130, 0.6)';
    this.renderMountains(ctx, -mountainOffset, height * 0.6, width * 2, height * 0.4);
    this.renderMountains(ctx, width * 2 - mountainOffset, height * 0.6, width * 2, height * 0.4);
    
    // City skyline (parallax layer 2 - medium speed)
    const cityOffset = (camera.x * 0.3) % (width * 1.5);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    this.renderCity(ctx, -cityOffset, height * 0.7, width * 1.5, height * 0.3);
    this.renderCity(ctx, width * 1.5 - cityOffset, height * 0.7, width * 1.5, height * 0.3);
    
    // Distant buildings (parallax layer 3 - faster)
    const buildingOffset = (camera.x * 0.5) % width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.renderBuildings(ctx, -buildingOffset, height * 0.8, width, height * 0.2);
    this.renderBuildings(ctx, width - buildingOffset, height * 0.8, width, height * 0.2);
    
    // Sun
    const sunX = width * 0.8 - (camera.x * 0.05);
    const sunY = height * 0.2;
    const sunGradient = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 60);
    sunGradient.addColorStop(0, '#ffff00');
    sunGradient.addColorStop(0.6, '#ff8c00');
    sunGradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
    
    ctx.fillStyle = sunGradient;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }
  
  private static renderMountains(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    width: number,
    height: number
  ) {
    ctx.beginPath();
    ctx.moveTo(startX, startY + height);
    
    for (let x = 0; x <= width; x += 50) {
      const y = startY + Math.sin(x * 0.01) * height * 0.3 + Math.cos(x * 0.005) * height * 0.2;
      ctx.lineTo(startX + x, y);
    }
    
    ctx.lineTo(startX + width, startY + height);
    ctx.fill();
  }
  
  private static renderCity(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    width: number,
    height: number
  ) {
    for (let x = 0; x < width; x += 30) {
      const buildingHeight = Math.random() * height * 0.7 + height * 0.3;
      ctx.fillRect(startX + x, startY + height - buildingHeight, 25, buildingHeight);
      
      // Building windows
      ctx.fillStyle = 'rgba(255, 255, 0, 0.3)';
      for (let y = startY + height - buildingHeight + 10; y < startY + height; y += 15) {
        for (let wx = 0; wx < 20; wx += 8) {
          if (Math.random() > 0.3) {
            ctx.fillRect(startX + x + wx + 2, y, 4, 8);
          }
        }
      }
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    }
  }
  
  private static renderBuildings(
    ctx: CanvasRenderingContext2D,
    startX: number,
    startY: number,
    width: number,
    height: number
  ) {
    for (let x = 0; x < width; x += 20) {
      const buildingHeight = Math.random() * height * 0.8 + height * 0.2;
      ctx.fillRect(startX + x, startY + height - buildingHeight, 18, buildingHeight);
    }
  }
}
