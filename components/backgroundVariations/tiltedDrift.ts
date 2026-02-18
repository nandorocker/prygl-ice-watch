import * as THREE from 'three';
import { GridVariation } from './types';
import { buildGrid } from './sharedGrid';

/**
 * Variation 3 – Tilted Drift
 * A flat grid rendered at an angle (~35° X rotation, slight Y tilt) that
 * slowly scrolls diagonally. Position wraps via modulo so it loops
 * seamlessly. An oversized grid (3× viewport) hides the edges.
 */
export function createTiltedDrift(): GridVariation {
  const GROUP_SIZE = 30; // world units — oversized to cover viewport
  const COLS = 32;
  const ROWS = 32;
  const PTS = 2; // straight lines only need 2 vertices

  const { lines, geometries, material } = buildGrid(COLS, ROWS, PTS, GROUP_SIZE);

  const group = new THREE.Group();
  lines.forEach((l) => group.add(l));

  // Tilt the grid
  group.rotation.x = THREE.MathUtils.degToRad(35);
  group.rotation.y = THREE.MathUtils.degToRad(8);

  const SCROLL_SPEED = 0.03; // world units per second
  const WRAP = GROUP_SIZE / COLS; // wrap period = one grid cell

  function update(time: number) {
    const offset = (time * SCROLL_SPEED) % WRAP;
    group.position.x = -offset;
    group.position.y = offset * 0.5;
  }

  function dispose() {
    geometries.forEach((g) => g.dispose());
    material.dispose();
  }

  return { objects: [group], update, dispose };
}
