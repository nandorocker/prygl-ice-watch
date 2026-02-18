import * as THREE from 'three';

export interface GridVariation {
  /** All Three.js objects for this variation, added to the scene */
  objects: THREE.Object3D[];
  /** Called every frame with elapsed time in seconds */
  update(time: number): void;
  /** Clean up geometries, materials, etc. */
  dispose(): void;
  /** Rescale to fill the viewport; called on init and on every resize */
  resize?(camera: THREE.Camera): void;
}
