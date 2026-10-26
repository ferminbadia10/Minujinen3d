import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { AudioMetrics, OrientationData, RenderConfig } from '../types';
import { sensorManager } from '../services/sensorManager';
import { MINUJIN_ARTWORKS, Artwork } from '../data/artworks';
import {
  createArtworkTexture,
  createMattressWallTexture,
  createMinujinCeilingTexture,
} from './minujinTextures';
import { createTripleArteMonument } from './arte3DText';
import cloudFloorPngUrl from '../assets/images/clouds_floor.png';

// Pre-allocated math objects to guarantee ZERO GC per frame
const _tempVec3 = new THREE.Vector3();
const _targetCamPos = new THREE.Vector3();
const _targetLookAt = new THREE.Vector3();
const _currentLookAt = new THREE.Vector3(0, 1.6, -1);
const _raycaster = new THREE.Raycaster();
const _mouse = new THREE.Vector2();

interface ArtworkObject {
  artwork: Artwork;
  group: THREE.Group;
  canvasMesh: THREE.Mesh;
  spotlight: THREE.SpotLight;
  initialPos: THREE.Vector3;
  initialRot: THREE.Euler;
  viewPos: THREE.Vector3;
  viewLookAt: THREE.Vector3;
}

export class SceneManager {
  private container: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Background camera video plane (AR Mode)
  private videoPlane: THREE.Mesh | null = null;
  private videoTexture: THREE.VideoTexture | null = null;
  private videoPlaneMaterial: THREE.MeshBasicMaterial | null = null;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private centerLight: THREE.PointLight;
  private gallerySpotlights: THREE.SpotLight[] = [];

  // Gallery Architecture Elements
  private floorMesh: THREE.Mesh | null = null;
  private cloudFloorTexture: THREE.Texture | null = null;
  private ceilingMesh: THREE.Mesh | null = null;
  private ceilingSoftArtGroup: THREE.Group | null = null;
  private mattressWallGroup: THREE.Group | null = null;

  // Curated Artworks
  private artworkObjects: ArtworkObject[] = [];
  private interactiveMeshes: THREE.Mesh[] = [];

  // Kinetic 3D ARTE Monument
  private arteMonument: THREE.Group | null = null;
  private kineticSpinVelocity = 0.4;
  private suspensionWire: THREE.Line | null = null;

  // Sound-Spawned Floating Canvas Confetti / Ribbons
  private floatingRibbons: {
    mesh: THREE.Mesh;
    velocity: THREE.Vector3;
    rotSpeed: THREE.Vector3;
    life: number;
    maxLife: number;
  }[] = [];

  // Navigation State
  private focusedArtworkId: string | null = null;
  private isFocusing = false;
  private focusProgress = 0;
  private defaultCameraPos = new THREE.Vector3(0, 1.65, 0.1);
  private cameraYaw = 0;
  private cameraPitch = 0;

  // Touch & Pointer Tracking
  private isPointerDown = false;
  private pointerPrevPos = { x: 0, y: 0 };
  private pointerStartPos = { x: 0, y: 0 };
  private totalDragDist = 0;

  // Loop & Config
  private animationFrameId: number | null = null;
  private clock = new THREE.Clock();
  private isTabActive = true;
  private currentConfig: RenderConfig;

  // Callbacks
  private onSelectArtwork?: (artworkId: string | null) => void;
  private onFpsUpdate?: (fps: number) => void;
  private frameCount = 0;
  private lastFpsUpdateTime = 0;
  private currentFps = 60;

  constructor(
    container: HTMLDivElement,
    canvas: HTMLCanvasElement,
    initialConfig: RenderConfig,
    onSelectArtwork?: (artworkId: string | null) => void,
    onFpsUpdate?: (fps: number) => void
  ) {
    this.container = container;
    this.canvas = canvas;
    this.currentConfig = initialConfig;
    this.onSelectArtwork = onSelectArtwork;
    this.onFpsUpdate = onFpsUpdate;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x0e0e18, 0.035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 80);
    this.camera.position.copy(this.defaultCameraPos);

    // 3. Renderer with Mobile Optimization Rules
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(width, height);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 4. Procedural Studio Environment Reflection
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Setup
    this.ambientLight = new THREE.AmbientLight(0xffffff, this.currentConfig.ambientLightIntensity);
    this.scene.add(this.ambientLight);

    // Warm museum center light beneath skylight
    this.centerLight = new THREE.PointLight(0xfff5e6, 2.2, 22, 1.0);
    this.centerLight.position.set(0, 5.5, 0);
    this.centerLight.castShadow = true;
    this.centerLight.shadow.bias = -0.002;
    this.scene.add(this.centerLight);

    // Subtle colored accent fills inspired by Minujín
    const magentaFill = new THREE.PointLight(0xff007f, 1.2, 16);
    magentaFill.position.set(-8, 3, -6);
    this.scene.add(magentaFill);

    const cyanFill = new THREE.PointLight(0x00f0ff, 1.2, 16);
    cyanFill.position.set(8, 3, -6);
    this.scene.add(cyanFill);

