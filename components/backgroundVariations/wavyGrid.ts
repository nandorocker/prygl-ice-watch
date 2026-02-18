import * as THREE from 'three';
import { GridVariation } from './types';
import { makeLineMaterial } from './sharedGrid';

/**
 * Variation 2 – Wavy / S-Curve Grid
 * Grid lines undulate sinusoidally.
 *   Horizontal lines: y += sin(x * freq + time + phase)
 *   Vertical lines:   x += sin(y * freq + time + phase)
 * Adjacent lines have slightly offset phase so they don't move in lockstep.
 */
export function createWavyGrid(): GridVariation {
  const SIZE = 22;       // world units
  const COLS = 26;
  const ROWS = 26;
  const PTS = 80;        // vertices per line for smooth curves
  const FREQ = 0.5;      // spatial frequency of the wave
  const AMP = 0.25;      // wave amplitude
  const SPEED = 0.8;     // time multiplier

  const material = makeLineMaterial();
  const group = new THREE.Group();

  const hGeos: THREE.BufferGeometry[] = [];
  const vGeos: THREE.BufferGeometry[] = [];

  // Horizontal lines
  for (let r = 0; r < ROWS; r++) {
    const phase = (r / ROWS) * Math.PI * 2;
    const baseY = -SIZE / 2 + (r / (ROWS - 1)) * SIZE;
    const positions = new Float32Array(PTS * 3);
    for (let i = 0; i < PTS; i++) {
      const x = -SIZE / 2 + (i / (PTS - 1)) * SIZE;
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = baseY;
      positions[i * 3 + 2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    hGeos.push(geo);
    group.add(new THREE.Line(geo, material));
    // store phase on geo for update
    (geo as any)._phase = phase;
    (geo as any)._baseY = baseY;
  }

  // Vertical lines
  for (let c = 0; c < COLS; c++) {
    const phase = (c / COLS) * Math.PI * 2;
    const baseX = -SIZE / 2 + (c / (COLS - 1)) * SIZE;
    const positions = new Float32Array(PTS * 3);
    for (let i = 0; i < PTS; i++) {
      const y = -SIZE / 2 + (i / (PTS - 1)) * SIZE;
      positions[i * 3 + 0] = baseX;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    vGeos.push(geo);
    group.add(new THREE.Line(geo, material));
    (geo as any)._phase = phase;
    (geo as any)._baseX = baseX;
  }

  function update(time: number) {
    const t = time * SPEED;

    for (let r = 0; r < ROWS; r++) {
      const geo = hGeos[r];
      const phase = (geo as any)._phase as number;
      const baseY = (geo as any)._baseY as number;
      const attr = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PTS; i++) {
        const x = attr.getX(i);
        attr.setY(i, baseY + AMP * Math.sin(x * FREQ + t + phase));
      }
      attr.needsUpdate = true;
    }

    for (let c = 0; c < COLS; c++) {
      const geo = vGeos[c];
      const phase = (geo as any)._phase as number;
      const baseX = (geo as any)._baseX as number;
      const attr = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < PTS; i++) {
        const y = attr.getY(i);
        attr.setX(i, baseX + AMP * Math.sin(y * FREQ + t + phase));
      }
      attr.needsUpdate = true;
    }
  }

  function dispose() {
    [...hGeos, ...vGeos].forEach((g) => g.dispose());
    material.dispose();
  }

  return { objects: [group], update, dispose };
}
