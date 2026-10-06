// Mr Fuhs' office – a small low-poly Three.js scene (no external models).
import * as THREE from 'three';

let renderer, scene, camera, canvas, bubbleEl;
let fuhs, fuhsHead, fuhsChest, robot, robotEyes, board, steam = [], zzz = [];
let active = true, running = false, progress = 0, shownProgress = 0;
const clock = new THREE.Clock();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let bubbleTarget = null, bubbleTimer = null;

const FUHS_LINES = [
  'Hm? Oh… I wasn\'t sleeping. I was… thinking. Deeply. 😴',
  'Research is important. That\'s why YOU are doing it. ☕',
  'Could an AI replace me? It would have to drink a LOT of coffee.',
  'Ask me again after my coffee. Or after lunch. Or tomorrow.',
  'Arguments for AND against, please. I hate one-sided reports. Also reading.',
  'Don\'t forget your sources. And don\'t forget to close the door.',
  'A good researcher asks: which TASKS of a job can a machine do?',
  'If anyone asks, I am in a very important meeting. With my chair.',
  'Zzz… robots… Zzz… taking over… Zzz… not my job… Zzz',
  'My job? Director. Very hard to automate. Nobody knows what I do. 😎',
];
const ROBOT_LINES = [
  'Beep boop. I am just here to learn. 👀',
  'Bzzt. Which job should I take next? Just kidding. …Or am I?',
  'I can sort files in 0.3 seconds. But I can\'t make good coffee. Yet.',
  'Error 404: empathy not found. 🤖',
];

const mat = (color, opts = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, flatShading: true, ...opts });
function box(w, h, d, m, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y, z); mesh.castShadow = mesh.receiveShadow = true; return mesh;
}
function textTexture(text, { size = 128, color = '#fff', bg = null, font = 'bold 90px "Space Grotesk", sans-serif', w = size, h = size } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d');
  if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); }
  g.fillStyle = color; g.font = font; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, w / 2, h / 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

