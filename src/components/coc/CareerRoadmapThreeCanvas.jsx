import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Play, Pause, RotateCcw, Sparkles, Compass, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

/**
 * CareerRoadmapThreeCanvas
 * 3D Interactive Animated Career Roadmap powered by Three.js
 * Features:
 * - 3D winding luminous career highway with glowing pedestals
 * - 6 distinct stages from College to Career
 * - Procedural 3D animated tiny persons with walking legs, swinging arms, bobbing heads & accessories
 * - Travelling tiny person walking continuously along the path
 * - Orbit controls (mouse drag tilt/rotate), camera focus transitions, and auto-tour mode
 */
export const CareerRoadmapThreeCanvas = ({ onSelectStage }) => {
  const mountRef = useRef(null);
  const [activeStageIndex, setActiveStageIndex] = useState(0);
  const [isAutoTour, setIsAutoTour] = useState(true);
  const [hasWebGLError, setHasWebGLError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const isAutoTourRef = useRef(isAutoTour);
  isAutoTourRef.current = isAutoTour;

  const STAGES_DATA = [
    {
      id: 1,
      title: 'College Fresher',
      subtitle: 'Confusion to Clarity',
      desc: 'Entering college with high hopes but outdated syllabus and no roadmap.',
      color: 0xf59e0b,
      lightColor: '#f59e0b',
      tag: 'Stage 1 • 1st Year',
      coord: [-12, -0.5, 6]
    },
    {
      id: 2,
      title: 'Course of Career',
      subtitle: 'The Strategic Bridge',
      desc: 'Connecting academic degree with industry expectations from day one.',
      color: 0x06b6d4,
      lightColor: '#06b6d4',
      tag: 'Stage 2 • Guidance',
      coord: [-7, 0.8, -2]
    },
    {
      id: 3,
      title: 'Skills Mastery',
      subtitle: 'Hands-on Foundations',
      desc: 'Mastering Python, Modern JS, Data Structures & core system logic.',
      color: 0x2563eb,
      lightColor: '#2563eb',
      tag: 'Stage 3 • 2nd Year',
      coord: [-1.5, 0.2, 5]
    },
    {
      id: 4,
      title: 'Live Enterprise Projects',
      subtitle: 'Production SaaS Apps',
      desc: 'Building multi-tenant applications, microservices & GitHub commits.',
      color: 0x8b5cf6,
      lightColor: '#8b5cf6',
      tag: 'Stage 4 • 3rd Year',
      coord: [4, 1.2, -3]
    },
    {
      id: 5,
      title: 'Live Internship',
      subtitle: 'Sakith Harvan Tech Labs',
      desc: 'Working directly with tech leads on live client deliverables & cloud hosting.',
      color: 0x4f46e5,
      lightColor: '#4f46e5',
      tag: 'Stage 5 • Industry Bridge',
      coord: [9, 0.5, 4]
    },
    {
      id: 6,
      title: 'Career Triumph',
      subtitle: 'Placement & High Package',
      desc: 'ATS resume, FAANG mock interviews, and confident placement offers.',
      color: 0x10b981,
      lightColor: '#10b981',
      tag: 'Stage 6 • 4th Year & Beyond',
      coord: [14, 2.0, -1]
    }
  ];

  // Camera targets ref for animated transitions
  const camControlRef = useRef({
    targetPos: new THREE.Vector3(0, 8, 22),
    targetLook: new THREE.Vector3(0, 0, 0),
    currentLook: new THREE.Vector3(0, 0, 0),
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    rotX: 0.15,
    rotY: 0
  });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 0. Verify WebGL support safely
    let isWebGLSupported = false;
    try {
      const testCanvas = document.createElement('canvas');
      isWebGLSupported = !!(
        window.WebGLRenderingContext &&
        (testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
      );
    } catch (e) {
      isWebGLSupported = false;
    }

    if (!isWebGLSupported) {
      console.warn('WebGL is not supported or enabled on this system. Activating interactive 2D highway.');
      setHasWebGLError(true);
      return;
    }

    let isMounted = true;
    let animId = null;
    let renderer = null;

    try {
      const width = container.clientWidth || 800;
      const height = container.clientHeight || 460;

      // 1. Scene
      const scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x0a1128, 0.022);

      // 2. Camera
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 9, 23);

      // 3. WebGL Renderer
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'default' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      container.appendChild(renderer.domElement);

      // 4. Lights
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
      scene.add(ambientLight);

      const mainDirLight = new THREE.DirectionalLight(0xffffff, 1.8);
      mainDirLight.position.set(10, 20, 15);
      scene.add(mainDirLight);

      const blueLight = new THREE.PointLight(0x2563eb, 3.5, 35);
      blueLight.position.set(-6, 8, 8);
      scene.add(blueLight);

      const cyanLight = new THREE.PointLight(0x06b6d4, 3.0, 35);
      cyanLight.position.set(6, 8, -5);
      scene.add(cyanLight);

    // 5. Build Smooth Curve for Roadmap
    const curvePoints = [
      new THREE.Vector3(-14, -1.0, 8),
      new THREE.Vector3(-12, -0.4, 6),
      new THREE.Vector3(-7, 0.8, -2),
      new THREE.Vector3(-1.5, 0.2, 5),
      new THREE.Vector3(4, 1.2, -3),
      new THREE.Vector3(9, 0.5, 4),
      new THREE.Vector3(14, 2.0, -1),
      new THREE.Vector3(16, 2.3, -3)
    ];
    const roadCurve = new THREE.CatmullRomCurve3(curvePoints);
    roadCurve.curveType = 'catmullrom';
    roadCurve.tension = 0.5;

    // Road Tube Geometry
    const roadGeo = new THREE.TubeGeometry(roadCurve, 120, 0.35, 12, false);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8,
      emissive: 0x0f2b66,
      roughness: 0.2,
      metalness: 0.8,
      wireframe: false
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    scene.add(roadMesh);

    // Glowing Neon Guideline on top of road
    const glowLineGeo = new THREE.TubeGeometry(roadCurve, 120, 0.08, 8, false);
    const glowLineMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8
    });
    const glowLineMesh = new THREE.Mesh(glowLineGeo, glowLineMat);
    scene.add(glowLineMesh);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(50, 40, 0x1e3a8a, 0x0f172a);
    gridHelper.position.y = -3.2;
    scene.add(gridHelper);

    // Background Floating Star Particles
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 60;
      starPos[i + 1] = Math.random() * 25 - 5;
      starPos[i + 2] = (Math.random() - 0.5) * 50;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.16,
      transparent: true,
      opacity: 0.75
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    scene.add(starParticles);

    // 6. HELPER TO CREATE PROCEDURAL 3D TINY PERSON
    // A cute humanoid character with head, torso, backpack/gear, animated arms & legs
    const createTinyPerson = (colorHex, hasCap = false, hasLaptop = false, isConfused = false) => {
      const personGroup = new THREE.Group();

      // Head
      const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
      const headMat = new THREE.MeshStandardMaterial({ color: 0xffdfba, roughness: 0.5 });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 1.15;
      personGroup.add(head);

      // Cute Eyes
      const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.09, 1.18, 0.25);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.09, 1.18, 0.25);
      personGroup.add(leftEye, rightEye);

      // Torso / Shirt
      const bodyGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.55, 12);
      const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.4 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.72;
      personGroup.add(body);

      // Left Arm
      const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.45, 8);
      const leftArm = new THREE.Mesh(armGeo, bodyMat);
      leftArm.position.set(-0.32, 0.75, 0);
      personGroup.add(leftArm);

      // Right Arm
      const rightArm = new THREE.Mesh(armGeo, bodyMat);
      rightArm.position.set(0.32, 0.75, 0);
      personGroup.add(rightArm);

      // Left Leg
      const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.6 });
      const leftLeg = new THREE.Mesh(legGeo, legMat);
      leftLeg.position.set(-0.13, 0.25, 0);
      personGroup.add(leftLeg);

      // Right Leg
      const rightLeg = new THREE.Mesh(legGeo, legMat);
      rightLeg.position.set(0.13, 0.25, 0);
      personGroup.add(rightLeg);

      // Tiny Shoes
      const shoeGeo = new THREE.BoxGeometry(0.14, 0.08, 0.22);
      const shoeMat = new THREE.MeshStandardMaterial({ color: 0x0f172a });
      const leftShoe = new THREE.Mesh(shoeGeo, shoeMat);
      leftShoe.position.set(-0.13, 0.04, 0.04);
      const rightShoe = new THREE.Mesh(shoeGeo, shoeMat);
      rightShoe.position.set(0.13, 0.04, 0.04);
      personGroup.add(leftShoe, rightShoe);

      // Backpack
      const packGeo = new THREE.BoxGeometry(0.28, 0.35, 0.16);
      const packMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      const backpack = new THREE.Mesh(packGeo, packMat);
      backpack.position.set(0, 0.75, -0.22);
      personGroup.add(backpack);

      // Accessory 1: Confused Floating Question Mark
      let questionMark = null;
      if (isConfused) {
        const qGeo = new THREE.TorusGeometry(0.14, 0.04, 8, 24, Math.PI * 1.5);
        const qMat = new THREE.MeshBasicMaterial({ color: 0xfbbf24 });
        questionMark = new THREE.Mesh(qGeo, qMat);
        questionMark.position.set(0, 1.7, 0);
        questionMark.rotation.z = Math.PI * 0.25;
        personGroup.add(questionMark);
      }

      // Accessory 2: Glowing 3D Laptop
      if (hasLaptop) {
        const lapBase = new THREE.BoxGeometry(0.3, 0.02, 0.22);
        const lapScreen = new THREE.BoxGeometry(0.3, 0.22, 0.02);
        const lapMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8 });
        const screenGlow = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
        
        const laptopMesh = new THREE.Mesh(lapBase, lapMat);
        laptopMesh.position.set(0, 0.7, 0.25);
        
        const screenMesh = new THREE.Mesh(lapScreen, screenGlow);
        screenMesh.position.set(0, 0.82, 0.35);
        screenMesh.rotation.x = -Math.PI * 0.15;
        
        personGroup.add(laptopMesh, screenMesh);
      }

      // Accessory 3: Graduation Cap (Mortarboard)
      let gradCap = null;
      if (hasCap) {
        const capBase = new THREE.CylinderGeometry(0.2, 0.22, 0.1, 16);
        const capTop = new THREE.BoxGeometry(0.55, 0.03, 0.55);
        const capMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3 });
        
        gradCap = new THREE.Group();
        const baseMesh = new THREE.Mesh(capBase, capMat);
        const topMesh = new THREE.Mesh(capTop, capMat);
        topMesh.position.y = 0.07;
        
        // Golden Tassel
        const tasselGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.2, 6);
        const tasselMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
        const tassel = new THREE.Mesh(tasselGeo, tasselMat);
        tassel.position.set(0.18, 0.02, 0.18);
        tassel.rotation.z = Math.PI * 0.2;
        
        gradCap.add(baseMesh, topMesh, tassel);
        gradCap.position.set(0, 1.45, 0);
        personGroup.add(gradCap);
      }

      return {
        group: personGroup,
        head,
        leftArm,
        rightArm,
        leftLeg,
        rightLeg,
        questionMark,
        gradCap
      };
    };

    // 7. BUILD 6 MILESTONE ISLANDS ALONG THE ROAD
    const stageNodes = [];
    STAGES_DATA.forEach((stage, idx) => {
      const islandGroup = new THREE.Group();
      islandGroup.position.set(stage.coord[0], stage.coord[1], stage.coord[2]);

      // Base Pedestal / Platform
      const cylGeo = new THREE.CylinderGeometry(1.3, 1.5, 0.4, 32);
      const cylMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        roughness: 0.3,
        metalness: 0.7
      });
      const pedestal = new THREE.Mesh(cylGeo, cylMat);
      islandGroup.add(pedestal);

      // Glowing Neon Ring around Pedestal
      const ringGeo = new THREE.TorusGeometry(1.35, 0.06, 12, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: stage.color });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = 0.15;
      islandGroup.add(ring);

      // Milestone Beacon Light
      const beaconLight = new THREE.PointLight(stage.color, 2.5, 8);
      beaconLight.position.set(0, 1.5, 0);
      islandGroup.add(beaconLight);

      // Stage Character
      let personObj;
      if (idx === 0) {
        // Confused student
        personObj = createTinyPerson(stage.color, false, false, true);
      } else if (idx === 2) {
        // Coding student with laptop
        personObj = createTinyPerson(stage.color, false, true, false);
      } else if (idx === 5) {
        // Triumphant graduate with cap
        personObj = createTinyPerson(stage.color, true, false, false);
      } else {
        personObj = createTinyPerson(stage.color, false, false, false);
      }
      personObj.group.position.y = 0.2;
      islandGroup.add(personObj.group);

      scene.add(islandGroup);
      stageNodes.push({ islandGroup, personObj, stage });
    });

    // 8. THE TRAVELLING TINY PERSON (Walking seamlessly along the highway!)
    const travelerPerson = createTinyPerson(0x38bdf8, false, false, false);
    scene.add(travelerPerson.group);

    // 9. Mouse Orbit & Pan Handler
    const onMouseDown = (e) => {
      camControlRef.current.isDragging = true;
      camControlRef.current.prevMouseX = e.clientX;
      camControlRef.current.prevMouseY = e.clientY;
    };

    const onMouseMove = (e) => {
      if (!camControlRef.current.isDragging) return;
      const dx = e.clientX - camControlRef.current.prevMouseX;
      const dy = e.clientY - camControlRef.current.prevMouseY;

      camControlRef.current.rotY += dx * 0.005;
      camControlRef.current.rotX = Math.max(-0.4, Math.min(0.6, camControlRef.current.rotX + dy * 0.005));

      camControlRef.current.prevMouseX = e.clientX;
      camControlRef.current.prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      camControlRef.current.isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 10. Animation Loop
    let clock = new THREE.Clock();
    let travelerT = 0;

    const animate = () => {
      if (!isMounted) return;
      animId = requestAnimationFrame(animate);

      try {
        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        // Animate background star particles floating
        if (starParticles) {
          starParticles.rotation.y = time * 0.015;
        }

        // Animate Milestone Characters (Subtle floating, arm movements, question mark spin)
        stageNodes.forEach((node, idx) => {
          const { personObj } = node;
          if (!personObj) return;
          const offset = idx * 1.2;

          // Head bobbing & breathing
          if (personObj.head) {
            personObj.head.position.y = 1.15 + Math.sin(time * 2.5 + offset) * 0.03;
          }

          // Gentle arm swing
          if (personObj.leftArm) {
            personObj.leftArm.rotation.x = Math.sin(time * 2 + offset) * 0.2;
          }
          if (personObj.rightArm) {
            personObj.rightArm.rotation.x = -Math.sin(time * 2 + offset) * 0.2;
          }

          // If confused person, spin question mark
          if (personObj.questionMark) {
            personObj.questionMark.rotation.y = time * 2;
            personObj.questionMark.position.y = 1.7 + Math.sin(time * 3) * 0.08;
          }

          // If graduate, toss cap gently
          if (personObj.gradCap) {
            personObj.gradCap.position.y = 1.45 + Math.sin(time * 3) * 0.05;
          }
        });

        // Animate the Travelling Tiny Person walking along the curve!
        if (travelerPerson && travelerPerson.group) {
          travelerT = (travelerT + delta * 0.08) % 1.0;
          const currentPoint = roadCurve.getPointAt(travelerT);
          const tangent = roadCurve.getTangentAt(travelerT);

          travelerPerson.group.position.copy(currentPoint);
          travelerPerson.group.position.y += 0.35; // Walk on top of road tube

          // Align person orientation to face along road curve
          const lookTarget = currentPoint.clone().add(tangent);
          travelerPerson.group.lookAt(lookTarget);

          // Procedural walking legs and arms swing animation for the traveller
          const walkSpeed = 12;
          if (travelerPerson.leftLeg) travelerPerson.leftLeg.rotation.x = Math.sin(time * walkSpeed) * 0.6;
          if (travelerPerson.rightLeg) travelerPerson.rightLeg.rotation.x = -Math.sin(time * walkSpeed) * 0.6;
          if (travelerPerson.leftArm) travelerPerson.leftArm.rotation.x = -Math.sin(time * walkSpeed) * 0.5;
          if (travelerPerson.rightArm) travelerPerson.rightArm.rotation.x = Math.sin(time * walkSpeed) * 0.5;
          if (travelerPerson.head) travelerPerson.head.position.y = 1.15 + Math.abs(Math.sin(time * walkSpeed * 2)) * 0.03;
        }

        // Camera Orbit & Smooth Interpolation
        const radius = 22;
        const targetCamX = Math.sin(camControlRef.current.rotY) * radius * Math.cos(camControlRef.current.rotX);
        const targetCamZ = Math.cos(camControlRef.current.rotY) * radius * Math.cos(camControlRef.current.rotX);
        const targetCamY = 7 + Math.sin(camControlRef.current.rotX) * radius;

        // If in Auto-Tour mode, camera gently pans back and forth along the scene
        if (isAutoTourRef.current && !camControlRef.current.isDragging) {
          camControlRef.current.rotY = Math.sin(time * 0.18) * 0.35;
          camControlRef.current.rotX = 0.12 + Math.cos(time * 0.15) * 0.05;
        }

        camera.position.x += (targetCamX - camera.position.x) * 0.05;
        camera.position.y += (targetCamY - camera.position.y) * 0.05;
        camera.position.z += (targetCamZ - camera.position.z) * 0.05;

        camControlRef.current.currentLook.lerp(camControlRef.current.targetLook, 0.05);
        camera.lookAt(camControlRef.current.currentLook);

        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      } catch (loopErr) {
        console.warn('Three.js render loop warning:', loopErr);
        if (animId) cancelAnimationFrame(animId);
        setHasWebGLError(true);
      }
    };

    animate();

    // 11. Resize Observer
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const newW = container.clientWidth || 800;
      const newH = container.clientHeight || 460;
      if (newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isMounted = false;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('mousedown', onMouseDown);
      }
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      try {
        if (renderer) {
          if (container && renderer.domElement && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          renderer.dispose();
        }
      } catch (disposeErr) {
        console.warn('Three.js disposal warning:', disposeErr);
      }
    };
  } catch (initErr) {
    console.warn('Failed to start 3D WebGL roadmap canvas:', initErr);
    setHasWebGLError(true);
  }
}, [retryKey]);

  const handleStageClick = (index) => {
    setActiveStageIndex(index);
    setIsAutoTour(false);
    const stage = STAGES_DATA[index];
    if (stage) {
      camControlRef.current.targetLook.set(stage.coord[0], stage.coord[1] + 1, stage.coord[2]);
      if (onSelectStage) {
        onSelectStage(stage);
      }
    }
  };

  const handleResetCamera = () => {
    setIsAutoTour(true);
    camControlRef.current.targetLook.set(0, 0, 0);
    camControlRef.current.rotY = 0;
    camControlRef.current.rotX = 0.15;
  };

  return (
    <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-blue-950 border border-slate-200/20 shadow-2xl">
      {/* Top Header & Stage Indicator */}
      <div className="absolute top-4 left-4 right-4 z-20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-slate-900/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-lg">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-bold text-white tracking-wide">
            {hasWebGLError ? 'Interactive Career Highway' : 'Interactive 3D Career Highway'}
          </span>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            {hasWebGLError ? '(High-Performance Engine)' : '(Three.js Engine)'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {!hasWebGLError ? (
            <>
              <button
                onClick={() => setIsAutoTour(!isAutoTour)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all shadow-md cursor-pointer ${
                  isAutoTour
                    ? 'bg-blue-600 text-white border border-blue-400 shadow-blue-500/30'
                    : 'bg-slate-800/80 text-slate-300 border border-white/15 hover:text-white'
                }`}
                title="Toggle Auto Tour camera animation"
              >
                {isAutoTour ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isAutoTour ? 'Auto Tour Active' : 'Start Auto Tour'}</span>
              </button>

              <button
                onClick={handleResetCamera}
                className="p-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
                title="Reset 3D camera angle"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setHasWebGLError(false);
                setRetryKey(k => k + 1);
              }}
              className="px-3 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-white/15 backdrop-blur-md transition-all cursor-pointer"
              title="Try reinitializing 3D WebGL mode"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry 3D Mode</span>
            </button>
          )}
        </div>
      </div>

      {/* The Highway Canvas / Fallback Area */}
      {!hasWebGLError ? (
        <div
          ref={mountRef}
          className="w-full h-[400px] sm:h-[480px] md:h-[540px] cursor-grab active:cursor-grabbing select-none"
        />
      ) : (
        <div className="w-full min-h-[380px] sm:min-h-[440px] p-6 sm:p-10 flex flex-col justify-center items-center relative overflow-hidden select-none">
          {/* Animated Neon Highway Vector Illustration */}
          <div className="w-full max-w-4xl relative py-8">
            {/* Ambient Background Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a15_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a15_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            {/* Glowing Highway Path SVG */}
            <svg viewBox="0 0 900 180" className="w-full h-auto relative z-10 overflow-visible">
              <defs>
                <linearGradient id="roadGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="20%" stopColor="#06b6d4" />
                  <stop offset="45%" stopColor="#2563eb" />
                  <stop offset="65%" stopColor="#8b5cf6" />
                  <stop offset="85%" stopColor="#4f46e5" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Road Curve Base */}
              <path
                d="M 50 120 Q 200 40 350 110 T 650 70 T 850 90"
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="16"
                strokeLinecap="round"
                opacity="0.4"
              />
              {/* Neon Guidance Centerline */}
              <path
                d="M 50 120 Q 200 40 350 110 T 650 70 T 850 90"
                fill="none"
                stroke="url(#roadGlow)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#neonBlur)"
              />
            </svg>

            {/* Interactive Stage Milestone Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 relative z-10">
              {STAGES_DATA.map((stg, i) => (
                <div
                  key={stg.id}
                  onClick={() => handleStageClick(i)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left ${
                    activeStageIndex === i
                      ? 'bg-blue-600/30 border-cyan-400 shadow-xl shadow-cyan-500/20 transform -translate-y-1'
                      : 'bg-slate-900/80 border-white/10 hover:border-white/30 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span
                      className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                      style={{ backgroundColor: `${stg.lightColor}25`, color: stg.lightColor }}
                    >
                      Stage {stg.id}
                    </span>
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: stg.lightColor }}
                    />
                  </div>
                  <div className="text-xs font-bold text-white leading-tight">{stg.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{stg.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Interactive Milestone Selection Bar */}
      <div className="p-4 sm:p-5 bg-slate-900/95 border-t border-white/10 backdrop-blur-xl relative z-20 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
          <span>Click any milestone to view stage details &amp; curriculum objectives:</span>
          {!hasWebGLError && (
            <span className="hidden sm:inline text-cyan-400 font-mono">Drag 3D scene to tilt &amp; rotate</span>
          )}
        </div>

        {/* 6 Stage Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {STAGES_DATA.map((stage, idx) => (
            <button
              key={stage.id}
              onClick={() => handleStageClick(idx)}
              className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border ${
                activeStageIndex === idx
                  ? 'bg-blue-600/30 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: stage.lightColor }}>
                  Stage {stage.id}
                </span>
                {activeStageIndex === idx && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                )}
              </div>
              <div className="text-xs font-bold truncate text-white">{stage.title}</div>
              <div className="text-[10px] text-slate-400 truncate">{stage.subtitle}</div>
            </button>
          ))}
        </div>

        {/* Selected Stage Detail Card */}
        {STAGES_DATA[activeStageIndex] && (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300">
                  {STAGES_DATA[activeStageIndex].tag}
                </span>
                <span className="text-xs font-extrabold text-white">
                  {STAGES_DATA[activeStageIndex].title} — {STAGES_DATA[activeStageIndex].subtitle}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {STAGES_DATA[activeStageIndex].desc}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[11px] text-slate-400 hidden md:inline">
                Sakith Harvan Progression
              </span>
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STAGES_DATA[activeStageIndex].lightColor }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
