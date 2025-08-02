export interface CollisionEntity {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function checkCollision(a: CollisionEntity, b: CollisionEntity): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export function checkPointInRect(
  point: { x: number; y: number },
  rect: CollisionEntity
): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

export function getCollisionSide(
  moving: CollisionEntity,
  stationary: CollisionEntity
): 'top' | 'bottom' | 'left' | 'right' | null {
  if (!checkCollision(moving, stationary)) return null;

  const overlapLeft = (moving.x + moving.width) - stationary.x;
  const overlapRight = (stationary.x + stationary.width) - moving.x;
  const overlapTop = (moving.y + moving.height) - stationary.y;
  const overlapBottom = (stationary.y + stationary.height) - moving.y;

  const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

  if (minOverlap === overlapTop) return 'top';
  if (minOverlap === overlapBottom) return 'bottom';
  if (minOverlap === overlapLeft) return 'left';
  if (minOverlap === overlapRight) return 'right';

  return null;
}
