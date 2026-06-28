/* ============================================================
   Dunia Kita — untuk Nabila, dari Salman
   Three.js: hati partikel (GLSL) + nebula + bloom + foto orbit.
   ============================================================ */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/* ---------- KONFIGURASI (silakan ubah) ---------- */
// Tanggal jadian. Bulan dimulai dari 0, jadi 4 = Mei. → 5 Mei 2025.
const START_DATE = new Date(2025, 4, 5, 0, 0, 0);

const PHOTOS = Array.from({ length: 14 }, (_, i) => `assets/photos/photo${i + 1}.jpeg`);

const CAPTIONS = [
  'Awal dari segalanya.',
  'Senyum yang bikin aku jatuh berkali-kali.',
  'Hari biasa yang jadi luar biasa karenamu.',
  'Tempat ternyamanku adalah di sisimu.',
  'Tawa kita yang tak ada habisnya.',
  'Kamu, dan ketenangan yang kau bawa.',
  'Setiap detik bersamamu layak dikenang.',
  'Dunia terasa lebih lembut saat ada kamu.',
  'Kita, dengan caranya sendiri.',
  'Rindu yang selalu ku simpan untukmu.',
  'Pelukan yang ingin ku ulang seribu kali.',
  'Kamu rumah yang tak pernah ingin ku tinggalkan.',
  'Cerita kita masih panjang, sayang.',
  'Dan aku akan terus memilihmu.'
];

const TYPE_LINES = [
  'Sebuah semesta kecil, isinya cuma kamu.',
  'Geser dunia ini sesukamu.',
  'Setiap bintang di sini namamu.'
];

/* ============================================================
   RENDERER / SCENE / CAMERA
   ============================================================ */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400);
camera.position.set(0, 1.5, 34);

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.rotateSpeed = 0.6;
controls.minDistance = 12;
controls.maxDistance = 60;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;
controls.enablePan = false;
controls.enabled = false; // dinyalakan setelah intro

scene.add(new THREE.AmbientLight(0xbcd6ff, 1.1));
const key = new THREE.DirectionalLight(0xffffff, 0.7);
key.position.set(6, 10, 8);
scene.add(key);

/* ============================================================
   POST-PROCESSING (bloom)
   ============================================================ */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  0.85, 0.45, 0.12
);
composer.addPass(bloom);

/* ============================================================
   TEKSTUR HATI (canvas) — untuk hujan hati & burst
   ============================================================ */
function heartTexture() {
  const s = 128, c = document.createElement('canvas');
  c.width = c.height = s;
  const x = c.getContext('2d');
  x.translate(s / 2, s / 2); x.scale(3.6, 3.6);
  x.beginPath();
  x.moveTo(0, 10);
  x.bezierCurveTo(-12, -4, -10, -18, 0, -10);
  x.bezierCurveTo(10, -18, 12, -4, 0, 10);
  x.closePath();
  x.fillStyle = '#fff'; x.shadowColor = '#cfe0ff'; x.shadowBlur = 7; x.fill();
  const t = new THREE.CanvasTexture(c); t.minFilter = THREE.LinearFilter; return t;
}
const HEART_TEX = heartTexture();

/* ============================================================
   NEBULA (langit shader di dalam bola)
   ============================================================ */
const nebulaMat = new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { uTime: { value: 0 } },
  vertexShader: /* glsl */`
    varying vec3 vPos;
    void main(){ vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
  `,
  fragmentShader: /* glsl */`
    precision highp float;
    varying vec3 vPos;
    uniform float uTime;
    float hash(vec3 p){ p=fract(p*0.3183099+0.1); p*=17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
    float noise(vec3 x){ vec3 i=floor(x),f=fract(x); f=f*f*(3.0-2.0*f);
      return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                     mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                 mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                     mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z); }
    float fbm(vec3 p){ float v=0.0,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=0.5; } return v; }
    void main(){
      vec3 d = normalize(vPos);
      float t = uTime*0.025;
      float n  = fbm(d*2.4 + vec3(t, t*0.4, t*0.2));
      float n2 = fbm(d*5.2 - vec3(t*0.7, 0.0, t*0.3));
      float g = smoothstep(-1.0, 1.0, d.y);
      vec3 col = mix(vec3(0.006,0.012,0.05), vec3(0.02,0.06,0.24), g);
      col += vec3(0.10,0.34,0.90) * pow(n, 2.2) * 0.55;
      col += vec3(0.25,0.55,1.0)  * pow(n2,3.0) * 0.22;
      col += vec3(0.85,0.35,0.6)  * pow(max(n-0.62,0.0),2.0) * 0.5; // semburat merah muda
      gl_FragColor = vec4(col, 1.0);
    }
  `
});
scene.add(new THREE.Mesh(new THREE.SphereGeometry(200, 48, 48), nebulaMat));

