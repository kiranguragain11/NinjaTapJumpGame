export interface PhysicsEntity {
  x: number;
  y: number;
  velocityY: number;
  width: number;
  height: number;
  isGrounded: boolean;
}

const GRAVITY = 0.5;
const TERMINAL_VELOCITY = 15;

export function applyGravity<T extends PhysicsEntity>(entity: T): T {
  const newEntity = { ...entity };
  
  if (!newEntity.isGrounded) {
    newEntity.velocityY += GRAVITY;
    newEntity.velocityY = Math.min(newEntity.velocityY, TERMINAL_VELOCITY);
  }
  
  newEntity.y += newEntity.velocityY;
  
  return newEntity;
}

export function updateVelocity<T extends PhysicsEntity>(entity: T, deltaTime: number): T {
  const newEntity = { ...entity };
  newEntity.y += newEntity.velocityY * deltaTime;
  return newEntity;
}

export function jump<T extends PhysicsEntity>(entity: T, jumpForce: number): T {
  const newEntity = { ...entity };
  if (newEntity.isGrounded) {
    newEntity.velocityY = -jumpForce;
    newEntity.isGrounded = false;
  }
  return newEntity;
}
