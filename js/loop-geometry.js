/**
 * LOOP X - Architectural 3D Loop Geometry & Spatial Systems
 * Defines the parametric 3D Lemniscate Monolith, beveled cross-sections,
 * dynamic idea fragments, strategy lattices, creative ribbons, and growth systems.
 */

import * as THREE from 'three';

export class LoopXGeometrySystem {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    // Parametric constants for 3D Lemniscate with architectural overpass elevation
    this.curveParams = {
      a: 14.2,  // X spread
      b: 8.4,   // Y height
      c: 2.8,   // Z bridge elevation offset (prevents self-intersection)
      segments: 400
    };

    this.points = [];
    this.tangents = [];
    this.normals = [];
    this.binormals = [];

    this.mainMesh = null;
    this.coreFilament = null;
    this.ideaParticlesGroup = null;
    this.strategyGridGroup = null;
    this.creativeRibbonsGroup = null;
    this.growthSuperstructureGroup = null;

    this.uniforms = {
      uTime: { value: 0 },
      uPulsePos: { value: 0 },
      uStage: { value: 0 },
      uCreativeWave: { value: 0 },
      uGrowthScale: { value: 0 },
      uReveal: { value: 1.0 },
      uAccentColor: { value: new THREE.Color(0x8ee326) }, // Brand signature lime
      uObsidianColor: { value: new THREE.Color(0x060709) },
      uTitaniumColor: { value: new THREE.Color(0x282c34) }
    };

