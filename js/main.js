/* ============================================================
   Untuk Nabila — by Salman
   Three.js: latar partikel hati + galeri foto 3D carousel.
   ============================================================ */
'use strict';

/* ---------- KONFIGURASI (silakan ubah) ---------- */
// Tanggal mulai untuk penghitung waktu (format: tahun, bulan-1, tanggal).
// Catatan: bulan dimulai dari 0 (0 = Januari, 5 = Juni).
const START_DATE = new Date(2023, 5, 28, 0, 0, 0);

const PHOTOS = Array.from({ length: 14 }, (_, i) => `assets/photos/photo${i + 1}.jpeg`);

const TYPE_LINES = [
  'Kamu rumah yang selalu ku rindukan.',
  'Sebucin itu, dan aku tidak menyesal.',
  'Setiap hari jadi lebih baik karenamu.'
];

/* ============================================================
   CURSOR KUSTOM
   ============================================================ */
(function cursor() {
  const dot = document.getElementById('cursorDot');
  const ring = document.getElementById('cursorRing');
  if (!dot || !ring) return;
  let rx = 0, ry = 0, mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });
  (function follow() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  })();
  const hoverables = 'a,button,[data-cursor],.reason,.count__cell';
  document.querySelectorAll(hoverables).forEach((el) => {
    el.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
  });
})();

/* ============================================================
   TEKSTUR HATI (digambar di canvas)
   ============================================================ */
function makeHeartTexture() {
  const s = 128;
  const c = document.createElement('canvas');
  c.width = c.height = s;
  const ctx = c.getContext('2d');
  ctx.translate(s / 2, s / 2);
  ctx.scale(3.4, 3.4);
  ctx.beginPath();
  // kurva hati klasik
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-12, -4, -10, -18, 0, -10);
  ctx.bezierCurveTo(10, -18, 12, -4, 0, 10);
  ctx.closePath();
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#bcd6ff';
  ctx.shadowBlur = 6;
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  return tex;
}

/* ============================================================
   LATAR: PARTIKEL HATI
   ============================================================ */
