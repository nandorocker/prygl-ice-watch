import * as THREE from 'three';

export const GRID_COLOR = 0xfdf6e3;
export const GRID_OPACITY = 0.3;
export const GRID_SPACING = 1.0;

export function makeLineMaterial(): THREE.LineBasicMaterial {
  return new THREE.LineBasicMaterial({
    color: GRID_COLOR,
    transparent: true,
    opacity: GRID_OPACITY,
  });
}

/**
 * Build a grid of THREE.Line objects.
 * Returns { lines, geometries, material } so callers can dispose them.
 *
 * @param cols  Number of vertical lines
 * @param rows  Number of horizontal lines
 * @param pts   Number of vertices per line
 * @param size  World-space width/height of the grid
 */
export function buildGrid(
  cols: number,
  rows: number,
  pts: number,
  size: number,
): {
  lines: THREE.Line[];
  geometries: THREE.BufferGeometry[];
  material: THREE.LineBasicMaterial;
} {
  const material = makeLineMaterial();
  const lines: THREE.Line[] = [];
  const geometries: THREE.BufferGeometry[] = [];

  const half = size / 2;
  const step = size / (pts - 1);

  // Horizontal lines (constant Y, varying X)
  for (let r = 0; r < rows; r++) {
    const y = -half + (r / (rows - 1)) * size;
    const positions = new Float32Array(pts * 3);
    for (let i = 0; i < pts; i++) {
      positions[i * 3 + 0] = -half + i * step;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometries.push(geo);
    lines.push(new THREE.Line(geo, material));
  }

  // Vertical lines (constant X, varying Y)
  for (let c = 0; c < cols; c++) {
    const x = -half + (c / (cols - 1)) * size;
    const positions = new Float32Array(pts * 3);
    for (let i = 0; i < pts; i++) {
      positions[i * 3 + 0] = x;
      positions[i * 3 + 1] = -half + i * step;
      positions[i * 3 + 2] = 0;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometries.push(geo);
    lines.push(new THREE.Line(geo, material));
  }

  return { lines, geometries, material };
}