    // 6. Build the Contemporary Gallery Room
    this.buildGalleryRoom();

    // 7. Build Curated Floating Artworks
    this.buildCuratedArtworks();

    // 8. Build Suspended Kinetic 3D "ARTE ARTE ARTE" Sculpture
    this.buildSuspendedArteSculpture();

    // 9. Setup Event Listeners
    this.initEventListeners();

    // 10. Start Animation Loop
    this.startLoop();
  }

  /**
   * Builds the contemporary gallery architecture:
   * Polished resin floor, perimeter mattress installation wall, and architectural cove ceiling
   */
  private buildGalleryRoom() {
    // 1. Ethereal Cloud Sea Floor via PNG Texture (Walking on Clouds)
    const floorRadius = 15.6;
    const floorGeo = new THREE.CircleGeometry(floorRadius, 96);
    this.cloudFloorTexture = new THREE.TextureLoader().load(cloudFloorPngUrl);
    this.cloudFloorTexture.wrapS = THREE.RepeatWrapping;
    this.cloudFloorTexture.wrapT = THREE.RepeatWrapping;
    this.cloudFloorTexture.repeat.set(5, 5);
    this.cloudFloorTexture.colorSpace = THREE.SRGBColorSpace;

    const floorMat = new THREE.MeshStandardMaterial({
      map: this.cloudFloorTexture,
      roughness: 0.25,
      metalness: 0.05,
      emissive: new THREE.Color(0x301e38), // Soft Minujín lavender/rose ethereal undertone
      emissiveMap: this.cloudFloorTexture,
      emissiveIntensity: 0.38,
    });

    this.floorMesh = new THREE.Mesh(floorGeo, floorMat);
    this.floorMesh.rotation.x = -Math.PI / 2;
    this.floorMesh.position.y = 0;
    this.floorMesh.receiveShadow = true;
    this.scene.add(this.floorMesh);

    // 2. Sculptural Vaulted Ceiling with Marta Minujín Pop-Art Aesthetic
    const innerRadius = 2.4;
    const outerRadius = 15.6;
    const ceilingGeo = new THREE.RingGeometry(innerRadius, outerRadius, 96, 32);

    // Arch the ceiling into a vaulted canopy with puffy mattress tufting / pillowing displacement
    const posAttr = ceilingGeo.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const x = posAttr.getX(i);
      const y = posAttr.getY(i);
      const dist = Math.sqrt(x * x + y * y);
      const angle = Math.atan2(y, x);
      const normDist = (dist - innerRadius) / (outerRadius - innerRadius);

      // Vault arch curvature (apex at oculus y=7.2, perimeter resting at y=6.25)
      const arch = (1 - Math.pow(normDist, 0.75)) * 0.95;

      // Organic soft-art mattress pillowing / tufting displacement emulating cushion modules
      const pillow =
        Math.sin(angle * 12) * Math.sin(normDist * Math.PI * 6) * 0.08 +
        Math.cos(angle * 8 + normDist * 5) * 0.04;
      posAttr.setZ(i, -(arch + pillow));
    }
    ceilingGeo.computeVertexNormals();

    const ceilingTex = createMinujinCeilingTexture(this.renderer);
    const ceilingMat = new THREE.MeshStandardMaterial({
      map: ceilingTex,
      emissive: new THREE.Color(0xffffff),
      emissiveMap: ceilingTex,
      emissiveIntensity: 0.38,
      roughness: 0.55,
      metalness: 0.08,
      side: THREE.DoubleSide,
    });
    this.ceilingMesh = new THREE.Mesh(ceilingGeo, ceilingMat);
    this.ceilingMesh.rotation.x = Math.PI / 2;
    this.ceilingMesh.position.y = 6.25;
    this.scene.add(this.ceilingMesh);

    // Oculus Skylight Outer Rim (Neon Yellow Pop Art Accent)
    const oculusRimGeo = new THREE.TorusGeometry(innerRadius, 0.12, 16, 64);
    const oculusRimMat = new THREE.MeshBasicMaterial({
      color: 0xfaff00, // Neon yellow core ring
    });
    const oculusRim = new THREE.Mesh(oculusRimGeo, oculusRimMat);
    oculusRim.rotation.x = Math.PI / 2;
    oculusRim.position.y = 7.2;
    this.scene.add(oculusRim);

    // Concentric Neon Cove Accent Rings highlighting the vaulted canopy
    const neonCyanRingGeo = new THREE.TorusGeometry(6.8, 0.045, 12, 64);
    const neonCyanMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const neonCyanRing = new THREE.Mesh(neonCyanRingGeo, neonCyanMat);
    neonCyanRing.rotation.x = Math.PI / 2;
    neonCyanRing.position.y = 6.8;
    this.scene.add(neonCyanRing);

    const neonMagentaRingGeo = new THREE.TorusGeometry(11.2, 0.045, 12, 64);
    const neonMagentaMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const neonMagentaRing = new THREE.Mesh(neonMagentaRingGeo, neonMagentaMat);
    neonMagentaRing.rotation.x = Math.PI / 2;
    neonMagentaRing.position.y = 6.46;
    this.scene.add(neonMagentaRing);

    // 3. 3D Overlapping Straight Soft-Art Mattress Beams / Padded Slats
    // Emulating Minujín's iconic mattress installations (La Menesunda / Revuélquese y Viva)
    // Multidirectional straight upholstered beams crisscrossing at staggered heights without black outlines
    this.ceilingSoftArtGroup = new THREE.Group();
    this.ceilingSoftArtGroup.name = 'ceilingSoftArtBeams';

    const beamColors = [0xfaff00, 0xff007f, 0x00f0ff, 0xff5500, 0x8b00ff, 0x00ff66, 0xffffff];
    const numBeams = 32;

    for (let b = 0; b < numBeams; b++) {
      // Angular orientation and positioning across chords and diameters
      const beamAngle = ((b * 5) % 16) * (Math.PI / 8) + ((b % 3) - 1) * 0.05;
      const distFromCenter = ((b * 1.37) % 6.2) - 3.1; // offset along perpendicular axis
      const length = 7.5 + ((b * 3.1) % 7.0); // 7.5m to 14.5m spanning across vault
      const width = 0.32 + ((b % 4) * 0.05); // 32cm to 47cm mattress width
      const thickness = 0.11 + ((b % 3) * 0.03); // 11cm to 17cm soft cushion height

      // Staggered vertical elevation so straight beams physically overlap in 3D
      // Stagger between y = 6.40 and y = 7.08
      const layerY = 6.42 + ((b % 6) * 0.11);

      // Pillowed upholstered beam geometry
      const beamGeo = new THREE.BoxGeometry(length, thickness, width, 8, 2, 4);
      const bPosAttr = beamGeo.attributes.position;
      for (let j = 0; j < bPosAttr.count; j++) {
        const bx = bPosAttr.getX(j);
        const by = bPosAttr.getY(j);
        const bz = bPosAttr.getZ(j);

        // Soft mattress puffiness / pillowing along outer faces
        if (Math.abs(by) > thickness * 0.3) {
          const pill = Math.cos((bx / (length * 0.5)) * (Math.PI * 0.5)) * Math.cos((bz / (width * 0.5)) * (Math.PI * 0.5));
          bPosAttr.setY(j, by + (by > 0 ? 1 : -1) * pill * 0.025);
        }
      }
      beamGeo.computeVertexNormals();

      const beamColor = beamColors[b % beamColors.length];
      const beamMat = new THREE.MeshStandardMaterial({
        color: beamColor,
        roughness: 0.48,
        metalness: 0.08,
        emissive: new THREE.Color(beamColor),
        emissiveIntensity: 0.22,
      });

      const beamMesh = new THREE.Mesh(beamGeo, beamMat);

      // Compute position in horizontal plane
      const perpAngle = beamAngle + Math.PI / 2;
      const posX = Math.cos(perpAngle) * distFromCenter;
      const posZ = Math.sin(perpAngle) * distFromCenter;

      beamMesh.position.set(posX, layerY, posZ);
      beamMesh.rotation.y = -beamAngle;
      beamMesh.castShadow = true;
      beamMesh.receiveShadow = true;

      this.ceilingSoftArtGroup.add(beamMesh);
    }
    this.scene.add(this.ceilingSoftArtGroup);

    // Upward gallery wash light to illuminate the ceiling details and soft-art colors
    const ceilingWashLight = new THREE.PointLight(0xfff5e0, 1.6, 24, 1.8);
    ceilingWashLight.position.set(0, 4.3, 0);
    this.scene.add(ceilingWashLight);

    // 3. Perimeter Wall of Upholstered Mattresses (Minujinda Tribute)
    this.mattressWallGroup = new THREE.Group();
    this.mattressWallGroup.name = 'mattressWall';

    const mattressTex = createMattressWallTexture(this.renderer);
    const mattressMat = new THREE.MeshStandardMaterial({
      map: mattressTex,
      roughness: 0.45,
      metalness: 0.15,
    });

    const wallRadius = 15.2;
    const numPanels = 18;
    for (let i = 0; i < numPanels; i++) {
      const angle = (i / numPanels) * Math.PI * 2;
      // Pillowy curved mattress module
      const panelGeo = new THREE.BoxGeometry(4.8, 5.2, 0.45, 6, 6, 2);

      // Puffy mattress vertex displacement
      const posAttr = panelGeo.attributes.position;
      for (let j = 0; j < posAttr.count; j++) {
        const x = posAttr.getX(j);
        const y = posAttr.getY(j);
        const z = posAttr.getZ(j);
        if (Math.abs(z) > 0.1) {
          const pillow = Math.sin((x / 2.4) * Math.PI) * Math.sin((y / 2.6) * Math.PI);
          posAttr.setZ(j, z + pillow * 0.14);
        }
      }
      panelGeo.computeVertexNormals();

      const panel = new THREE.Mesh(panelGeo, mattressMat);
      panel.position.set(
        Math.cos(angle) * wallRadius,
        2.8,
        Math.sin(angle) * wallRadius
      );
      panel.rotation.y = -angle - Math.PI / 2;
      panel.receiveShadow = true;
      this.mattressWallGroup.add(panel);
    }

    this.scene.add(this.mattressWallGroup);
  }

  /**
   * Assembles the 6 curated artworks floating in a gallery circle:
   * Frames, canvas textures, spotlights, placards, and raycast colliders
   */
  /**
   * Assembles the 6 curated artworks floating in a gallery circle:
   * Frames, canvas textures, spotlights, placards, and raycast colliders.
   * Arranged in a mathematically symmetric 8-station layout:
   * Station 0 (North, 0°): Monumental 3D "ARTE ARTE ARTE" Sculpture
   * Right Wing (East): Artworks 0, 1, 2 at +45°, +90°, +135°
   * Station 4 (South): Gallery entrance portal
   * Left Wing (West): Artworks 5, 4, 3 at -45°, -90°, -135°
   */
  private buildCuratedArtworks() {
    const radius = 9.8;

    // Symmetrical bilateral angles: Right wing mirrors Left wing exactly across the Z axis
    const artworkAngles = [
      -Math.PI / 4,        // Index 0: energia_multidireccional (Right forward flank, +45° from North)
      0,                   // Index 1: laberinto_minujinda_1985 (Right center flank, +90° from North)
      Math.PI / 4,         // Index 2: sin_titulo_2013 (Right rear flank, +135° from North)
      (3 * Math.PI) / 4,   // Index 3: laberinto_minujinda_vertical (Left rear flank, -135° from North)
      Math.PI,             // Index 4: arte_mediatico_happening (Left center flank, -90° from North)
      (-3 * Math.PI) / 4,  // Index 5: iconicos_anteojos (Left forward flank, -45° from North)
    ];

    MINUJIN_ARTWORKS.forEach((artwork, index) => {
      // Angular placement around the room
      const angle = artworkAngles[index];
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = 1.75;

      const artworkGroup = new THREE.Group();
      artworkGroup.name = `artwork_${artwork.id}`;
      artworkGroup.position.set(x, y, z);
      // Face inward towards the central gallery promenade (0, y, 0)
      artworkGroup.lookAt(0, y, 0);

      // 1. Canvas Dimensions based on aspect ratio
      const baseHeight = 2.6;
      let width = baseHeight * artwork.aspectRatio;
      let height = baseHeight;

      if (artwork.aspectRatio < 0.6) {
        // Tall vertical pieces like "Laberinto Minujinda (Franja Vertical)"
        height = 3.2;
        width = height * artwork.aspectRatio;
      } else if (artwork.aspectRatio > 1.4) {
        // Wide pieces
        width = 3.6;
        height = width / artwork.aspectRatio;
      }

      // 2. Minimalist Museum Frame (Deep Black Beveled Lacquered Wood)
      const frameDepth = 0.14;
      const borderSize = 0.08;
      const frameGeo = new THREE.BoxGeometry(
        width + borderSize * 2,
        height + borderSize * 2,
        frameDepth
      );
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0x15151b,
        roughness: 0.35,
        metalness: 0.45,
      });
      const frameMesh = new THREE.Mesh(frameGeo, frameMat);
      frameMesh.castShadow = true;
      frameMesh.receiveShadow = true;
      artworkGroup.add(frameMesh);

      // Fine golden/color accent inner rim
      const accentGeo = new THREE.BoxGeometry(
        width + 0.03,
        height + 0.03,
        frameDepth + 0.01
      );
      const accentMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(artwork.colorAccent),
      });
      const accentMesh = new THREE.Mesh(accentGeo, accentMat);
      artworkGroup.add(accentMesh);

      // 3. Stretched Canvas with High-Res Procedural Artwork Texture
      const canvasTex = createArtworkTexture(artwork.id, this.renderer);
      const canvasGeo = new THREE.PlaneGeometry(width, height);
      const canvasMat = new THREE.MeshStandardMaterial({
        map: canvasTex,
        roughness: 0.6,
        metalness: 0.05,
      });
      const canvasMesh = new THREE.Mesh(canvasGeo, canvasMat);
      canvasMesh.position.z = frameDepth / 2 + 0.015;
      canvasMesh.castShadow = true;
      canvasMesh.receiveShadow = true;
      // Tag canvas for raycasting
      canvasMesh.userData = { artworkId: artwork.id };
      artworkGroup.add(canvasMesh);
      this.interactiveMeshes.push(canvasMesh);

      // 4. Overhead Museum Track Spotlight focused directly on this artwork
      const spotLight = new THREE.SpotLight(0xfff8ee, this.currentConfig.spotlightIntensity);
      spotLight.position.set(x * 0.75, 5.8, z * 0.75);
      spotLight.target = canvasMesh;
      spotLight.angle = 0.45;
      spotLight.penumbra = 0.55;
      spotLight.decay = 1.4;
      spotLight.distance = 14;
      spotLight.castShadow = true;
      spotLight.shadow.bias = -0.001;
      this.scene.add(spotLight);
      this.gallerySpotlights.push(spotLight);

      // 6. Precompute Optimal Camera Focus Vantage Position
      // Vector pointing out from canvas into the gallery room
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(artworkGroup.quaternion);
      const optimalDist = Math.max(width, height) * 1.35;
      const viewPos = new THREE.Vector3().copy(artworkGroup.position).addScaledVector(normal, optimalDist);
      viewPos.y = artworkGroup.position.y; // eye level with artwork center

      const viewLookAt = new THREE.Vector3().copy(artworkGroup.position);

      this.artworkObjects.push({
        artwork,
        group: artworkGroup,
        canvasMesh,
        spotlight: spotLight,
        initialPos: artworkGroup.position.clone(),
        initialRot: artworkGroup.rotation.clone(),
        viewPos,
        viewLookAt,
      });

      this.scene.add(artworkGroup);
    });

    // South Gallery Entrance Portal (Completing the 8-station radial symmetry)
    const portalGroup = new THREE.Group();
    portalGroup.position.set(0, 2.2, 9.8);
    portalGroup.lookAt(0, 2.2, 0);

    const portalArchGeo = new THREE.BoxGeometry(4.2, 3.4, 0.2);
    const portalArchMat = new THREE.MeshStandardMaterial({
      color: 0x161622,
      roughness: 0.35,
      metalness: 0.3,
    });
    const portalArch = new THREE.Mesh(portalArchGeo, portalArchMat);
    portalGroup.add(portalArch);

    const portalNeonGeo = new THREE.TorusGeometry(1.6, 0.04, 12, 32);
    const portalNeonMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const portalNeon = new THREE.Mesh(portalNeonGeo, portalNeonMat);
    portalNeon.position.z = 0.12;
    portalGroup.add(portalNeon);

    this.scene.add(portalGroup);
  }

  /**
   * Builds the kinetic 3D "ARTE ARTE ARTE" sculpture positioned alongside the artworks
   * in the space on a dedicated pop-art pedestal at the North focal station (0, 2.3, -9.2).
   */
  private buildSuspendedArteSculpture() {
    const monumentX = 0;
    const monumentZ = -9.2;
    const monumentY = 2.3;

    this.arteMonument = createTripleArteMonument();
    this.arteMonument.position.set(monumentX, monumentY, monumentZ);
    this.arteMonument.scale.set(1.15, 1.15, 1.15);

    // Tag all meshes in the monument for raycasting (tap to trigger spin!)
    this.arteMonument.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.userData = { isArteSculpture: true };
        this.interactiveMeshes.push(child);
      }
    });

    this.scene.add(this.arteMonument);

    // Pop-Art Museum Pedestal / Plinth beneath the sculpture alongside the perimeter
    const plinthGroup = new THREE.Group();
    plinthGroup.position.set(monumentX, 0, monumentZ);

    // Lower tiered circular base in polished obsidian black lacquered composite
    const baseGeo = new THREE.CylinderGeometry(2.1, 2.3, 0.22, 36);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x181822,
      roughness: 0.25,
      metalness: 0.45,
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.11;
    baseMesh.receiveShadow = true;
    baseMesh.castShadow = true;
    plinthGroup.add(baseMesh);

    // Upper illuminated stage in neon yellow & chrome
    const upperGeo = new THREE.CylinderGeometry(1.65, 1.85, 0.18, 36);
    const upperMat = new THREE.MeshStandardMaterial({
      color: 0x242436,
      roughness: 0.18,
      metalness: 0.6,
    });
    const upperMesh = new THREE.Mesh(upperGeo, upperMat);
    upperMesh.position.y = 0.29;
    upperMesh.receiveShadow = true;
    upperMesh.castShadow = true;
    plinthGroup.add(upperMesh);

    // Fluorescent pink rim ring
    const neonRimGeo = new THREE.TorusGeometry(1.7, 0.045, 12, 36);
    const neonRimMat = new THREE.MeshBasicMaterial({ color: 0xff007f });
    const neonRim = new THREE.Mesh(neonRimGeo, neonRimMat);
    neonRim.rotation.x = Math.PI / 2;
    neonRim.position.y = 0.38;
    plinthGroup.add(neonRim);

    this.scene.add(plinthGroup);

    // Dedicated overhead spotlight focused directly on the ARTE sculpture
    const arteSpotlight = new THREE.SpotLight(0xfff8ee, 3.2);
    arteSpotlight.position.set(monumentX, 6.2, monumentZ + 2.8);
    arteSpotlight.target = this.arteMonument;
    arteSpotlight.angle = 0.48;
    arteSpotlight.penumbra = 0.45;
    arteSpotlight.decay = 1.3;
    arteSpotlight.distance = 15;
    arteSpotlight.castShadow = true;
    this.scene.add(arteSpotlight);

    // Minimalist gallery suspension wire from ceiling vault down to sculpture
    const wireGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(monumentX, 6.6, monumentZ),
      new THREE.Vector3(monumentX, monumentY + 1.25, monumentZ),
    ]);
    const wireMat = new THREE.LineBasicMaterial({
      color: 0xa0a0b5,
      transparent: true,
      opacity: 0.65,
    });
    this.suspensionWire = new THREE.Line(wireGeo, wireMat);
    this.scene.add(this.suspensionWire);
  }

  /**
   * Spawns floating neon canvas ribbons when user interacts or triggers "ARTE!"
   */
  public triggerArteHappening() {
    this.kineticSpinVelocity = 4.5; // High speed celebratory spin!

    // Flash lights with pop vibrancy
    this.centerLight.intensity = 4.8;
    this.centerLight.color.setHex(0xff007f);

    if (sensorManager.getHapticsSupported()) {
      sensorManager.triggerHaptic([30, 50, 40]);
    }

    // Spawn 14 vibrant floating ribbons
    const colors = [0xff007f, 0xfaff00, 0x00f0ff, 0xff5500, 0x00ff66];
    for (let i = 0; i < 14; i++) {
      const w = 0.12 + Math.random() * 0.18;
      const h = 0.8 + Math.random() * 1.4;
      const geo = new THREE.BoxGeometry(w, h, 0.02);
      const color = colors[i % colors.length];
      const mat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 2.2,
        2.3 + (Math.random() - 0.5) * 1.0,
        -9.2 + (Math.random() - 0.5) * 2.2
      );

      this.scene.add(mesh);
      this.floatingRibbons.push({
        mesh,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 2.5,
          1.2 + Math.random() * 2.2,
          (Math.random() - 0.5) * 2.5
        ),
        rotSpeed: new THREE.Vector3(
          Math.random() * 3,
          Math.random() * 3,
          Math.random() * 3
        ),
        life: 0,
        maxLife: 3.5 + Math.random() * 2.0,
      });
    }
  }

  /**
   * Smoothly focus camera onto a specific artwork
   */
  public focusArtwork(artworkId: string) {
    const found = this.artworkObjects.find((item) => item.artwork.id === artworkId);
    if (!found) return;

    this.focusedArtworkId = artworkId;
    this.isFocusing = true;
    this.focusProgress = 0;

    if (this.onSelectArtwork) {
      this.onSelectArtwork(artworkId);
    }
  }

  /**
   * Smoothly return camera to 360° central panoramic gallery walk
   */
  public clearFocus() {
    this.focusedArtworkId = null;
    this.isFocusing = false;
    this.focusProgress = 0;

    if (this.onSelectArtwork) {
      this.onSelectArtwork(null);
    }
  }

  /**
   * Raycast detection for tapping/clicking artworks or sculpture
   */
  private handlePointerClick(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    _mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    _mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

    _raycaster.setFromCamera(_mouse, this.camera);
    const intersects = _raycaster.intersectObjects(this.interactiveMeshes, true);

    if (intersects.length > 0) {
      const topHit = intersects[0].object;

      // Check if clicked the 3D ARTE Monument
      if (topHit.userData?.isArteSculpture) {
        this.triggerArteHappening();
        return;
      }

      // Check if clicked an Artwork canvas
      if (topHit.userData?.artworkId) {
        const id = topHit.userData.artworkId;
        if (this.focusedArtworkId === id) {
          // Already focused: clear focus
          this.clearFocus();
        } else {
          this.focusArtwork(id);
        }
      }
    }
  }

  /**
   * Video Texture handling for AR Mode (SDD Section 4.2)
   */
  public setCameraVideoTexture(videoElement: HTMLVideoElement | null) {
    if (!videoElement) {
      if (this.videoPlane) {
        this.scene.remove(this.videoPlane);
        this.videoPlane.geometry.dispose();
        this.videoPlaneMaterial?.dispose();
        this.videoTexture?.dispose();
        this.videoPlane = null;
        this.videoTexture = null;
        this.videoPlaneMaterial = null;
      }
      return;
    }

    if (!this.videoPlane) {
      this.videoTexture = new THREE.VideoTexture(videoElement);
      this.videoTexture.colorSpace = THREE.SRGBColorSpace;
      this.videoTexture.minFilter = THREE.LinearFilter;
      this.videoTexture.magFilter = THREE.LinearFilter;

      this.videoPlaneMaterial = new THREE.MeshBasicMaterial({
        map: this.videoTexture,
        depthWrite: false,
        depthTest: false,
      });

      // Background AR aperture window
      const planeGeo = new THREE.PlaneGeometry(16, 9);
      this.videoPlane = new THREE.Mesh(planeGeo, this.videoPlaneMaterial);
      this.videoPlane.renderOrder = -1;
      this.videoPlane.position.set(0, 2.5, -12);
      this.scene.add(this.videoPlane);
    }
  }

  /**
   * Reset camera to center eye-level looking forward
   */
  public resetCamera() {
    this.clearFocus();
    this.cameraYaw = 0;
    this.cameraPitch = 0;
    this.camera.position.copy(this.defaultCameraPos);
    _currentLookAt.set(0, 1.6, -1);
    this.camera.lookAt(_currentLookAt);
  }

  /**
   * Event Listeners setup: Touch, Mouse, Resize, Visibility
   */
  private initEventListeners() {
    const dom = this.container;

    // Pointer Down
    dom.addEventListener('pointerdown', (e: PointerEvent) => {
      this.isPointerDown = true;
      this.pointerPrevPos = { x: e.clientX, y: e.clientY };
      this.pointerStartPos = { x: e.clientX, y: e.clientY };
      this.totalDragDist = 0;
    });

    // Pointer Move
    window.addEventListener('pointermove', (e: PointerEvent) => {
      if (!this.isPointerDown) return;

      const deltaX = e.clientX - this.pointerPrevPos.x;
      const deltaY = e.clientY - this.pointerPrevPos.y;
      this.totalDragDist += Math.hypot(deltaX, deltaY);

      this.pointerPrevPos = { x: e.clientX, y: e.clientY };

      // Drag rotates camera in 360° space
      const sensitivity = 0.0032;
      this.cameraYaw -= deltaX * sensitivity;
      this.cameraPitch = THREE.MathUtils.clamp(
        this.cameraPitch - deltaY * sensitivity,
        -Math.PI / 3,
        Math.PI / 3
      );
    });

    // Pointer Up
    window.addEventListener('pointerup', (e: PointerEvent) => {
      if (this.isPointerDown) {
        this.isPointerDown = false;
        // If it was a quick tap with minimal drag distance, interpret as raycast tap!
        if (this.totalDragDist < 8) {
          this.handlePointerClick(e.clientX, e.clientY);
        }
      }
    });

    // Window Resize
    window.addEventListener('resize', this.handleResize);

    // Page Visibility (Battery / Performance optimization)
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleResize = () => {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private handleVisibilityChange = () => {
    this.isTabActive = !document.hidden;
    if (this.isTabActive) {
      this.clock.start();
    } else {
      this.clock.stop();
    }
  };

  /**
   * Main Render Loop (60 FPS, Zero Allocations)
   */
  private startLoop() {
    const loop = (currentTime: number) => {
      this.animationFrameId = requestAnimationFrame(loop);

      if (!this.isTabActive) return;

      const delta = Math.min(this.clock.getDelta(), 0.05);

      // FPS tracking
      this.frameCount++;
      if (currentTime - this.lastFpsUpdateTime > 1000) {
        this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdateTime));
        this.frameCount = 0;
        this.lastFpsUpdateTime = currentTime;
        if (this.onFpsUpdate) {
          this.onFpsUpdate(this.currentFps);
        }
      }

      // Update Scene State
      this.update(delta);

      // Render Scene
      this.renderer.render(this.scene, this.camera);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Frame updates: Camera Lerp, Gyroscope Integration, Kinetic Monument Spin, Audio Reactivity
   */
  private update(delta: number) {
    const audio = sensorManager.getAudioMetrics();
    const gyro = sensorManager.getOrientation();

    // 1. Kinetic 3D "ARTE ARTE ARTE" Rotation & Audio Reactivity
    if (this.arteMonument) {
      // Natural slow spin + temporary boost from happenings
      this.kineticSpinVelocity = THREE.MathUtils.lerp(
        this.kineticSpinVelocity,
        this.currentConfig.kineticRotationSpeed,
        delta * 1.5
      );
      this.arteMonument.rotation.y += this.kineticSpinVelocity * delta;

      // Slight floating hover sway
      const elapsed = this.clock.getElapsedTime();
      this.arteMonument.position.y = 2.3 + Math.sin(elapsed * 1.8) * 0.08;

      // Audio reactive pulsing on the 3D monument
      const audioScale = 1.0 + (audio.bassLevel || 0) * 0.25 * this.currentConfig.audioSensitivity;
      this.arteMonument.scale.set(1.15 * audioScale, 1.15 * audioScale, 1.15 * audioScale);
    }

    // Restore center light intensity smoothly
    this.centerLight.intensity = THREE.MathUtils.lerp(
      this.centerLight.intensity,
      2.2 + (audio.volume || 0) * 2.0 * this.currentConfig.audioSensitivity,
      delta * 4
    );
    this.centerLight.color.lerp(new THREE.Color(0xfff5e6), delta * 2);

    // 2. Floating Artworks Gentle Sway
    const time = this.clock.getElapsedTime();
    this.artworkObjects.forEach((item, idx) => {
      const floatY = Math.sin(time * 1.2 + idx * 1.1) * 0.04;
      item.group.position.y = item.initialPos.y + floatY;

      // When focused, boost its spotlight
      if (this.focusedArtworkId === item.artwork.id) {
        item.spotlight.intensity = THREE.MathUtils.lerp(item.spotlight.intensity, 3.8, delta * 3);
      } else {
        item.spotlight.intensity = THREE.MathUtils.lerp(item.spotlight.intensity, 1.6, delta * 3);
      }
    });

    // 3. Subtle Ethereal Cloud Drift beneath the visitor's feet
    if (this.cloudFloorTexture) {
      this.cloudFloorTexture.offset.x += 0.0006 * delta;
      this.cloudFloorTexture.offset.y += 0.0004 * delta;
    }

    // 3. Update Floating Ribbons
    for (let i = this.floatingRibbons.length - 1; i >= 0; i--) {
      const ribbon = this.floatingRibbons[i];
      ribbon.life += delta;

      ribbon.mesh.position.addScaledVector(ribbon.velocity, delta);
      ribbon.velocity.y -= 1.8 * delta; // Gravity
      ribbon.mesh.rotation.x += ribbon.rotSpeed.x * delta;
      ribbon.mesh.rotation.y += ribbon.rotSpeed.y * delta;
      ribbon.mesh.rotation.z += ribbon.rotSpeed.z * delta;

      if (ribbon.life >= ribbon.maxLife) {
        this.scene.remove(ribbon.mesh);
        ribbon.mesh.geometry.dispose();
        if (Array.isArray(ribbon.mesh.material)) {
          ribbon.mesh.material.forEach((m) => m.dispose());
        } else {
          ribbon.mesh.material.dispose();
        }
        this.floatingRibbons.splice(i, 1);
      }
    }

    // 4. Camera Movement & Cinematic Focus (Pestaña Única)
    if (this.focusedArtworkId) {
      // Cinematically lerp towards the selected artwork
      const targetObj = this.artworkObjects.find((item) => item.artwork.id === this.focusedArtworkId);
      if (targetObj) {
        const isDesktop = (this.container?.clientWidth || window.innerWidth) >= 768;
        const width = targetObj.artwork.aspectRatio ? 2.3 * targetObj.artwork.aspectRatio : 2.5;
        const height = 2.4;
        const optimalDist = isDesktop
          ? Math.max(width, height) * 1.85
          : Math.max(width, height) * 2.15;

        // Normal pointing perpendicular out from the artwork face into the room
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(targetObj.group.quaternion);
        // Lateral axis along the artwork's local horizontal plane
        const right = new THREE.Vector3(1, 0, 0).applyQuaternion(targetObj.group.quaternion);

        // On desktop, shift camera framing so the artwork centers directly inside the left exhibition frame
        const screenW = this.container?.clientWidth || window.innerWidth;
        const visibleSpanX = 2 * optimalDist * Math.tan((this.camera.fov * Math.PI) / 360) * this.camera.aspect;
        const lateralShift = isDesktop ? visibleSpanX * (205 / screenW) : 0;
        const verticalShift = isDesktop ? 0.0 : 0.35; // on mobile, place higher up above the bottom panel

        _targetCamPos
          .copy(targetObj.group.position)
          .addScaledVector(normal, optimalDist)
          .addScaledVector(right, lateralShift);
        _targetCamPos.y += verticalShift;

        _targetLookAt
          .copy(targetObj.group.position)
          .addScaledVector(right, lateralShift);
        _targetLookAt.y += verticalShift;

        // Smooth camera damp
        this.camera.position.lerp(_targetCamPos, delta * 3.2);
        _currentLookAt.lerp(_targetLookAt, delta * 3.8);
        this.camera.lookAt(_currentLookAt);
      }
    } else {
      // 360° Free Gallery Orbit & Gyroscope / Accelerometer
      let targetYaw = this.cameraYaw;
      let targetPitch = this.cameraPitch;

      // Integrate physical mobile gyroscope if available
      if (gyro.smoothedAlpha !== 0 || gyro.smoothedBeta !== 0) {
        const gyroYawRad = (gyro.smoothedAlpha * Math.PI) / 180;
        const gyroPitchRad = ((gyro.smoothedBeta - 45) * Math.PI) / 180; // natural viewing angle
        targetYaw += gyroYawRad * 0.75;
        targetPitch = THREE.MathUtils.clamp(targetPitch + gyroPitchRad * 0.45, -Math.PI / 3, Math.PI / 3);
      }

      _targetCamPos.copy(this.defaultCameraPos);
      this.camera.position.lerp(_targetCamPos, delta * 3.5);

      // Compute look direction on unit sphere
      const cosPitch = Math.cos(targetPitch);
      _targetLookAt.set(
        Math.sin(targetYaw) * cosPitch,
        1.65 + Math.sin(targetPitch),
        -Math.cos(targetYaw) * cosPitch
      );

      _currentLookAt.lerp(_targetLookAt, delta * 4.5);
      this.camera.lookAt(_currentLookAt);
    }
  }

  /**
   * Update RenderConfig dynamically
   */
  public updateConfig(newConfig: RenderConfig) {
    this.currentConfig = newConfig;
    this.ambientLight.intensity = newConfig.ambientLightIntensity;
  }

  /**
   * Capture crisp PNG snapshot of the gallery
   */
  public captureSnapshot(): string {
    this.renderer.render(this.scene, this.camera);
    return this.canvas.toDataURL('image/png');
  }

  /**
   * Clean disposal to prevent memory leaks
   */
  public dispose() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }

    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);

    if (this.floorMesh) {
      this.floorMesh.geometry.dispose();
      if (Array.isArray(this.floorMesh.material)) {
        this.floorMesh.material.forEach((m) => m.dispose());
      } else {
        this.floorMesh.material.dispose();
      }
      this.floorMesh = null;
    }
    if (this.cloudFloorTexture) {
      this.cloudFloorTexture.dispose();
      this.cloudFloorTexture = null;
    }

    this.scene.clear();
    this.renderer.dispose();
  }
}
