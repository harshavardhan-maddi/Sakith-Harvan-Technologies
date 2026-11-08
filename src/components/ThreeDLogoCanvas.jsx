import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ThreeDLogoCanvas
 * Renders the company PNG logo on an elevated 3D card/badge using Three.js.
 * Features:
 * - Smooth "come up" rising entrance animation
 * - Gentle 3D floating and tilting physics
 * - Dynamic lighting with metallic/glass highlights
 * - Mouse-interactive tilt
 */
export const ThreeDLogoCanvas = ({ className = '', logoSrc = '/logo.png' }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 220;

    // 1. Scene setup
    const scene = new THREE.Scene();

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5.2);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.8);
    dirLight.position.set(3, 5, 4);
    scene.add(dirLight);

    const blueLight = new THREE.PointLight(0x2563eb, 2.5, 10);
    blueLight.position.set(-3, -2, 3);
    scene.add(blueLight);

    const cyanLight = new THREE.PointLight(0x0284c7, 2.0, 10);
    cyanLight.position.set(2, -2, 2.5);
    scene.add(cyanLight);

    // 5. 3D Object Group
    const group = new THREE.Group();
    // Start positioned low so it animates UP
    group.position.y = -3.5;
    group.scale.set(0.2, 0.2, 0.2);
    scene.add(group);

    // 6. Texture Loader for Logo PNG
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      logoSrc,
      (texture) => {
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;

        // Front Face Material with PNG Texture
        const frontMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          roughness: 0.2,
          metalness: 0.15,
          side: THREE.DoubleSide
        });

        // Frame / Card Base Geometry (Rounded 3D Card)
        const geometry = new THREE.BoxGeometry(3.2, 1.5, 0.12);

        // Edge / Back Materials (Crisp soft blue/silver border)
        const borderMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.25,
          metalness: 0.85
        });

        const materials = [
          borderMaterial, // right
          borderMaterial, // left
          borderMaterial, // top
          borderMaterial, // bottom
          frontMaterial,  // front with logo
          borderMaterial  // back
        ];

        const mesh = new THREE.Mesh(geometry, materials);
        group.add(mesh);

        // Outer Metallic Glow Ring
        const ringGeo = new THREE.TorusGeometry(2.1, 0.04, 16, 64);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0x2563eb,
          roughness: 0.2,
          metalness: 0.9,
          emissive: 0x1d4ed8,
          emissiveIntensity: 0.3
        });
        const ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = Math.PI / 2.3;
        ringMesh.position.y = -0.1;
        group.add(ringMesh);
      },
      undefined,
      (err) => {
        console.warn('Three.js texture load error:', err);
      }
    );

    // 7. Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.45;
      targetRotX = -y * 0.3;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // 8. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();
    let entranceProgress = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Entrance animation: "come up" smoothly from bottom
      if (entranceProgress < 1) {
        entranceProgress += 0.035;
        const ease = 1 - Math.pow(1 - Math.min(1, entranceProgress), 3); // ease-out cubic
        group.position.y = -3.5 + ease * 3.5;
        const currentScale = 0.2 + ease * 0.8;
        group.scale.set(currentScale, currentScale, currentScale);
      } else {
        // Subtle floating bobbing effect
        group.position.y = Math.sin(elapsedTime * 2.2) * 0.08;
      }

      // Gentle continuous rotation + mouse reactivity
      group.rotation.y += (targetRotY + Math.sin(elapsedTime * 1.6) * 0.15 - group.rotation.y) * 0.08;
      group.rotation.x += (targetRotX + Math.cos(elapsedTime * 1.8) * 0.08 - group.rotation.x) * 0.08;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Resize Handling
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 320;
      const newHeight = container.clientHeight || 220;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // 10. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [logoSrc]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center overflow-hidden pointer-events-auto select-none ${className}`}
      style={{ minHeight: '220px', width: '100%' }}
    />
  );
};