(function background() {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x03061a, 0.012);
  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 40;

  const COUNT = 260;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(COUNT * 3);
  const col = new Float32Array(COUNT * 3);
  const speed = new Float32Array(COUNT);
  const sway = new Float32Array(COUNT);
  const size = new Float32Array(COUNT);

  const palette = [
    new THREE.Color(0x3b82f6),
    new THREE.Color(0x60a5fa),
    new THREE.Color(0x7dd3fc),
    new THREE.Color(0x9cc6ff),
    new THREE.Color(0xf7a8c4) // sentuhan merah muda yang lembut
  ];

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 90;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 70;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 60;
    const c = palette[Math.floor(Math.random() * palette.length)];
    // sedikit lebih sering biru daripada merah muda
    const cc = Math.random() < 0.85 ? palette[Math.floor(Math.random() * 4)] : c;
    col[i * 3] = cc.r; col[i * 3 + 1] = cc.g; col[i * 3 + 2] = cc.b;
    speed[i] = 0.6 + Math.random() * 1.4;
    sway[i] = Math.random() * Math.PI * 2;
    size[i] = 1.4 + Math.random() * 2.6;
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 2.6,
    map: makeHeartTexture(),
    vertexColors: true,
    transparent: true,
    opacity: 0.92,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let mx = 0, my = 0;
  window.addEventListener('mousemove', (e) => {
    mx = (e.clientX / window.innerWidth - 0.5);
    my = (e.clientY / window.innerHeight - 0.5);
  });

  const clock = new THREE.Clock();
  (function loop() {
    const t = clock.getElapsedTime();
    const arr = geo.attributes.position.array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += speed[i] * 0.02;          // naik perlahan
      arr[i * 3] += Math.sin(t + sway[i]) * 0.006; // ayunan halus
      if (arr[i * 3 + 1] > 36) arr[i * 3 + 1] = -36; // wrap
    }
    geo.attributes.position.needsUpdate = true;
    points.rotation.y = t * 0.02;
    camera.position.x += (mx * 8 - camera.position.x) * 0.04;
    camera.position.y += (-my * 6 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

/* ============================================================
   GALERI FOTO 3D (carousel silinder)
   ============================================================ */
(function gallery() {
  const canvas = document.getElementById('gallery-canvas');
  const stage = canvas.parentElement;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function sizeOf() { return { w: stage.clientWidth, h: stage.clientHeight }; }
  let { w, h } = sizeOf();
  renderer.setSize(w, h);

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x040a24, 18, 46);
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 0.4, 21);

  scene.add(new THREE.AmbientLight(0xbcd6ff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(4, 8, 10);
  scene.add(key);
  const rim = new THREE.PointLight(0x3b82f6, 0.8, 60);
  rim.position.set(-8, 2, 6);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  const N = PHOTOS.length;
  const RADIUS = 12;
  const cards = [];
  const loader = new THREE.TextureLoader();

  // pelat lantai pemantul lembut
  const floorGeo = new THREE.PlaneGeometry(80, 80);
  const floorMat = new THREE.MeshBasicMaterial({ color: 0x0a1740, transparent: true, opacity: 0.5 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -7.5;
  scene.add(floor);

  const loaderBar = document.getElementById('loaderBar');
  const loaderEl = document.getElementById('loader');
  let loaded = 0;

  PHOTOS.forEach((src, i) => {
    const angle = (i / N) * Math.PI * 2;
    const card = new THREE.Group();
    card.position.set(Math.sin(angle) * RADIUS, 0, Math.cos(angle) * RADIUS);
    card.rotation.y = angle;
    card.userData.baseAngle = angle;
    group.add(card);
    cards.push(card);

    // bingkai sementara sambil menunggu gambar
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x0c1c4a, roughness: 0.6, metalness: 0.1 });
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 6.6), frameMat);
    card.add(frame);

    loader.load(src, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      const ratio = tex.image.width / tex.image.height;
      let pw = 4.8, ph = 4.8 / ratio;
      if (ph > 6.2) { ph = 6.2; pw = 6.2 * ratio; }
      // bingkai mengikuti foto
      frame.geometry.dispose();
      frame.geometry = new THREE.PlaneGeometry(pw + 0.45, ph + 0.45);

      const photoMat = new THREE.MeshBasicMaterial({ map: tex });
      const photo = new THREE.Mesh(new THREE.PlaneGeometry(pw, ph), photoMat);
      photo.position.z = 0.03;
      card.add(photo);

      loaded++;
      if (loaderBar) loaderBar.style.width = `${Math.round((loaded / N) * 100)}%`;
      if (loaded === N && loaderEl) {
        setTimeout(() => loaderEl.classList.add('is-done'), 350);
      }
    }, undefined, () => {
      // jika gagal memuat, tetap hitung agar loader tidak macet
      loaded++;
      if (loaderBar) loaderBar.style.width = `${Math.round((loaded / N) * 100)}%`;
      if (loaded === N && loaderEl) loaderEl.classList.add('is-done');
    });
  });

  // jaring pengaman: tutup loader maksimal setelah 6 detik
  setTimeout(() => loaderEl && loaderEl.classList.add('is-done'), 6000);

  /* ---------- interaksi tarik ---------- */
  let targetRot = 0, curRot = 0, autoVel = 0.0016;
  let dragging = false, lastX = 0, vel = 0;
  const hint = document.getElementById('galleryHint');

  function onDown(x) { dragging = true; lastX = x; autoVel = 0; if (hint) hint.classList.add('is-hidden'); }
  function onMove(x) {
    if (!dragging) return;
    const dx = x - lastX; lastX = x;
    vel = dx * 0.005;
    targetRot += vel;
  }
  function onUp() { dragging = false; }

  canvas.addEventListener('mousedown', (e) => onDown(e.clientX));
  window.addEventListener('mousemove', (e) => onMove(e.clientX));
  window.addEventListener('mouseup', onUp);
  canvas.addEventListener('touchstart', (e) => onDown(e.touches[0].clientX), { passive: true });
  canvas.addEventListener('touchmove', (e) => onMove(e.touches[0].clientX), { passive: true });
  canvas.addEventListener('touchend', onUp);

  const clock = new THREE.Clock();
  (function loop() {
    const t = clock.getElapsedTime();
    if (!dragging) {
      vel *= 0.94;
      targetRot += vel + autoVel;
      if (Math.abs(autoVel) < 0.0016) autoVel += 0.00002; // kembali berputar otomatis
    }
    curRot += (targetRot - curRot) * 0.08;
    group.rotation.y = curRot;

    // tiap kartu menghadap kamera + sedikit mengambang
    cards.forEach((card, i) => {
      card.rotation.y = -curRot + card.userData.baseAngle;
      card.position.y = Math.sin(t * 0.8 + i) * 0.18;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  })();

  window.addEventListener('resize', () => {
    const s = sizeOf();
    camera.aspect = s.w / s.h;
    camera.updateProjectionMatrix();
    renderer.setSize(s.w, s.h);
  });
})();

/* ============================================================
   EFEK KETIK (hero)
   ============================================================ */
(function typing() {
  const el = document.getElementById('typeLine');
  if (!el) return;
  let li = 0, ci = 0, deleting = false;
  function tick() {
    const line = TYPE_LINES[li];
    if (!deleting) {
      el.textContent = line.slice(0, ++ci);
      if (ci === line.length) { deleting = true; return setTimeout(tick, 1900); }
    } else {
      el.textContent = line.slice(0, --ci);
      if (ci === 0) { deleting = false; li = (li + 1) % TYPE_LINES.length; }
    }
    setTimeout(tick, deleting ? 38 : 64);
  }
  tick();
})();

/* ============================================================
   PENGHITUNG WAKTU
   ============================================================ */
(function counter() {
  const d = document.getElementById('cDays');
  const h = document.getElementById('cHours');
  const m = document.getElementById('cMin');
  const s = document.getElementById('cSec');
  if (!d) return;
  function pad(n) { return String(n).padStart(2, '0'); }
  function update() {
    let diff = Math.max(0, Date.now() - START_DATE.getTime());
    const days = Math.floor(diff / 86400000); diff -= days * 86400000;
    const hrs = Math.floor(diff / 3600000); diff -= hrs * 3600000;
    const mins = Math.floor(diff / 60000); diff -= mins * 60000;
    const secs = Math.floor(diff / 1000);
    d.textContent = days; h.textContent = pad(hrs); m.textContent = pad(mins); s.textContent = pad(secs);
  }
  update();
  setInterval(update, 1000);
})();

/* ============================================================
   REVEAL SAAT SCROLL
   ============================================================ */
(function reveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window)) {
    els.forEach((e) => e.classList.add('is-in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.18 });
  els.forEach((e) => io.observe(e));
})();
