export type { GridVariation } from './types';
export { createSphereBulge } from './sphereBulge';
export { createWavyGrid } from './wavyGrid';
export { createTiltedDrift } from './tiltedDrift';

import { createSphereBulge } from './sphereBulge';
import { createWavyGrid } from './wavyGrid';
import { createTiltedDrift } from './tiltedDrift';
import type { GridVariation } from './types';

const factories = [createSphereBulge, createWavyGrid, createTiltedDrift];

export function createVariation(index: number): GridVariation {
  return factories[index % factories.length]();
}

export function createRandomVariation(): GridVariation {
  return createVariation(Math.floor(Math.random() * factories.length));
}
