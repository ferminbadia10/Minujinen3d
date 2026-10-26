import * as THREE from 'three';

const extrudeSettings: THREE.ExtrudeGeometryOptions = {
  depth: 0.22,
  bevelEnabled: true,
  bevelThickness: 0.05,
  bevelSize: 0.035,
  bevelSegments: 3,
};

function createLetterA(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  // Outer silhouette of A
  shape.moveTo(0.0, 0.0);
  shape.lineTo(0.22, 0.0);
  shape.lineTo(0.28, 0.35);
  shape.lineTo(0.52, 0.35);
  shape.lineTo(0.58, 0.0);
  shape.lineTo(0.8, 0.0);
  shape.lineTo(0.5, 1.0);
  shape.lineTo(0.3, 1.0);
  shape.closePath();

  // Triangular hole
  const hole = new THREE.Path();
  hole.moveTo(0.33, 0.52);
  hole.lineTo(0.47, 0.52);
  hole.lineTo(0.4, 0.78);
  hole.closePath();
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

function createLetterR(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0.0, 0.0);
  shape.lineTo(0.22, 0.0);
  shape.lineTo(0.22, 0.44);
  shape.lineTo(0.42, 0.44);
  shape.lineTo(0.65, 0.0);
  shape.lineTo(0.88, 0.0);
  shape.lineTo(0.58, 0.5);
  shape.lineTo(0.74, 0.62);
  shape.lineTo(0.74, 0.88);
  shape.lineTo(0.62, 1.0);
  shape.lineTo(0.0, 1.0);
  shape.closePath();

  // Rectangular loop hole
  const hole = new THREE.Path();
  hole.moveTo(0.22, 0.65);
  hole.lineTo(0.52, 0.65);
  hole.lineTo(0.52, 0.86);
  hole.lineTo(0.22, 0.86);
  hole.closePath();
  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

function createLetterT(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0.26, 0.0);
  shape.lineTo(0.48, 0.0);
  shape.lineTo(0.48, 0.8);
  shape.lineTo(0.74, 0.8);
  shape.lineTo(0.74, 1.0);
  shape.lineTo(0.0, 1.0);
  shape.lineTo(0.0, 0.8);
  shape.lineTo(0.26, 0.8);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

function createLetterE(): THREE.BufferGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(0.0, 0.0);
  shape.lineTo(0.68, 0.0);
  shape.lineTo(0.68, 0.2);
  shape.lineTo(0.22, 0.2);
  shape.lineTo(0.22, 0.42);
  shape.lineTo(0.58, 0.42);
  shape.lineTo(0.58, 0.6);
  shape.lineTo(0.22, 0.6);
  shape.lineTo(0.22, 0.8);
  shape.lineTo(0.68, 0.8);
  shape.lineTo(0.68, 1.0);
  shape.lineTo(0.0, 1.0);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  return geo;
}

// Cached geometries to avoid duplicate allocations
let geoA: THREE.BufferGeometry | null = null;
let geoR: THREE.BufferGeometry | null = null;
let geoT: THREE.BufferGeometry | null = null;
let geoE: THREE.BufferGeometry | null = null;

function getGeometries() {
  if (!geoA) geoA = createLetterA();
  if (!geoR) geoR = createLetterR();
  if (!geoT) geoT = createLetterT();
  if (!geoE) geoE = createLetterE();
  return { geoA, geoR, geoT, geoE };
}

/**
 * Creates a single 3D "ARTE" extruded word as a THREE.Group
 */
export function createSingleArteWord(colorHex: number, scale = 1.0): THREE.Group {
  const { geoA, geoR, geoT, geoE } = getGeometries();
  const group = new THREE.Group();

  const mat = new THREE.MeshPhysicalMaterial({
    color: colorHex,
    emissive: colorHex,
    emissiveIntensity: 0.45,
    roughness: 0.15,
    metalness: 0.85,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
  });

  const meshA = new THREE.Mesh(geoA, mat);
  meshA.position.x = -1.25;

  const meshR = new THREE.Mesh(geoR, mat);
  meshR.position.x = -0.4;

  const meshT = new THREE.Mesh(geoT, mat);
  meshT.position.x = 0.4;

  const meshE = new THREE.Mesh(geoE, mat);
  meshE.position.x = 1.15;

  group.add(meshA, meshR, meshT, meshE);
  group.scale.set(scale, scale, scale);
  return group;
}

/**
 * Creates the complete triple stacked 3D "ARTE ARTE ARTE" monument
 * with the iconic Minujín flúor palette: Magenta (#FF007F), Yellow (#FAFF00), Cyan (#00F0FF)
 */
export function createTripleArteMonument(): THREE.Group {
  const container = new THREE.Group();
  container.name = 'arteArteArte3DMonument';

  // 1. Top ARTE (Neon Magenta)
  const arteTop = createSingleArteWord(0xff007f, 0.9);
  arteTop.position.set(0, 1.15, 0);
  arteTop.name = 'arteTop';

  // 2. Middle ARTE (Neon Yellow)
  const arteMid = createSingleArteWord(0xfaff00, 1.05);
  arteMid.position.set(0, 0, 0.08);
  arteMid.name = 'arteMid';

  // 3. Bottom ARTE (Electric Cyan)
  const arteBot = createSingleArteWord(0x00f0ff, 0.9);
  arteBot.position.set(0, -1.15, 0);
  arteBot.name = 'arteBot';

  container.add(arteTop, arteMid, arteBot);
  return container;
}