// ---------- building the room ----------
function buildRoom() {
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), mat(0x8a6a4f));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1.9, 32), mat(0x3a5a8c));
  rug.rotation.x = -Math.PI / 2; rug.position.set(0, 0.01, 0.2); rug.receiveShadow = true; scene.add(rug);

  const wallM = mat(0xe9e2d4);
  scene.add(box(14, 5, 0.2, wallM, 0, 2.5, -3));
  const left = box(0.2, 5, 10, mat(0xdcd3c2), -5, 2.5, 2); scene.add(left);
  const right = box(0.2, 5, 10, mat(0xdcd3c2), 5, 2.5, 2); scene.add(right);

  // window with sky
  const frame = box(2.4, 1.7, 0.1, mat(0xffffff), -2.6, 2.6, -2.88); scene.add(frame);
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 1.5), new THREE.MeshBasicMaterial({ color: 0x9fd3ff }));
  sky.position.set(-2.6, 2.6, -2.82); scene.add(sky);
  scene.add(box(0.06, 1.5, 0.05, mat(0xffffff), -2.6, 2.6, -2.8));
  scene.add(box(2.2, 0.06, 0.05, mat(0xffffff), -2.6, 2.6, -2.8));
  for (const [x, y, s] of [[-3.1, 2.9, 0.18], [-2.9, 2.95, 0.22], [-2.2, 2.4, 0.15]]) {
    const cloud = new THREE.Mesh(new THREE.SphereGeometry(s, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    cloud.position.set(x, y, -2.81); cloud.scale.z = 0.1; scene.add(cloud);
  }

  // progress board on the wall
  const boardG = new THREE.Group(); boardG.position.set(1.9, 2.75, -2.86);
  boardG.add(box(2.4, 1.3, 0.08, mat(0x14213d)));
  const title = new THREE.Mesh(new THREE.PlaneGeometry(2.1, 0.35),
    new THREE.MeshBasicMaterial({ map: textTexture('RESEARCH PROGRESS', { w: 512, h: 86, font: 'bold 44px "Space Grotesk", sans-serif', color: '#f4a259' }), transparent: true }));
  title.position.set(0, 0.35, 0.05); boardG.add(title);
  const track = box(2, 0.28, 0.02, mat(0x2b3c62), 0, -0.15, 0.05); boardG.add(track);
  board = new THREE.Mesh(new THREE.BoxGeometry(2, 0.28, 0.03), new THREE.MeshStandardMaterial({ color: 0x3a6ff7, emissive: 0x3a6ff7, emissiveIntensity: 0.6 }));
  board.position.set(-1, -0.15, 0.06); board.geometry.translate(1, 0, 0); board.scale.x = 0.001; boardG.add(board);
  for (let i = 1; i < 4; i++) boardG.add(box(0.03, 0.32, 0.04, mat(0xffffff), -1 + i * 0.5, -0.15, 0.07));
  scene.add(boardG);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.35),
    new THREE.MeshBasicMaterial({ map: textTexture('DIRECTOR · MR FUHS', { w: 512, h: 112, bg: '#c9a227', color: '#14213d', font: 'bold 50px "Space Grotesk", sans-serif' }) }));
  sign.position.set(0, 4.2, -2.88); scene.add(sign);

  // bookshelf with files
  const shelf = new THREE.Group(); shelf.position.set(-4.3, 0, -1.6);
  shelf.add(box(1, 2.6, 0.5, mat(0x6b4a33), 0, 1.3, 0));
  const fileColors = [0xe5484d, 0x3a6ff7, 0x2f9e6e, 0xf4a259, 0x7b5cff, 0xffffff];
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) {
    if (Math.random() < 0.2) continue;
    shelf.add(box(0.11, 0.42 + Math.random() * 0.1, 0.36, mat(fileColors[(r * 7 + i) % 6]), -0.33 + i * 0.13, 0.35 + r * 0.6, 0.08));
  }
  shelf.rotation.y = 0.5; scene.add(shelf);

  // plant
  const plant = new THREE.Group(); plant.position.set(3.6, 0, -1.8);
  plant.add(box(0.5, 0.55, 0.5, mat(0xc26b3d), 0, 0.27, 0));
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.9, 5), mat(0x3f8f4f));
    leaf.position.set(Math.sin(i) * 0.15, 0.95, Math.cos(i * 1.3) * 0.15);
    leaf.rotation.set(Math.sin(i * 2) * 0.5, 0, Math.cos(i * 3) * 0.5); leaf.castShadow = true; plant.add(leaf);
  }
  scene.add(plant);

  // coffee machine on a side table
  const side = new THREE.Group(); side.position.set(3.4, 0, 0.2);
  side.add(box(1, 0.8, 0.7, mat(0x6b4a33), 0, 0.4, 0));
  side.add(box(0.45, 0.6, 0.4, mat(0x222831), 0, 1.1, 0));
  side.add(box(0.3, 0.08, 0.1, mat(0xe5484d, { emissive: 0xe5484d, emissiveIntensity: 0.5 }), 0, 1.25, 0.21));
  scene.add(side);
}

function buildDesk() {
  const wood = mat(0x9b6b43), dark = mat(0x5c3d26);
  const desk = new THREE.Group(); desk.position.set(0, 0, 0.1);
  desk.add(box(2.6, 0.1, 1.1, wood, 0, 0.78, 0));
  desk.add(box(0.1, 0.75, 1, dark, -1.2, 0.38, 0));
  desk.add(box(0.1, 0.75, 1, dark, 1.2, 0.38, 0));
  desk.add(box(2.3, 0.6, 0.05, dark, 0, 0.45, 0.45));
  // monitor turned sideways (he is not looking at it)
  const mon = new THREE.Group(); mon.position.set(-0.85, 0.83, -0.2); mon.rotation.y = 0.9;
  mon.add(box(0.06, 0.25, 0.06, mat(0x222831), 0, 0.12, 0));
  mon.add(box(0.75, 0.48, 0.05, mat(0x222831), 0, 0.45, 0));
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(0.68, 0.4), new THREE.MeshBasicMaterial({ map: textTexture('💤 screensaver', { w: 256, h: 150, bg: '#1d3a7a', font: '28px sans-serif' }) }));
  scr.position.set(0, 0.45, 0.03); mon.add(scr); desk.add(mon);
  // stack of job files
  const files = [0xe5484d, 0x3a6ff7, 0x2f9e6e, 0xf4a259];
  files.forEach((c, i) => { const f = box(0.5, 0.04, 0.36, mat(c), 0.75, 0.86 + i * 0.045, -0.15); f.rotation.y = (i - 1.5) * 0.12; desk.add(f); });
  // coffee mug + steam
  const mug = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.17, 12), mat(0xffffff));
  mug.position.set(0.3, 0.92, 0.2); mug.castShadow = true; desk.add(mug);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.015, 6, 10), mat(0xffffff)); handle.position.set(0.39, 0.92, 0.2); desk.add(handle);
  const steamM = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
  for (let i = 0; i < 3; i++) { const s = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 5), steamM.clone()); s.userData.offset = i / 3; desk.add(s); steam.push(s); s.userData.base = new THREE.Vector3(0.3, 1.02, 0.2); }
  scene.add(desk);
}

