import * as THREE from 'three';
import { GridVariation } from './types';
import { buildGrid } from './sharedGrid';

function cubicEaseInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2;
}

/**
 * Variation 3 – See-Saw
 * Two independent motions:
 *   1. See-saw: X rotation rocks ±30° (top/bottom alternately toward camera)
 *   2. Z spin: the whole grid slowly rotates around its own face, like a coin
 *
 * Group hierarchy:
 *   spinGroup  — steady Z rotation (spinning in place)
 *   seesawGroup — animated X rotation (see-saw)
 *   grid lines
 */
export function createTiltedDrift(): GridVariation {
  const GROUP_SIZE = 40;
  const COLS = 32;
  const ROWS = 32;
  const PTS = 2;

  const { lines, geometries, material } = buildGrid(COLS, ROWS, PTS, GROUP_SIZE);

  const spinGroup = new THREE.Group();

  const seesawGroup = new THREE.Group();
  lines.forEach((l) => seesawGroup.add(l));
  spinGroup.add(seesawGroup);

  const SWING = Math.PI / 6;   // ±30°
  const PERIOD = 7.5;           // seconds for a full cycle
  const Z_SPIN = 0.09;          // rad/s — steady face-spin

  function update(time: number) {
    const phase = (time % PERIOD) / PERIOD;
    const t = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
    seesawGroup.rotation.x = SWING * (1 - 2 * cubicEaseInOut(t));

    spinGroup.rotation.z = time * Z_SPIN;
  }

  function dispose() {
    geometries.forEach((g) => g.dispose());
    material.dispose();
  }

  return { objects: [spinGroup], update, dispose };
}
