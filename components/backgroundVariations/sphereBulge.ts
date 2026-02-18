import * as THREE from 'three';
import { GridVariation } from './types';
import { makeLineMaterial } from './sharedGrid';

/**
 * Variation 1 – Sphere Bulge
 * A flat grid where vertices displace outward in Z based on distance
 * from centre, forming a dome. The dome slowly "breathes" (pulsing
 * amplitude) and the whole group slowly rotates.
 */
export function createSphereBulge(): GridVariation {
  const SIZE = 34;       // world units — oversized so edges never show during rotation
  const COLS = 32;
  const ROWS = 32;
  const PTS = 80;        // vertices per line
  const MAX_AMP = 8.0;   // max Z displacement at centre (scaled with SIZE)
  const BREATHE_SPEED = 0.9;
  const ROTATE_SPEED = 0.08; // rad / second

  const material = makeLineMaterial();
  const group = new THREE.Group();

  const hGeos: THREE.BufferGeometry[] = [];
  const vGeos: THREE.BufferGeometry[] = [];

  // Precompute base positions and distance-from-centre for each vertex
  type LineData = { geo: THREE.BufferGeometry; basePos: Float32Array; dists: Float32Array };

  const hData: LineData[] = [];
  const vData: LineData[] = [];

  for (let r = 0; r < ROWS; r++) {
    const baseY = -SIZE / 2 + (r / (ROWS - 1)) * SIZE;
    const basePos = new Float32Array(PTS * 3);
    const dists = new Float32Array(PTS);
    for (let i = 0; i < PTS; i++) {
      const x = -SIZE / 2 + (i / (PTS - 1)) * SIZE;
      basePos[i * 3 + 0] = x;
      basePos[i * 3 + 1] = baseY;
      basePos[i * 3 + 2] = 0;
      dists[i] = Math.sqrt(x * x + baseY * baseY);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(basePos), 3));
    hGeos.push(geo);
    group.add(new THREE.Line(geo, material));
    hData.push({ geo, basePos, dists });
  }

  for (let c = 0; c < COLS; c++) {
    const baseX = -SIZE / 2 + (c / (COLS - 1)) * SIZE;
    const basePos = new Float32Array(PTS * 3);
    const dists = new Float32Array(PTS);
    for (let i = 0; i < PTS; i++) {
      const y = -SIZE / 2 + (i / (PTS - 1)) * SIZE;
      basePos[i * 3 + 0] = baseX;
      basePos[i * 3 + 1] = y;
      basePos[i * 3 + 2] = 0;
      dists[i] = Math.sqrt(baseX * baseX + y * y);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(basePos), 3));
    vGeos.push(geo);
    group.add(new THREE.Line(geo, material));
    vData.push({ geo, basePos, dists });
  }

  const HALF = SIZE / 2;
  const MAX_DIST = Math.sqrt(2) * HALF;

  function applyBulge(data: LineData[], amp: number) {
    for (const { geo, basePos, dists } of data) {
      const attr = geo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < dists.length; i++) {
        const t = 1 - Math.min(dists[i] / MAX_DIST, 1);
        const z = amp * t * t; // quadratic falloff
        attr.setXYZ(i, basePos[i * 3], basePos[i * 3 + 1], z);
      }
      attr.needsUpdate = true;
    }
  }

  function update(time: number) {
    const amp = MAX_AMP * (0.6 + 0.4 * Math.sin(time * BREATHE_SPEED));
    applyBulge(hData, amp);
    applyBulge(vData, amp);
    group.rotation.z = time * ROTATE_SPEED;
  }

  function dispose() {
    [...hGeos, ...vGeos].forEach((g) => g.dispose());
    material.dispose();
  }

  return { objects: [group], update, dispose };
}