function buildFuhs() {
  fuhs = new THREE.Group(); fuhs.name = 'fuhs';
  const suit = mat(0x4a5878), skin = mat(0xf0c8a0), shirt = mat(0xffffff), hair = mat(0x6b6b6b), shoe = mat(0x2b1d14), pants = mat(0x38425c);

  // office chair
  const chair = new THREE.Group(); chair.position.set(0, 0, -1.25);
  chair.add(box(0.75, 0.12, 0.7, mat(0x222831), 0, 0.55, 0));
  const back = box(0.75, 1.1, 0.12, mat(0x222831), 0, 1.1, -0.42); back.rotation.x = -0.45; chair.add(back);
  chair.add(box(0.08, 0.5, 0.08, mat(0x888888), 0, 0.27, 0));
  for (let i = 0; i < 5; i++) { const leg = box(0.4, 0.05, 0.06, mat(0x888888), Math.cos(i * 1.256) * 0.2, 0.05, Math.sin(i * 1.256) * 0.2); leg.rotation.y = -i * 1.256; chair.add(leg); }
  fuhs.add(chair);

  // reclined upper body (pivot at hips)
  const upper = new THREE.Group(); upper.position.set(0, 0.68, -1.25); upper.rotation.x = -0.5; fuhs.add(upper);
  fuhsChest = new THREE.Group(); upper.add(fuhsChest);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.45, 4, 10), suit); torso.position.y = 0.4; torso.castShadow = true; fuhsChest.add(torso);
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.27, 10, 8), suit); belly.position.set(0, 0.25, 0.1); fuhsChest.add(belly);
  fuhsChest.add(box(0.12, 0.4, 0.05, shirt, 0, 0.55, 0.25));
  const tie = box(0.07, 0.32, 0.03, mat(0xe5484d), 0, 0.52, 0.28); tie.rotation.z = 0.15; fuhsChest.add(tie);

  // head
  fuhsHead = new THREE.Group(); fuhsHead.position.set(0, 0.98, 0); upper.add(fuhsHead);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.25, 14, 12), skin); head.castShadow = true; fuhsHead.add(head);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 6), skin); nose.position.set(0, -0.01, 0.25); fuhsHead.add(nose);
  const hairM = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2.4), hair); hairM.rotation.x = -0.6; hairM.position.y = 0.02; fuhsHead.add(hairM);
  // closed eyes (lines) + glasses
  for (const x of [-0.09, 0.09]) {
    fuhsHead.add(box(0.07, 0.012, 0.01, mat(0x222222), x, 0.04, 0.235));
    const g = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.012, 6, 16), mat(0x222222)); g.position.set(x, 0.04, 0.245); fuhsHead.add(g);
  }
  fuhsHead.add(box(0.06, 0.012, 0.01, mat(0x222222), 0, 0.05, 0.25));
  const mouth = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.012, 6, 12), mat(0x7a3b2e)); mouth.position.set(0, -0.11, 0.22); fuhsHead.add(mouth);
  fuhsHead.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), skin).translateX(-0.25));
  fuhsHead.add(new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), skin).translateX(0.25));

  // arms folded behind head
  for (const s of [-1, 1]) {
    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.35, 4, 8), suit);
    upperArm.position.set(s * 0.33, 0.85, -0.02); upperArm.rotation.z = s * -2.3; upperArm.castShadow = true; upper.add(upperArm);
    const fore = new THREE.Mesh(new THREE.CapsuleGeometry(0.07, 0.28, 4, 8), suit);
    fore.position.set(s * 0.2, 1.12, -0.12); fore.rotation.z = s * 1.2; upper.add(fore);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), skin); hand.position.set(s * 0.06, 1.05, -0.2); upper.add(hand);
  }

  // legs stretched onto the desk
  for (const s of [-1, 1]) {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.55, 4, 8), pants);
    thigh.position.set(s * 0.14, 0.72, -0.85); thigh.rotation.x = Math.PI / 2 - 0.12; thigh.castShadow = true; fuhs.add(thigh);
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.1, 0.55, 4, 8), pants);
    shin.position.set(s * 0.16, 0.86, -0.18); shin.rotation.x = Math.PI / 2 - 0.08; shin.castShadow = true; fuhs.add(shin);
    const foot = box(0.16, 0.24, 0.12, shoe, s * 0.17, 0.98, 0.22); foot.castShadow = true; fuhs.add(foot);
  }
  scene.add(fuhs);

  // floating Zzz
  for (let i = 0; i < 3; i++) {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: textTexture('Z', { color: '#ffffff' }), transparent: true, depthWrite: false }));
    sp.userData.offset = i / 3; scene.add(sp); zzz.push(sp);
  }
}

