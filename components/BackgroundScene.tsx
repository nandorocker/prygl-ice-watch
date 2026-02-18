import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { createVariation, createRandomVariation } from './backgroundVariations';
import type { GridVariation } from './backgroundVariations';

interface Props {
  bgColor: string;
  variationIndex?: number;
}

function hexToColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

export default function BackgroundScene({ bgColor, variationIndex }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const bgColorRef = useRef(bgColor);
  const [webglFailed, setWebglFailed] = useState(false);

  // Keep bgColorRef in sync without triggering effect re-runs
  useEffect(() => {
    bgColorRef.current = bgColor;
  }, [bgColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // --- Renderer ---
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // --- Scene & Camera ---
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 200);
    camera.position.z = 12;

    // --- Variation ---
    let variation: GridVariation;
    try {
      variation = variationIndex != null ? createVariation(variationIndex) : createRandomVariation();
    } catch {
      setWebglFailed(true);
      renderer.dispose();
      return;
    }
    variation.objects.forEach((obj) => scene.add(obj));
    variation.resize?.(camera);

    // --- Color lerp state ---
    const currentColor = hexToColor(bgColorRef.current);
    renderer.setClearColor(currentColor, 1);

    // --- Animation loop ---
    const clock = new THREE.Clock();
    let lastTime = 0;
    let rafId: number;

    function animate() {
      rafId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const dt = time - lastTime;
      lastTime = time;

      // Update variation
      variation.update(time);

      // Lerp background color toward target (~1 s transition: factor ≈ 1 - e^(-6*dt))
      const target = hexToColor(bgColorRef.current);
      currentColor.lerp(target, 1 - Math.exp(-6 * dt));
      renderer.setClearColor(currentColor, 1);

      renderer.render(scene, camera);
    }
    animate();

    // --- Resize ---
    const resizeObserver = new ResizeObserver(() => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      variation.resize?.(camera);
    });
    resizeObserver.observe(canvas);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      variation.dispose();
      renderer.dispose();
    };
  }, [variationIndex]); // re-run when variation is forced

  if (webglFailed) {
    return <div className="fixed inset-0 blueprint-grid z-0" />;
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0"
      style={{ width: '100%', height: '100%', display: 'block', pointerEvents: 'none' }}
    />
  );
}