    this.buildCurveFrame();
    this.buildMonolithicLoop();
    this.buildCoreFilament();
    this.buildIdeaFragments();
    this.buildStrategyLattice();
    this.buildCreativeRibbons();
    this.buildGrowthSuperstructure();
  }

  // 1. Parametric 3D Lemniscate of Bernoulli with architectural elevation
  getPointAt(t) {
    // t in [0, 1]
    const u = t * Math.PI * 2;
    const sinU = Math.sin(u);
    const cosU = Math.cos(u);
    const denom = 1 + sinU * sinU;

    const x = (this.curveParams.a * cosU) / denom;
    const y = (this.curveParams.b * sinU * cosU) / denom;
    // Z creates the overpass: at u=pi/2 (intake crossing) and u=3pi/2 (outtake crossing)
    const z = this.curveParams.c * sinU;

    return new THREE.Vector3(x, y, z);
  }

  buildCurveFrame() {
    const N = this.curveParams.segments;
    this.points = [];
    for (let i = 0; i <= N; i++) {
      const t = i / N;
      this.points.push(this.getPointAt(t));
    }

    // Compute continuous parallel-transport / rotation-minimizing frame
    this.tangents = [];
    this.normals = [];
    this.binormals = [];

    // Up vector for initial frame
    let normal = new THREE.Vector3(0, 0, 1);

    for (let i = 0; i <= N; i++) {
      const nextIdx = (i + 1) % N;
      const prevIdx = (i - 1 + N) % N;
      const tangent = new THREE.Vector3().subVectors(this.points[nextIdx], this.points[prevIdx]).normalize();
      this.tangents.push(tangent);

      let binormal = new THREE.Vector3().crossVectors(tangent, normal).normalize();
      normal = new THREE.Vector3().crossVectors(binormal, tangent).normalize();

      this.normals.push(normal.clone());
      this.binormals.push(binormal.clone());
    }
  }

  // 2. Monolithic Architectural Loop Mesh with beveled faceted profile
  buildMonolithicLoop() {
    const N = this.curveParams.segments;
    // Octagonal beveled architectural slab profile
    // Asymmetric thickness: thinner at left (intake t~0.5), thicker at right (growth t~0.0/1.0)
    const baseProfile = [
      new THREE.Vector2(-0.75, -0.25),
      new THREE.Vector2(-0.85, 0.0),
      new THREE.Vector2(-0.75, 0.25),
      new THREE.Vector2(-0.35, 0.38),
      new THREE.Vector2(0.35, 0.38),
      new THREE.Vector2(0.75, 0.25),
      new THREE.Vector2(0.85, 0.0),
      new THREE.Vector2(0.75, -0.25),
      new THREE.Vector2(0.35, -0.38),
      new THREE.Vector2(-0.35, -0.38)
    ];

    const vertices = [];
    const normals = [];
    const uvs = [];
    const indices = [];

    const P = baseProfile.length;

    for (let i = 0; i <= N; i++) {
      const t = i / N;
      const pt = this.points[i];
      const T = this.tangents[i];
      const Norm = this.normals[i];
      const Binorm = this.binormals[i];

      // Physical metaphor: Idea enters smaller (t ~ 0.5, x < 0), returns bigger (t ~ 1.0 / 0.0, x > 0)
      // Smooth sigmoid / cosine transition: scale 0.82 to 1.48
      const xNorm = pt.x / this.curveParams.a; // -1 to +1
      const scaleFactor = 1.08 + xNorm * 0.36; // 0.72 on left, 1.44 on right

      for (let j = 0; j < P; j++) {
        const pr = baseProfile[j];
        // Offset along normal and binormal
        const vx = pr.x * scaleFactor;
        const vy = pr.y * scaleFactor;

        const worldPt = new THREE.Vector3()
          .copy(pt)
          .addScaledVector(Norm, vx)
          .addScaledVector(Binorm, vy);

        vertices.push(worldPt.x, worldPt.y, worldPt.z);

        // Approximate normal from center of cross section
        const normVec = new THREE.Vector3().subVectors(worldPt, pt).normalize();
        normals.push(normVec.x, normVec.y, normVec.z);

        uvs.push(t, j / P);
      }
    }

    // Triangulate between ring i and ring i+1
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < P; j++) {
        const nextJ = (j + 1) % P;
        const currentRing = i * P;
        const nextRing = (i + 1) * P;

        const a = currentRing + j;
        const b = nextRing + j;
        const c = nextRing + nextJ;
        const d = currentRing + nextJ;

        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();

    // High-end obsidian/dark titanium PBR material
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x090a0d,
      roughness: 0.16,
      metalness: 0.88,
      clearcoat: 0.85,
      clearcoatRoughness: 0.12,
      reflectivity: 0.95,
      side: THREE.DoubleSide
    });

    this.mainMesh = new THREE.Mesh(geometry, material);
    this.mainMesh.castShadow = true;
    this.mainMesh.receiveShadow = true;
    this.group.add(this.mainMesh);
  }

  // 3. Luminous Core Filament (Laser light guide running along the interior spine)
  buildCoreFilament() {
    const N = this.curveParams.segments;
    const filamentPoints = [];

    for (let i = 0; i <= N; i++) {
      const pt = this.points[i];
      const Binorm = this.binormals[i];
      // Offset slightly onto the upper ridge
      filamentPoints.push(new THREE.Vector3().copy(pt).addScaledVector(Binorm, 0.42));
    }

    const curve = new THREE.CatmullRomCurve3(filamentPoints, true);
    const geometry = new THREE.TubeGeometry(curve, 320, 0.075, 12, true);

    const material = new THREE.MeshBasicMaterial({
      color: 0x98f02e,
      transparent: true,
      opacity: 0.92
    });

    this.coreFilament = new THREE.Mesh(geometry, material);
    this.group.add(this.coreFilament);

    // Subtle exterior glow sheath around the filament
    const glowGeo = new THREE.TubeGeometry(curve, 240, 0.22, 10, true);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x8ee326,
      transparent: true,
      opacity: 0.18,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    this.group.add(glowMesh);
    this.coreFilamentGlow = glowMesh;
  }

  // 4. Abstract Idea Fragments (Entering the loop at the left aperture)
  buildIdeaFragments() {
    this.ideaParticlesGroup = new THREE.Group();
    this.ideaFragments = [];

    const numFragments = 140;
    // Refined abstract architectural geometry: thin lines, prisms, micro cuboids, coordinate crosses
    const boxGeo = new THREE.BoxGeometry(0.18, 0.18, 0.5);
    const prismGeo = new THREE.ConeGeometry(0.2, 0.45, 4);
    const crossGeo = new THREE.BoxGeometry(0.35, 0.04, 0.04);

    const darkMetalMat = new THREE.MeshPhysicalMaterial({
      color: 0x1a1e24,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 0.6
    });

    const accentMat = new THREE.MeshBasicMaterial({
      color: 0x8ee326,
      wireframe: true
    });

    const whiteWireMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.4,
      wireframe: true
    });

    for (let i = 0; i < numFragments; i++) {
      let mesh;
      const type = i % 3;
      if (type === 0) mesh = new THREE.Mesh(boxGeo, darkMetalMat);
      else if (type === 1) mesh = new THREE.Mesh(prismGeo, accentMat);
      else mesh = new THREE.Mesh(crossGeo, whiteWireMat);

      // Starting positions scattered in negative space to the left of the loop
      const spawnX = -18 - Math.random() * 14;
      const spawnY = (Math.random() - 0.5) * 12;
      const spawnZ = (Math.random() - 0.5) * 8;

      mesh.position.set(spawnX, spawnY, spawnZ);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);

      // Target path parameter t around the intake apex (t ~ 0.5 is x = -a)
      const targetT = 0.4 + (Math.random() - 0.5) * 0.18;

      this.ideaParticlesGroup.add(mesh);
      this.ideaFragments.push({
        mesh,
        initialPos: new THREE.Vector3(spawnX, spawnY, spawnZ),
        targetT,
        speed: 0.2 + Math.random() * 0.4,
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03,
          (Math.random() - 0.5) * 0.03
        ),
        phase: Math.random() * Math.PI * 2
      });
    }

    this.group.add(this.ideaParticlesGroup);
  }

  // 5. Strategy Lattice (Orthogonal alignment cage and precision laser lines)
  buildStrategyLattice() {
    this.strategyGridGroup = new THREE.Group();

    // Architectural alignment frames around the intake and crossing
    const frameCount = 18;
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x8ee326,
      transparent: true,
      opacity: 0.0
    });
    this.strategyLineMat = lineMat;

    const frameGeos = [];
    for (let i = 0; i < frameCount; i++) {
      // Sample points along the intake path
      const t = 0.35 + (i / frameCount) * 0.3;
      const pt = this.getPointAt(t);

      // Create an architectural bounding rectangle around the loop cross section
      const w = 1.6 + i * 0.06;
      const h = 1.2 + i * 0.04;
      const rectGeo = new THREE.BufferGeometry();
      const vertices = [
        -w, -h, 0,
         w, -h, 0,
         w,  h, 0,
        -w,  h, 0,
        -w, -h, 0
      ];
      rectGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
      const line = new THREE.Line(rectGeo, lineMat);
      line.position.copy(pt);
      line.lookAt(this.getPointAt(t + 0.02));
      this.strategyGridGroup.add(line);
    }

    // Precision coordinate crosshairs and horizontal laser guide datum
    const datumGeo = new THREE.BufferGeometry();
    const datumVerts = [-20, 0, 0, 20, 0, 0];
    datumGeo.setAttribute('position', new THREE.Float32BufferAttribute(datumVerts, 3));
    const datumLine = new THREE.Line(datumGeo, lineMat);
    this.strategyGridGroup.add(datumLine);

    this.group.add(this.strategyGridGroup);
  }

  // 6. Creative Ribbons (Parametric twisting fins that blossom during transformation)
  buildCreativeRibbons() {
    this.creativeRibbonsGroup = new THREE.Group();

    const ribbonCount = 5;
    this.ribbonMeshes = [];

    const ribbonMat = new THREE.MeshPhysicalMaterial({
      color: 0x15181e,
      roughness: 0.1,
      metalness: 0.95,
      clearcoat: 0.9,
      transparent: true,
      opacity: 0.0,
      side: THREE.DoubleSide
    });
    this.creativeRibbonMat = ribbonMat;

    for (let r = 0; r < ribbonCount; r++) {
      const ribbonPts = [];
      const N = 120;
      const phaseOffset = (r / ribbonCount) * Math.PI * 2;

      for (let i = 0; i <= N; i++) {
        const t = (i / N) * 0.5 + 0.25; // Centered on the creative section
        const pt = this.getPointAt(t);
        const binorm = this.binormals[Math.floor(t * this.curveParams.segments)] || new THREE.Vector3(0, 1, 0);

        // Helical offset that blossoms outward
        const rad = 0.9 + Math.sin(t * Math.PI * 6 + phaseOffset) * 0.45;
        ribbonPts.push(
          new THREE.Vector3()
            .copy(pt)
            .addScaledVector(binorm, Math.cos(t * Math.PI * 4 + phaseOffset) * rad)
        );
      }

      const curve = new THREE.CatmullRomCurve3(ribbonPts);
      const geo = new THREE.TubeGeometry(curve, 90, 0.05, 6, false);
      const mesh = new THREE.Mesh(geo, ribbonMat);
      this.creativeRibbonsGroup.add(mesh);
      this.ribbonMeshes.push(mesh);
    }

    this.group.add(this.creativeRibbonsGroup);
  }

  // 7. Growth Superstructure (Monumental expanding architectural rings & cosmic trusses)
  buildGrowthSuperstructure() {
    this.growthSuperstructureGroup = new THREE.Group();

    const ringScales = [1.65, 2.45, 3.6];
    this.growthRings = [];

    ringScales.forEach((scale, idx) => {
      const N = 180;
      const pts = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N;
        const pt = this.getPointAt(t);
        pts.push(new THREE.Vector3(pt.x * scale, pt.y * scale, pt.z * (scale * 0.8)));
      }

      const curve = new THREE.CatmullRomCurve3(pts, true);
      const geo = new THREE.TubeGeometry(curve, 180, 0.04 + idx * 0.02, 6, true);
      const mat = new THREE.MeshPhysicalMaterial({
        color: 0x121418,
        metalness: 0.92,
        roughness: 0.24,
        transparent: true,
        opacity: 0.0
      });

      const mesh = new THREE.Mesh(geo, mat);
      this.growthSuperstructureGroup.add(mesh);
      this.growthRings.push(mesh);
    });

    // Radial architectural tensile lines connecting main loop to outer rings
    const tensileGeo = new THREE.BufferGeometry();
    const tensileVerts = [];
    for (let i = 0; i < 32; i++) {
      const t = i / 32;
      const p1 = this.getPointAt(t);
      const p2 = new THREE.Vector3(p1.x * 2.45, p1.y * 2.45, p1.z * 1.8);
      tensileVerts.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
    }
    tensileGeo.setAttribute('position', new THREE.Float32BufferAttribute(tensileVerts, 3));
    this.tensileMat = new THREE.LineBasicMaterial({
      color: 0x8ee326,
      transparent: true,
      opacity: 0.0
    });
    this.tensileLines = new THREE.LineSegments(tensileGeo, this.tensileMat);
    this.growthSuperstructureGroup.add(this.tensileLines);

    this.group.add(this.growthSuperstructureGroup);
  }

  // Update dynamic transforms and material states across the 5 narrative phases
  update(time, stageIndex, stageProgress, overallProgress) {
    this.uniforms.uTime.value = time;

    // 1. Slow, majestic architectural self-rotation
    this.group.rotation.y = Math.sin(time * 0.15) * 0.06;
    this.group.rotation.x = Math.cos(time * 0.12) * 0.03;

    // 2. Pulse laser filament along the loop
    const pulseSpeed = 0.35 + stageIndex * 0.08;
    const pulseOffset = (time * pulseSpeed) % 1.0;
    if (this.coreFilament) {
      // Glow intensity modulates with narrative progression
      let baseOpacity = 0.5;
      if (stageIndex === 0) baseOpacity = 0.25 + Math.sin(time * 2) * 0.15; // Awakening
      else if (stageIndex === 2) baseOpacity = 0.85; // Strategy precision
      else if (stageIndex === 3) baseOpacity = 0.95; // Creative brilliance
      else if (stageIndex === 4) baseOpacity = 1.0;  // Growth expansion
      else if (stageIndex === 5) baseOpacity = 0.9;  // Loop X brand monolith

      this.coreFilament.material.opacity = baseOpacity;
      if (this.coreFilamentGlow) {
        this.coreFilamentGlow.material.opacity = baseOpacity * 0.3;
      }
    }

    // 3. Stage 1: Ideas Entering
    if (this.ideaParticlesGroup) {
      // Particles active during stages 0, 1, and 2
      let ideasVisibility = 0;
      if (stageIndex === 0) ideasVisibility = stageProgress * 0.6;
      else if (stageIndex === 1) ideasVisibility = 1.0;
      else if (stageIndex === 2) ideasVisibility = 1.0 - stageProgress;

      this.ideaParticlesGroup.visible = ideasVisibility > 0.01;

      this.ideaFragments.forEach(frag => {
        // Ideas stream from left toward intake locus
        const streamProgress = (time * frag.speed * 0.2 + frag.phase) % 1.0;
        const targetPt = this.getPointAt(frag.targetT);

        frag.mesh.position.lerpVectors(frag.initialPos, targetPt, streamProgress);
        frag.mesh.rotation.x += frag.rotSpeed.x;
        frag.mesh.rotation.y += frag.rotSpeed.y;

        // Scale down as they absorb into the loop
        const s = (1.0 - streamProgress * 0.7) * ideasVisibility;
        frag.mesh.scale.set(s, s, s);
      });
    }

    // 4. Stage 2: Strategy Alignment
    if (this.strategyGridGroup) {
      let strategyAlpha = 0.0;
      if (stageIndex === 2) {
        strategyAlpha = Math.sin(stageProgress * Math.PI);
      }
      this.strategyLineMat.opacity = strategyAlpha * 0.75;
      this.strategyGridGroup.visible = strategyAlpha > 0.02;
    }

    // 5. Stage 3: Creative Ribbon Morphing
    if (this.creativeRibbonsGroup) {
      let creativeAlpha = 0.0;
      if (stageIndex === 3) {
        creativeAlpha = Math.sin(stageProgress * Math.PI);
      }
      this.creativeRibbonMat.opacity = creativeAlpha * 0.85;
      this.creativeRibbonsGroup.visible = creativeAlpha > 0.02;

      // Animate ribbons with subtle undulating wave
      if (this.ribbonMeshes) {
        this.ribbonMeshes.forEach((mesh, idx) => {
          mesh.rotation.z = time * 0.2 + idx * 0.4;
        });
      }
    }

    // 6. Stage 4: Growth Superstructure
    if (this.growthSuperstructureGroup) {
      let growthAlpha = 0.0;
      let expandScale = 1.0;
      if (stageIndex === 4) {
        growthAlpha = Math.sin(stageProgress * Math.PI);
        expandScale = 1.0 + stageProgress * 0.35;
      }
      this.growthRings.forEach(ring => {
        ring.material.opacity = growthAlpha * 0.65;
        ring.scale.set(expandScale, expandScale, expandScale);
      });
      this.tensileMat.opacity = growthAlpha * 0.35;
      this.growthSuperstructureGroup.visible = growthAlpha > 0.02;
    }

    // 7. Stage 5: Brand Identity Convergence
    if (stageIndex === 5) {
      // Loop returns to pristine frontal alignment
      const ease = Math.min(1.0, stageProgress * 1.5);
      this.group.position.set(0, 0, 0);
      this.group.rotation.x = THREE.MathUtils.lerp(this.group.rotation.x, 0, 0.05);
      this.group.rotation.y = THREE.MathUtils.lerp(this.group.rotation.y, 0, 0.05);
    }
  }
}
