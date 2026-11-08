import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * Cinematic Three.js backdrop: rotating golden gem (icosahedron with facets),
 * orbiting gold-dust particles and a soft glow — respects prefers-reduced-motion.
 */
export default function GemScene({ density = 1 }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07070d, 0.055);

    const camera = new THREE.PerspectiveCamera(55, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 9);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    el.appendChild(renderer.domElement);

    // ── Golden gem ────────────────────────────────────────────
    const gemGeo = new THREE.IcosahedronGeometry(2.1, 0);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xe6b64c, metalness: 1, roughness: 0.22, flatShading: true,
      emissive: 0x8a6a1f, emissiveIntensity: 0.25,
    });
    const gem = new THREE.Mesh(gemGeo, gemMat);
    scene.add(gem);

    const wire = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(2.35, 1)),
      new THREE.LineBasicMaterial({ color: 0xf5d78a, transparent: true, opacity: 0.28 })
    );
    scene.add(wire);

    // ── Gold dust particles ───────────────────────────────────
    const COUNT = Math.floor(1400 * density);
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i += 1) {
      const r = 4 + Math.random() * 14;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th) * 0.55;
      pos[i * 3 + 2] = r * Math.cos(ph);
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0xf7c948, size: 0.045, transparent: true, opacity: 0.75, depthWrite: false });
    const points = new THREE.Points(pGeo, pMat);
    scene.add(points);

    // ── Lights ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0x332200, 0.9));
    const key = new THREE.PointLight(0xffe9a8, 90, 60); key.position.set(6, 5, 7); scene.add(key);
    const rim = new THREE.PointLight(0xc98a1b, 60, 60); rim.position.set(-7, -4, 4); scene.add(rim);

    let mouseX = 0, mouseY = 0;
    const onMove = (e) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove);

    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      if (!reduced) {
        gem.rotation.y = t * 0.35; gem.rotation.x = Math.sin(t * 0.22) * 0.35;
        wire.rotation.y = -t * 0.18; wire.rotation.z = t * 0.1;
        points.rotation.y = t * 0.03;
        camera.position.x += (mouseX * 1.2 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 0.8 - camera.position.y) * 0.04;
        camera.lookAt(0, 0, 0);
      }
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = el.clientWidth, h = el.clientHeight;
      camera.aspect = w / h; camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onMove);
      gemGeo.dispose(); gemMat.dispose(); wire.geometry.dispose(); wire.material.dispose();
      pGeo.dispose(); pMat.dispose(); renderer.dispose();
      if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement);
    };
  }, [density]);

  return <div ref={mountRef} className="absolute inset-0 -z-10" aria-hidden="true" />;
}
