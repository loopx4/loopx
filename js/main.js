/**
 * LOOP X - Cinematic 3D Scroll-Driven WebGL Engine
 * Synchronizes 3D architectural Lemniscate geometry, camera choreography,
 * spatial telemetry, and procedural soundscapes with page scrolling.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { LoopXGeometrySystem } from './loop-geometry.js';
import { LoopAudioEngine } from './audio.js';

class LoopXWebsiteApp {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.audioEngine = new LoopAudioEngine();

    // Scene & Renderer
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.loopSystem = null;

    // Lighting
    this.keyLight = null;
    this.rimLight = null;
    this.pointerLight = null;

    // Scroll-Driven State Machine
    this.scrollProgress = 0.0;
    this.targetScrollProgress = 0.0;
    this.cameraMode = 'cinematic'; // 'cinematic' | 'orbit' | 'macro'
    this.currentStageIndex = 0;
    this.prevStageIndex = -1;

    // Interaction & Parallax
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.clock = new THREE.Clock();

    // 6 Narrative Stages Definition (Aligned with Page Scroll)
    this.stages = [
      { id: 'hero', name: '00 // SYSTEM', title: 'THE VOID', start: 0.00, end: 0.16 },
      { id: 'ideas', name: '01 // INFLUX', title: 'IDEAS', start: 0.16, end: 0.36 },
      { id: 'strategy', name: '02 // ALIGN', title: 'STRATEGY', start: 0.36, end: 0.56 },
      { id: 'creative', name: '03 // MORPH', title: 'CREATIVE', start: 0.56, end: 0.76 },
      { id: 'growth', name: '04 // SCALE', title: 'GROWTH', start: 0.76, end: 0.92 },
      { id: 'the-loop', name: '05 // MONOLITH', title: 'THE LOOP', start: 0.92, end: 1.00 }
    ];

    // Camera Waypoints for Cinematic Spline Choreography
    this.cameraTracks = {
      hero: {
        posStart: new THREE.Vector3(0.0, 1.8, 26.0),
        posEnd: new THREE.Vector3(6.5, 2.0, 14.0),
        targetStart: new THREE.Vector3(0.0, 0.0, 0.0),
        targetEnd: new THREE.Vector3(4.0, 0.5, 0.0),
        fov: 36
      },
      ideas: {
        posStart: new THREE.Vector3(-16.0, 5.0, 18.0),
        posEnd: new THREE.Vector3(-10.5, 2.5, 14.0),
        targetStart: new THREE.Vector3(-14.0, 0.0, 0.0),
        targetEnd: new THREE.Vector3(-6.5, 0.0, 0.0),
        fov: 38
      },
      strategy: {
        posStart: new THREE.Vector3(-8.5, 8.5, 21.0),
        posEnd: new THREE.Vector3(-3.5, 6.0, 18.5),
        targetStart: new THREE.Vector3(-6.0, 1.0, 0.0),
        targetEnd: new THREE.Vector3(-1.5, 0.0, 0.0),
        fov: 36
      },
      creative: {
        posStart: new THREE.Vector3(4.0, -7.5, 18.5),
        posEnd: new THREE.Vector3(6.5, -4.0, 16.0),
        targetStart: new THREE.Vector3(2.0, -1.0, 0.0),
        targetEnd: new THREE.Vector3(5.0, 0.5, 0.0),
        fov: 40
      },
      growth: {
        posStart: new THREE.Vector3(0.0, 2.0, 24.0),
        posEnd: new THREE.Vector3(0.0, 4.5, 44.0),
        targetStart: new THREE.Vector3(0.0, 0.0, 0.0),
        targetEnd: new THREE.Vector3(0.0, 0.0, 0.0),
        fov: 46
      },
      'the-loop': {
        posStart: new THREE.Vector3(0.0, 2.0, 30.0),
        posEnd: new THREE.Vector3(0.0, 0.0, 23.5),
        targetStart: new THREE.Vector3(0.0, 0.0, 0.0),
        targetEnd: new THREE.Vector3(0.0, 0.0, 0.0),
        fov: 35
      }
    };

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupScene();
    this.setupCamera();
    this.setupLighting();
    this.setupGeometry();
    this.setupControls();
    this.setupScrollListener();
    this.setupDOMEventListeners();
    this.setupAudioVisualizer();
    this.handleResize();

    // Start Animation Loop
    this.animate();
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: false,
      stencil: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);
  }

  setupScene() {
    this.scene = new THREE.Scene();
    // Near-black architectural obsidian background
    this.scene.background = new THREE.Color(0x040507);
    this.scene.fog = new THREE.FogExp2(0x040507, 0.016);
  }

  setupCamera() {
    this.camera = new THREE.PerspectiveCamera(
      36,
      window.innerWidth / window.innerHeight,
      0.1,
      200
    );
    this.camera.position.set(0, 1.8, 26);
    this.cameraTarget = new THREE.Vector3(0, 0, 0);
  }

  setupLighting() {
    // 1. Master Directional Key Light (cool white studio raking highlight)
    this.keyLight = new THREE.DirectionalLight(0xeef3fc, 3.8);
    this.keyLight.position.set(16, 18, 14);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.bias = -0.0001;
    this.scene.add(this.keyLight);

    // 2. Loop X Signature Green Rim Light (striking razor highlight on loop bevels)
    this.rimLight = new THREE.DirectionalLight(0x8ee326, 4.2);
    this.rimLight.position.set(-18, -12, -10);
    this.scene.add(this.rimLight);

    // 3. Subtle Atmospheric Fill (deep slate indigo)
    const fillLight = new THREE.DirectionalLight(0x182032, 1.2);
    fillLight.position.set(-8, 12, 10);
    this.scene.add(fillLight);

    // 4. Ambient Fill
    const ambientLight = new THREE.AmbientLight(0x080a10, 0.9);
    this.scene.add(ambientLight);

    // 5. Interactive Cursor Spotlight (caresses loop bevels on pointer move)
    this.pointerLight = new THREE.PointLight(0xaef550, 1.8, 24, 1.4);
    this.pointerLight.position.set(0, 0, 8);
    this.scene.add(this.pointerLight);
  }

  setupGeometry() {
    this.loopSystem = new LoopXGeometrySystem(this.scene);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxDistance = 75;
    this.controls.minDistance = 4;
    this.controls.enabled = false; // Disabled by default for cinematic scroll choreography
  }

  setupScrollListener() {
    const computeScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      this.targetScrollProgress = Math.max(0, Math.min(1, scrollY / maxScroll));
    };

    window.addEventListener('scroll', computeScroll, { passive: true });
    computeScroll();
  }

  setupDOMEventListeners() {
    // Resize with ResizeObserver
    window.addEventListener('resize', () => this.handleResize());

    // Tab visibility (pause rendering when tab hidden)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.clock.start();
      }
    });

    // Mouse movement for subtle parallax & light tracking
    window.addEventListener('pointermove', (e) => {
      this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;

      // Project pointer spotlight in 3D world
      this.pointerLight.position.x = this.mouse.x * 12;
      this.pointerLight.position.y = this.mouse.y * 7;
      this.pointerLight.position.z = 7 + (1 - Math.abs(this.mouse.x)) * 3;
    });

    // Camera Mode Selectors
    document.querySelectorAll('.cam-mode-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cam-mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setCameraMode(btn.dataset.mode);
      });
    });

    // Audio Engine Toggle
    const audioToggle = document.getElementById('audio-toggle');
    if (audioToggle) {
      audioToggle.addEventListener('click', () => {
        const active = this.audioEngine.toggleMute();
        audioToggle.classList.toggle('active', active);
        const label = audioToggle.querySelector('.sound-label');
        if (label) label.textContent = active ? 'SOUND // ON' : 'SOUND // MUTED';
      });
    }

    // Right-Side Navigation Rail Smooth Scrolling
    document.querySelectorAll('.nav-rail-item').forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = item.getAttribute('href');
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          targetEl.scrollIntoView({ behavior: 'smooth' });
          this.audioEngine.playTick();
        }
      });
    });

    // Re-enter the Loop button
    const restartBtn = document.getElementById('btn-re-enter');
    if (restartBtn) {
      restartBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.audioEngine.playTick();
      });
    }
  }

  setCameraMode(mode) {
    this.cameraMode = mode;
    const canvasWrap = document.getElementById('canvas-container');

    if (mode === 'orbit') {
      this.controls.enabled = true;
      this.controls.target.set(0, 0, 0);
      if (canvasWrap) canvasWrap.classList.add('interactive');
    } else if (mode === 'macro') {
      this.controls.enabled = false;
      if (canvasWrap) canvasWrap.classList.remove('interactive');
      this.camera.position.set(5.5, 1.2, 5.0);
      this.cameraTarget.set(4.0, 0.2, 0.0);
      this.camera.lookAt(this.cameraTarget);
      this.camera.fov = 28;
      this.camera.updateProjectionMatrix();
    } else {
      // Cinematic (scroll-driven)
      this.controls.enabled = false;
      if (canvasWrap) canvasWrap.classList.remove('interactive');
    }
  }

  updateStageState() {
    const progress = this.scrollProgress;

    let stageIdx = 0;
    for (let i = 0; i < this.stages.length; i++) {
      if (progress >= this.stages[i].start && progress < this.stages[i].end) {
        stageIdx = i;
        break;
      }
    }
    if (progress >= 0.98) stageIdx = 5;

    const currentStage = this.stages[stageIdx];
    const stageDuration = currentStage.end - currentStage.start;
    const stageProgress = Math.max(0, Math.min(1, (progress - currentStage.start) / stageDuration));

    this.currentStageIndex = stageIdx;

    // Trigger subtle harmonic tick when stage boundary is crossed
    if (this.prevStageIndex !== stageIdx) {
      if (this.prevStageIndex !== -1) {
        this.audioEngine.playTick();
      }
      this.prevStageIndex = stageIdx;
    }

    // Update 3D Geometry
    this.loopSystem.update(this.clock.getElapsedTime(), stageIdx, stageProgress, progress);

    // Update Procedural Audio
    this.audioEngine.updateStage(stageIdx, stageProgress);

    // Update Cinematic Camera if in cinematic mode
    if (this.cameraMode === 'cinematic') {
      this.interpolateCinematicCamera(currentStage.id, stageProgress);
    }

    // Update DOM telemetry and spatial tags
    this.updateDOMTelemetry(stageIdx, currentStage);
  }

  interpolateCinematicCamera(stageId, progress) {
    const track = this.cameraTracks[stageId];
    if (!track) return;

    // Smooth cubic easing for architectural elegance
    const t = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;

    const targetPos = new THREE.Vector3().lerpVectors(track.posStart, track.posEnd, t);
    const targetLook = new THREE.Vector3().lerpVectors(track.targetStart, track.targetEnd, t);

    // Mouse parallax micro-offset
    const parallaxFactor = 0.8;
    targetPos.x += this.mouse.x * parallaxFactor;
    targetPos.y += this.mouse.y * (parallaxFactor * 0.6);

    this.camera.position.lerp(targetPos, 0.08);
    this.cameraTarget.lerp(targetLook, 0.08);
    this.camera.lookAt(this.cameraTarget);

    if (track.fov && Math.abs(this.camera.fov - track.fov) > 0.1) {
      this.camera.fov = THREE.MathUtils.lerp(this.camera.fov, track.fov, 0.05);
      this.camera.updateProjectionMatrix();
    }
  }

  updateDOMTelemetry(stageIdx, currentStage) {
    // 1. Header Status Badge
    const badgeText = document.getElementById('stage-indicator-badge');
    const stageTitle = document.getElementById('stage-title-text');
    if (badgeText && stageTitle) {
      badgeText.textContent = currentStage.name;
      stageTitle.textContent = currentStage.title;
    }

    // 2. Navigation Rail Active State
    const railItems = document.querySelectorAll('.nav-rail-item');
    railItems.forEach((item, idx) => {
      item.classList.toggle('active', idx === stageIdx);
    });

    // 3. Spatial 3D Integrated Labels
    const strategyTag = document.getElementById('spatial-tag-strategy');
    const creativeTag = document.getElementById('spatial-tag-creative');
    const growthTag = document.getElementById('spatial-tag-growth');

    if (strategyTag) {
      const active = stageIdx === 2;
      strategyTag.classList.toggle('visible', active);
      if (active) this.project3DToDOM(new THREE.Vector3(-6.5, 2.5, 1.0), strategyTag);
    }

    if (creativeTag) {
      const active = stageIdx === 3;
      creativeTag.classList.toggle('visible', active);
      if (active) this.project3DToDOM(new THREE.Vector3(4.5, -2.0, 1.5), creativeTag);
    }

    if (growthTag) {
      const active = stageIdx === 4;
      growthTag.classList.toggle('visible', active);
      if (active) this.project3DToDOM(new THREE.Vector3(0.0, 6.5, 0.0), growthTag);
    }
  }

  project3DToDOM(worldPos, domElement) {
    const wp = worldPos.clone();
    wp.project(this.camera);

    const x = (wp.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(wp.y * 0.5) + 0.5) * window.innerHeight;

    domElement.style.transform = `translate3d(${x}px, ${y}px, 0px) translate(-50%, -50%)`;
  }

  setupAudioVisualizer() {
    this.audioBars = document.querySelectorAll('.audio-bar');
  }

  updateAudioVisualizer() {
    if (!this.audioBars || this.audioBars.length === 0) return;
    const levels = this.audioEngine.getAudioLevels();
    this.audioBars.forEach((bar, idx) => {
      const lvl = levels[idx % levels.length] || 0.1;
      const height = Math.max(3, lvl * 18);
      bar.style.height = `${height}px`;
    });
  }

  handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.camera.aspect = w / h;

    if (w < 768) {
      this.camera.fov = 50;
    } else if (w < 1200) {
      this.camera.fov = 40;
    } else {
      this.camera.fov = 36;
    }

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Liquid-smooth scroll progress damping (lerp)
    this.scrollProgress += (this.targetScrollProgress - this.scrollProgress) * 0.08;

    // Smooth mouse parallax damping
    this.mouse.x = THREE.MathUtils.lerp(this.mouse.x, this.mouse.targetX, 0.05);
    this.mouse.y = THREE.MathUtils.lerp(this.mouse.y, this.mouse.targetY, 0.05);

    // Update Controls if in Orbit mode
    if (this.cameraMode === 'orbit') {
      this.controls.update();
    }

    // Update Timeline State & Scene Systems
    this.updateStageState();

    // Update Audio Visualizer
    this.updateAudioVisualizer();

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

// Bootstrap on DOM Ready or immediately if already loaded
function initApp() {
  new LoopXWebsiteApp();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