function buildRobot() {
  robot = new THREE.Group(); robot.name = 'robot';
  const metal = mat(0xc9d2e3, { metalness: 0.4, roughness: 0.4 });
  robot.add(box(0.36, 0.36, 0.3, metal, 0, 0.32, 0));
  robot.add(box(0.22, 0.12, 0.02, mat(0x3a6ff7, { emissive: 0x3a6ff7, emissiveIntensity: 0.6 }), 0, 0.34, 0.16));
  const head = new THREE.Group(); head.position.y = 0.62; robot.add(head);
  head.add(box(0.3, 0.22, 0.24, metal));
  robotEyes = new THREE.MeshStandardMaterial({ color: 0x5cf2ff, emissive: 0x5cf2ff, emissiveIntensity: 1 });
  for (const x of [-0.07, 0.07]) { const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), robotEyes); e.position.set(x, 0.01, 0.12); head.add(e); }
  head.add(box(0.02, 0.15, 0.02, metal, 0, 0.18, 0));
  const tip = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mat(0xe5484d, { emissive: 0xe5484d, emissiveIntensity: 0.8 })); tip.position.y = 0.27; head.add(tip);
  for (const x of [-0.13, 0.13]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), mat(0x222831)); w.rotation.z = Math.PI / 2; w.position.set(x, 0.09, 0); robot.add(w); }
  robot.userData.head = head;
  scene.add(robot);
}

// ---------- lifecycle ----------
export function initScene(canvasEl, bubble) {
  canvas = canvasEl; bubbleEl = bubble;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'low-power' });
  } catch (e) { canvas.parentElement.classList.add('no-webgl'); return; }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x20304f);
  scene.fog = new THREE.Fog(0x20304f, 9, 16);
  camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);

  scene.add(new THREE.HemisphereLight(0xfff4e0, 0x404a66, 1.3));
  const sun = new THREE.DirectionalLight(0xffe2b8, 2.2);
  sun.position.set(-3, 6, 4); sun.castShadow = true; sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 });
  scene.add(sun);
  const lamp = new THREE.PointLight(0xffc27a, 6, 6); lamp.position.set(1.2, 2.3, 0.8); scene.add(lamp);

  buildRoom(); buildDesk(); buildFuhs(); buildRobot();

  new ResizeObserver(resize).observe(canvas);
  resize();
  canvas.addEventListener('pointerup', onTap);
  document.addEventListener('visibilitychange', loop);
  new IntersectionObserver(([e]) => { canvas.dataset.visible = e.isIntersecting ? '1' : ''; loop(); }).observe(canvas);
  canvas.dataset.visible = '1';
  loop();
}

function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  // portrait iPads are narrower: move camera back so everything fits
  const dist = camera.aspect < 1.4 ? 7.2 : camera.aspect < 2 ? 5.8 : 5;
  camera.userData.dist = dist;
  camera.updateProjectionMatrix();
  if (!running) render(clock.getElapsedTime());
}

