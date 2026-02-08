const canvas = document.getElementById("confettiCanvas");
const ctx = canvas.getContext("2d");

function resize() {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener("resize", resize);
resize();

const colors = [
  "#f7c948", // gold
  "#d9dee7", // silver
  "#d19a66", // bronze
  "#8ad1ff", // blue
  "#b6ffb3", // green
  "#ffffff"
];

const particles = [];
let running = false;

function rand(min, max) { return Math.random() * (max - min) + min; }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shootConfetti({ x, y, angleDeg, spreadDeg = 55, count = 90, power = 11 }) {
  const angle = (angleDeg * Math.PI) / 180;
  const spread = (spreadDeg * Math.PI) / 180;

  for (let i = 0; i < count; i++) {
    const a = angle + rand(-spread / 2, spread / 2);
    const speed = rand(power * 0.6, power * 1.15);

    const size = rand(5, 10);
    const shape = Math.random() < 0.65 ? "rect" : "circle";

    particles.push({
      x, y,
      vx: Math.cos(a) * speed,
      vy: Math.sin(a) * speed,
      g: rand(0.18, 0.32),
      drag: rand(0.985, 0.995),
      rot: rand(0, Math.PI * 2),
      vr: rand(-0.22, 0.22),
      w: size,
      h: size * rand(0.6, 1.3),
      color: pick(colors),
      life: rand(90, 150),
      shape,
      alpha: 1
    });
  }

  if (!running) {
    running = true;
    requestAnimationFrame(tick);
  }
}

function tick() {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.vx *= p.drag;
    p.vy *= p.drag;
    p.vy += p.g;

    p.x += p.vx;
    p.y += p.vy;

    p.rot += p.vr;
    p.life -= 1;

    // leicht ausfaden am Ende
    if (p.life < 25) p.alpha = p.life / 25;

    // rauswerfen wenn weg
    if (p.life <= 0 || p.y > window.innerHeight + 80) {
      particles.splice(i, 1);
      continue;
    }

    ctx.save();
    ctx.globalAlpha = p.alpha;
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.color;

    if (p.shape === "circle") {
      ctx.beginPath();
      ctx.arc(0, 0, p.w * 0.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }
    ctx.restore();
  }

  if (particles.length > 0) {
    requestAnimationFrame(tick);
  } else {
    running = false;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
}

/* ====== "Geburtstag-Kanonen" von allen Seiten ====== */
function birthdayCannons() {
  const w = window.innerWidth;
  const h = window.innerHeight;

  // Links -> nach rechts/oben
  shootConfetti({ x: 0, y: h * 0.65, angleDeg: -15, spreadDeg: 65, count: 110, power: 14 });

  // Rechts -> nach links/oben
  shootConfetti({ x: w, y: h * 0.65, angleDeg: 195, spreadDeg: 65, count: 110, power: 14 });

  // Oben links -> nach rechts/unten
  shootConfetti({ x: w * 0.15, y: 0, angleDeg: 70, spreadDeg: 55, count: 90, power: 12 });

  // Oben rechts -> nach links/unten
  shootConfetti({ x: w * 0.85, y: 0, angleDeg: 110, spreadDeg: 55, count: 90, power: 12 });

  // zweite Welle für "WOW"
  setTimeout(() => {
    shootConfetti({ x: 0, y: h * 0.45, angleDeg: -8, spreadDeg: 60, count: 90, power: 13 });
    shootConfetti({ x: w, y: h * 0.45, angleDeg: 188, spreadDeg: 60, count: 90, power: 13 });
  }, 800);
}

// Start automatisch beim Laden:
birthdayCannons();

// Optional: nochmal bei Klick irgendwo (wenn du willst):
// window.addEventListener("click", birthdayCannons);
