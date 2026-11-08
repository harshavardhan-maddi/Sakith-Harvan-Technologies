import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles, Trophy, History, ArrowRight, Compass } from 'lucide-react';

/**
 * HackathonEmptyStateCard
 * Minimalist 3D Empty State Card featuring:
 * - Smooth rounded corners (rounded-2xl)
 * - Three.js 3D floating crystal/gem visual anchor (with safe WebGL fallback)
 * - Soft emoji / icon visual anchor
 * - Clear "No Live Hackathons" title
 * - Helpful description paragraph
 * - Subtle "View Past Events" fallback button to keep user engagement
 */
export const HackathonEmptyStateCard = ({ onViewPastEvents, onExploreRoadmaps }) => {
  const mountRef = useRef(null);
  const [webGLFailed, setWebGLFailed] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // WebGL support check
    try {
      const testCanvas = document.createElement('canvas');
      const hasWebGL = !!(window.WebGLRenderingContext && 
        (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl')));
      if (!hasWebGL) {
        setWebGLFailed(true);
        return;
      }
    } catch {
      setWebGLFailed(true);
      return;
    }

    let renderer, scene, camera, mesh, animId;
    let isDisposed = false;

    try {
      const width = container.clientWidth || 280;
      const height = container.clientHeight || 180;

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
      camera.position.set(0, 0, 4.5);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.appendChild(renderer.domElement);

      // Ambient & Point lights for soft 3D metallic-glass reflections
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
      scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xf59e0b, 2.0);
      dirLight.position.set(2, 4, 3);
      scene.add(dirLight);

      const bluePointLight = new THREE.PointLight(0xeab308, 3, 10);
      bluePointLight.position.set(-2, -2, 2);
      scene.add(bluePointLight);

      // Minimalist 3D Dodecahedron crystal with wireframe overlay
      const geometry = new THREE.DodecahedronGeometry(1.1, 0);
      const material = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.7,
        roughness: 0.2,
        transparent: true,
        opacity: 0.95
      });
      mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Glowing wireframe contour
      const wireframeGeometry = new THREE.WireframeGeometry(geometry);
      const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xf59e0b,
        transparent: true,
        opacity: 0.9
      });
      const wireframe = new THREE.LineSegments(wireframeGeometry, lineMaterial);
      mesh.add(wireframe);

      // Inner small glowing core
      const coreGeo = new THREE.OctahedronGeometry(0.45, 0);
      const coreMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.8,
        wireframe: true
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      mesh.add(coreMesh);

      // Animation loop
      let clock = new THREE.Clock();
      const animate = () => {
        if (isDisposed) return;
        animId = requestAnimationFrame(animate);
        const elapsedTime = clock.getElapsedTime();

        // Smooth floating sine-wave translation & rotation
        mesh.rotation.x = elapsedTime * 0.35;
        mesh.rotation.y = elapsedTime * 0.5;
        mesh.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

        renderer.render(scene, camera);
      };
      animate();

    } catch (err) {
      console.warn('HackathonEmptyStateCard 3D canvas fallback:', err);
      setWebGLFailed(true);
    }

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      {/* 3D Minimalist Card Container with rounded-2xl in Nexora Dark Aesthetic */}
      <div className="relative rounded-2xl bg-[#12141F] p-8 sm:p-12 text-center border border-white/10 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300 hover:border-amber-400/40">
        
        {/* Soft Background Radial Glows */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* 3D Visual Anchor / Soft Canvas */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-full h-44 flex items-center justify-center relative">
            {!webGLFailed ? (
              <div ref={mountRef} className="w-56 h-40 flex items-center justify-center" />
            ) : (
              /* Soft Minimalist 3D Fallback Anchor */
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 shadow-xl shadow-amber-500/30 flex items-center justify-center animate-pulse">
                <div className="absolute inset-1 rounded-xl bg-slate-900/40 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-amber-300" />
                </div>
              </div>
            )}

            {/* Soft Floating Emoji / Icon Pill Anchor */}
            <div className="absolute -bottom-1 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-white/10 shadow-md text-xs font-semibold text-amber-300 backdrop-blur-sm">
              <span className="text-sm">⚡</span>
              <span>Next Season in Formulation</span>
            </div>
          </div>

          {/* Title & Clear Description */}
          <div className="mt-6 space-y-3 max-w-lg">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              No Live Hackathons
            </h3>
            
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
              There are currently no active hackathons accepting new registrations. Our technical team and enterprise mentors are curating the next batch of production challenges and problem statements.
            </p>
          </div>

          {/* Action / Engagement Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {/* Subtle "View Past Events" Fallback Button */}
            <button
              onClick={onViewPastEvents}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs sm:text-sm font-bold transition-all duration-200 shadow-lg shadow-amber-500/25 cursor-pointer group"
            >
              <History className="w-4 h-4 text-slate-950 group-hover:rotate-[-30deg] transition-transform duration-200" />
              <span>View Past Events &amp; Hall of Fame</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>

            {onExploreRoadmaps && (
              <button
                onClick={onExploreRoadmaps}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-slate-200 text-xs sm:text-sm font-semibold transition-all duration-200 shadow-xs cursor-pointer"
              >
                <Compass className="w-4 h-4 text-amber-400" />
                <span>Prepare via Career Roadmaps</span>
              </button>
            )}
          </div>

          {/* Micro Footer Notice */}
          <div className="mt-6 pt-5 border-t border-white/10 w-full flex items-center justify-center gap-2 text-xs text-slate-400 font-mono font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Presented by NEXARVA • Think Bold • Build Beyond</span>
          </div>

        </div>
      </div>
    </div>
  );
};