function shouldRun() { return active && !document.hidden && canvas.dataset.visible === '1'; }
function loop() {
  if (running || !shouldRun()) return;
  running = true;
  const tick = () => {
    if (!shouldRun()) { running = false; return; }
    render(clock.getElapsedTime());
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function render(t) {
  const d = camera.userData.dist || 5.5;
  camera.position.set(Math.sin(t * 0.12) * 1.1, 2.5 + Math.sin(t * 0.2) * 0.1, d);
  camera.lookAt(0, 1.15, -0.6);

  // Fuhs snoring
  const breathe = Math.sin(t * 1.4);
  fuhsChest.scale.set(1 + breathe * 0.03, 1, 1 + breathe * 0.05);
  fuhsHead.rotation.x = 0.15 + breathe * 0.06;
  fuhsHead.rotation.z = Math.sin(t * 0.3) * 0.08;
  const headPos = fuhsHead.getWorldPosition(new THREE.Vector3());
  zzz.forEach(z => {
    const p = (t * 0.25 + z.userData.offset) % 1;
    z.position.set(headPos.x + 0.25 + p * 0.5, headPos.y + 0.25 + p * 0.9, headPos.z + 0.1);
    const s = 0.12 + p * 0.22; z.scale.set(s, s, s);
    z.material.opacity = Math.sin(p * Math.PI);
  });
  steam.forEach(s => {
    const p = (t * 0.5 + s.userData.offset) % 1;
    s.position.copy(s.userData.base).add(new THREE.Vector3(Math.sin(t * 2 + p * 6) * 0.03, p * 0.35, 0));
    s.material.opacity = 0.45 * (1 - p); s.scale.setScalar(0.6 + p);
  });

  // robot patrols in front of the desk, sometimes stops to stare at Fuhs
  const a = t * 0.35;
  const x = Math.sin(a) * 2.6, z = 1.6 + Math.sin(a * 2) * 0.5;
  const dx = Math.cos(a) * 2.6, dz = Math.cos(a * 2) * 1.0;
  robot.position.set(x, Math.abs(Math.sin(t * 6)) * 0.02, z);
  robot.rotation.y = Math.atan2(dx, dz);
  robot.userData.head.rotation.y = Math.sin(t * 0.9) * 0.6;
  robotEyes.emissiveIntensity = Math.sin(t * 3) > 0.97 ? 0.1 : 1;

  // progress board
  shownProgress += (progress - shownProgress) * 0.05;
  board.scale.x = Math.max(0.001, shownProgress);
  board.material.color.setHex(progress >= 1 ? 0x2f9e6e : 0x3a6ff7);
  board.material.emissive.copy(board.material.color);

  renderer.render(scene, camera);
  if (bubbleTarget) placeBubble();
}

function onTap(e) {
  if (!renderer) return;
  const r = canvas.getBoundingClientRect();
  pointer.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects([fuhs, robot], true)[0];
  if (!hit) return;
  let o = hit.object; while (o && !o.name) o = o.parent;
  if (o?.name === 'robot') say(ROBOT_LINES[Math.floor(Math.random() * ROBOT_LINES.length)], robot.userData.head);
  else sayFromFuhs(FUHS_LINES[Math.floor(Math.random() * FUHS_LINES.length)]);
}

function say(text, target) {
  if (!bubbleEl) return;
  bubbleEl.textContent = text;
  bubbleEl.hidden = false;
  bubbleEl.style.animation = 'none'; void bubbleEl.offsetWidth; bubbleEl.style.animation = '';
  bubbleTarget = target || null;
  if (bubbleTarget && camera) placeBubble();
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => { bubbleEl.hidden = true; bubbleTarget = null; }, 4500);
}
function placeBubble() {
  const p = bubbleTarget.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.35, 0)).project(camera);
  const w = canvas.clientWidth, h = canvas.clientHeight;
  const bw = bubbleEl.offsetWidth / 2;
  const x = Math.min(Math.max((p.x + 1) / 2 * w, bw + 8), w - bw - 8);
  const y = Math.max((1 - p.y) / 2 * h, bubbleEl.offsetHeight + 12);
  bubbleEl.style.left = x + 'px'; bubbleEl.style.top = y + 'px';
}

export function sayFromFuhs(text) { say(text, fuhsHead); }
export function setSceneActive(on) { active = on; if (renderer) loop(); }
export function setProgressGlow(p) { progress = p; }
