import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function Trail3D() {
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    } catch (e) {
      return;
    }

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 200);

    function size() {
      const w = wrap.clientWidth, h = wrap.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    const pts = [
      new THREE.Vector3(-14, -3, 6),
      new THREE.Vector3(-7, -1, -2),
      new THREE.Vector3(-1, 1.5, 4),
      new THREE.Vector3(6, 0.5, -3),
      new THREE.Vector3(13, 3, 2),
    ];
    const curve = new THREE.CatmullRomCurve3(pts);
    const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.28, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({ color: 0x174D38, roughness: 0.6, metalness: 0.05 });
    const tube = new THREE.Mesh(tubeGeo, tubeMat);
    scene.add(tube);

    const groundGeo = new THREE.PlaneGeometry(60, 40);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xDCE2DD, roughness: 1 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -6;
    scene.add(ground);

    const markerMat = new THREE.MeshStandardMaterial({ color: 0x4D1717, emissive: 0x4D1717, emissiveIntensity: 0.35, roughness: 0.4 });
    const markers = [];
    [0.08, 0.32, 0.58, 0.85].forEach((t) => {
      const p = curve.getPointAt(t);
      const geo = new THREE.SphereGeometry(0.55, 20, 20);
      const m = new THREE.Mesh(geo, markerMat);
      m.position.copy(p).add(new THREE.Vector3(0, 0.7, 0));
      scene.add(m);
      markers.push(m);
    });

    const particleCount = 90;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = Math.random() * 12 - 3;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x174D38, size: 0.08, transparent: true, opacity: 0.4 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75));
    const dLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dLight.position.set(5, 10, 5);
    scene.add(dLight);

    camera.position.set(0, 5, 16);
    camera.lookAt(0, 0, 0);

    let mouseX = 0;
    const onMouseMove = (e) => {
      const rect = wrap.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    };
    wrap.addEventListener('mousemove', onMouseMove);

    size();
    window.addEventListener('resize', size);

    let t = 0;
    let rafId;
    function loop() {
      if (!prefersReduced) {
        t += 0.0009;
        scene.rotation.y = Math.sin(t) * 0.15 + mouseX * 0.12;
        markers.forEach((m, i) => { m.position.y += Math.sin(t * 40 + i) * 0.0015; });
        particles.rotation.y += 0.0004;
      }
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(loop);
    }
    loop();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', size);
      wrap.removeEventListener('mousemove', onMouseMove);
      tubeGeo.dispose();
      tubeMat.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      markerMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section>
      <div className="wrap">
        <div className="section-head">
          <h2>The trail, from above.</h2>
          <p>Every mentor match starts as a real path — degree, first step, next step, and where they are now.</p>
        </div>
        <div className="trail3d-wrap" ref={wrapRef}>
          <canvas id="trail3d" ref={canvasRef}></canvas>
          <div className="trail3d-caption">One journey. Four milestones. The trail your mentor already walked.</div>
        </div>
      </div>
    </section>
  );
}