/* ============================================================
   STARFIELD
   ============================================================ */
(function stars() {
  const N = 1600, g = new THREE.BufferGeometry(), p = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const r = 70 + Math.random() * 110;
    const th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1);
    p[i * 3] = r * Math.sin(ph) * Math.cos(th);
    p[i * 3 + 1] = r * Math.cos(ph);
    p[i * 3 + 2] = r * Math.sin(ph) * Math.sin(th);
  }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ color: 0xbcd6ff, size: 0.7, sizeAttenuation: true, transparent: true, opacity: 0.9, depthWrite: false });
  scene.add(new THREE.Points(g, m));
})();

/* ============================================================
   HATI PARTIKEL (GLSL) — terbentuk dari serpihan beterbangan
   ============================================================ */
let heartMat;
(function particleHeart() {
  const COUNT = 7000, S = 6.2;
  const pos = [], col = [], start = [], scl = [];
  const cBlue = new THREE.Color(0x2f6bff);
  const cCyan = new THREE.Color(0x8fe9ff);
  const cPink = new THREE.Color(0xff7eb6);
  let made = 0, guard = 0;
  while (made < COUNT && guard < COUNT * 80) {
    guard++;
    const x = (Math.random() * 2 - 1) * 1.5;
    const y = (Math.random() * 2 - 1) * 1.5;
    const f = Math.pow(x * x + y * y - 1.0, 3.0) - x * x * y * y * y; // hati implisit
    if (f > 0) continue;
    const depth = Math.sqrt(Math.max(0, -f));
    const z = (Math.random() * 2 - 1) * depth * 0.82;
    pos.push(x * S, y * S, z * S);

    const c = cBlue.clone().lerp(cCyan, Math.random() * 0.65);
    if (Math.random() < 0.13) c.lerp(cPink, 0.4 + Math.random() * 0.5);
    col.push(c.r, c.g, c.b);

    const r = 16 + Math.random() * 16;
    const th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1);
    start.push(r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th));
    scl.push(0.6 + Math.random() * 1.8);
    made++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('aColor', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('aStart', new THREE.Float32BufferAttribute(start, 3));
  g.setAttribute('aScale', new THREE.Float32BufferAttribute(scl, 1));

  heartMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uProgress: { value: 0 }, uPulse: { value: 0 }, uSize: { value: 14.0 } },
    vertexShader: /* glsl */`
      attribute vec3 aColor; attribute vec3 aStart; attribute float aScale;
      uniform float uTime, uProgress, uPulse, uSize;
      varying vec3 vColor;
      void main(){
        vColor = aColor;
        vec3 home = position;
        float e = uProgress*uProgress*(3.0-2.0*uProgress);   // smoothstep
        vec3 p = mix(aStart, home, e);
        p *= (1.0 + uPulse*0.07);                            // detak
        p.x += sin(uTime*0.7 + home.y*1.8)*0.04;            // gerak halus
        p.y += cos(uTime*0.6 + home.x*1.6)*0.04;
        vec4 mv = modelViewMatrix * vec4(p,1.0);
        gl_PointSize = uSize * aScale * (0.7 + uPulse*0.5) * (300.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */`
      precision highp float;
      varying vec3 vColor;
      void main(){
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.05, d);
        a = pow(a, 1.5);
        gl_FragColor = vec4(vColor, a);
      }
    `
  });
  const points = new THREE.Points(g, heartMat);
  points.name = 'heart';
  scene.add(points);
})();

/* ============================================================
   FOTO MELAYANG (mengorbit hati, bisa diklik)
   ============================================================ */
const photoGroups = [];
const pickMeshes = [];
const texLoader = new THREE.TextureLoader();
let loadedCount = 0;
const loaderBar = document.getElementById('loaderBar');
const loaderEl = document.getElementById('loader');

const RING_R = 13.5;
PHOTOS.forEach((src, i) => {
  const angle = (i / PHOTOS.length) * Math.PI * 2;
  const y = Math.sin(i * 1.7) * 4.5;
  const home = new THREE.Vector3(Math.cos(angle) * RING_R, y, Math.sin(angle) * RING_R);

  const group = new THREE.Group();
  group.position.copy(home);
  group.userData = { home: home.clone(), index: i, scaleMul: 1, opacity: 1, focused: false, bob: Math.random() * Math.PI * 2 };
  scene.add(group);
  photoGroups.push(group);

  // bingkai
  const frame = new THREE.Mesh(
    new THREE.PlaneGeometry(3.2, 3.2),
    new THREE.MeshBasicMaterial({ color: 0xcfe0ff, transparent: true, opacity: 0.9 })
  );
  frame.position.z = -0.02;
  group.add(frame);
  group.userData.frame = frame;

  // foto (placeholder dulu)
  const photo = new THREE.Mesh(
    new THREE.PlaneGeometry(3, 3),
    new THREE.MeshBasicMaterial({ color: 0x0c1c4a, transparent: true })
  );
  group.add(photo);
  group.userData.photo = photo;
  photo.userData.group = group;
  pickMeshes.push(photo);

  texLoader.load(src, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const ar = tex.image.width / tex.image.height;
    let w = 3.4, h = 3.4 / ar;
    if (h > 4.4) { h = 4.4; w = 4.4 * ar; }
    photo.geometry.dispose(); photo.geometry = new THREE.PlaneGeometry(w, h);
    photo.material.map = tex; photo.material.color.set(0xffffff); photo.material.needsUpdate = true;
    frame.geometry.dispose(); frame.geometry = new THREE.PlaneGeometry(w + 0.28, h + 0.28);

    loadedCount++;
    if (loaderBar) loaderBar.style.width = `${Math.round((loadedCount / PHOTOS.length) * 100)}%`;
    if (loadedCount === PHOTOS.length) startExperience();
  }, undefined, () => {
    loadedCount++;
    if (loaderBar) loaderBar.style.width = `${Math.round((loadedCount / PHOTOS.length) * 100)}%`;
    if (loadedCount === PHOTOS.length) startExperience();
  });
});
// jaring pengaman
setTimeout(() => { if (!started) startExperience(); }, 6500);

/* ============================================================
   INTERAKSI: hover + klik foto + klik kosong
   ============================================================ */
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hovered = null, focused = null;
const focuscap = document.getElementById('focuscap');
const focusText = document.getElementById('focusText');
let downX = 0, downY = 0;

function setPointer(e) {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
}

canvas.addEventListener('pointermove', (e) => {
  setPointer(e);
  if (focused) return;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickMeshes, false)[0];
  const g = hit ? hit.object.userData.group : null;
  if (g !== hovered) {
    if (hovered) hovered.userData.scaleMul = 1;
    hovered = g;
    if (hovered) hovered.userData.scaleMul = 1.18;
    canvas.classList.toggle('is-pointer', !!hovered);
  }
});

canvas.addEventListener('pointerdown', (e) => { downX = e.clientX; downY = e.clientY; });
canvas.addEventListener('pointerup', (e) => {
  const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
  if (moved > 6) return; // itu drag, bukan klik
  setPointer(e);
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickMeshes, false)[0];
  if (hit) focusPhoto(hit.object.userData.group);
  else if (focused) unfocus();
  else heartBurst(e.clientX, e.clientY);
});

function focusPhoto(group) {
  if (focused === group) return;
  focused = group;
  controls.enabled = false;
  controls.autoRotate = false;
  if (hovered) { hovered.userData.scaleMul = 1; hovered = null; }
  canvas.classList.remove('is-pointer');

  photoGroups.forEach((g) => {
    g.userData.focused = (g === group);
    g.userData.opacity = (g === group) ? 1 : 0.12;
  });
  // posisi target: tepat di depan kamera
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  group.userData.focusPos = camera.position.clone().add(dir.multiplyScalar(7));
  group.userData.scaleMul = 2.4;

  focusText.textContent = CAPTIONS[group.userData.index] || '';
  focuscap.classList.add('is-shown');
}

function unfocus() {
  if (!focused) return;
  focused.userData.scaleMul = 1;
  focused = null;
  photoGroups.forEach((g) => { g.userData.focused = false; g.userData.opacity = 1; });
  focuscap.classList.remove('is-shown');
  controls.enabled = true;
  controls.autoRotate = true;
}

/* ============================================================
   LEDAKAN HATI (klik ruang kosong)
   ============================================================ */
const bursts = [];
function heartBurst(sx, sy) {
  pointer.x = (sx / window.innerWidth) * 2 - 1;
  pointer.y = -(sy / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const origin = raycaster.ray.origin.clone().add(raycaster.ray.direction.clone().multiplyScalar(16));

  const N = 26, g = new THREE.BufferGeometry();
  const p = new Float32Array(N * 3), vel = [];
  for (let i = 0; i < N; i++) {
    p[i * 3] = origin.x; p[i * 3 + 1] = origin.y; p[i * 3 + 2] = origin.z;
    const th = Math.random() * Math.PI * 2, ph = Math.acos(Math.random() * 2 - 1), sp = 2 + Math.random() * 4;
    vel.push(new THREE.Vector3(Math.sin(ph) * Math.cos(th), Math.abs(Math.cos(ph)) * 0.6 + 0.4, Math.sin(ph) * Math.sin(th)).multiplyScalar(sp));
  }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({
    map: HEART_TEX, size: 1.6, transparent: true, opacity: 1,
    depthWrite: false, blending: THREE.AdditiveBlending,
    color: Math.random() < 0.5 ? 0x8fe9ff : 0xff86b8
  });
  const pts = new THREE.Points(g, m);
  scene.add(pts);
  bursts.push({ pts, vel, life: 0, max: 1.5 });
}

/* ============================================================
   HUJAN HATI (toggle)
   ============================================================ */
let rainOn = false, rainPts = null, rainVel = null;
function buildRain() {
  const N = 140, g = new THREE.BufferGeometry(), p = new Float32Array(N * 3);
  rainVel = [];
  for (let i = 0; i < N; i++) {
    p[i * 3] = (Math.random() - 0.5) * 70;
    p[i * 3 + 1] = Math.random() * 60 - 10;
    p[i * 3 + 2] = (Math.random() - 0.5) * 50 - 6;
    rainVel.push(2 + Math.random() * 3);
  }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({
    map: HEART_TEX, size: 1.4, transparent: true, opacity: 0.95,
    depthWrite: false, blending: THREE.AdditiveBlending, color: 0xff9ec8
  });
  rainPts = new THREE.Points(g, m);
  rainPts.visible = false;
  scene.add(rainPts);
}
buildRain();

/* ============================================================
   HUD: tombol, surat, efek ketik, penghitung
   ============================================================ */
const hud = document.getElementById('hud');
const sheet = document.getElementById('sheet');
document.getElementById('btnLetter').addEventListener('click', () => sheet.classList.add('is-open'));
document.getElementById('sheetClose').addEventListener('click', () => sheet.classList.remove('is-open'));
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.classList.remove('is-open'); });

const btnRain = document.getElementById('btnRain');
btnRain.addEventListener('click', () => {
  rainOn = !rainOn; rainPts.visible = rainOn; btnRain.classList.toggle('is-active', rainOn);
});

document.getElementById('btnReset').addEventListener('click', () => {
  unfocus();
  controls.reset();
  camera.position.set(0, 1.5, 34);
  controls.autoRotate = true;
});

// efek ketik
(function typing() {
  const el = document.getElementById('typeLine');
  let li = 0, ci = 0, del = false;
  (function tick() {
    const line = TYPE_LINES[li];
    el.textContent = del ? line.slice(0, --ci) : line.slice(0, ++ci);
    if (!del && ci === line.length) { del = true; return setTimeout(tick, 2000); }
    if (del && ci === 0) { del = false; li = (li + 1) % TYPE_LINES.length; }
    setTimeout(tick, del ? 36 : 62);
  })();
})();

// penghitung
(function counter() {
  const dEl = document.getElementById('cDays'), clk = document.getElementById('cClock');
  const pad = (n) => String(n).padStart(2, '0');
  function update() {
    let diff = Math.max(0, Date.now() - START_DATE.getTime());
    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const h = Math.floor(diff / 3600000); diff -= h * 3600000;
    const m = Math.floor(diff / 60000); diff -= m * 60000;
    const s = Math.floor(diff / 1000);
    dEl.textContent = days; clk.textContent = `${pad(h)} : ${pad(m)} : ${pad(s)}`;
  }
  update(); setInterval(update, 1000);
})();

/* ============================================================
   INTRO + LOOP
   ============================================================ */
let started = false, introT = 0;
function startExperience() {
  if (started) return;
  started = true;
  setTimeout(() => loaderEl.classList.add('is-done'), 300);
  setTimeout(() => hud.classList.add('is-shown'), 500);
  setTimeout(() => { controls.enabled = true; }, 2600);
}

function beat(t) {
  const p = (t % 1.5) / 1.5;
  const b1 = Math.exp(-Math.pow((p - 0.10) / 0.05, 2));
  const b2 = Math.exp(-Math.pow((p - 0.28) / 0.06, 2)) * 0.85;
  return b1 + b2;
}

const tmp = new THREE.Vector3();
const clock = new THREE.Clock();
let elapsed = 0;
function animate() {
  requestAnimationFrame(animate);
  // hitung delta SEKALI, lalu akumulasi waktu sendiri
  // (getElapsedTime + getDelta bersamaan akan saling memakan delta)
  const dt = Math.min(clock.getDelta(), 0.05);
  elapsed += dt;
  const t = elapsed;

  nebulaMat.uniforms.uTime.value = t;
  if (heartMat) {
    heartMat.uniforms.uTime.value = t;
    heartMat.uniforms.uPulse.value = beat(t);
    if (started && introT < 1) { introT = Math.min(1, introT + dt / 2.4); }
    heartMat.uniforms.uProgress.value = introT;
  }

  // foto: billboard + lerp posisi/skala/opasitas
  photoGroups.forEach((g) => {
    const d = g.userData;
    let target;
    if (d.focused && d.focusPos) target = d.focusPos;
    else { tmp.copy(d.home); tmp.y += Math.sin(t * 0.8 + d.bob) * 0.5; target = tmp; }
    g.position.lerp(target, 0.08);
    const sc = THREE.MathUtils.lerp(g.scale.x, d.scaleMul, 0.12);
    g.scale.setScalar(sc);
    g.lookAt(camera.position);
    const op = THREE.MathUtils.lerp(d.photo.material.opacity, d.opacity, 0.1);
    d.photo.material.opacity = op; d.frame.material.opacity = op * 0.9;
  });

  // ledakan hati
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i]; b.life += dt;
    const arr = b.pts.geometry.attributes.position.array;
    for (let j = 0; j < b.vel.length; j++) {
      b.vel[j].y -= dt * 1.5; // gravitasi
      arr[j * 3] += b.vel[j].x * dt;
      arr[j * 3 + 1] += b.vel[j].y * dt;
      arr[j * 3 + 2] += b.vel[j].z * dt;
    }
    b.pts.geometry.attributes.position.needsUpdate = true;
    b.pts.material.opacity = Math.max(0, 1 - b.life / b.max);
    if (b.life >= b.max) { scene.remove(b.pts); b.pts.geometry.dispose(); b.pts.material.dispose(); bursts.splice(i, 1); }
  }

  // hujan hati
  if (rainOn && rainPts) {
    const arr = rainPts.geometry.attributes.position.array;
    for (let i = 0; i < rainVel.length; i++) {
      arr[i * 3 + 1] -= rainVel[i] * dt;
      arr[i * 3] += Math.sin(t + i) * dt * 0.6;
      if (arr[i * 3 + 1] < -28) { arr[i * 3 + 1] = 34; arr[i * 3] = (Math.random() - 0.5) * 70; }
    }
    rainPts.geometry.attributes.position.needsUpdate = true;
  }

  controls.update();
  composer.render();
}
animate();

/* ============================================================
   RESIZE
   ============================================================ */
window.addEventListener('resize', () => {
  const w = window.innerWidth, h = window.innerHeight;
  camera.aspect = w / h; camera.updateProjectionMatrix();
  renderer.setSize(w, h); composer.setSize(w, h);
});
